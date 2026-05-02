# CHECKPOINT ATUAL - App Financeiro Fabio

> Fonte canonica de handoff. Atualizado em 2026-05-02 apos reset total do repo.

## Estado Atual

O repositorio foi zerado de proposito a pedido do Fabio.

Permanece apenas:

- `.git/`
- `obsidian-vault/`

Tudo fora do vault foi removido: frontend, backend, build desktop, scripts, design zip, bancos locais, configs de agente e artefatos.

## Decisao

Recomecar o produto do zero, com backlog estruturado antes de escrever codigo.

O projeto novo deve preservar o conhecimento de produto, mas nao deve reaproveitar carcaça antiga de frontend/backend.

## Proxima Tarefa

**R0 - Scaffolding minimo do repo**

Criar uma base nova, pequena e limpa:

1. `.gitignore`
2. `README.md`
3. `frontend/` com React + Vite + TypeScript
4. `backend/` com FastAPI + SQLite
5. `build_desktop.bat` simples
6. Primeiro `npm run build` e primeiro `python -m py_compile`

## Regra de Inicio de Sessao

1. `git checkout develop`
2. `git pull origin develop`
3. Ler este arquivo.
4. Ler `obsidian-vault/05_PENDENCIAS.md`.
5. Escolher apenas o primeiro item sem claim.

## Regra de Fechamento

Ao concluir item:

1. Marcar `[x]` no backlog.
2. Atualizar este checkpoint.
3. Validar com os comandos cabiveis.
4. Commitar.
5. Push em `develop`.

Build desktop so volta a ser obrigatorio depois que a trilha de desktop for recriada.
