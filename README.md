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

---

## 🤖 AI Master Prompt (Para Fabio & Thiago)

Ao iniciar uma nova sessão com qualquer IA (Antigravity, Codex, etc.), copie e cole o prompt abaixo para garantir sincronia total:

> "Estou trabalhando no projeto **App Financeiro Fabio** (Repo: `https://github.com/fabioivosilva/app-financeiro-fabio.git`). Antes de qualquer ação, siga rigorosamente este protocolo de entrada:
>
> 1. **Sincronização:** Garanta que você está na branch `develop`. Se houver mudanças remotas, faça o pull.
> 2. **Cérebro (Obsidian):** Leia o arquivo `obsidian-vault/10_CHECKPOINT_ATUAL.md` e o `obsidian-vault/05_PENDENCIAS.md`. Eles são a fonte da verdade sobre o que deve ser feito.
> 3. **Design System:** Leia o arquivo `obsidian-vault/07_UX_REFERENCE.md`. O frontend (React/Tailwind) deve seguir o estilo **Stitch Premium**.
> 4. **Regras de Ouro:** O arquivo `backend/app/seed.py` contém o mapeamento de categorias/regras. Mantenha-o sincronizado com o banco de dados local.
> 5. **Handoff:** Ao final, atualize o `obsidian-vault/10_CHECKPOINT_ATUAL.md` com o seu progresso.
>
> Agora, [INSIRA SUA TAREFA AQUI]."
