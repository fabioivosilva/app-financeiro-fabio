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
    --onedir ^
    --add-data "../frontend/dist;frontend/dist" ^
    --hidden-import uvicorn ^
    --hidden-import fastapi ^
    --hidden-import pydantic ^
    --hidden-import sqlite3 ^
    --collect-all pdfminer ^
    --collect-all pdfplumber ^
    --collect-all ofxparse ^
    --noconfirm ^
    main_desktop.py

if %errorlevel% neq 0 (
    echo Erro no PyInstaller!
    exit /b %errorlevel%
)

echo.
cd ..
echo [3/4] Copiando pasta do executavel para a raiz...
if exist "ControleFinanceiro" rmdir /s /q "ControleFinanceiro"
xcopy /E /I /Y "backend\dist\ControleFinanceiro" "ControleFinanceiro" >nul
if %errorlevel% neq 0 (
    echo Erro ao copiar a pasta para a raiz do projeto!
    echo Feche o ControleFinanceiro.exe se ele estiver aberto e rode o build novamente.
    exit /b %errorlevel%
)

echo.
echo [4/4] Sucesso!
echo Executavel para uso/teste: %cd%\ControleFinanceiro\ControleFinanceiro.exe
echo Banco usado por este executavel: %cd%\data\finance.db
echo Artefato original tambem permanece em: backend\dist\ControleFinanceiro\
