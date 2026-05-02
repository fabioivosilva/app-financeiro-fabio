# 05_PENDENCIAS — Backlog Vivo

## Legenda de Tamanho
| Tag | Tokens estimados | O que cabe numa sessão |
|---|---|---|
| `[P]` Pequeno — 1 arquivo, mudança isolada | ~3–8k | 4–6 itens P |
| `[M]` Médio — 1 endpoint + 1 componente UI | ~8–20k | 2–3 itens M |
| `[G]` Grande — novo modelo + backend + UI | ~20k+ | 1 item G |

## Convenção de Tarefas em Andamento
> Antes de começar uma tarefa, marque com `🔒 [SEU_NOME]` no item e faça commit.
> Isso avisa a outra pessoa (e a IA dela) que aquele item está sendo trabalhado.
>
> **Como marcar:** `- [/] `[M]` 🔒 [FABIO] Nome da tarefa...`
> **Como liberar:** remover o 🔒 ao fechar o item (virar `[x]`).

> **Capacidade de uma sessão:** 1G · ou · 2-3M · ou · 4-6P

---

## 🔴 Trilha 1 — Metas & Cofrinho (completar o sistema)
> Estes 3 itens formam um sistema único. Atacar em sequência.

- [/] `[M]` **Aporte Manual em Meta:** Endpoint `POST /goals/{id}/deposit` + modal "Registrar Aporte" no card da meta. Transação gerada aparece no extrato com origem `Aporte Manual` e alimenta o progresso automaticamente. ← **PRÓXIMA TAREFA**

- [ ] `[P]` **Preenchimento Automático pela Categoria:** Ao selecionar uma categoria vinculada a uma meta em uma transação, preencher o vínculo de meta automaticamente. (Fazer junto com o item acima — é rápido.)

- [ ] `[M]` **Cofrinho por Keyword ou Regra Manual:** Uma meta pode ser alimentada por reconhecimento de texto na transação (ex: "COFRINHO VIAGEM") ou por uma regra explícita. Abordagem: adicionar `goal_id` opcional ao modelo `Rule` — quando a regra for aplicada, vincula a meta além de categorizar.

---

## 🟡 Trilha 2 — Importação Multi-Banco
> ⚠️ Respeitar a dependência: item A ANTES do item B.

- [ ] `[G]` **A — Arquitetura de Parsers Plugável:** Refatorar os 3 parsers atuais (Itaú Excel, Itaú PDF, OFX) para implementarem uma interface base `BaseParser`. Criar `PARSER_REGISTRY = { ("itau", "excel"): ItauExcelParser, ... }`. Na tela de importação, o usuário seleciona banco + formato — o sistema despacha para o parser certo. Para adicionar Bradesco ou Nubank futuramente, basta criar o parser e registrar.
  - Impacto: `services/` (interface base), `routers/imports.py` (unificar 3 endpoints em 1), `ImportPage.tsx` (dropdown banco + formato).

- [ ] `[M]` **B — Importação Assistida pela Pasta Padrão** *(depende do item A):* Usar a pasta configurada em Configurações para listar arquivos `.xls/.xlsx/.pdf/.ofx` ainda não importados. Destacar os novos e permitir importar com menos cliques. Só faz sentido após a refatoração dos parsers.

---

## 🟡 Trilha 3 — Provisões e Fluxo de Caixa
> Feature estrutural. Atacar em 3 sessões na ordem indicada — cada uma depende da anterior.

- [/] `[G]` 🔒 [FABIO] **1 — Modelo Base de Provisões:** Novo modelo `Provision` para registrar despesas e receitas futuras esperadas.
  - Campos: `description`, `amount`, `type` (despesa/receita), `category_id`, `recurrence` (única/mensal/trimestral/anual), `start_date`, `end_date`, `notes`.
  - Ao criar provisão recorrente → sistema gera `ProvisionOccurrence` com `expected_date`, `expected_amount`, `status` (pendente/realizada/ajustada).
  - CRUD completo + tela "Provisões" no frontend.
  - Casos de uso: assinaturas, parcelas de fatura, prestações de empréstimo/financiamento.

