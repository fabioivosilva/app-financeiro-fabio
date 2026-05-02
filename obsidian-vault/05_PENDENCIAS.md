# 05_PENDENCIAS — Backlog Vivo

## Legenda de Tamanho
| Tag | Tokens estimados | O que cabe numa sessão |
|---|---|---|
| `[P]` Pequeno — 1 arquivo, mudança isolada | ~3–8k | 4–6 itens P |
| `[M]` Médio — 1 endpoint + 1 componente UI | ~8–20k | 2–3 itens M |
| `[G]` Grande — novo modelo + backend + UI | ~20k+ | 1 item G |

> **Capacidade de uma sessão:** 1G · ou · 2-3M · ou · 4-6P

---

## ⚠️ CONTEXTO DA MIGRAÇÃO v2.0

**Decisão tomada em 2026-05-02:** Descartar o frontend atual e reescrever do zero
com o design system **Etheris Finance** (gerado pelo Stitch).

**O que muda:**
- Frontend: reescrito do zero em React + Tailwind com tokens do Etheris Finance
- Backend: mantido (FastAPI + SQLite) — apenas ajustes pontuais se necessário
- Build: remover `pause` do `build_desktop.bat` para permitir execução automatizada

**O que NÃO muda:**
- Toda a lógica de negócio do backend (models, crud, routers)
- Banco de dados e seeds
- Estrutura de pastas

**Arquivos de referência:**
- Design system: `C:\Users\fabio\Downloads\stitch_preview\stitch_instant_finance_tracker\etheris_finance\DESIGN.md`
- Telas HTML prontas (protótipos Stitch para converter em React):
  - Dashboard: `stitch_instant_finance_tracker\dashboard_consolidado\code.html`
  - Importar: `stitch_instant_finance_tracker\importar_arquivos\code.html`
  - Transações: `stitch_instant_finance_tracker\transa_es_do_ciclo\code.html`
  - Provisões: `stitch_instant_finance_tracker\provis_es_e_futuro\code.html`
- Backup v0.1.0: `C:\Users\fabio\Downloads\App-financeiro-v0.1.0.zip`

---

## 🔴 Trilha A — Fundação do Novo Frontend
> Fazer ANTES de qualquer tela. Tudo depende disso.

- [x] `[M]` **A1 — Setup Design System Etheris Finance**
  - Atualizar `frontend/tailwind.config.ts` com todos os tokens de cor do DESIGN.md
  - Instalar fonte Inter via `@fontsource/inter` ou importar do Google Fonts no index.html
  - Criar `frontend/src/styles/globals.css` com utilitários de glassmorphism:
    - `.glass-card` → `backdrop-filter: blur(20px)`, bg 3% white, border 1px 12% white, border-radius 1rem
    - `.glass-modal` → blur(20px), bg 8% white, border 1px 20% white
    - `.btn-primary` → bg #820AD1, hover glow `box-shadow: 0 0 15px #820AD1`
    - `.btn-ghost` → glass border, backdrop blur, text white
  - Remover classes legadas do Tailwind atual que conflitam
  - Testar: abrir qualquer página e ver se os tokens aplicam corretamente
  - **Não tocar em nenhuma página ainda — só a fundação**

- [/] `[P]` 🔒 [FABIO] **A2 — Layout Base + Sidebar novo**
  - Reescrever `frontend/src/components/Sidebar.tsx` seguindo o HTML do Stitch
    - Logo "Alpha Finance" (ou o nome final) + badge "Institutional Grade"
    - Avatar do usuário no rodapé com nome e role
    - Item ativo: destaque roxo #820AD1 com glass effect
    - Itens: Dashboard, Importar, Transações, Provisões, Metas, Regras, Configurações
  - Ajustar `frontend/src/layouts/MainLayout.tsx` se necessário
  - **Não tocam nas páginas — só shell**

- [ ] `[P]` **A3 — Fix build_desktop.bat**
  - Remover linha `pause` do final do `build_desktop.bat`
  - Testar que o build roda sem travar via PowerShell
  - Commitar — habilita o agente a buildar automaticamente ao fechar itens

---

## 🔴 Trilha B — Migração das Telas (em ordem de prioridade)
> Fazer APÓS A1 e A2 concluídos. Cada item é independente dos outros.
> Referência: converter os HTML do Stitch para React + conectar na API.

- [ ] `[G]` **B1 — Dashboard v2**
  - Converter `dashboard_consolidado/code.html` para `DashboardPage.tsx`
  - Manter todos os dados da API atual (`/api/dashboard/`)
  - **Corrigir o gráfico** de Fluxo de Caixa Futuro:
    - Trocar mixed chart (barras+linha confuso) por barras agrupadas simples
    - Verde = Receita prevista, Vermelho = Despesa prevista, Roxo = Saldo projetado
    - Legenda visível, gráfico maior (50%+ da tela)
  - Manter: KPIs do topo (Balanço, Entradas, Saídas, Projeção), Limites de Categoria, Alertas
  - Remover: card "Atenção aos Gastos" laranja em posição ruim — absorver como badge nos KPIs

- [ ] `[M]` **B2 — Importar v2**
  - Converter `importar_arquivos/code.html` para `ImportPage.tsx`
  - Manter lógica de upload (OFX, Excel, PDF)
  - Novo: painel lateral "Resumo da Extração" com counters (capturadas, auto-cat, pendentes)
  - Novo: fila de arquivos com status (sucesso / duplicado / erro)
  - Botão "Processar Ciclo 27-26" destacado

