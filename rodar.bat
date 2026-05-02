@echo off
chcp 65001 >nul
title App Financeiro

cd /d "%~dp0"

:: Sobe o backend (se existir)
if exist "backend\.venv\Scripts\activate" (
    start /b "" cmd /c "cd backend && .venv\Scripts\activate && uvicorn app.main:app --port 8000 --log-level warning 2>nul"
    timeout /t 3 /nobreak >nul
)

:: Sobe o frontend
start /b "" cmd /c "cd frontend && npm run dev"

:: Aguarda frontend subir
timeout /t 4 /nobreak >nul

:: Abre no browser
start http://localhost:5173

exit
