# SESSION_STATE

> Arquivo mantido apenas por compatibilidade com fluxos antigos.

## Fonte da Verdade

O handoff operacional do projeto agora fica em:

`obsidian-vault/10_CHECKPOINT_ATUAL.md`

O backlog vivo fica em:

`obsidian-vault/05_PENDENCIAS.md`

## Regra para IAs e Pessoas

Ao iniciar uma sessao:

1. Atualize o repo na branch `develop`.
2. Leia `obsidian-vault/10_CHECKPOINT_ATUAL.md`.
3. Leia `obsidian-vault/05_PENDENCIAS.md`.
4. Escolha apenas itens sem claim ativo de outra pessoa.

Ao fechar uma tarefa:

1. Marque `[x]` no item em `obsidian-vault/05_PENDENCIAS.md`.
2. Atualize `obsidian-vault/10_CHECKPOINT_ATUAL.md`.
3. Commit, build desktop e push.

Nao registrar novos handoffs neste arquivo. Use sempre `10_CHECKPOINT_ATUAL.md`.
