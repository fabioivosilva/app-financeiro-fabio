# SESSION_STATE

## Status geral
FASE 2 concluída. Parser OFX funcionando. Iniciando FASE 3 — Parser PDF Itaú.

## Última fase concluída
- FASE 2: Importação OFX (parser + endpoint + dedup + auto-categorização)

## Fase atual
FASE 3 — Parser PDF Itaú (fatura do cartão de crédito)

## Repo
- URL: https://github.com/fabioivosilva/app-financeiro-fabio
- Local: C:\Users\fabio\Projects\app-financeiro-fabio
- Branch: develop
- Último commit: feat: add OFX bank statement import (83eeabc)

## Stack
- Python 3.12.10 (C:\Users\fabio\AppData\Local\Programs\Python\Python312\python.exe)
- Venv: backend/.venv
- Comando para rodar: cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
- FastAPI em http://127.0.0.1:8000
- SQLite em data/finance.db
- Git 2.53.0 + gh CLI 2.92.0 autenticado como fabioivosilva

## Decisões técnicas tomadas
- SQLite como banco local (data/finance.db)
- FastAPI como backend (uvicorn)
- React + Vite + TypeScript + TailwindCSS v3 no frontend (não iniciado)
- OFX: ofxparse (concluído)
- PDF: pdfplumber (próximo)
- UX do Stitch como referência visual obrigatória
- pywebview + PyInstaller para desktop/exe
- Sem login, cloud, Open Finance, SaaS ou Upgrade Pro

## Arquivos do Backend (todos criados)
- backend/requirements.txt — fastapi, uvicorn, sqlalchemy, pydantic, pdfplumber, ofxparse, python-multipart, aiofiles
- backend/app/__init__.py
- backend/app/database.py — SQLAlchemy engine + SessionLocal + get_db
- backend/app/models.py — 8 modelos: Person, Card, Category, Transaction, Rule, FileImport, Goal, Setting
- backend/app/schemas.py — Pydantic schemas (PersonOut, CardOut, CategoryOut, TransactionOut, RuleOut, GoalOut, FileImportOut, DashboardOut, ImportResult)
- backend/app/crud.py — CRUD para todos os modelos
- backend/app/seed.py — 2 pessoas, 20 categorias, 18 regras, 1 meta
- backend/app/main.py — FastAPI app com CORS, auto-create tables, seed, 8 routers
- backend/app/routers/persons.py — GET, POST, PUT
- backend/app/routers/cards.py — GET, POST, PUT
- backend/app/routers/categories.py — GET, POST, PUT
- backend/app/routers/transactions.py — GET (filtros: month, category_id, person_id, source, pending), PUT
- backend/app/routers/rules.py — GET, POST, PUT, DELETE
- backend/app/routers/goals.py — GET, POST, PUT
- backend/app/routers/dashboard.py — GET /dashboard/?month=YYYY-MM
- backend/app/routers/imports.py — GET /imports/, POST /imports/bank-statement-ofx
- backend/app/services/__init__.py
- backend/app/services/categorizer.py — normalização + match por prioridade
- backend/app/services/dashboard_service.py — agregações mensais
- backend/app/services/ofx_parser.py — parser OFX com ofxparse

## Endpoints implementados e testados
- GET / — status ok
- GET /persons/ — 2 pessoas (Você, Fernanda)
- GET /categories/ — 20 categorias (8 fixed, 6 variable, 6 income)
- GET /rules/ — 18 regras com category_name e person_name
- GET /goals/ — 1 meta (Reserva de emergência R$10.000)
- GET /dashboard/?month=YYYY-MM — Dashboard completo com limites
- GET /transactions/?month=&category_id=&person_id=&source=&pending=
- GET /cards/ — lista de cartões
- GET /imports/ — histórico de importações
- POST /imports/bank-statement-ofx — importação OFX com dedup e auto-categorização

## Seed atual
- Pessoas: Você (id=1), Fernanda (id=2)
- Categorias: 8 fixas, 6 variáveis, 6 income (20 total)
- Regras: 18 (IFOOD, KEETA, MERCADO, FARMÁCIA, UBER, NETFLIX, SPOTIFY, etc.)
- Meta: Reserva de emergência R$10.000

## Parsers implementados
- OFX: CONCLUÍDO (ofx_parser.py com ofxparse, dedup por FITID + hash)
- PDF Itaú: NÃO INICIADO (próxima fase)

## Telas implementadas
Nenhuma (frontend não iniciado).

## Desktop / EXE
- pywebview: não iniciado
- PyInstaller: não iniciado
- Executável: não gerado

## Obsidian
- Caminho: C:\Users\fabio\OneDrive\Documentos\Projetos\app-financeiro-fabio\
- Arquivos: 00_INDEX.md a 09_COMANDOS.md + context_manifest.json
- Último update: 2026-05-01

## Plano de fases restantes
- FASE 3: Parser PDF Itaú → POST /imports/credit-card-pdf
- FASE 4: Dashboard backend (já feito parcialmente no dashboard_service.py)
- FASE 5: Frontend base (React + Vite + TS + Tailwind + layout)
- FASE 6: Telas principais (Dashboard, Import, Transações, Cartão)
- FASE 7: Telas admin (Regras, Metas, Config)
- FASE 8: Integração frontend ↔ backend
- FASE 9: Desktop packaging (pywebview + PyInstaller)

## Como continuar em nova sessão
1. Ler este SESSION_STATE.md (repo ou Obsidian)
2. Ler context_manifest.json no Obsidian
3. cd C:\Users\fabio\Projects\app-financeiro-fabio
4. git checkout develop
5. Identificar fase atual e próximos passos
6. Para rodar o backend: cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
7. Nunca recomeçar do zero se houver estado salvo
