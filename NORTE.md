# NORTE — App Financeiro Fabio & Thiago

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : Sessão 2026-05-04 (5). BUG.2/BUG.3 em andamento por Codex.
             Entregue primeira fatia: Cartão saiu de placeholder e foi portado para
             estrutura da referência; modais/popovers/dropdowns receberam fixes de
             grid modal, preview, ellipsis e altura/HTML válido.
BRANCH     : develop
PRÓXIMA    : BUG.2 + BUG.3 — Conformidade visual e modais/popovers [G/M]
CLAIMS     : 🔒 [CODEX] BUG.2 · 🔒 [CODEX] BUG.3
BLOCKER    : Nenhum conhecido.
SESSÃO     : 1G · ou · 2-3M · ou · 4-6P

REGRA UX ABSOLUTA (ler antes de qualquer tela):
  Abrir C:\Users\fabio\Downloads\App-financeiro ANTES de escrever qualquer JSX.
  Copiar estrutura, classes CSS, ordem dos elementos, labels e comportamento do
  componente de referência. Adaptar SOMENTE os dados/API depois. "Parecido" nao passa.
  Nunca inventar layout, classes ou UX — o codigo de referencia já existe, use-o.

QUANDO LER MAIS:
  UI / componentes visuais  →  obsidian-vault/07_UX_REFERENCE.md
  Parsers de importação     →  obsidian-vault/08_PARSERS.md
  Itens já concluídos       →  obsidian-vault/CHANGELOG.md
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

- [ ] `[G]` **BUG.2 — Conformidade 100% da referência visual** · *qualquer um · depende BUG.1* 🔒 [CODEX]
  Portar telas ainda placeholder ou parciais usando exatamente os componentes da referência. Hoje confirmados como pendentes/parciais: Dashboard, Cartão, Provisões e Configurações; Transações/Regras/Importar/Metas precisam reauditoria visual fina.
  - Fatia Configurações > Bancos concluída por Codex em 2026-05-03: cards usam SVGs locais dos bancos, check/radio via componente `Icon`, visual dark/glass e chips separados para fatura/extrato. Não alterou `Importar.tsx`.
  - Fatia Codex 2026-05-04: Cartão deixou de ser placeholder e usa `page-cartao`,
    `cartao-card`, `cartao-bg`, `cartao-info`, `cartao-bar`; Config ganhou
    `page-config` e toolbar de categorias com `cfg-cat-toolbar`/`search-wrap`;
    Provisões recuperou ação visual `Vincular` no status futuro.

- [ ] `[M]` **T_SYNC.1 — Auto-sync de regras e categorias entre Fabio e Thiago** · *qualquer um*
  Ao categorizar, criar regra ou criar categoria, salvar também no backend um endpoint
  de "sync snapshot" (regras + categorias) que o Thiago pode puxar via `GET /sync/rules-categories`.
  Thiago roda `POST /sync/apply` para aplicar as regras e categorias do Fabio na base dele.
  Objetivo: manter os dois sempre alinhados sem precisar compartilhar arquivo de banco.

- [ ] `[M]` **BUG.3 — Modais, popovers e dropdowns sem quebra visual** · *qualquer um · depende BUG.1* 🔒 [CODEX]
  Auditar `CategoryPopover`, `RuleModal`, modais de Metas, modal Nova Regra, dropdowns de filtros e grid de categorias/pessoas. Todo modal deve usar classes da referência (`modal-*`, `modal-cat-grid`, `inbox-cat`, `inbox-person`, `filter-dd`) sem texto grudado/overflow.
  - Fatia Codex 2026-05-04: grids de categorias em modais trocados para
    `modal-cat-grid`; preview da Nova Provisão voltou a ter `prov-icon`;
    popover de categoria saiu de dentro de `<span>` e ganhou limite de altura;
    chips/dropdowns ganharam ellipsis; modal de senha PDF usa `modal-backdrop`,
    `modal-head`, `modal-foot` e `cfg-input`.

