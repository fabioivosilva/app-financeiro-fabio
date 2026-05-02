---
name: app-financeiro-startup
description: >
  Protocolo obrigatorio de inicio de sessao no projeto App Financeiro Fabio.
  Use sempre ao iniciar qualquer sessao neste projeto.
---

# Skill: App Financeiro - Startup de Sessao

## Estado base

Em 2026-05-02 o repositorio foi zerado por decisao do Fabio.
O unico codigo/artefato que deve existir como fonte de verdade e o vault:

- `.git/`
- `obsidian-vault/`

Frontend, backend, build desktop, configs e prototipos antigos foram removidos.
Nao assuma que arquivos fora do vault existem.

## Passo 1 - Atualizar o repositorio

```bash
git checkout develop
git pull origin develop
git log --oneline -3
```

Se ainda nao clonado:

```bash
git clone https://<TOKEN>@github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio
git checkout develop
```

## Passo 2 - Ler o vault, nesta ordem

1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` - estado atual e proxima tarefa
2. `obsidian-vault/05_PENDENCIAS.md` - backlog oficial com sizing
3. `obsidian-vault/09_COMANDOS.md` - comandos permitidos no estado atual

Leia outros arquivos so quando a tarefa pedir.

## Passo 3 - Checar claims

No backlog, respeite itens marcados com claim:

- `[/] [FABIO]` - Fabio esta trabalhando
- `[/] [THIAGO]` - Thiago esta trabalhando

Se o item estiver com claim de outra pessoa, nao assuma a tarefa sem alinhar.

## Passo 4 - Estado que deve ser apresentado

Ao iniciar a sessao, diga de forma curta:

```text
Estado atual: repo zerado, vault e a fonte de verdade.
Proxima tarefa: [extraida do 10_CHECKPOINT_ATUAL.md]
Backlog: [primeiros itens disponiveis do 05_PENDENCIAS.md]
Build: indisponivel ate recriar scaffold desktop.
```

## Passo 5 - Ao iniciar uma tarefa

Antes de codar, marcar claim no backlog:

```markdown
- [/] `[M]` [FABIO] R0 - Scaffolding minimo do repo
```

Depois commitar e dar push:

```bash
git add obsidian-vault/05_PENDENCIAS.md
git commit -m "chore(backlog): Fabio inicia R0 scaffolding minimo"
git push origin develop
```

## Regras fixas

- Branch sempre `develop`.
- Vault e fonte de verdade.
- Nao reaproveitar frontend/backend removidos.
- Parser engine sera recriado como modulo novo, com foco multi-banco.
- UI alvo: dark mode, glassmorphism, Inter, Material Symbols Outlined, `#820AD1`.
- Ciclo financeiro: dia 27 ao dia 26.
