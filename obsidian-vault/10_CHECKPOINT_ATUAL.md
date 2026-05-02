# CHECKPOINT ATUAL — App Financeiro Fabio
> **Arquivo canônico de handoff entre IAs.** Atualizar ao fechar qualquer item.
> Última atualização: 2026-05-02 — Início da migração v2.0

---

## 🟡 Estado do Projeto — MIGRAÇÃO v2.0 EM PLANEJAMENTO

**Decisão:** Frontend descartado e reescrito do zero com design system Etheris Finance (Stitch).
Backend mantido integralmente — só o React/Tailwind muda.

- Branch ativa: `develop`
- Backup v0.1.0: `C:\Users\fabio\Downloads\App-financeiro-v0.1.0.zip`
- Executável atual: `ControleFinanceiro\ControleFinanceiro.exe` (raiz) — v0.1.0 ainda

## 🔴 Próxima Tarefa (Iniciar Aqui)
**A1 — Setup Design System Etheris Finance** — fundação de tudo

**O que fazer:**
1. Atualizar `frontend/tailwind.config.ts` com tokens de cor do DESIGN.md
2. Criar utilitários CSS: `.glass-card`, `.glass-modal`, `.btn-primary` com glow, `.btn-ghost`
3. Instalar fonte Inter
4. **Não tocar em páginas ainda** — só a fundação

Referência de cores em `C:\Users\fabio\Downloads\stitch_preview\stitch_instant_finance_tracker\etheris_finance\DESIGN.md`

## 📋 Ordem de Execução

### Trilha A — Fundação (fazer primeiro)
1. `[M]` A1 — Setup Design System Etheris Finance ← **AGORA**
2. `[P]` A2 — Layout Base + Sidebar novo
3. `[P]` A3 — Fix build_desktop.bat (remover pause)

### Trilha B — Migração das Telas (após A1+A2)
4. `[G]` B1 — Dashboard v2 (corrigir gráfico + novo layout)
5. `[M]` B2 — Importar v2
6. `[M]` B3 — Transações v2
7. `[M]` B4 — Provisões v2
8. `[M]` B5 — Configurações v2 (criar do zero no novo design)
9. `[P]` B6 — Metas v2
10. `[P]` B7 — Regras v2
11. `[P]` B8 — Cartão v2

### Trilha C — Features Novas (após B completa)
12. `[G]` C1 — Vinculação Provisão ↔ Transação Real
13. `[G]` C2 — Relatório Fluxo de Caixa Futuro
14. `[G]` C3 — Parsers Plugáveis Multi-Banco
15. `[M]` C4 — Aporte Manual em Meta
16. `[P]` C5 — Preenchimento Automático pela Categoria

## ✅ Últimas Features Entregues (v0.1.0)
| Feature | Status |
|---|---|
| Backend completo (models + CRUD + routers) | ✅ mantido na v2.0 |
| Provisões — Modelo Base (Trilha 3 Item 1) | ✅ backend pronto |
| Multi-Metas & Cofrinho | ✅ backend pronto |
| Dashboard, Importar, Transações, Cartão, Regras, Metas, Configurações | ✅ v0.1.0 (descartado visualmente) |

## ⚠️ Protocolo Obrigatório ao Fechar Item
1. Marcar `[x]` em `05_PENDENCIAS.md`
2. Atualizar este arquivo (seção acima)
3. `git add -A && git commit -m "feat(...): ..."`
4. Rodar `build_desktop.bat` (após A3 o agente pode rodar sozinho)
5. `git push origin develop`
