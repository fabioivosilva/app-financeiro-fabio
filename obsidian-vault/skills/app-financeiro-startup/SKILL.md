---
name: app-financeiro-startup
description: >
  Protocolo obrigatório de início de sessão no projeto App Financeiro Fabio.
  Use SEMPRE ao iniciar qualquer sessão neste projeto — seja para desenvolver,
  revisar, debugar ou planejar. Ativa ao receber o token do GitHub, ao mencionar
  "app financeiro", "projeto fabio", "app-financeiro-fabio", ou ao receber o
  prompt de início de sessão padrão do projeto.
---

# Skill: App Financeiro — Startup de Sessão

## Por que esta skill existe
Este projeto é desenvolvido em duo (Fabio + Thiago) com múltiplos agentes de IA alternando sessões.
Cada IA deve partir do estado mais recente do repositório e do Vault antes de qualquer código.

---

## Passo 1 — Atualizar o Repositório

```bash
git checkout develop
git pull origin develop
```

Se ainda não clonado:
```bash
git clone https://<TOKEN>@github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio && git checkout develop
```

---

## Passo 2 — Ler o Vault (nesta ordem, mínimo de tokens)

1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` — último estado + próxima tarefa
2. `obsidian-vault/05_PENDENCIAS.md` — backlog com sizing P/M/G

Não ler outros arquivos a menos que a tarefa exija (ver `obsidian-vault/00_INDEX.md`).

---

## Passo 3 — Gerar Orçamento de Sessão

Após ler o backlog, apresentar ao usuário:

```
## 🧠 Estado Atual
Último trabalho: [extraído do checkpoint]
Commit: [git log --oneline -1]

## 💰 Orçamento da Sessão
Capacidade: 1G  ·  ou  ·  2-3M  ·  ou  ·  4-6P

Itens disponíveis (por prioridade):
  [/] [M] Fluxo de Aporte em Meta ............ ← recomendado agora
  [ ] [P] Preenchimento Automático Categoria . ← dá pra encaixar junto
  [ ] [G] Previsão de Gastos Futuros ......... ← sessão própria
  ...

Sugestão para hoje: [listar o que cabe — ex: "1M + 1P = ~80% da sessão"]

## 🎯 Próxima Tarefa Recomendada
[descrever o item mais prioritário com escopo claro]
```

Só então perguntar ao usuário se confirma o plano ou quer ajustar.

---

## Referências Rápidas
- Design System: `obsidian-vault/07_UX_REFERENCE.md` (dark mode, glassmorphism, `#820AD1`)
- Regras de categorização: `backend/app/seed.py`
- Arquitetura: `obsidian-vault/06_ARQUITETURA.md`
- Comandos: `obsidian-vault/09_COMANDOS.md`
