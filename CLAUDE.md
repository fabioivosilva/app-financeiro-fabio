# App Financeiro Fabio — Guia para Agentes de IA

Este arquivo é lido automaticamente por Claude Code e outros agentes de IA.
Para Claude.ai (web), use o prompt de início de sessão padrão.

## 🚨 Leitura Obrigatória ao Iniciar

Antes de qualquer código ou sugestão, ler nesta ordem:
1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` — último estado + próxima tarefa
2. `obsidian-vault/05_PENDENCIAS.md` — backlog completo
3. (se necessário) `obsidian-vault/00_INDEX.md` — mapa do vault

## Stack
- **Frontend:** React 19 + Vite + TypeScript + TailwindCSS + Recharts
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy + SQLite
- **Desktop:** PyWebView + PyInstaller (onedir)
- **Build:** `build_desktop.bat` → gera `ControleFinanceiro.exe` na raiz

## Regras de Ouro

### Git
- Trabalhar SEMPRE na branch `develop`
- Nunca commitar em `main`
- Commit após cada feature/fix completo

### Design System (Stitch Premium)
- Dark mode obrigatório
- Cor primária: `#820AD1`
- Estilo: glassmorphism, micro-animações suaves
- Referência: `obsidian-vault/07_UX_REFERENCE.md`

### Seed e Regras de Categorização
- `backend/app/seed.py` é a fonte da verdade das 56 regras de categorização
- Qualquer nova regra de categoria deve ser refletida no seed.py

### Protocolo de Fechamento de Item (OBRIGATÓRIO)
Ao concluir qualquer tarefa:
1. Marcar `[x]` em `obsidian-vault/05_PENDENCIAS.md`
2. Atualizar `obsidian-vault/10_CHECKPOINT_ATUAL.md`
3. `git add -A && git commit -m "feat/fix(...): descrição"`
4. Instruir o usuário a rodar `build_desktop.bat`
5. `git push origin develop`

### Ciclo Financeiro
- O ciclo vai do dia 27 ao dia 26 (ex: 27/04 a 26/05 = ciclo de maio)

## Estrutura do Projeto
```
backend/app/
  main.py, database.py, models.py, schemas.py, crud.py
  routers/     → dashboard, imports, transactions, categories, rules, goals, cards, persons
  services/    → parsers (OFX, PDF, Excel), dashboard_service, categorizer

frontend/src/
  pages/       → DashboardPage, TransactionsPage, CardPage, GoalsPage, ImportPage, RulesPage, SettingsPage
  components/  → Modal, MonthSelector, etc.
  types/       → contratos TypeScript

obsidian-vault/  → cérebro do projeto (não commitar session state)
data/            → finance.db (não versionar, é local)
```

## Executor do Build (Windows)
O `build_desktop.bat` deve ser rodado pelo **usuário na máquina Windows**.
A IA não consegue rodar o build — instruir o usuário a executar após o commit.
