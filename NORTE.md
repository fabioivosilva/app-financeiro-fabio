# NORTE — App Financeiro Fabio, Thiago & Lucas

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : 2026-05-04. Início da auditoria de consistência do fluxo de caixa (BUG.PROV.FLOW.CONSISTENCY).
BRANCH     : develop
PRÓXIMA    : [G] BUG.PROV.FLOW.CONSISTENCY
CLAIMS     : 🔒 [FABIO] BUG.PROV.FLOW.CONSISTENCY
BLOCKER    : Nenhum conhecido.
SESSÃO     : 5 [P] restantes nesta sessão (0% usado)

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
| Lucas | Claude.ai |

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

🔒 [FABIO] BUG.PROV.FLOW.CONSISTENCY

---

## 📋 ROADMAP

> Regra: item fechado → `obsidian-vault/CHANGELOG.md`. Só itens abertos ficam aqui.

---

### TRILHA 1 — Importação

- [ ] `[P]` **BUG.C6.FLOW — C6 Bank: transações importadas não aparecem na tela** · *Thiago*
  Parser salva (total_found/imported > 0) mas Transações não exibe. Causa provável: filtro ciclo 27→26.
  Primeiro passo: mudar MonthSelector para ciclo de abril (abr/27→mai/26) antes de qualquer código.
  Arquivos modelo: `C:\Users\thiag\Desktop\Projeto Fabo\Modelos para parse\`

- [ ] `[M]` **FEAT.IMPORT.AUTOSYNC — Auto-importar ao abrir o app** · *qualquer um*
  Ao iniciar o app, varrer pasta padrão e importar automaticamente arquivos novos (não processados ainda).


---

### TRILHA 2 — Transações & Regras

- [ ] `[P]` **T2.3 — Cofrinho por Keyword** · *qualquer um*
  Campo `keyword` em Goal · ao categorizar, bate keyword → vincula à meta automaticamente. *depende T2.2 ✅ T3.1 ✅*

---

### TRILHA 3 — Metas & Cofrinho

- [ ] `[P]` **FEAT.META.REINFORCE — Capturar transações já categorizadas para metas** · *qualquer um*
  Varrer transações existentes e vincular à meta pela subcategoria associada. `POST /goals/reinforce` ou trigger ao salvar meta.

---

### TRILHA 4 — Dashboard & Cartão

- [ ] `[G]` **T4.1 — Dashboard** · *qualquer um*
  Hero saldo · sub-cards fatura+saldo · barras por pessoa · limites por categoria · meta de reserva · top 3 · comparativo ciclo anterior.
  Ícones do top gastos devem bater com a subcategoria (Config). Metas em posição de destaque (não escondidas).
  **Ref:** `07_UX_REFERENCE.md` → Dashboard

- [ ] `[P]` **FEAT.DASH.CYCLES — Seletor de ciclos passados no Dashboard** · *qualquer um · depende T4.1*
  MonthSelector integrado ao Dashboard para navegar por ciclos anteriores.

- [ ] `[M]` **FEAT.DASH.UX — Reorganizar UX do Dashboard** · *qualquer um · depende T4.1*
  Avaliar gráfico de linha vs alternativa mais clara. Metas em posição visível. **Ref:** `07_UX_REFERENCE.md`.

- [ ] `[M]` **T4.2 — Tela de Cartão** · *qualquer um · depende T4.1*
  Hero fatura+limite · tabs (Resumo, Por Pessoa, Parcelas Futuras, Recorrentes) · barras por pessoa.
  **Ref:** `07_UX_REFERENCE.md` → Cartão

---

### TRILHA 5 — Provisões & Fluxo de Caixa

- [ ] `[P]` **FEAT.PROV.CARD.FATURA — Fatura de cartão como provisão** · *qualquer um*
  Definir/implementar como o pagamento mensal da fatura aparece nas provisões.
  Sugestão: gerar provisão automática "Fatura [Cartão]" com valor = total do ciclo.

- [ ] `[G]` **BUG.PROV.FLOW.CONSISTENCY — Estabilizar fluxo de caixa e provisões** · *Fabio/Claude*
  Auditar e corrigir a consistência entre transações realizadas, provisões, parcelas futuras, fatura de cartão e saldo projetado. O backend deve ser a fonte de verdade do fluxo de caixa. O frontend deve apenas renderizar dados consolidados. Evitar dupla contagem do cartão e manter o botão Vincular apenas como exceção manual.

- [ ] `[G]` **T5.1 — Modelo de Provisões** · *Thiago propôs*
  Modelo `Provision`+`ProvisionOccurrence` · CRUD + tela frontend · assinaturas, parcelas, empréstimos.

- [ ] `[G]` **T5.2 — Vinculação Provisão↔Transação** · *depende T5.1*
  Sugerir atrelar ocorrência pendente ao importar. Diferença de valor → variação ou juros.

- [ ] `[G]` **T5.3 — Fluxo de Caixa Futuro** · *depende T5.1+T5.2*
  Projeção mês a mês · receitas/despesas previstas · saldo projetado · drill-down por mês.

---

### TRILHA 6 — Configurações & Sync

- [ ] `[G]` **T_SYNC.2 — Sync automático de regras via repositório** · *qualquer um*
  Ao criar/editar regra ou categoria, gravar `data/sync_rules.json` e commitar no repo automaticamente.
  Outros usuários fazem `git pull` ou clicam "Sync" e o app aplica regras novas sem sobrescrever categorizações manuais.
  Pré-req: base de categorias com nomes idênticos entre usuários. Ganho: categorização de um beneficia todos.
  Config mostra apenas data/hora do último sync (tapume atual já entregue).

---

### TRILHA 7 — Insights/IA *(após T4+T5)*

- [ ] `[G]` **T7.1 — Aba Insights** · *qualquer um*
  Gastos acima da média · sugestões de corte · simulação "economize R$X → meta Y em Z meses" · projeção com provisão.

---

### TRILHA 8 — Segurança *(não bloqueia nada)*

- [ ] `[P]` **T8.1** — Avaliar criptografia local (SQLCipher vs chave derivada)
- [ ] `[P]` **T8.2** — UX de senha mestre
- [ ] `[M]` **T8.3** — Auditoria de brechas (deps, CORS, localhost, logs)
- [ ] `[M]` **T8.4** — Hardening desktop (porta aleatória, remoção de debug)

---
