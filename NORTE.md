# NORTE — App Financeiro Fabio & Thiago

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : T0.1 + T0.2a concluídos. Backend (8000) + Frontend (5173) prontos.
             Seed com Fabio/Fernanda, 10 categorias, regras, meta e transações de exemplo.
BRANCH     : develop
PRÓXIMA    : T0.2b — Design System [M] · T1.1 — Parsers Plugáveis [G]
CLAIMS     : nenhum
SESSÃO     : 1G · ou · 2-3M · ou · 4-6P

QUANDO LER MAIS:
  UI / componentes visuais  →  obsidian-vault/07_UX_REFERENCE.md
  Parsers de importação     →  obsidian-vault/08_PARSERS.md
  Onboarding Thiago         →  obsidian-vault/THIAGO_SETUP.md
```

---

## 👥 Time

| Dev | Ferramenta |
|---|---|
| Fabio | Claude.ai + Claude Code VSCode |
| Thiago | Claude.ai |

**Repo:** `github.com/fabioivosilva/app-financeiro-fabio` · Branch: `develop`
**Exe:** `ControleFinanceiro\ControleFinanceiro.exe` · **DB:** `data\finance.db` (local, não versionar)

---

## 🛠 Stack & Design

**Stack:** React 19 + Vite + TS + TailwindCSS + Recharts · FastAPI + SQLAlchemy + SQLite · PyWebView + PyInstaller
**Cores:** Primary `#820AD1` · Fundo `#fff7fd` · Verde `#0e8345` · Vermelho `#ba1a1a` · Orange `#f97316`
**Design:** Dark mode · Glassmorphism · Fonte Inter · Referência visual: `07_UX_REFERENCE.md`
**Ciclo financeiro:** dia 27 ao dia 26 · **Seed:** `backend/app/seed.py` = fonte da verdade das regras

---

## 🔒 Claims — Quem está em quê

> Antes de iniciar: marcar `🔒 [NOME]` no item e commitar.
> Ao fechar: remover 🔒, marcar `[x]`, commitar + push.

```bash
git add NORTE.md && git commit -m "chore: 🔒 [FABIO] inicia TXX" && git push origin develop
```

*Nenhum claim ativo no momento.*

---

## 📋 ROADMAP

### TRILHA 0 — Fundação *(nenhum código existe ainda — começar aqui)*

- [x] `[G]` **T0.1 — Backend Base** · *Fabio · CONCLUÍDO*
  FastAPI + SQLAlchemy + SQLite · 7 modelos · 8 routers CRUD · seed com Fabio/Fernanda/cartões/10 cats/regras/meta/transações
  **Saída:** `localhost:8000` funcionando com dados de seed

- [x] `[G]` **T0.2a — Frontend Shell** · *Fabio · CONCLUÍDO*
  Vite + React 19 + TS + Tailwind · AppShell + Sidebar + MonthSelector · react-router · API client tipado · 6 pages placeholder

- [ ] `[M]` **T0.2b — Design System** · *qualquer um · paralelo com T0.1*
  Button, Card, Modal, Badge · tokens completos · fontes Inter
  **Saída:** componentes reutilizáveis com visual glassmorphism
  **PENDÊNCIAS antes de iniciar:**
  - [x] ⚠️ Modo: DARK MODE confirmado para v1 (UX ref é light — será v2)
  - [ ] Sidebar: ajustar de 220px → 256px conforme UX ref
  - [ ] Carregar fonte Inter via Google Fonts ou bundle local
  - [ ] Criar rota /configuracoes (Pessoas, Cartões, Categorias, Sistema)
  - [ ] Cor primary: separar #6200a0 (texto) de #820AD1 (brand/botões)
  - [ ] Backlog v2: switch light/dark mode (tokens já preparados no index.css)
  **NOTA:** design light mode em elaboração com designer (Claude.ai) — sessão estourou tokens antes de concluir. Arquivo incompleto. Retomar quando designer tiver nova sessão.

- [ ] `[P]` **T0.3 — Script de Execução** · *Fabio · depende T0.1+T0.2*
  `rodar.bat` sobe backend + abre browser · `auto_sync.ps1` só faz git pull + notificação (sem rebuild exe)
  **Saída:** app abrindo no browser via rodar.bat

---

### TRILHA 1 — Importação *(T1.1 antes de T1.2)*

- [ ] `[G]` **T1.1 — Parsers Plugáveis** · *qualquer um · depende T0.1*
  Interface `BaseParser` · `PARSER_REGISTRY {(banco,formato): Parser}` · parsers: OFX, Itaú Excel, Itaú PDF · endpoint único `POST /imports/upload` · deduplicação centralizada
  **Detalhe técnico:** `08_PARSERS.md`

- [ ] `[M]` **T1.2 — Tela de Importação** · *qualquer um · depende T1.1*
  Dropdown banco+formato · drag & drop · resumo pós-import · histórico de imports
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Importar Dados"

- [ ] `[M]` **T1.3 — Importação Assistida** · *qualquer um · depende T1.2*
  Pasta padrão configurável · lista arquivos não importados · 1 clique para importar

---

### TRILHA 2 — Transações & Regras *(depende T0+T1)*

