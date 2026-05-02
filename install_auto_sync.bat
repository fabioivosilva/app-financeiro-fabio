@echo off
chcp 65001 >nul
title Instalando Auto Sync — App Financeiro

echo.
echo ╔══════════════════════════════════════════╗
echo ║   Instalando sincronização automática    ║
echo ╚══════════════════════════════════════════╝
echo.
echo Este script registra o auto_sync.ps1 no Agendador de Tarefas do Windows.
echo Ele vai rodar automaticamente toda vez que voce fizer login no PC.
echo.

:: Caminho do projeto (ajusta se necessário)
set PROJECT=C:\Users\fabio\Projects\app-financeiro-fabio
set SCRIPT=%PROJECT%\auto_sync.ps1

:: Verifica se o script existe
if not exist "%SCRIPT%" (
    echo [ERRO] auto_sync.ps1 nao encontrado em %PROJECT%
    echo Certifique-se de estar rodando este bat dentro da pasta do projeto.
    pause & exit /b 1
)

:: Remove tarefa antiga se existir
schtasks /delete /tn "AppFinanceiroAutoSync" /f >nul 2>&1

:: Cria a tarefa no login do usuário atual
schtasks /create ^
    /tn "AppFinanceiroAutoSync" ^
    /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%SCRIPT%\"" ^
    /sc onlogon ^
    /ru "%USERNAME%" ^
    /delay 0002:00 ^
    /f

if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao criar tarefa. Tente rodar como Administrador.
    pause & exit /b 1
)

echo.
echo ✅ Tarefa criada com sucesso!
echo.
echo Como funciona:
echo   - Toda vez que voce logar no Windows, o sync roda em background
echo   - Se tiver codigo novo: rebuilda o .exe (~2 min) e te notifica
echo   - Se for so vault/docs: sync rapido, sem rebuild
echo   - Log disponivel em: %PROJECT%\auto_sync.log
echo.
echo Para desinstalar: schtasks /delete /tn "AppFinanceiroAutoSync" /f
echo Para rodar agora: schtasks /run /tn "AppFinanceiroAutoSync"
echo.
pause
