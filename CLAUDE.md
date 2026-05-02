# App Financeiro Fabio — Guia para Agentes de IA

Este arquivo é lido automaticamente pelo Claude Code e outros agentes de IA.

## 🚨 Leitura Obrigatória ao Iniciar

Antes de qualquer código ou sugestão, ler nesta ordem:
1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` — handoff canônico, último estado e próxima tarefa
2. `obsidian-vault/05_PENDENCIAS.md` — backlog completo com trilhas A→B→C→D

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS + Recharts |
| Backend | Python 3.12 + FastAPI + SQLAlchemy + SQLite |
| Desktop | PyWebView + PyInstaller (onedir) |
| Design | Etheris Finance (Stitch) — ver `docs/UX_REFERENCE.md` |
| Build | `build_desktop.bat` → gera `ControleFinanceiro\ControleFinanceiro.exe` na raiz |

## Estado Atual — Migração v2.0

Frontend está sendo reescrito do zero com design system **Etheris Finance**.
Backend (FastAPI + SQLite) está completo e **não muda**.
Ver `obsidian-vault/10_CHECKPOINT_ATUAL.md` para o ponto exato de onde retomar.

## Regras de Ouro

### Git
- Trabalhar SEMPRE na branch `develop`
- Nunca commitar direto em `main` — merge via develop
- Commit após cada feature/fix completo
- Push ao final de cada item do backlog

### Design System (Etheris Finance)
- Dark mode obrigatório, fundo `#17111b`
- Cor primária: `#820AD1`
- Glassmorphism: `backdrop-filter: blur(20px)`, cards com 3% white opacity
- Fonte: Inter
- Ícones: Material Symbols Outlined
- Referência completa: `docs/UX_REFERENCE.md`
- Protótipos HTML: `C:\Users\fabio\Downloads\stitch_preview\stitch_instant_finance_tracker\`

### Backend
- `backend/app/seed.py` é a fonte da verdade das regras de categorização
- Qualquer nova regra de categoria deve ser refletida no seed.py
- Ciclo financeiro: dia 27 ao dia 26

### Protocolo de Fechamento de Item (OBRIGATÓRIO)
Ao concluir qualquer tarefa:
1. Marcar `[x]` em `obsidian-vault/05_PENDENCIAS.md`
2. Atualizar `obsidian-vault/10_CHECKPOINT_ATUAL.md`
3. `git add -A && git commit -m "feat/fix(...): descrição"`
4. Rodar `build_desktop.bat` (abre terminal Windows separado — tem `pause`)
5. `git push origin develop`

### Scripts úteis na raiz
- `build_desktop.bat` — gera o `.exe` (rodar no terminal Windows)
- `sync_and_run.bat` — sincroniza o repo e abre o app (para uso diário do Thiago/Fabio)
- `install_auto_sync.bat` — instala o auto_sync no Agendador do Windows (uma vez)
- `auto_sync.ps1` — roda no login: faz pull, detecta mudanças de código, rebuilda se necessário

## Estrutura do Projeto

```
backend/app/
  main.py, database.py, models.py, schemas.py, crud.py
  routers/     → dashboard, imports, transactions, categories, rules, goals, cards, persons, settings, provisions
  services/    → parsers (OFX, PDF, Excel), dashboard_service, categorizer

frontend/src/
  pages/       → DashboardPage, TransactionsPage, CardPage, GoalsPage, ImportPage, RulesPage, SettingsPage, ProvisionsPage
  components/  → Modal, MonthSelector, Sidebar
  types/       → contratos TypeScript
  api/         → client.ts (axios)

obsidian-vault/  → cérebro do projeto (backlog, checkpoint, decisões)
docs/            → UX reference e design system
data/            → finance.db (não versionar, é local)
```

## Executor do Build (Windows)
O `build_desktop.bat` deve ser rodado pelo **usuário na máquina Windows**.
Tem `pause` no final — não roda de forma não-interativa.
