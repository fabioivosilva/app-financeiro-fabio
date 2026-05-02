# 09_COMANDOS

Comandos atuais do projeto. Executar a partir de `C:\Users\fabio\Projects\app-financeiro-fabio` salvo indicacao contraria.

## Validacao Backend

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest test_dashboard_service.py test_transaction_learning.py test_itau_pdf_parser.py test_accounting_rules.py test_itau_excel_parser.py test_usability_backlog.py
.\.venv\Scripts\python.exe -m py_compile app\main.py app\crud.py app\routers\imports.py app\routers\transactions.py
```

## Frontend

```powershell
cd frontend
npm.cmd run build
```

## Desktop

```powershell
.\build_desktop.bat
```

Executavel de uso: `ControleFinanceiro.exe` na raiz do repo. `backend\dist\ControleFinanceiro.exe` e artefato intermediario.

Se a copia para a raiz falhar, fechar instancias abertas do app:

```powershell
Get-Process | Where-Object { $_.ProcessName -like '*ControleFinanceiro*' }
Stop-Process -Id <PID> -Force
Copy-Item -LiteralPath backend\dist\ControleFinanceiro.exe -Destination ControleFinanceiro.exe -Force
```

## Git

```powershell
git status --short
git add <arquivos>
git commit -m "tipo(escopo): descricao"
```

Nao commitar artefatos locais: `ControleFinanceiro.exe`, `backend\data`, `backend\*.spec`, debug/testes soltos, bancos locais.
