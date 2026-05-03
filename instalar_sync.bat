@echo off
:: Rodar UMA VEZ como Administrador para registrar o auto_sync no Task Scheduler
schtasks /create /tn "AppFinanceiro_AutoSync" ^
  /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"C:\Users\fabio\Projects\app-financeiro-fabio\auto_sync.ps1\"" ^
  /sc ONLOGON ^
  /ru "%USERNAME%" ^
  /f
echo.
echo Tarefa registrada! O sync roda automaticamente a cada login.
pause
