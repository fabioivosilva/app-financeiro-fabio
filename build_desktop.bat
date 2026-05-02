@echo off
echo Iniciando build do Controle Financeiro...

echo.
echo [1/3] Compilando o Frontend (React + Vite)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Erro ao compilar o frontend!
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/3] Empacotando o Backend e Frontend num executavel (PyInstaller)...
cd backend
call .venv\Scripts\pyinstaller.exe ^
    --name ControleFinanceiro ^
    --noconsole ^
    --onefile ^
    --add-data "../frontend/dist;frontend/dist" ^
    --hidden-import uvicorn ^
    --hidden-import fastapi ^
    --hidden-import pydantic ^
    --hidden-import sqlalchemy ^
    --hidden-import sqlite3 ^
    --collect-all pdfminer ^
    --collect-all pdfplumber ^
    --collect-all ofxparse ^
    main_desktop.py

if %errorlevel% neq 0 (
    echo Erro no PyInstaller!
    exit /b %errorlevel%
)

echo.
echo [3/3] Sucesso!
echo O executavel foi gerado em: backend\dist\ControleFinanceiro.exe
cd ..
pause
