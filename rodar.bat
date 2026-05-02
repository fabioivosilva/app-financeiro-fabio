@echo off
chcp 65001 >nul
title App Financeiro

cd /d "%~dp0"

:: Sobe o backend em background
start /b "" cmd /c "cd backend && .venv\Scripts\activate && uvicorn app.main:app --port 8000 --log-level warning 2>nul"

:: Aguarda backend subir
timeout /t 3 /nobreak >nul

:: Abre no browser padrão
start http://localhost:5173

exit
