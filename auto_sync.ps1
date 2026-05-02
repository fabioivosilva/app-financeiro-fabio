# auto_sync.ps1 — roda no login via Task Scheduler
# Faz git pull e notifica. Sem rebuild de exe.

param([string]$ProjectPath = "C:\Users\fabio\Projects\app-financeiro-fabio")

$logFile = Join-Path $ProjectPath "auto_sync.log"

function Write-Log([string]$msg) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Tee-Object -FilePath $logFile -Append
}

function Show-Toast([string]$title, [string]$msg) {
    [Windows.UI.Notifications.ToastNotificationManager,Windows.UI.Notifications,ContentType=WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument,Windows.Data.Xml.Dom,ContentType=WindowsRuntime] | Out-Null
    $xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
    $xml.LoadXml("<toast><visual><binding template='ToastGeneric'><text>$title</text><text>$msg</text></binding></visual></toast>")
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("App Financeiro")
    $notifier.Show([Windows.UI.Notifications.ToastNotification]::new($xml))
}

Write-Log "=== auto_sync iniciado ==="
Set-Location $ProjectPath

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "ERRO: git não encontrado."
    exit 1
}

$branch = git branch --show-current
if ($branch -ne "develop") {
    git checkout develop 2>&1 | ForEach-Object { Write-Log $_ }
}

$commitAntes = git rev-parse HEAD
Write-Log "Fazendo git pull..."
git pull origin develop 2>&1 | ForEach-Object { Write-Log $_ }

if ($LASTEXITCODE -ne 0) {
    Write-Log "AVISO: pull falhou."
    Show-Toast "⚠️ App Financeiro" "Sync falhou — verifique conflitos."
    exit 1
}

$commitDepois = git rev-parse HEAD

if ($commitAntes -eq $commitDepois) {
    Write-Log "Já estava atualizado."
    exit 0
}

$novos = git log --oneline "$commitAntes..$commitDepois" 2>&1
Write-Log "Novos commits: $novos"
Show-Toast "✅ App Financeiro" "Atualizado! $($novos.Count) commit(s) novo(s)."