- [ ] `[M]` **B3 — Transações v2**
  - Converter `transa_es_do_ciclo/code.html` para `TransactionsPage.tsx`
  - Manter: tabela, filtros, categorização inline, paginação
  - Novo: banner de ação necessária quando há pendentes
  - Novo: seletor Anterior / Próximo ciclo no topo
  - Novo: total movimentado destacado no header da tabela

- [ ] `[M]` **B4 — Provisões v2**
  - Converter `provis_es_e_futuro/code.html` para `ProvisionsPage.tsx`
  - Manter lógica atual (CRUD + ocorrências + marcar como realizado)
  - Novo: 3 meses futuros no topo com valor comprometido + % vinculado
  - Novo: painel lateral "Projeção de Saldo" com timeline de eventos

- [ ] `[M]` **B5 — Configurações v2**
  - Não tem protótipo Stitch — criar do zero seguindo Etheris Finance
  - Layout em abas: Pessoas & Cartões | Categorias | Sistema | Zona de Perigo
  - Categorias: barra de busca + filtro por grupo + grid de cards compactos com cor destacada
  - Badge de limite mensal e vínculo de meta visíveis no card de categoria
  - Zona de Perigo: card borda vermelha, botão outline até hover

- [ ] `[P]` **B6 — Metas v2**
  - Não tem protótipo Stitch — adaptar GoalsPage.tsx para Etheris Finance
  - Glass cards com PieChart, mesma lógica atual
  - Ajustar cores e tipografia para os novos tokens

- [ ] `[P]` **B7 — Regras v2**
  - Adaptar RulesPage.tsx para Etheris Finance
  - Tabela com glass rows, busca, filtros — mesma lógica atual

- [ ] `[P]` **B8 — Cartão v2**
  - Adaptar CardPage.tsx para Etheris Finance
  - Mesma lógica, visual novo

---

## 🟡 Trilha C — Features Novas (após migração completa)
> Só iniciar quando Trilha A e B estiverem concluídas.

- [ ] `[G]` **C1 — Trilha 3 Item 2: Vinculação Provisão ↔ Transação Real**
  - Ao importar, oferecer opção de atrelar transação a uma ProvisionOccurrence pendente
  - Se valor diferir: perguntar causa (variação normal vs. juros/encargos)
  - Se juros/encargos: registrar diferença como transação separada em "Juros e Encargos"
  - Atualizar status da ocorrência para "realizada" + guardar linked_transaction_id

- [ ] `[G]` **C2 — Trilha 3 Item 3: Relatório Fluxo de Caixa Futuro**
  - Nova aba ou seção no Dashboard com projeção dos próximos meses
  - Por mês: Receitas previstas | Despesas previstas | Saldo projetado
  - Distinguir realizado vs. provisionado
  - Drill-down por mês

- [ ] `[G]` **C3 — Trilha 2A: Arquitetura de Parsers Plugável**
  - Interface base `BaseParser` com método `parse(file_bytes) -> List[Transaction]`
  - `PARSER_REGISTRY = {("itau", "excel"): ItauExcelParser, ...}`
  - Dropdown banco + formato na tela de Importar
  - Unificar 3 endpoints em 1

- [ ] `[M]` **C4 — Trilha 1: Aporte Manual em Meta**
  - `POST /goals/{id}/deposit` + modal "Registrar Aporte" no card de meta
  - Transação gerada com origem "Aporte Manual"

- [ ] `[P]` **C5 — Trilha 1: Preenchimento Automático pela Categoria**
  - Ao selecionar categoria vinculada a uma meta em transação, preencher vínculo automaticamente

---

## 🔵 Trilha D — Segurança e Infraestrutura
- [ ] `[P]` **D1 — Avaliação de Criptografia Local** — mapear opções para proteger `data\finance.db`
- [ ] `[P]` **D2 — Plano de Senha/Master Key** — UX de senha mestre se criptografia adotada
- [ ] `[M]` **D3 — Varredura de Brechas** — auditoria deps Python/Node, CORS, path traversal
- [ ] `[M]` **D4 — Hardening Desktop** — porta aleatória, remover arquivos debug no build

---

## ✅ Concluídos (v0.1.0 — preservados como referência)

### Backend (mantido na v2.0)
- [x] Models: Person, Card, Category, Transaction, Rule, FileImport, Goal, Setting, Provision, ProvisionOccurrence
- [x] CRUD completo para todas as entidades
- [x] Parsers: OFX, PDF Itaú, Excel Itaú
- [x] Auto-categorização por regras de keyword
- [x] Dashboard endpoint com ciclo 27-26
- [x] Geração automática de ocorrências de Provisões

### Frontend v0.1.0 (descartado — backup em App-financeiro-v0.1.0.zip)
- [x] Dashboard com KPIs, gráficos, metas, alertas
- [x] Importar com upload OFX/PDF/Excel
- [x] Transações com filtros e categorização inline
- [x] Cartão com gastos por pessoa
- [x] Regras de auto-categorização
- [x] Metas/Cofrinhos com PieChart e progresso
- [x] Provisões com CRUD e ocorrências expandíveis
- [x] Configurações com Pessoas, Cartões, Categorias, Sistema, Danger Zone

---

*Última atualização: 2026-05-02 — Início da migração v2.0 (Etheris Finance)*
