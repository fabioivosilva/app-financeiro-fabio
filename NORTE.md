# NORTE — App Financeiro Fabio & Thiago

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : PAUSA PARA BUGFIX — auditar UI 100% referência + integração front↔back antes de novas features.
BRANCH     : develop
PRÓXIMA    : BUG.1 — Auditoria UI/API de todos os menus [G]
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
**Dev:** backend FastAPI `127.0.0.1:8000` + Vite `127.0.0.1:5173` · **DB:** `data\finance.db` (local, não versionar)

---

## 🛠 Stack & Design

**Stack:** React 19 + Vite + TS + TailwindCSS + Recharts · FastAPI + SQLAlchemy + SQLite
**Cores:** Primary `#820AD1` · Fundo `#fff7fd` · Verde `#0e8345` · Vermelho `#ba1a1a` · Orange `#f97316`
**Design:** Dark mode · Glassmorphism · Fonte Inter · Referência visual obrigatória: `C:\Users\fabio\Downloads\App-financeiro`
**Regra UI rígida:** nenhuma tela, modal, popover, filtro ou card pode ser "parecido"; precisa copiar estrutura/classes/ordem/labels do componente de referência antes de adaptar dados reais.
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

## 🔴 BUGS BLOQUEANTES — LER ANTES DAS TRILHAS

Regra de status: `[x]` só quando estiver pronto, validado e aceito. Se tem código mas ainda depende de BUG, fica `[ ]` como **PARCIAL/BLOQUEADO**. O trabalho de amanhã começa em BUG.1.

### 🔴 TRILHA BUG — Estabilização UI/API *(bloqueia novas features antes de T3.2)*

- [x] `[G]` **BUG.1 — Auditoria UI/API de todos os menus** · *Thiago + Fabio · CONCLUÍDO 2026-05-03*
  Resultado: Dashboard🔴placeholder, Importar🟡funcional/BUG.4, Transações🟡funcional/BUG.2-3, Cartão🔴placeholder, Provisões🔴placeholder(sem backend), Metas🟢funcional, Regras🟢funcional, Config🔴placeholder. Backend: todas as rotas existem exceto provisions e settings.
  **Fixes entregues:** filtro "Ciclo atual" (dia 27→26) em Transações + suggestCategory agora usa regras reais do backend.

- [ ] `[G]` **BUG.2 — Conformidade 100% da referência visual** · *qualquer um · depende BUG.1*
  Portar telas ainda placeholder ou parciais usando exatamente os componentes da referência. Hoje confirmados como pendentes/parciais: Dashboard, Cartão, Provisões e Configurações; Transações/Regras/Importar/Metas precisam reauditoria visual fina.

- [ ] `[M]` **BUG.3 — Modais, popovers e dropdowns sem quebra visual** · *qualquer um · depende BUG.1*
  Auditar `CategoryPopover`, `RuleModal`, modais de Metas, modal Nova Regra, dropdowns de filtros e grid de categorias/pessoas. Todo modal deve usar classes da referência (`modal-*`, `modal-cat-grid`, `inbox-cat`, `inbox-person`, `filter-dd`) sem texto grudado/overflow.

- [x] `[M]` **BUG.4 — Remover mocks ou sinalizar claramente o que ainda é mock** · *Thiago · CONCLUÍDO 2026-05-03*
  Importar: substituído sampleImports por localStorage (loadHistory/saveHistory). Histórico persiste entre sessões, começa vazio, empty state adicionado. Nenhum dado fake restante identificado nas demais telas funcionais.

- [ ] `[P]` **BUG.5 — Script dev confiável** · *qualquer um*
  Ajustar/validar `rodar.bat` para subir backend + Vite no modelo atual. Não usar `.exe`, `build_desktop.bat`, PyWebView ou PyInstaller enquanto não existirem no repo novo.

#### HANDOFF CLAUDE — 2026-05-03 noite

- **Regra UX absoluta:** abrir `C:\Users\fabio\Downloads\App-financeiro` antes de mexer em qualquer tela. Copiar estrutura, classes, ordem, labels e comportamento do componente de referencia; adaptar somente dados/API depois. "Parecido" nao passa.
- **Validado hoje:** `npm.cmd run build` passou depois dos ajustes de UI em Transacoes/sidebar.
- **Commits recentes em `develop`:** `da83edd` inbox de pendentes; `0a9ddef` sem categoria conta como pendente; `6e303ba` status local da sidebar; `01285d9` dropdown acima da lista; `c75f069` filtros de Transacoes conforme referencia.
- **Transacoes:** botao `Revisar N pendentes` agora abre fluxo inbox one-by-one baseado na referencia, com categoria, pessoa, pular, categorizar e proxima, `PUT /transactions/{id}` e regra opcional via `POST /rules/`.
- **Pendente amanha:** executar BUG.1 antes de novas features. Conferir todos os menus contra backend real e referencia visual: Dashboard, Importar, Transacoes, Cartao, Provisoes, Metas, Regras e Configuracoes. Configuracoes ainda nao foi portada/conectada.
- **Cuidado:** nao usar fluxo antigo de `.exe`, `build_desktop.bat`, PyWebView ou PyInstaller. Modelo atual e backend FastAPI + Vite.

