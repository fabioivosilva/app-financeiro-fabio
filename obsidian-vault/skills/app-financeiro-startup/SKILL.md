---
name: app-financeiro-startup
description: >
  Protocolo obrigatório de início de sessão no projeto App Financeiro Fabio.
  Use SEMPRE ao iniciar qualquer sessão neste projeto. Ativa ao receber token
  do GitHub, ao mencionar "app financeiro", "projeto fabio" ou o prompt padrão.
---

# Skill: App Financeiro - Startup de Sessao

## Passo 1 — Atualizar o Repositório
```bash
git checkout develop && git pull origin develop && git log --oneline -3
```

## Passo 2 — Ler APENAS o NORTE.md (1 arquivo, tudo está lá)
`NORTE.md` na raiz contém: roadmap completo, sizing, claims, protocolo, stack e comandos.

## Passo 3 — Apresentar ao usuário
```
## 🧠 Estado Atual
Últimos commits: [git log --oneline -3]

## 🔒 Claims Ativos
[listar itens com 🔒 em NORTE.md — ou "nenhum"]

## 💰 Orçamento da Sessão
Capacidade: 1G · ou · 2-3M · ou · 4-6P

Próximos disponíveis (sem claim):
  [ ] [G] T0.1 — Setup Backend Base   ← próxima tarefa
  [ ] [G] T0.2 — Setup Frontend Base  ← pode ser paralelo
  ...

Sugestão para hoje: [o que cabe na sessão]
```

## Passo 4 — Ao Iniciar Tarefa
Marcar `🔒 [NOME]` no item em NORTE.md e commitar imediatamente.