#### HANDOFF ANTIGRAVITY — 2026-05-03 sessão 4 (Fim do dia)

- **BUG.7 Concluído ✅:** Importação Itaú (PDF, OFX, Excel) estabilizada.
  - **Performance:** Deduplicação otimizada de N+1 para query única (IN).
  - **Estabilidade:** Banco migrado de `Enum` para `String` em `origin` e `status` para evitar erros de encoding/acentuação (Error 500).
  - **Conectividade:** Alinhamento de hostnames (`localhost` vs `127.0.0.1`) resolveu o `Failed to fetch`.
- **FEATURE TOGGLE DE IMPORTAÇÃO 🚀:**
  - O motor de importação agora é "amarrado" aos bancos ativos nas configurações.
  - O backend recebe `active_bank_ids` e só executa os parsers permitidos.
  - O `OFXParser` agora detecta automaticamente se o arquivo é do Itaú (código 341).
- **BANCO DE DADOS:** Resetado em `data/finance.db` com o novo esquema e populado via `seed.py`.

#### HANDOFF CLAUDE — 2026-05-03 sessão 3 (Thiago)

- **Entregues:**
  - `rodar.bat`: mata portas 8000/5173 antes de subir novos processos + `--reload` no uvicorn → problema de "porta ocupada" resolvido
  - C3 parser C6 Bank (`backend/app/parsers/c6_csv.py`): detecta `Fatura_YYYY-MM-DD.csv` pelo header real (`Data de Compra;Final do Cartão;Valor (em R$)`), extrai parcelas (`N/M`), inverte sinal compra/pagamento
  - Encoding CSV corrigido em todos parsers: `utf-8-sig` (strip BOM) + fallback `latin-1`
  - PDF protegido por senha: `can_parse` retorna 0.80 para PDFs criptografados; `parse` emite `PDF_ENCRYPTED`; frontend abre modal de senha e re-envia
  - Nubank corrigido: campo real do CSV de crédito é `title`, não `description`
  - Generic CSV: keyword sets expandidos com aliases brasileiros reais (`data de compra`, `valor (em r$)`, `title` etc.)

- **Pendente C3 — dois sub-problemas para próxima sessão:**
  1. **ESTRATÉGIA MULTI-BANCO:** deliberar a forma mais prática de reconhecer e diferenciar extratos/faturas de múltiplas instituições sem virar um labirinto de parsers. Arquivos modelo disponíveis em `C:\Users\thiag\Desktop\Projeto Fabo\Modelos para parse` para guiar decisão.
  2. **FLUXO IMPORTAÇÃO→TRANSAÇÕES:** parser reconhece e salva no banco (confirmado: `total_found` e `imported` retornam valores), mas as transações não aparecem na tela de Transações. Causa mais provável: **filtro de ciclo (dia 27→26)** — o arquivo C6 tem datas de out/2025 a abr/2026, que caem em ciclos anteriores ao atual (maio 2026). Antes de qualquer código: mudar o MonthSelector para o ciclo de abril (abr/27 → mai/26) e verificar se as transações aparecem.