- [ ] `[M]` **T2.1 — Tela de Transações** · *qualquer um*
  Lista agrupada por data · filtros pill (mês, categoria, pessoa, origem, status) · toggle pendentes · inline edit categoria · "criar regra automática"
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Transações"

- [ ] `[M]` **T2.2 — Tela de Regras** · *qualquer um · depende T2.1*
  CRUD regras (keyword→categoria+pessoa+origem+goal_id opcional) · vínculo cartão→pessoa · grid com busca e paginação
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Regras"

- [ ] `[P]` **T2.3 — Cofrinho por Keyword** · *qualquer um · depende T2.2+T3.1*
  Campo `keyword` em Goal · ao categorizar, bate keyword → vincula à meta automaticamente

---

### TRILHA 3 — Metas & Cofrinho *(depende T0+T2)*

- [ ] `[M]` **T3.1 — Tela de Metas** · *qualquer um*
  Cards com barra de progresso · CRUD (nome, objetivo, prazo, categoria vinculada) · progresso calculado por transações da categoria
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Metas"

- [ ] `[M]` **T3.2 — Aporte Manual** · *qualquer um · depende T3.1*
  Botão "Registrar Aporte" · modal (valor, descrição, data) · `POST /goals/{id}/deposit` → cria Transaction com origem `Aporte Manual`

- [ ] `[P]` **T3.3 — Insight de Meta** · *qualquer um · depende T3.1*
  Card roxo: "Para atingir X até DD/MM, guarde R$ Y/mês"

---

### TRILHA 4 — Dashboard & Cartão *(depende T0+T2+T3)*

- [ ] `[G]` **T4.1 — Dashboard** · *qualquer um*
  Hero saldo do mês · sub-cards fatura+saldo · gastos por pessoa (barras) · limites por categoria (verde/amarelo/vermelho) · meta de reserva · comparativo ciclo anterior · top 3 categorias · MonthSelector global
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Dashboard"

- [ ] `[M]` **T4.2 — Tela de Cartão** · *qualquer um · depende T4.1*
  Hero total fatura+limite · tabs (Resumo, Por Pessoa, Parcelas Futuras, Recorrentes) · barras por pessoa · lista por categoria
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Cartão"

---

### TRILHA 5 — Provisões & Fluxo de Caixa *(em sequência, cada depende do anterior)*

- [ ] `[G]` **T5.1 — Modelo de Provisões** · *Thiago propôs*
  Modelo `Provision` (desc, valor, tipo, categoria, recorrência, datas) · gera `ProvisionOccurrence` para recorrentes · CRUD + tela frontend · casos: assinaturas, parcelas, empréstimos

- [ ] `[G]` **T5.2 — Vinculação Provisão↔Transação** · *depende T5.1*
  Ao importar: sugerir atrelar a ocorrência pendente · diferença de valor → variação normal ou juros/encargos · juros = transação separada em "Juros e Encargos"

- [ ] `[G]` **T5.3 — Fluxo de Caixa Futuro** · *depende T5.1+T5.2*
  Projeção mês a mês: receitas previstas | despesas previstas | saldo projetado · realizado vs provisionado · drill-down por mês

---

### TRILHA 6 — Configurações *(paralelo com T1-T3)*

- [ ] `[M]` **T6.1 — Tela de Configurações** · *qualquer um*
  Grid 2col: Pessoas (avatar iniciais) + Cartões (final→pessoa+limite) + Categorias full-width (cor, nome, limite, soft-delete, separadores Fixas/Variáveis) + Sistema (pasta import + reset com confirmação)
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Configurações"

---

### TRILHA 7 — Insights/IA *(após T4+T5)*

- [ ] `[G]` **T7.1 — Aba Insights** · *qualquer um*
  Gastos acima da média · sugestões de corte · simulação "economize R$X → meta Y em Z meses" · projeção de metas com dados de provisão

---

### TRILHA 8 — Segurança *(não bloqueia nada, qualquer momento)*

- [ ] `[P]` **T8.1** — Avaliar criptografia local (SQLCipher vs chave derivada)
- [ ] `[P]` **T8.2** — UX de senha mestre
- [ ] `[M]` **T8.3** — Auditoria de brechas (deps, CORS, localhost, logs)
- [ ] `[M]` **T8.4** — Hardening desktop (porta aleatória, remoção de debug)

---

## ✅ Protocolo de Fechamento

```bash
# 1. Marcar [x] e remover 🔒 neste arquivo
git add NORTE.md
git add -A
git commit -m "feat(TXX): descrição"
# 2. Rodar build_desktop.bat (Windows local)
git push origin develop
```

---

## 📊 Mapa de Dependências

```
T0.1 ─┬─ T1.1 ─┬─ T1.2 ─── T1.3
      │         └─ T2.1 ─── T2.2 ─── T2.3
      │              └────── T3.1 ─┬─ T3.2
      │                            └─ T3.3
T0.2 ─┤                            │
      └─ T6.1 (paralelo)           │
                    T4.1 (T2+T3) ──┘─── T4.2
                    T5.1 ─── T5.2 ─── T5.3
                    T7.1 (após T4+T5)
                    T8.x (qualquer momento)
```

**~20 sessões no total.**
