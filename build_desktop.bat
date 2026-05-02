@echo off
echo Iniciando build do Controle Financeiro...

echo.
echo [1/4] Compilando o Frontend (React + Vite)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Erro ao compilar o frontend!
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/4] Empacotando o Backend e Frontend num executavel (PyInstaller)...
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
cd ..
echo [3/4] Copiando executavel para a pasta do banco local...
copy /Y "backend\dist\ControleFinanceiro.exe" "ControleFinanceiro.exe" >nul
if %errorlevel% neq 0 (
    echo Erro ao copiar o executavel para a raiz do projeto!
    exit /b %errorlevel%
)

echo.
echo [4/4] Sucesso!
echo Executavel para uso/teste: %cd%\ControleFinanceiro.exe
echo Banco usado por este executavel: %cd%\data\finance.db
echo Artefato original tambem permanece em: backend\dist\ControleFinanceiro.exe
pause