- **Arquivos modelo para C3:** `C:\Users\thiag\Desktop\Projeto Fabo\Modelos para parse\` — qualquer novo parser deve ser validado contra estes arquivos antes de marcar concluído.

#### HANDOFF CLAUDE — 2026-05-03 sessão 2 (Fabio + Claude Code)

- **Entregues nesta sessão:**
  - BUG.1 ✅ auditoria completa UI/API (Thiago fez junto)
  - BUG.4 ✅ Importar sem mock — localStorage (Thiago)
  - T1.2 ✅ desbloqueada (BUG.4 fechado)
  - fix b7: filtro "Ciclo atual" dia 27→26 em Transações
  - fix b8: suggestCategory usa regras reais do backend (não hardcoded)
  - T6.1 ✅ Configurações completa: Pessoas+Cartões CRUD, Categorias com subcategorias, Sistema, Zona de Perigo
  - Backend: `parent_id` em Category com migration automática no startup
  - CORS liberado para porta 5174
- **REGRA CRÍTICA aprendida:** SEMPRE abrir `C:\Users\fabio\Downloads\App-financeiro` antes de qualquer JSX. Copiar o código de referência, não reinventar. Subcategorias, modais, grids — tudo tem código pronto.
- **Próximo:** BUG.2 (conformidade visual Dashboard/Cartão/Provisões) ou BUG.3 (modais/popovers). Não iniciar T3.2/T4/T5 antes de fechar BUG.2+BUG.3.
- **Backend rodando:** `uvicorn app.main:app --port 8000 --reload` dentro de `backend/` com `.venv` ativado.

#### HANDOFF CLAUDE — 2026-05-03 noite

- **Regra UX absoluta:** abrir `C:\Users\fabio\Downloads\App-financeiro` antes de mexer em qualquer tela. Copiar estrutura, classes, ordem, labels e comportamento do componente de referencia; adaptar somente dados/API depois. "Parecido" nao passa.
- **Validado hoje:** `npm.cmd run build` passou depois dos ajustes de UI em Transacoes/sidebar.
- **Commits recentes em `develop`:** `da83edd` inbox de pendentes; `0a9ddef` sem categoria conta como pendente; `6e303ba` status local da sidebar; `01285d9` dropdown acima da lista; `c75f069` filtros de Transacoes conforme referencia.
- **Transacoes:** botao `Revisar N pendentes` agora abre fluxo inbox one-by-one baseado na referencia, com categoria, pessoa, pular, categorizar e proxima, `PUT /transactions/{id}` e regra opcional via `POST /rules/`.
- **Pendente amanha:** executar BUG.1 antes de novas features. Conferir todos os menus contra backend real e referencia visual: Dashboard, Importar, Transacoes, Cartao, Provisoes, Metas, Regras e Configuracoes. Configuracoes ainda nao foi portada/conectada.
- **Cuidado:** nao usar fluxo antigo de `.exe`, `build_desktop.bat`, PyWebView ou PyInstaller. Modelo atual e backend FastAPI + Vite.

### TRILHA 0 — Fundação

- [ ] `[P]` **T0.3 — Script de Execução** · *Fabio · PARCIAL/BLOQUEADO BUG.5*
  `rodar.bat` existe, mas ainda precisa validação ponta a ponta como fluxo dev confiável antes de marcar concluído.
  **Saída:** app abrindo no browser via rodar.bat

---

- [ ] `[M]` **T0.4 — Onboarding de Perfil** · *qualquer um · depende T0.2*
  Wizard no primeiro acesso: nome do usuário, dia de início do ciclo, bancos utilizados + formatos por banco.
  Persiste em `data/perfil.json` (não sobe pro Git). Parser Registry carrega apenas os parsers do perfil.
  Se perfil não existe → redireciona para o wizard ao abrir o app.
  **Campos:** nome · ciclo_inicio (dia) · bancos[] (nome + formatos suportados)
  **Saída:** `data/perfil.json` criado · tela de importação mostra só os bancos/formatos declarados

### TRILHA 1 — Importação *(T0.4 antes de T1.1 — parser depende do perfil)*

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

- [ ] `[M]` **T6.4 — Seção Sistema funcional** · *qualquer um*
  Três problemas identificados em Configurações > Sistema:
  1. **Botão Salvar sempre ativo** — falta dirty-state: botão deve ficar desabilitado até o usuário alterar pasta ou dia de ciclo.
  2. **Pasta de importação não conectada** — valor salva em localStorage mas nenhuma tela usa essa pasta ainda (T1.3 depende disso). Em webapp puro não é possível abrir seletor de pasta nativo; solução possível: input de texto + botão que abre `<input type="file" webkitdirectory>` para leitura.
  3. **Dia de ciclo não conectado ao backend** — `Settings.cycle_start_day` existe no banco mas falta `PUT /settings/` e o filtro de transações usa mês calendário, não o ciclo configurado. Conectar ao backend e usar `cycle_start_day` no cálculo do período atual em Transações e Dashboard.

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

