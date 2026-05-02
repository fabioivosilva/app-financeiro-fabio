# Setup do Projeto - Thiago

## Estado Atual

O repo foi zerado. So existe `obsidian-vault/`.

Nao tente rodar backend, frontend ou build desktop antes da tarefa `R0 - Scaffolding minimo do repo`.

## Como Comecar

```powershell
git clone https://github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio
git checkout develop
git pull origin develop
```

Depois leia, nesta ordem:

1. `obsidian-vault/10_CHECKPOINT_ATUAL.md`
2. `obsidian-vault/05_PENDENCIAS.md`
3. `obsidian-vault/00_INDEX.md`

## Prompt para Claude

```text
Estou iniciando uma sessao no projeto App Financeiro Fabio.

O repo foi zerado de proposito e so o obsidian-vault permanece.

Regras:
- Sempre branch develop.
- Nao usar main.
- Ler primeiro obsidian-vault/10_CHECKPOINT_ATUAL.md.
- Depois ler obsidian-vault/05_PENDENCIAS.md.
- Comecar pelo primeiro item sem claim.
- O backlog atual reconstrói o app do zero.
- Parsers devem nascer plugaveis e multi-banco, nao acoplados ao Itau.

Antes de codar, me diga:
1. Estado atual.
2. Proxima tarefa.
3. Arquivos que pretende criar.
4. Validacoes que pretende rodar.
```

## Dinamica

- Ao iniciar uma tarefa, marcar claim no backlog.
- Ao concluir, marcar `[x]`, atualizar checkpoint, commitar e dar push.
- Build desktop so volta a ser exigido depois que a trilha Desktop for recriada.
