# App Financeiro Fabio

Aplicativo local de controle financeiro pessoal para Windows.

## Objetivo

Controlar finanças pessoais importando faturas do cartão Itaú (PDF) e extratos bancários (OFX), com categorização automática, separação de gastos por pessoa e dashboard financeiro.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Python + FastAPI + SQLAlchemy + SQLite |
| Parsers | pdfplumber (PDF), ofxparse (OFX) |
| Desktop | pywebview + PyInstaller |

## Funcionalidades

- Importar PDF da fatura Itaú
- Importar OFX do extrato bancário
- Categorização automática por regras
- Separação de gastos por pessoa (Você x Fernanda)
- Dashboard financeiro com saldo, entradas, saídas, fatura
- Controle de limites por categoria
- Controle de metas (reserva de emergência)
- Revisão manual de transações
- Executável Windows: `ControleFinanceiro.exe`

## Estrutura

```
app-financeiro-fabio/
├── backend/          # FastAPI + SQLAlchemy + SQLite
├── frontend/         # React + Vite + TypeScript + TailwindCSS
├── desktop/          # pywebview + PyInstaller
├── docs/             # Documentação e referência UX
├── data/             # Banco SQLite (gitignored)
├── imports/          # Faturas e extratos (gitignored)
└── samples/          # Dados de teste (gitignored)
```

## Como Rodar (Desenvolvimento)

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Desktop
```bash
cd desktop
python main.py
```

## Características

- 100% local, sem cloud
- Sem login, sem Open Finance
- Sem plano pago ou SaaS
- SQLite local
- Executável Windows standalone
