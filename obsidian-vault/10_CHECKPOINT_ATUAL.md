# CHECKPOINT ATUAL — App Financeiro Fabio
> **Arquivo canônico de handoff entre IAs.** Atualizar ao fechar qualquer item.
> Última atualização: 2026-05-02 — A2 Layout Base concluído

---

## Fonte da Verdade para Retomar o Projeto

Este e o unico arquivo de handoff operacional.

Qualquer IA ou pessoa que entrar no projeto deve comecar por aqui e depois abrir
`obsidian-vault/05_PENDENCIAS.md` para ver o backlog completo.

Arquivos antigos de handoff fora deste fluxo devem ser removidos para evitar
contexto duplicado. Se houver conflito em algum documento antigo, este checkpoint vence.

### Protocolo de Inicio
1. `git checkout develop`
2. `git pull origin develop`
3. Ler este arquivo.
4. Ler `obsidian-vault/05_PENDENCIAS.md`.
5. Checar claims ativos antes de iniciar qualquer tarefa.

## 🟡 Estado do Projeto — MIGRAÇÃO v2.0 EM PLANEJAMENTO

**Decisão:** Frontend descartado e reescrito do zero com design system Etheris Finance (Stitch).
Backend mantido integralmente — só o React/Tailwind muda.

- Branch ativa: `develop`
- Backup v0.1.0: `C:\Users\fabio\Downloads\App-financeiro-v0.1.0.zip`
- Executável atual: `ControleFinanceiro\ControleFinanceiro.exe` (raiz) — v0.1.0 ainda

## 🔴 Próxima Tarefa (Iniciar Aqui)
**A3 — Fix build_desktop.bat** — remover pausa final do build

**O que fazer:**
1. Verificar `build_desktop.bat`
2. Remover `pause` do final se ainda existir
3. Testar que o build roda sem travar via PowerShell

Referência: item A3 em `obsidian-vault/05_PENDENCIAS.md`

## 📋 Ordem de Execução

### Trilha A — Fundação (fazer primeiro)
1. `[M]` A1 — Setup Design System Etheris Finance ✅
2. `[P]` A2 — Layout Base + Sidebar novo ✅
3. `[P]` A3 — Fix build_desktop.bat (remover pause) ← **AGORA**

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
| A1 — Setup Design System Etheris Finance | ✅ tokens Tailwind, Inter e utilitários glass globais |
| A2 — Layout Base + Sidebar novo | ✅ Sidebar Etheris + layout base com área principal alinhada |
| Dashboard, Importar, Transações, Cartão, Regras, Metas, Configurações | ✅ v0.1.0 (descartado visualmente) |

## 💬 Nota da Sessão Anterior
Feito: A2 concluiu o shell base em `frontend/src/components/Sidebar.tsx` e `frontend/src/layouts/MainLayout.tsx`, sem migrar páginas.
Pendente: iniciar A3 para remover pausa do `build_desktop.bat`, se ainda existir.

## ⚠️ Protocolo Obrigatório ao Fechar Item
1. Marcar `[x]` em `05_PENDENCIAS.md`
2. Atualizar este arquivo (seção acima)
3. `git add -A && git commit -m "feat(...): ..."`
4. Rodar `build_desktop.bat` (após A3 o agente pode rodar sozinho)
5. `git push origin develop`
