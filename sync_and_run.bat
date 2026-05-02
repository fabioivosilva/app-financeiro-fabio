@echo off
chcp 65001 >nul
title App Financeiro — Sincronizar e Abrir

echo.
echo ╔══════════════════════════════════════════╗
echo ║   App Financeiro Fabio — Sync e Run      ║
echo ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Git nao encontrado. Instale em https://git-scm.com/download/win
    pause & exit /b 1
)

for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
echo Branch atual: %BRANCH%

if not "%BRANCH%"=="develop" (
    echo Trocando para branch develop...
    git checkout develop
    if errorlevel 1 ( echo [ERRO] Conflito ao trocar de branch. & pause & exit /b 1 )
)

echo.
echo Ultimo commit local:
git log --oneline -1
echo.
echo Buscando atualizacoes do GitHub...
git pull origin develop
if errorlevel 1 (
    echo.
    echo [AVISO] Conflito no pull. Resolva manualmente e rode novamente.
    pause & exit /b 1
)

echo.
echo Novidades desde o ultimo pull:
git log --oneline ORIG_HEAD..HEAD 2>nul || echo   Ja estava atualizado.

echo.
echo Tarefas em andamento por alguem:
findstr /i "FABIO\|THIAGO" obsidian-vault\05_PENDENCIAS.md 2>nul | findstr "🔒" || echo   Nenhuma tarefa bloqueada no momento.

echo.
echo ══════════════════════════════════════════
echo Abrindo o aplicativo...

if exist "ControleFinanceiro\ControleFinanceiro.exe" (
    start "" "ControleFinanceiro\ControleFinanceiro.exe"
    echo Pronto! Esta janela pode ser fechada.
    timeout /t 3 >nul
) else (
    echo [AVISO] Executavel nao encontrado. Rode build_desktop.bat primeiro.
    pause
)