- [ ] `[G]` **2 — Vinculação Provisão ↔ Transação Real** *(depende do item 1):* Ao importar, oferecer ao usuário a opção de atrelar a transação a uma `ProvisionOccurrence` pendente.
  - Se valor diferir do provisionado: perguntar causa (variação normal vs. juros/encargos).
  - Se juros/encargos: registrar diferença como transação separada na categoria "Juros e Encargos" para não distorcer a categoria original.
  - Atualizar `status` da ocorrência para "realizada" e guardar `linked_transaction_id`.

- [ ] `[G]` **3 — Relatório de Fluxo de Caixa Futuro** *(depende dos itens 1 e 2):* Nova aba mostrando a projeção dos próximos meses.
  - Por mês: Receitas previstas | Despesas previstas | Saldo projetado.
  - Distinguir realizado (transações importadas) vs. provisionado (ocorrências futuras pendentes).
  - Drill-down por mês para ver quais provisões compõem o total.

---

## 🔵 Baixa Prioridade

- [ ] `[G]` **Menu de Insights/IA** *(melhor após Trilha 3):* Aba com gastos altos, sugestões de corte, simulação de metas ("se economizar R$ X no iFood, chego na meta Y em Z meses"). Com as Provisões implementadas, os insights ganham dados de fluxo futuro e ficam muito mais ricos.

- [ ] `[P]` **Evitar Confusão entre Executáveis:** Melhoria no `build_desktop.bat` ou README para deixar claro que o único executável para o usuário é `ControleFinanceiro.exe` na raiz.

### Segurança *(trilha própria — não misturar com features)*
- [ ] `[P]` **Avaliação de Criptografia Local:** Mapear opções para proteger `data\finance.db` (SQLCipher, chave derivada de senha, impacto no app desktop).
- [ ] `[P]` **Plano de Senha/Master Key:** Se criptografia adotada — UX de senha mestre, recuperação, troca de senha.
- [ ] `[M]` **Varredura de Brechas de Segurança:** Auditoria: deps Python/Node, CORS, localhost, path traversal, dados sensíveis em logs.
- [ ] `[M]` **Hardening do Desktop:** PyInstaller/PyWebView, porta aleatória, remoção de arquivos debug antes de distribuir.

---

## ✅ Concluídos

### Metas e Cofrinho
- [x] Conectar categorias a metas automaticamente (category.goal_id)
- [x] Calcular progresso de meta por transações vinculadas
- [x] Multi-Metas: CRUD completo com modal e cards
- [x] Transação categorizada alimenta meta vinculada automaticamente

### Melhorias de Usabilidade
- [x] Titular do Cartão no Excel → Dashboard "Gastos por Pessoa"
- [x] Soft-delete de categorias
- [x] Ordenação de transações por maior valor
- [x] Gráfico pizza com labels e tooltips
- [x] MonthSelector em todas as abas

### Cartões
- [x] Gráfico "Gasto por Pessoa no Cartão" corrigido
- [x] Diagnóstico visual quando gráfico por pessoa estiver vazio

### Dashboard UX
- [x] Alertas de Limite: "Estourou R$ X" / "Faltam R$ Y"
- [x] Atalhos clicáveis: Pendentes, Saídas, categorias → Transações filtradas
- [x] Top 3 gastos do ciclo
- [x] Comparativo por Ciclo com variação %
- [x] Estados Vazios Guiados com ações diretas

### Desktop e Performance
- [x] Build onedir (startup mais rápido)
- [x] Splash screen enquanto backend sobe
- [x] build_desktop.bat copia exe para a raiz automaticamente

### Sistema
- [x] Configuração de Pasta de Importação
- [x] Reset Local com confirmação forte

---
*Última atualização: 2026-05-02 — Claude (claude.ai)*
