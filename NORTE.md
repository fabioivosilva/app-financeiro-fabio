# NORTE — App Financeiro Fabio, Thiago & Lucas

---

## ⚡ SNAPSHOT — Única leitura obrigatória. Atualizar ao iniciar E fechar qualquer tarefa.

```
STATUS     : 2026-05-04. Varredura manual: 7 bugs + 14 features incorporados nas trilhas.
             Lucas entregou: FEAT.META.ICON (T3) + T_SYNC.1 (T6).
             Base entregue: trilhas 0,1,3,6 + T2.1, T2.2, todos os bugs anteriores.
BRANCH     : develop
PRÓXIMA    : BUG.RULES.2 [P] rápido · ou · T4.1 Dashboard [G]
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

🔒 **[FABIO]** — BUG.RULES.2, BUG.IMPORT.SCAN, BUG.DASH.CYCLE, BUG.PROV.AUTO, BUG.PROV.ICON, BUG.META.SUB, FEAT.IMPORT.HISTORY, FEAT.IMPORT.NOBANK, FEAT.IMPORT.REINFORCE, FEAT.IMPORT.UX, FEAT.PROV.ORDER, FEAT.META.DELETE, FEAT.META.REINFORCE, FEAT.CFG.CARDS.UX, FEAT.PROV.CARD.FATURA

---

## 📋 ROADMAP

> Regra: item fechado → `obsidian-vault/CHANGELOG.md`. Só itens abertos ficam aqui.

---

### TRILHA 1 — Importação

- [ ] `[P]` **BUG.IMPORT.SCAN — Botão "Atualizar" pasta padrão não executa** · *qualquer um*
  Clicar em "Atualizar" na tela Importar não dispara o scan de arquivos novos na pasta configurada.

- [ ] `[P]` **BUG.C6.FLOW — C6 Bank: transações importadas não aparecem na tela** · *Thiago*
  Parser salva (total_found/imported > 0) mas Transações não exibe. Causa provável: filtro ciclo 27→26.
  Primeiro passo: mudar MonthSelector para ciclo de abril (abr/27→mai/26) antes de qualquer código.
  Arquivos modelo: `C:\Users\thiag\Desktop\Projeto Fabo\Modelos para parse\`

- [ ] `[M]` **FEAT.IMPORT.AUTOSYNC — Auto-importar ao abrir o app** · *qualquer um*
  Ao iniciar o app, varrer pasta padrão e importar automaticamente arquivos novos (não processados ainda).

- [ ] `[P]` **FEAT.IMPORT.HISTORY — Corrigir histórico de importações** · *qualquer um*
  Adicionar data de importação a cada linha. Botão 3 bolinhas: ações reais (excluir registro, ver detalhes).
  Avaliar limitar exibição aos N mais recentes.

- [ ] `[P]` **FEAT.IMPORT.NOBANK — Bloquear importação sem banco configurado** · *qualquer um*
  Se nenhum banco estiver ativo: bloquear drag&drop e seleção de arquivo.
  Exibir mensagem + botão "Configurar bancos" → Config→Bancos.

- [ ] `[P]` **FEAT.IMPORT.REINFORCE — Re-aplicar regras em transações já importadas** · *qualquer um*
  Botão na tela de Importação para rodar `POST /rules/apply` em massa sobre transações sem categoria.

- [ ] `[P]` **FEAT.IMPORT.UX — Compactar tela + reposicionar dica** · *qualquer um*
  Tela grande demais. Compactar layout. Mover bloco de dica para área visível (não escondida no rodapé).

---

### TRILHA 2 — Transações & Regras

- [ ] `[P]` **BUG.RULES.2 — Aplicação de regras automáticas quebrada** · *qualquer um*
  `POST /rules/apply` não está categorizando transações pendentes corretamente.

- [ ] `[P]` **T2.3 — Cofrinho por Keyword** · *qualquer um*
  Campo `keyword` em Goal · ao categorizar, bate keyword → vincula à meta automaticamente. *depende T2.2 ✅ T3.1 ✅*

---

### TRILHA 3 — Metas & Cofrinho

- [ ] `[P]` **BUG.META.SUB — Modal de meta exibe só categoria pai** · *qualquer um*
  Seletor de categoria no GoalFormModal não exibe subcategorias → impede captura automática de transações.

- [ ] `[P]` **FEAT.META.REINFORCE — Capturar transações já categorizadas para metas** · *qualquer um*
  Varrer transações existentes e vincular à meta pela subcategoria associada. `POST /goals/reinforce` ou trigger ao salvar meta.

- [ ] `[P]` **FEAT.META.DELETE — Deletar meta com dupla confirmação** · *qualquer um*
  Botão de deleção nos cards. Modal de confirmação com digitação do nome ou duplo clique para confirmar.

---

### TRILHA 4 — Dashboard & Cartão

- [ ] `[P]` **BUG.DASH.CYCLE — Progressão de ciclo estática no Dashboard** · *qualquer um*
  Barra de dias e "dias restantes" não refletem o ciclo real (27→26). Verificar cálculo de `getCycleInfo`.

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

- [ ] `[P]` **BUG.PROV.AUTO — Motor de provisão auto incompleto** · *qualquer um*
  FEAT.PROV.AUTO.FIXA entregue mas não cria provisões para todas as categorias fixas já categorizadas.
  Rodar reinforce sobre transações existentes: re-disparar lógica de auto-provisão retroativamente.

- [ ] `[P]` **BUG.PROV.ICON — Ícone de cartão ausente em Provisões** · *qualquer um*
  Provisões de cartão não exibem ícone de cartão na visão linha (dinheiro) nem na timeline.
  Timeline não diferencia visualmente provisões de cartão das demais.

- [ ] `[P]` **FEAT.PROV.ORDER — Ordenação da timeline de provisões** · *qualquer um*
  Timeline atualmente desordenada. Ordenar por data prevista crescente. Agrupar por mês.

- [ ] `[P]` **FEAT.PROV.CARD.FATURA — Fatura de cartão como provisão** · *qualquer um*
  Definir/implementar como o pagamento mensal da fatura aparece nas provisões.
  Sugestão: gerar provisão automática "Fatura [Cartão]" com valor = total do ciclo.

- [ ] `[G]` **T5.1 — Modelo de Provisões** · *Thiago propôs*
  Modelo `Provision`+`ProvisionOccurrence` · CRUD + tela frontend · assinaturas, parcelas, empréstimos.

- [ ] `[G]` **T5.2 — Vinculação Provisão↔Transação** · *depende T5.1*
  Sugerir atrelar ocorrência pendente ao importar. Diferença de valor → variação ou juros.

- [ ] `[G]` **T5.3 — Fluxo de Caixa Futuro** · *depende T5.1+T5.2*
  Projeção mês a mês · receitas/despesas previstas · saldo projetado · drill-down por mês.

---

### TRILHA 6 — Configurações & Sync

- [ ] `[P]` **FEAT.CFG.CARDS.UX — UX da lista de cartões com muitos itens** · *qualquer um*
  Muitos cartões → lista imensa. Adicionar busca/filtro ou colapso para listas longas.

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
