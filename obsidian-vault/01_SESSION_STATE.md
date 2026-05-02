# SESSION STATE — App Financeiro Fabio
> Estado compacto. Detalhes históricos em `04_LOG_DE_EXECUCAO.md`.
> Para handoff completo, use `10_CHECKPOINT_ATUAL.md`.

## Status Geral
MVP concluído. App roda como executável Windows (PyWebView + FastAPI + SQLite).
Stack: React/Vite/Tailwind (frontend) · FastAPI/SQLAlchemy/SQLite (backend) · PyInstaller onedir (build).

## Branch / Repo
- Branch: `develop`
- Repo: https://github.com/fabioivosilva/app-financeiro-fabio
- Executável: `ControleFinanceiro.exe` na **raiz** do projeto (não em `backend/dist/`)
- Banco: `data/finance.db` ao lado do executável

## Próximo Passo
Ver `10_CHECKPOINT_ATUAL.md` — seção "🔴 Próxima Tarefa".

## Regra de Compactação
Não acumular logs de sessão aqui. Registrar apenas decisões que mudam a arquitetura ou o produto.
Handoffs vão em `10_CHECKPOINT_ATUAL.md`.
