# App Financeiro Fabio

Aplicativo desktop Windows de controle financeiro pessoal.
100% local — sem cloud, sem login, sem SaaS.

## O que faz

O usuário importa extratos bancários (OFX, Excel) e faturas de cartão (PDF, Excel),
o app categoriza automaticamente as transações por regras de keyword,
e exibe dashboard do mês atual + projeção de meses futuros via Provisões.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS + Recharts |
| Backend | Python 3.12 + FastAPI + SQLAlchemy + SQLite |
| Desktop | PyWebView + PyInstaller (onedir) |
| Design | Etheris Finance — dark mode, glassmorphism, `#820AD1` |

## Início Rápido

### Rodar em desenvolvimento

```bash
# Terminal 1 — Backend
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`

### Gerar o executável

```bash
build_desktop.bat
```

Executável gerado em `ControleFinanceiro\ControleFinanceiro.exe`.
O banco de dados fica em `data\finance.db` (na raiz, ao lado do exe).

### Sincronização automática (opcional)

Para sincronizar o repo e rebuildar o exe automaticamente ao logar no Windows:

```bash
install_auto_sync.bat
```

Para sincronizar manualmente e abrir o app:

```bash
sync_and_run.bat
```

## Para Desenvolvedores (Fabio & Thiago)

**Leia primeiro:** [`NEXT_SESSION.md`](NEXT_SESSION.md)

O projeto usa o Obsidian vault (`obsidian-vault/`) como cérebro compartilhado.
Backlog em `obsidian-vault/05_PENDENCIAS.md`.
Estado atual em `obsidian-vault/10_CHECKPOINT_ATUAL.md`.

Branch de trabalho: `develop`. Nunca commitar direto em `main`.

## Versões

| Versão | Status |
|---|---|
| v0.1.0 | Concluída — backup em `App-financeiro-v0.1.0.zip` |
| v2.0 | Em desenvolvimento — novo design Etheris Finance |
