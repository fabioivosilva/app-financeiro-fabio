# CHECKPOINT ATUAL — App Financeiro Fabio
> **Arquivo canônico de handoff entre IAs.** Atualizar ao fechar qualquer item.
> Última atualização: 2026-05-02 — Claude (claude.ai)

---

## 🟢 Estado do Projeto
- MVP 100% concluído e funcionando como executável Windows (`ControleFinanceiro.exe`).
- Branch ativa: `develop`. Último commit: `feat(cofrinho): implement goal sensitization...`
- Executável em: `ControleFinanceiro.exe` (raiz) — use **sempre este**, não o de `backend/dist/`.

## ✅ Últimas Features Entregues
| Feature | Commit/Status |
|---|---|
| Multi-Metas & Cofrinho (CRUD + vinculo categoria→meta) | ✅ commitado |
| Dashboard comparativo mensal (badges +/- %) | ✅ commitado |
| MonthSelector em todas as abas | ✅ commitado |
| Configuração Pasta de Importação + Reset (Danger Zone) | ✅ commitado |
| Titular do cartão Excel → Dashboard Gastos por Pessoa | ✅ commitado |
| Soft-delete categorias + ordenação transações | ✅ commitado |
| Gráfico pizza com tooltips/labels | ✅ commitado |
| Atalhos clicáveis Dashboard + Top 3 gastos + Estados vazios | ✅ commitado |
| Splash screen + build onedir (startup mais rápido) | ✅ commitado |

## 🔴 Próxima Tarefa (Iniciar Aqui)
**Fluxo de Aporte em Meta (Cofrinho)** — item `[/]` no backlog = em aberto.

**O que falta:**
- Backend: endpoint `POST /goals/{id}/deposit` (recebe `amount`, `description`, `date` → cria Transaction + atualiza `current_amount`)
- Frontend: botão "💰 Registrar Aporte" no card de meta → modal → chama endpoint
- A transação gerada deve aparecer na aba Transações com origem `"Aporte Manual"`

## 📋 Próximos Itens do Backlog (em ordem)
1. `[/]` Fluxo de Aporte em Meta ← **AGORA**
2. `[ ]` Preenchimento automático de meta ao selecionar categoria vinculada
3. `[ ]` Previsão de Gastos Futuros (parcelas futuras no Dashboard)
4. `[ ]` Importação Assistida pela Pasta Padrão
5. `[ ]` Aba de Insights/IA

## ⚠️ Protocolo Obrigatório ao Fechar Item
1. Marcar `[x]` em `05_PENDENCIAS.md`
2. Atualizar este arquivo (seção acima)
3. `git add -A && git commit -m "feat(...): ..."` na branch `develop`
4. Rodar `build_desktop.bat` → confirmar novo timestamp do `ControleFinanceiro.exe`
5. Push: `git push origin develop`
