# 05_PENDENCIAS — Backlog Vivo

## Legenda de Tamanho
| Tag | Significado | Tokens estimados | O que cabe numa sessão |
|---|---|---|---|
| `[P]` | Pequeno — 1 arquivo, mudança isolada | ~3–8k tokens | 4–6 itens P |
| `[M]` | Médio — 1 endpoint + 1 componente UI | ~8–20k tokens | 2–3 itens M |
| `[G]` | Grande — novo modelo + backend + UI | ~20k+ tokens | 1 item G |

> **Capacidade de uma sessão:** 1G · ou · 2-3M · ou · 4-6P (combinações possíveis)

---

## 🔴 Alta Prioridade

- [/] `[M]` **Fluxo de Aporte em Meta (Cofrinho):** Endpoint `POST /goals/{id}/deposit` + modal "Registrar Aporte" no card de meta. Transação gerada aparece no extrato com origem `Aporte Manual`. ← **PRÓXIMA TAREFA**
- [ ] `[P]` **Preenchimento Automático pela Categoria:** Ao selecionar categoria vinculada a uma meta em uma transação, preencher automaticamente o vínculo de meta.

---

## 🟡 Média Prioridade

### Dashboard
- [ ] `[G]` **Previsão de Gastos Futuros (Provisão):** Mostrar no Dashboard quanto já está comprometido nos próximos meses baseado em parcelas existentes.

### Sistema e Importação
- [ ] `[M]` **Importação Assistida pela Pasta Padrão:** Usar pasta configurada para listar arquivos não importados e permitir importar com menos cliques.

### Desktop
- [ ] `[P]` **Evitar Confusão entre Executáveis:** Doc/script de build deixando claro que só o `ControleFinanceiro.exe` da raiz deve ser usado.

---

## 🔵 Baixa Prioridade

### Inteligência e Insights
- [ ] `[G]` **Menu de Insights/IA:** Aba com gastos altos, sugestões de corte, simulação de metas. Cruzar categorias + histórico + metas.

### Segurança (trilha própria)
- [ ] `[P]` **Avaliação de Criptografia Local:** Mapear opções para proteger `data\finance.db`.
- [ ] `[P]` **Plano de Senha/Master Key:** UX de senha mestre, recuperação, troca.
- [ ] `[M]` **Varredura de Brechas de Segurança:** Auditoria: deps, CORS, localhost, path traversal, logs.
- [ ] `[M]` **Hardening do Desktop:** PyInstaller/PyWebView, porta aleatória, remoção de debug antes de distribuir.

---

## ✅ Concluídos

### Metas e Cofrinho
- [x] Conectar categorias a metas automaticamente (category.goal_id)
- [x] Ajustar backend de metas para calcular progresso por transações vinculadas
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

---

## 📥 Notas do Thiago — Incorporadas ao Backlog (2026-05-02)

### Importação Multi-Instituição

- [ ] `[G]` **Arquitetura de Parsers Plugável:** Hoje os parsers são hardcoded (Itaú Excel, Itaú PDF, OFX). Criar uma interface base `BaseParser` com método `parse(file_bytes) -> List[Transaction]` e um registro de parsers por instituição/formato. Na tela de importação, o usuário seleciona a instituição (dropdown) + formato (OFX / Excel / PDF) e o sistema despacha para o parser correto.
  - **Dica prática (uso interno):** Não vale a pena auto-detectar instituição por heurística. O mais simples é um `PARSER_REGISTRY = { ("itau", "excel"): ItauExcelParser, ("itau", "pdf"): ItauPdfParser, ("generic", "ofx"): OfxParser }`. Para adicionar Bradesco ou Nubank, basta criar o parser e registrar.
  - Impacto: `backend/app/services/` (nova classe base), `backend/app/routers/imports.py` (unificar endpoints), `frontend/src/pages/ImportPage.tsx` (dropdown de instituição).

- [ ] `[M]` **Cofrinho por Reconhecimento de Texto ou Regra Manual:** Hoje a meta só é alimentada via `category.goal_id`. Thiago quer que uma transação também alimente uma meta se a descrição contiver uma palavra-chave (ex: "COFRINHO VIAGEM") ou se existir uma regra explícita "transações da conta X com texto Y → meta Z".
  - Abordagem: Estender o modelo `Rule` com campo opcional `goal_id`. Quando a regra for aplicada na categorização, se tiver `goal_id`, vincular a transação à meta além de categorizar.
  - Alternativa mais simples: campo `keyword` na própria `Goal` — ao categorizar, varrer metas com keyword e vincular se bater.

---

### Provisões e Fluxo de Caixa (Feature Estrutural — quebrar em 3 sessões)

- [ ] `[G]` **Modelo Base de Provisões:** Novo modelo `Provision` para registrar despesas e receitas futuras esperadas.
  - Campos: `description`, `amount`, `type` (despesa/receita), `category_id`, `recurrence` (única / mensal / trimestral / anual), `start_date`, `end_date` (opcional), `notes`.
  - Ao criar uma provisão recorrente, o sistema gera automaticamente as ocorrências futuras (`ProvisionOccurrence`) com `expected_date`, `expected_amount` e `status` (pendente / realizada / ajustada).
  - CRUD completo + tela "Provisões" no frontend.
  - Casos de uso: assinaturas mensais, parcelas de fatura, prestações de empréstimo/financiamento.

- [ ] `[G]` **Vinculação Provisão ↔ Transação Real:** Ao importar um extrato, oferecer ao usuário a opção de atrelar uma transação a uma `ProvisionOccurrence` pendente.
  - Se o valor importado diferir do provisionado: perguntar a causa (variação normal vs. juros/encargos).
  - Se juros/encargos: registrar a diferença como transação separada na categoria "Juros e Encargos" (categoria especial a criar) para não distorcer a categoria original.
  - Atualizar o `status` da ocorrência para "realizada" e guardar `linked_transaction_id`.

- [ ] `[G]` **Relatório de Fluxo de Caixa Futuro:** Nova aba ou seção no Dashboard mostrando a projeção dos próximos meses.
  - Colunas por mês: Receitas previstas, Despesas previstas, Saldo projetado.
  - Distinguir: já realizado (transações importadas) vs. provisionado (ocorrências futuras pendentes).
  - Drill-down: clicar no mês para ver quais provisões compõem o total.
  - Dependência: requer o Modelo Base de Provisões estar implementado.

---
