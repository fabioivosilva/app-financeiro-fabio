# Skill: App Financeiro — Startup de Sessão

Protocolo obrigatório de início de sessão no projeto App Financeiro Fabio.
Use SEMPRE ao iniciar qualquer sessão neste projeto.

## Passo 1 — Atualizar o Repositório

```bash
git checkout develop
git pull origin develop
git log --oneline -3
```

## Passo 2 — Ler o Vault (nesta ordem)

1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` — último estado + próxima tarefa
2. `obsidian-vault/05_PENDENCIAS.md` — backlog com sizing P/M/G e claims 🔒

## Passo 3 — Checar Claims Ativos (🔒)

- `🔒 [FABIO]` — Fabio está trabalhando nisso
- `🔒 [THIAGO]` — Thiago está trabalhando nisso

Se houver claim do outro dev, avisar e não sugerir aquele item.

## Passo 4 — Apresentar ao Usuário

```
## 🧠 Estado Atual
Último trabalho: [extraído do checkpoint]
Últimos commits: [git log --oneline -3]

## 🔒 Tarefas em Andamento
[listar itens com 🔒 e por quem — ou "nenhuma" se limpo]

## 💰 Orçamento da Sessão
Capacidade: 1G  ·  ou  ·  2-3M  ·  ou  ·  4-6P

Próximos itens disponíveis (sem claim):
  [item] [tamanho] descrição .. status

Sugestão para hoje: [o que cabe, excluindo claims do outro dev]
```

## Passo 5 — Ao Iniciar uma Tarefa

Marcar no backlog com claim e commitar imediatamente:
```bash
git add obsidian-vault/05_PENDENCIAS.md
git commit -m "chore(backlog): 🔒 [FABIO] inicia <nome da tarefa>"
git push origin develop
```

## Referências Rápidas
- Design System: `obsidian-vault/07_UX_REFERENCE.md` (dark mode, glassmorphism, `#820AD1`)
- Regras de categorização: `backend/app/seed.py`
- Arquitetura: `obsidian-vault/06_ARQUITETURA.md`
- Comandos: `obsidian-vault/09_COMANDOS.md`
