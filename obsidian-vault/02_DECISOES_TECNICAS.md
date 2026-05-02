# 02_DECISOES_TECNICAS

Decisoes estaveis do produto. Para estado atual e proxima tarefa, usar:

- `obsidian-vault/10_CHECKPOINT_ATUAL.md`
- `obsidian-vault/05_PENDENCIAS.md`

## Estado do Repo

Em 2026-05-02 o repositorio foi zerado.
Nao existe frontend, backend, desktop build ou banco local implementado neste momento.

Tudo abaixo e decisao-alvo para a reconstrucao.

## Stack Alvo

- Frontend: React 19 + Vite + TypeScript + TailwindCSS + Recharts.
- Backend: Python 3.12 + FastAPI + SQLAlchemy + SQLite.
- Desktop: PyWebView + PyInstaller.
- Parser engine: modulo proprio, com parsers plugaveis por banco/formato.

## Produto

- App local/desktop.
- Sem login e sem cloud no MVP.
- Banco SQLite local futuro em `data/finance.db`.
- Executavel futuro: `ControleFinanceiro.exe`, quando a trilha desktop for recriada.

## Regras de Dados

- Ciclo financeiro: dia 27 ao dia 26.
- Deduplicacao por ID externo quando existir; fallback por hash canonico.
- Cartao deve incluir identificador de cartao/pessoa no hash quando disponivel.
- Categorias poderao excluir transacoes de totais, limites e dashboard.

## UX

- Dark mode obrigatorio.
- Glassmorphism obrigatorio.
- Cor primaria: `#820AD1`.
- Fonte: Inter.
- Icones: Material Symbols Outlined.
