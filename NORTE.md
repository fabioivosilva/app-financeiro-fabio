# NORTE — App Financeiro Fabio & Thiago

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : Sessão 2026-05-04. BUG.2, BUG.D1, BUG.PR1, BUG.ICON1, T0.4, T1.3, T3.2 fechados.
             T3.2: aporte manual em metas (modal + POST /goals/{id}/deposit).
             FEAT.PROV.AUTO.FIXA fechado: categorias fixas recorrentes geram provisão.
BRANCH     : develop
PRÓXIMA    : FEAT.META.ICON — Seletor de ícone no cadastro de meta [P] (T_SYNC.1 para o fim)
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




### TRILHA 0 — Fundação


---

### TRILHA 1 — Importação *(T0.4 antes de T1.1 — parser depende do perfil)*

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
