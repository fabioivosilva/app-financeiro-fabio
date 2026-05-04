# NORTE — App Financeiro Fabio & Thiago

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : Sessão 2026-05-04. BUG.2, BUG.D1, BUG.PR1, BUG.ICON1, T0.4, T3.2 fechados.
             T3.2: aporte manual em metas (modal + POST /goals/{id}/deposit).
BRANCH     : develop
PRÓXIMA    : T1.3 — Importação Assistida [M] (T_SYNC.1 para o fim)
CLAIMS     : nenhum
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
> Ao fechar: remover o item do NORTE.md, registrar no CHANGELOG, commitar + push.

```bash
git add NORTE.md && git commit -m "chore: 🔒 [FABIO] inicia TXX" && git push origin develop
```

*Nenhum claim ativo no momento.*

---

## 📋 ROADMAP

## 🔴 BUGS BLOQUEANTES — LER ANTES DAS TRILHAS

Regra de status: item fechado sai do NORTE.md e vai para `obsidian-vault/CHANGELOG.md`.
Se tem código mas ainda depende de BUG, fica `[ ]` como **PARCIAL/BLOQUEADO**.

### 🔴 TRILHA BUG — Estabilização UI/API *(bloqueia novas features antes de T3.2)*

- [ ] `[M]` **FEAT.PROV.AUTO.FIXA — Auto-provisão para categorias fixas** · *qualquer um*
  `auto_provision.py` hoje só age em `category.type == "receita"`. Estender para `type == "fixa"`:
  ao categorizar uma transação de despesa fixa (Aluguel, Condomínio, Plano de saúde, etc.)
  com 2+ ocorrências em meses distintos → cria/atualiza provisão mensal automaticamente
  com valor médio e dia médio, igual ao fluxo de receitas.
  **Cuidado:** ignorar type="interna" e type="variavel" — só fixas fazem sentido para provisão automática.
  Arquivo a editar: `backend/app/services/auto_provision.py` (linha 42: condição `category.type != "receita"`).

- [ ] `[P]` **FEAT.META.ICON — Seletor de ícone no cadastro de meta** · *qualquer um*
  Modal "Nova meta" / "Editar meta" não permite escolher ícone — usa fallback por índice.
  Adicionar campo `icon` ao modelo `Goal` (backend + migration), expor no `GoalIn`/`GoalOut`,
  e incluir `<IconPicker>` no `GoalFormModal` (mesmo componente já usado em Configurações).
  `getGoalVisual()` passa a usar `goal.icon` quando preenchido, caindo no fallback por índice só se vazio.

- [ ] `[M]` **T_SYNC.1 — Auto-sync de regras e categorias entre Fabio e Thiago** · *qualquer um*
  Ao categorizar, criar regra ou criar categoria, salvar também no backend um endpoint
  de "sync snapshot" (regras + categorias) que o Thiago pode puxar via `GET /sync/rules-categories`.
  Thiago roda `POST /sync/apply` para aplicar as regras e categorias do Fabio na base dele.
  Objetivo: manter os dois sempre alinhados sem precisar compartilhar arquivo de banco.


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


---

### TRILHA 1 — Importação *(T0.4 antes de T1.1 — parser depende do perfil)*

- [ ] `[M]` **T1.3 — Importação Assistida** · *qualquer um · depende T1.2*
  Pasta padrão configurável · lista arquivos não importados · 1 clique para importar

---

### TRILHA 2 — Transações & Regras *(depende T0+T1)*


- [ ] `[P]` **T2.3 — Cofrinho por Keyword** · *qualquer um · depende T2.2+T3.1*
  Campo `keyword` em Goal · ao categorizar, bate keyword → vincula à meta automaticamente

---

### TRILHA 3 — Metas & Cofrinho *(depende T0+T2)*


- [ ] `[M]` **T3.2 — Aporte Manual** · *qualquer um · depende T3.1*
  Botão "Registrar Aporte" · modal (valor, descrição, data) · `POST /goals/{id}/deposit` → cria Transaction com origem `Aporte Manual`


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
