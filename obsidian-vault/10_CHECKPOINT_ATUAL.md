# CHECKPOINT ATUAL — App Financeiro Fabio
> **Arquivo canônico de handoff entre IAs.** Atualizar ao fechar qualquer item.
> Última atualização: 2026-05-02 — Claude (claude.ai)

---

## 🟢 Estado do Projeto
- MVP 100% concluído e funcionando como executável Windows (`ControleFinanceiro.exe`).
- Branch ativa: `develop`. Último trabalho: **Trilha 3 — Item 1: Modelo Base de Provisões** (em andamento 🔒 [FABIO])
- Executável em: `ControleFinanceiro.exe` (raiz) — use **sempre este**, não o de `backend/dist/`.


## ✅ Últimas Features Entregues
| Feature | Commit/Status |
|---|---|
| Trilha 3 — Item 1: Modelo Base de Provisões (CRUD + UI completa) | ✅ commitado |
| Multi-Metas & Cofrinho (CRUD + vinculo categoria→meta) | ✅ commitado |
| Dashboard comparativo mensal (badges +/- %) | ✅ commitado |
| MonthSelector em todas as abas | ✅ commitado |
| Configuração Pasta de Importação + Reset (Danger Zone) | ✅ commitado |
| Titular do cartão Excel → Dashboard Gastos por Pessoa | ✅ commitado |
| Soft-delete categorias + ordenação transações | ✅ commitado |
| Gráfico pizza com tooltips/labels | ✅ commitado |
| Splash screen + build onedir (startup mais rápido) | ✅ commitado |

## 🔴 Próxima Tarefa (Iniciar Aqui)
**Trilha 3 — Item 2: Vinculação Provisão ↔ Transação Real**

**O que falta:**
- Ao importar, oferecer ao usuário opção de atrelar transação a uma `ProvisionOccurrence` pendente
- Se valor diferir do provisionado: perguntar causa (variação normal vs. juros/encargos)
- Se juros/encargos: registrar diferença como transação separada na categoria "Juros e Encargos"
- Atualizar `status` da ocorrência para "realizada" e guardar `linked_transaction_id`

## 📋 Próximos Itens do Backlog (em ordem)
1. `[ ]` Trilha 3 — Item 2: Vinculação Provisão ↔ Transação Real ← **AGORA**
2. `[ ]` Trilha 3 — Item 3: Relatório de Fluxo de Caixa Futuro
3. `[ ]` Trilha 1 — Aporte Manual em Meta
4. `[ ]` Trilha 2 — Parsers Plugáveis

## ⚠️ Protocolo Obrigatório ao Fechar Item
1. Marcar `[x]` em `05_PENDENCIAS.md`
2. Atualizar este arquivo (seção acima)
3. `git add -A && git commit -m "feat(...): ..."` na branch `develop`
4. Rodar `build_desktop.bat` → confirmar novo timestamp do `ControleFinanceiro.exe`
5. Push: `git push origin develop`
