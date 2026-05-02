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
