@echo off
chcp 65001 >nul
title App Financeiro

cd /d "%~dp0"

:: Mata processos antigos nas portas usadas
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1

timeout /t 1 /nobreak >nul

:: Sobe o backend com reload (recarrega automaticamente ao salvar arquivos Python)
if exist "backend\.venv\Scripts\activate" (
    start /b "" cmd /c "cd backend && .venv\Scripts\activate && uvicorn app.main:app --port 8000 --reload --log-level warning"
    timeout /t 3 /nobreak >nul
)

:: Sobe o frontend
start /b "" cmd /c "cd frontend && npm run dev"

:: Aguarda frontend subir
timeout /t 4 /nobreak >nul

:: Abre no browser
start http://localhost:5173

exit