### TRILHA 0 — Fundação *(nenhum código existe ainda — começar aqui)*

- [x] `[G]` **T0.1 — Backend Base** · *Fabio · CONCLUÍDO*
  FastAPI + SQLAlchemy + SQLite · 7 modelos · 8 routers CRUD · seed com Fabio/Fernanda/cartões/10 cats/regras/meta/transações
  **Saída:** `localhost:8000` funcionando com dados de seed

- [x] `[G]` **T0.2a — Frontend Shell** · *Fabio · CONCLUÍDO*
  Vite + React 19 + TS + Tailwind · AppShell + Sidebar + MonthSelector · react-router · API client tipado · 6 pages placeholder

- [x] `[M]` **T0.2b — Design System** · *Fabio · CONCLUÍDO*
  Icon, Button, Glass, Badge, CategoryChip, Modal, PageHeader, SectionHeader, CycleProgress
  CSS completo fiel ao design de referência (styles.css) · tokens corretos · Inter + Material Symbols
  - [ ] Cor primary: separar #6200a0 (texto) de #820AD1 (brand/botões)
  - [ ] Backlog v2: switch light/dark mode (tokens já preparados no index.css)
  **NOTA:** design light mode em elaboração com designer (Claude.ai) — sessão estourou tokens antes de concluir. Arquivo incompleto. Retomar quando designer tiver nova sessão.

- [ ] `[P]` **T0.3 — Script de Execução** · *Fabio · PARCIAL/BLOQUEADO BUG.5*
  `rodar.bat` existe, mas ainda precisa validação ponta a ponta como fluxo dev confiável antes de marcar concluído.
  **Saída:** app abrindo no browser via rodar.bat

---

### TRILHA 1 — Importação *(T1.1 antes de T1.2)*

- [x] `[G]` **T1.1 — Parsers Plugáveis** · *Fabio · CONCLUÍDO*
  Interface `BaseParser` · `PARSER_REGISTRY` · parsers OFX, Itaú Excel e Itaú PDF · endpoint único `POST /imports/upload` · deduplicação centralizada.
  **Detalhe técnico:** `08_PARSERS.md`

- [x] `[M]` **T1.2 — Tela de Importação** · *Thiago · CONCLUÍDO 2026-05-03*
  Drag & drop · upload real `POST /imports/upload` · resumo pós-import · histórico via localStorage (loadHistory/saveHistory) · começa vazio · empty state adicionado. BUG.4 fechado.
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Importar Dados"

- [ ] `[M]` **T1.3 — Importação Assistida** · *qualquer um · depende T1.2*
  Pasta padrão configurável · lista arquivos não importados · 1 clique para importar

---

### TRILHA 2 — Transações & Regras *(depende T0+T1)*

- [ ] `[M]` **T2.1 — Tela de Transações** · *Fabio · PARCIAL/BLOQUEADO BUG.2/BUG.3*
  Lista agrupada por data · filtros pill conforme referência · aba pendentes · sem categoria conta como pendente · inline edit categoria · botão `Revisar N pendentes` abre inbox one-by-one · categoriza e cria regra automática. Não marcar concluído até reauditoria visual/API passar.
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Transações"

- [ ] `[M]` **T2.2 — Tela de Regras** · *Fabio · PARCIAL/BLOQUEADO BUG.2/BUG.3*
  CRUD regras keyword→categoria+pessoa · nova regra em modal · exclusão · lista no padrão visual de referência existem, mas ainda precisam reauditoria visual/API. Vínculo cartão→pessoa/paginação ficam para BUG.1 se ainda forem necessários.
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Regras"

- [ ] `[P]` **T2.3 — Cofrinho por Keyword** · *qualquer um · depende T2.2+T3.1*
  Campo `keyword` em Goal · ao categorizar, bate keyword → vincula à meta automaticamente

---

### TRILHA 3 — Metas & Cofrinho *(depende T0+T2)*

- [ ] `[M]` **T3.1 — Tela de Metas** · *Fabio · PARCIAL/BLOQUEADO BUG.2*
  Cards com barra de progresso · CRUD (nome, objetivo, prazo, categoria vinculada) · progresso calculado por transações da categoria existem, mas ainda precisam reauditoria 100% contra a referência antes de marcar concluído.
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
# 2. Validar no modelo atual: backend FastAPI + Vite + npm.cmd run build
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
