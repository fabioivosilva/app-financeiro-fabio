# 02_DECISOES_TECNICAS

Decisoes estaveis. Para estado atual e pendencias, usar `10_CHECKPOINT_ATUAL.md` e `05_PENDENCIAS.md`.

## Stack

- Frontend: React + Vite + TypeScript + TailwindCSS + Recharts.
- Backend: Python 3.12, FastAPI, SQLAlchemy, SQLite.
- Desktop: PyWebView + PyInstaller onefile.
- Parsers: OFX, PDF Itau e Excel Itau.

## Produto

- App local/desktop, sem login e sem cloud no MVP.
- Banco SQLite local em `data/finance.db`.
- Executavel de uso e o da raiz: `ControleFinanceiro.exe`.

## Regras de Dados

- Deduplicacao por `external_id` em OFX quando existir; fallback por hash.
- Cartao usa hash incluindo `card_id`.
- Categoria `exclude_from_totals` remove transacoes de totais/limites/dashboard.
- Ciclo financeiro: dia 27 ao dia 26.

## UX

- Base visual inspirada no prototipo Stitch.
- Cores principais: purple `#820AD1`, fundo `#fff7fd`, verde `#0e8345`, vermelho `#ba1a1a`, orange Fernanda `#f97316`.
