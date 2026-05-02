# SESSION_STATE

## Status geral
FASE 3 concluída. Backend completo com parsers OFX e PDF. Próximo: FASE 4 (Dashboard backend - já parcialmente feito) ou FASE 5 (Frontend base).

## Última fase concluída
- FASE 3: Parser PDF Itaú (fatura do cartão de crédito)

## Fase atual
Preparando FASE 5 — Frontend base (FASE 4 já está feita dentro do dashboard_service.py)

## Repo
- URL: https://github.com/fabioivosilva/app-financeiro-fabio
- Local: C:\Users\fabio\Projects\app-financeiro-fabio
- Branch: develop
- Último commit: feat: add Itaú credit card PDF import (1c42dc4)

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
- OFX: ofxparse (CONCLUÍDO - FASE 2)
- PDF: pdfplumber (CONCLUÍDO - FASE 3)
- UX do Stitch como referência visual obrigatória
- pywebview + PyInstaller para desktop/exe
- Sem login, cloud, Open Finance, SaaS ou Upgrade Pro

## Arquivos do Backend (todos criados e testados)
- backend/requirements.txt — fastapi, uvicorn, sqlalchemy, pydantic, pdfplumber, ofxparse, python-multipart, aiofiles
- backend/app/__init__.py
- backend/app/database.py — SQLAlchemy engine + SessionLocal + get_db
- backend/app/models.py — 8 modelos: Person, Card, Category, Transaction, Rule, FileImport, Goal, Setting
- backend/app/schemas.py — Pydantic schemas completos incluindo DashboardOut e ImportResult
- backend/app/crud.py — CRUD para todos os modelos com filtros e dedup
- backend/app/seed.py — 2 pessoas, 20 categorias, 18 regras, 1 meta
- backend/app/main.py — FastAPI app com CORS, auto-create tables, seed, 8 routers
- backend/app/routers/persons.py — GET, POST, PUT
- backend/app/routers/cards.py — GET, POST, PUT
- backend/app/routers/categories.py — GET, POST, PUT
- backend/app/routers/transactions.py — GET (filtros: month, category_id, person_id, source, pending), PUT
- backend/app/routers/rules.py — GET, POST, PUT, DELETE
- backend/app/routers/goals.py — GET, POST, PUT
- backend/app/routers/dashboard.py — GET /dashboard/?month=YYYY-MM
- backend/app/routers/imports.py — GET, POST /bank-statement-ofx, POST /credit-card-pdf
- backend/app/services/__init__.py
- backend/app/services/categorizer.py — normalização + match por prioridade
- backend/app/services/dashboard_service.py — agregações mensais completas
- backend/app/services/ofx_parser.py — parser OFX com ofxparse (FITID + dedup)
- backend/app/services/itau_pdf_parser.py — parser PDF Itaú com pdfplumber (cartão + parcelas)

## Todos os endpoints (16 total)
- GET / — status
- GET /persons/ — listar pessoas
- POST /persons/ — criar pessoa
- PUT /persons/{id} — atualizar pessoa
- GET /cards/ — listar cartões
- POST /cards/ — criar cartão
- PUT /cards/{id} — atualizar cartão
- GET /categories/ — listar categorias
- POST /categories/ — criar categoria
- PUT /categories/{id} — atualizar categoria
- GET /transactions/?month=&category_id=&person_id=&source=&pending= — listar transações
- PUT /transactions/{id} — atualizar transação
- GET /rules/ — listar regras
- POST /rules/ — criar regra
- PUT /rules/{id} — atualizar regra
- DELETE /rules/{id} — deletar regra
- GET /goals/ — listar metas
- POST /goals/ — criar meta
- PUT /goals/{id} — atualizar meta
- GET /dashboard/?month=YYYY-MM — dashboard agregado
- GET /imports/ — histórico de importações
- POST /imports/bank-statement-ofx — importar OFX
- POST /imports/credit-card-pdf — importar PDF Itaú

## Seed atual
- Pessoas: Você (id=1), Fernanda (id=2)
- Categorias fixas (8): Aluguel, Escola, MBA, Seguro, Assinaturas, Internet/Luz/Celular, Cozinheira, Faxineira
- Categorias variáveis (6): Mercado (R$1800), iFood (R$800), Farmácia (R$400), Combustível (R$1000), Transporte, Outros (R$500)
- Categorias income (6): Salário, Salário Fernanda, Reembolso, PLR, 13º, IR
- Regras (18): IFOOD, KEETA, VILA DAS FRUTAS, SAMS CLUB, PAO DE ACUCAR, CARREFOUR, HIROTA, DROGARIA, RAIA, UBER, PRUDENTIAL, NETFLIX, SPOTIFY, PARAMOUNT, PRIME, TOTALPASS, SALARIO, PIX RECEBIDO
- Meta: Reserva de emergência R$10.000

## Parsers implementados
- OFX: CONCLUÍDO — ofxparse, dedup por FITID + hash
- PDF Itaú: CONCLUÍDO — pdfplumber, detecção de cartão por final, parcelas, dedup por hash

## Telas implementadas
Nenhuma (frontend não iniciado).

## Frontend (NÃO INICIADO)
- Stack: React + Vite + TypeScript + TailwindCSS v3
- UX: Stitch (documentado em docs/UX_REFERENCE.md e 07_UX_REFERENCE.md no Obsidian)
- Telas: Dashboard, Importar, Transações, Cartão, Regras, Metas, Configurações
- Design tokens: Primary #820AD1, BG #fff7fd, fonte Inter, cards rounded-24px
- Precisa: npx create-vite@latest ./ --template react-ts no diretório frontend/

## Desktop / EXE
- pywebview: não iniciado
- PyInstaller: não iniciado
- Executável: não gerado

## Obsidian
- Caminho: C:\Users\fabio\OneDrive\Documentos\Projetos\app-financeiro-fabio\
- Arquivos: 00_INDEX.md a 09_COMANDOS.md + context_manifest.json
- Último update: 2026-05-01

## Plano de fases restantes
- FASE 4: Dashboard backend — JÁ FEITO (dashboard_service.py existe e funciona)
- FASE 5: Frontend base (React + Vite + TS + Tailwind + layout + sidebar)
- FASE 6: Telas principais (6a: Dashboard, 6b: Importar, 6c: Transações, 6d: Cartão)
- FASE 7: Telas admin (Regras, Metas, Configurações)
- FASE 8: Integração frontend ↔ backend + testes
- FASE 9: Desktop packaging (pywebview + PyInstaller → ControleFinanceiro.exe)

## Como continuar em nova sessão
1. Ler este SESSION_STATE.md (repo ou Obsidian 01_SESSION_STATE.md)
2. Ler context_manifest.json no Obsidian
3. cd C:\Users\fabio\Projects\app-financeiro-fabio
4. git checkout develop
5. Identificar fase atual: FASE 5 — Frontend base
6. Para rodar o backend: cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
7. Ler docs/UX_REFERENCE.md para design tokens e telas
8. Ler 07_UX_REFERENCE.md no Obsidian para detalhes visuais
9. Nunca recomeçar do zero se houver estado salvo
