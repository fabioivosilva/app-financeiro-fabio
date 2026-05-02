# 06_ARQUITETURA

Resumo atual do app desktop.

## Stack

- Frontend: React + Vite + TypeScript + CSS do prototipo Etheris.
- Backend: FastAPI + SQLite minimo.
- Desktop: `backend/main_desktop.py` com PyWebView + Uvicorn em porta local livre.
- Build: `build_desktop.bat` gera `backend/dist/ControleFinanceiro.exe` e copia para `ControleFinanceiro.exe` na raiz.

## Estrutura Relevante

```text
backend/app/
  main.py                 FastAPI app e rotas
  database.py             SQLite limpo, schema minimo
  models.py               helpers de hash/deduplicacao
  routers/                dashboard, imports, transactions
  services/               motor de parsers preservado: OFX, PDF Itau, Excel Itau
frontend/src/
  App.tsx                 shell e telas do novo prototipo
  main.tsx                entrada React
  styles/prototype.css    CSS oficial do zip de design
```

## Dados Locais

- Banco: `data/finance.db` ao lado do executavel da raiz.
- Imports privados e bancos locais nao devem ir para git.

## Fluxo de Importacao

1. Usuario importa OFX/PDF/Excel.
2. Parser extrai lancamentos normalizados.
3. Importador deduplica por hash/FITID.
4. Importador grava transacoes cruas no SQLite novo.
5. Dashboard e telas leem agregacoes basicas do SQLite.

## Observacoes Atuais

- Reset arquitetural A4: carcaça antiga removida; parsers foram preservados.
- Excel Itau e o caminho principal para fatura de cartao.
- Handoff operacional vive somente no Obsidian (`10_CHECKPOINT_ATUAL.md`), nao em arquivo solto na raiz.
