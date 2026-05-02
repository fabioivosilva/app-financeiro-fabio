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
Projeto desenvolvido em duo (Fabio + Thiago) com múltiplos agentes de IA alternando sessões.
Cada IA deve partir do estado mais recente do repositório e checar se há tarefas já em andamento
pelo outro desenvolvedor antes de sugerir qualquer trabalho.

---

## Passo 1 — Atualizar o Repositório

```bash
git checkout develop
git pull origin develop
git log --oneline -3   # mostrar os últimos commits ao usuário
```

Se ainda não clonado:
```bash
git clone https://<TOKEN>@github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio && git checkout develop
```

---

## Passo 2 — Ler o Vault (nesta ordem, mínimo de tokens)

1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` — último estado + próxima tarefa
2. `obsidian-vault/05_PENDENCIAS.md` — backlog com sizing P/M/G e claims 🔒

Não ler outros arquivos a menos que a tarefa exija (ver `obsidian-vault/00_INDEX.md`).

---

## Passo 3 — Checar Tarefas em Andamento (🔒 Claims)

Ao ler o backlog, verificar se há itens marcados com 🔒:
- `🔒 [FABIO]` — Fabio está trabalhando nisso
- `🔒 [THIAGO]` — Thiago está trabalhando nisso

Se houver claim ativo do **outro desenvolvedor**, avisar claramente e não sugerir aquele item.
Se o claim for do **próprio usuário** desta sessão, perguntar se quer continuar ou liberar.

---

## Passo 4 — Gerar Orçamento de Sessão

Apresentar ao usuário:

```
## 🧠 Estado Atual
Último trabalho: [extraído do checkpoint]
Últimos commits: [git log --oneline -3]

## 🔒 Tarefas em Andamento
[listar itens com 🔒 e por quem — ou "nenhuma" se limpo]

## 💰 Orçamento da Sessão
Capacidade: 1G  ·  ou  ·  2-3M  ·  ou  ·  4-6P

Próximos itens disponíveis (sem claim):
  [/] [M] 🔒 [FABIO] Aporte Manual em Meta .... em andamento por Fabio
  [ ] [P] Preenchimento Automático Categoria .. disponível
  [ ] [G] Parsers Plugáveis ................... disponível (sessão própria)

Sugestão para hoje: [o que cabe, excluindo itens com claim de outro dev]
```

---

## Passo 5 — Ao Iniciar uma Tarefa

Antes de começar a codar, marcar o item no backlog com o claim:
```markdown
- [/] `[M]` 🔒 [FABIO] Nome da tarefa...
```
Fazer commit imediato do backlog atualizado:
```bash
git add obsidian-vault/05_PENDENCIAS.md
git commit -m "chore(backlog): 🔒 [FABIO] inicia tarefa Nome Da Tarefa"
git push origin develop
```
Isso avisa o Thiago (e a IA dele) que o item está sendo trabalhado.

---

## Referências Rápidas
- Design System: `obsidian-vault/07_UX_REFERENCE.md` (dark mode, glassmorphism, `#820AD1`)
- Regras de categorização: `backend/app/seed.py`
- Arquitetura: `obsidian-vault/06_ARQUITETURA.md`
- Comandos: `obsidian-vault/09_COMANDOS.md`
