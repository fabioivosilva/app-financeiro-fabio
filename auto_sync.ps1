# auto_sync.ps1
# Executa no login do Windows via Task Scheduler.
# 1. Faz git pull na develop
# 2. Se houver mudanca de codigo (.py/.tsx/.ts) → rebuilda o exe
# 3. Notifica via toast quando terminar

param(
    [string]$ProjectPath = "C:\Users\fabio\Projects\app-financeiro-fabio"
)

$logFile = Join-Path $ProjectPath "auto_sync.log"

function Write-Log {
    param([string]$msg)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp  $msg" | Tee-Object -FilePath $logFile -Append
}

function Show-Toast {
    param([string]$title, [string]$msg)
    [Windows.UI.Notifications.ToastNotificationManager,Windows.UI.Notifications,ContentType=WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument,Windows.Data.Xml.Dom,ContentType=WindowsRuntime] | Out-Null
    $xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
    $xml.LoadXml("<toast><visual><binding template='ToastGeneric'><text>$title</text><text>$msg</text></binding></visual></toast>")
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("App Financeiro")
    $notifier.Show([Windows.UI.Notifications.ToastNotification]::new($xml))
}

# --- Início ---
Write-Log "=== auto_sync iniciado ==="

Set-Location $ProjectPath

# Verifica se git está disponível
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "ERRO: git não encontrado."
    exit 1
}

# Garante branch develop
$branch = git branch --show-current
if ($branch -ne "develop") {
    Write-Log "Trocando para develop (estava em $branch)..."
    git checkout develop 2>&1 | ForEach-Object { Write-Log $_ }
}

# Captura o commit atual ANTES do pull
$commitAntes = git rev-parse HEAD

# Faz o pull
Write-Log "Fazendo git pull origin develop..."
$pullOutput = git pull origin develop 2>&1
$pullOutput | ForEach-Object { Write-Log $_ }

if ($LASTEXITCODE -ne 0) {
    Write-Log "AVISO: pull falhou (possível conflito). Abortando rebuild."
    Show-Toast "⚠️ App Financeiro" "Sync falhou — verifique conflitos no repo."
    exit 1
}

# Captura o commit DEPOIS do pull
$commitDepois = git rev-parse HEAD

if ($commitAntes -eq $commitDepois) {
    Write-Log "Sem commits novos. Nada a fazer."
    exit 0
}

Write-Log "Novos commits detectados:"
git log --oneline "$commitAntes..$commitDepois" 2>&1 | ForEach-Object { Write-Log "  $_" }

# Checa se houve mudanca em arquivos de codigo (nao apenas vault/docs)
$arquivosAlterados = git diff --name-only "$commitAntes" "$commitDepois" 2>&1
$temMudancaCodigo = $arquivosAlterados | Where-Object {
    $_ -match '\.(py|tsx|ts|js|css|html)$' -and $_ -notmatch 'obsidian-vault|\.md$'
}

if (-not $temMudancaCodigo) {
    Write-Log "Apenas vault/docs alterados — sem necessidade de rebuild."
    Show-Toast "✅ App Financeiro" "Repo atualizado (só docs/vault). Exe não precisa rebuild."
    exit 0
}

Write-Log "Mudanças de código detectadas:"
$temMudancaCodigo | ForEach-Object { Write-Log "  $_" }
Write-Log "Iniciando build do executável..."

Show-Toast "🔨 App Financeiro" "Atualizando o executável... aguarde ~2 min."

# Roda o build
$buildResult = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c build_desktop.bat >> auto_sync.log 2>&1" `
    -WorkingDirectory $ProjectPath `
    -Wait -PassThru -WindowStyle Hidden

if ($buildResult.ExitCode -eq 0) {
    $exeTimestamp = (Get-Item "$ProjectPath\ControleFinanceiro\ControleFinanceiro.exe").LastWriteTime.ToString("HH:mm")
    Write-Log "Build concluído com sucesso. Exe atualizado às $exeTimestamp."
    Show-Toast "✅ App Financeiro" "Executável atualizado! ($exeTimestamp) Pode abrir normalmente."
} else {
    Write-Log "ERRO: build falhou. Verifique auto_sync.log."
    Show-Toast "❌ App Financeiro" "Build falhou. Verifique auto_sync.log no projeto."
}
