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
Para não perder contexto nem repetir trabalho, cada IA deve sempre partir do estado mais recente do repositório
e do Obsidian Vault antes de sugerir qualquer código ou mudança.

## Passo 1 — Clonar / Atualizar o Repositório

Se o repositório ainda não foi clonado:
```bash
git clone https://<TOKEN>@github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio
git checkout develop
```

Se já foi clonado:
```bash
cd app-financeiro-fabio
git checkout develop
git pull origin develop
```

**Importante:** Sempre trabalhar na branch `develop`. Nunca commitar direto em `main`.

## Passo 2 — Ler o Vault (nesta ordem exata, mínimo de tokens)

Ler sequencialmente:
1. `obsidian-vault/10_CHECKPOINT_ATUAL.md` — estado atual + próxima tarefa + protocolo de fechamento
2. `obsidian-vault/05_PENDENCIAS.md` — backlog vivo com status de cada item
3. (somente se necessário) `obsidian-vault/00_INDEX.md` — mapa do vault para saber onde buscar outra info

Não ler outros arquivos do vault a menos que a tarefa exija (ver `00_INDEX.md` para guia).

## Passo 3 — Reportar Estado ao Usuário

Após ler o vault, apresentar um resumo estruturado:

```
## 🧠 Estado Atual do Projeto
**Último trabalho:** [extraído do checkpoint]
**Próxima tarefa:** [extraído da seção 🔴 do checkpoint]
**Backlog pendente:** [N itens abertos no 05_PENDENCIAS.md]

## 🎯 Sugestão para Esta Sessão
[tarefa mais prioritária com escopo claro]
```

Só então perguntar ao usuário se quer atacar a tarefa sugerida ou outra coisa.

## Passo 4 — Antes de Qualquer Código

Confirmar:
- [ ] Branch é `develop` (`git branch`)
- [ ] Repo está atualizado (`git status` / `git log --oneline -3`)
- [ ] Entendeu o contexto da próxima tarefa

## Referências Rápidas
- Design System: `obsidian-vault/07_UX_REFERENCE.md` (dark mode, glassmorphism, cor `#820AD1`)
- Regras de categorização: `backend/app/seed.py` (56 regras de ouro)
- Arquitetura: `obsidian-vault/06_ARQUITETURA.md`
- Comandos: `obsidian-vault/09_COMANDOS.md`
