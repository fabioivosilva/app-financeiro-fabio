# 🚀 PRÓXIMA SESSÃO — App Financeiro Fabio

> Leia este arquivo antes de qualquer coisa. É o ponto de partida oficial.

---

## Contexto em 30 segundos

Estamos migrando o **frontend para um novo design system** chamado **Etheris Finance**
(gerado pelo Stitch). O backend (FastAPI + SQLite) está completo e **não muda**.

O app é um controle financeiro desktop Windows. O usuário importa extratos bancários
(OFX, Excel, PDF), vê suas transações categorizadas, acompanha o mês atual e
planeja os meses futuros com Provisões.

---

## O que já existe e funciona (não mexer)

### Backend — 100% pronto
- Models: Person, Card, Category, Transaction, Rule, FileImport, Goal, Setting, Provision, ProvisionOccurrence
- Routers: `/api/dashboard`, `/api/transactions`, `/api/categories`, `/api/rules`, `/api/goals`, `/api/provisions`, `/api/imports`, `/api/cards`, `/api/persons`, `/api/settings`
- Parsers: OFX, PDF Itaú, Excel Itaú
- Build: `build_desktop.bat` → gera `ControleFinanceiro\ControleFinanceiro.exe`

### Referências de design prontas (Stitch)
Estão em `C:\Users\fabio\Downloads\stitch_preview\stitch_instant_finance_tracker\`:
- `etheris_finance/DESIGN.md` ← **tokens de cor, tipografia, glassmorphism**
- `dashboard_consolidado/code.html` ← protótipo HTML do Dashboard
- `importar_arquivos/code.html` ← protótipo HTML do Importar
- `transa_es_do_ciclo/code.html` ← protótipo HTML de Transações
- `provis_es_e_futuro/code.html` ← protótipo HTML de Provisões

### Backup da versão anterior
`C:\Users\fabio\Downloads\App-financeiro-v0.1.0.zip`

---

## O que fazer agora

### Passo 1 — Atualizar o repo
```bash
git checkout develop
git pull origin develop
```

### Passo 2 — Ler o backlog
`obsidian-vault/05_PENDENCIAS.md` — está organizado em trilhas A → B → C → D

### Passo 3 — Começar pela Trilha A

**A1 — Setup Design System Etheris Finance** é o primeiro item obrigatório.
Nada das telas pode ser feito antes disso.

O que fazer em A1:
1. Atualizar `frontend/tailwind.config.ts` com os tokens de cor do `DESIGN.md`
2. Criar utilitários CSS globais:
   - `.glass-card` → `backdrop-filter: blur(20px)` + bg 3% white + border 1px 12% white
   - `.glass-modal` → blur(20px) + bg 8% white + border 1px 20% white
   - `.btn-primary` → bg `#820AD1` + hover `box-shadow: 0 0 15px #820AD1`
   - `.btn-ghost` → glass border + backdrop blur
3. Instalar fonte Inter
4. Não tocar nas páginas ainda

---

## Regras que nunca mudam

| Regra | Detalhe |
|---|---|
| Branch | Sempre `develop`, nunca `main` |
| Cor primária | `#820AD1` |
| Estilo | Dark mode + glassmorphism (Etheris Finance) |
| Fonte | Inter |
| Ícones | Material Symbols Outlined |
| Ciclo financeiro | Dia 27 ao dia 26 |
| Executável | `ControleFinanceiro\ControleFinanceiro.exe` (raiz) |
| Categorias | `backend/app/seed.py` é a fonte da verdade |
| Build | Rodar `build_desktop.bat` ao fechar cada item |

---

## Protocolo de fechamento de item (sempre seguir)

```bash
# 1. Marcar [x] em obsidian-vault/05_PENDENCIAS.md
# 2. Atualizar obsidian-vault/10_CHECKPOINT_ATUAL.md
# 3. Commitar
git add -A
git commit -m "feat(escopo): descrição"
# 4. Rodar o build
build_desktop.bat
# 5. Push
git push origin develop
```

---

## Stack completa

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS + Recharts |
| Backend | Python 3.12 + FastAPI + SQLAlchemy + SQLite |
| Desktop | PyWebView + PyInstaller (onedir) |
| Design | Etheris Finance (Stitch) — tokens em `DESIGN.md` |

---

*Gerado em 2026-05-02. Para detalhes completos do backlog: `obsidian-vault/05_PENDENCIAS.md`*
