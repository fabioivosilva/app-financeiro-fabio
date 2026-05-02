# 06_ARQUITETURA

Resumo atual do app desktop.

## Stack

- Frontend: React + Vite + TypeScript + TailwindCSS + Recharts.
- Backend: FastAPI + SQLAlchemy + SQLite.
- Desktop: `backend/main_desktop.py` com PyWebView + Uvicorn em porta local livre.
- Build: `build_desktop.bat` gera `backend/dist/ControleFinanceiro.exe` e copia para `ControleFinanceiro.exe` na raiz.

## Estrutura Relevante

```text
backend/app/
  main.py                 FastAPI app e rotas
  database.py             SQLite, schema leve e migrations simples
  models.py               ORM
  schemas.py              contratos API
  crud.py                 consultas e persistencia
  routers/                dashboard, imports, transactions, categories, rules, goals, cards, persons
  services/               parsers, dashboard, categorizacao, aprendizado
frontend/src/
  pages/                  telas principais
  components/             componentes compartilhados
  types/                  tipos TS dos contratos
```

## Dados Locais

- Banco: `data/finance.db` ao lado do executavel da raiz.
- Imports privados e bancos locais nao devem ir para git.

## Fluxo de Importacao

1. Usuario importa OFX/PDF/Excel.
2. Parser extrai lancamentos normalizados.
3. Importador deduplica por hash/FITID.
4. Categorizador aplica regras.
5. Transacoes pendentes ficam para revisao manual.
6. Dashboard e telas leem agregacoes do SQLite.

## Observacoes Atuais

- Ciclo financeiro usado no dashboard/cartao: dia 27 ao dia 26.
- Excel Itau e o caminho principal para fatura de cartao.
- Session state vive somente no Obsidian (`01_SESSION_STATE.md`), nao no repo.
