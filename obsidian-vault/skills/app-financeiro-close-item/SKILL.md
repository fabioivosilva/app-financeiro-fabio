---
name: app-financeiro-close-item
description: >
  Protocolo obrigatorio de fechamento de tarefa no App Financeiro Fabio.
  Use ao concluir qualquer item do backlog.
---

# Skill: App Financeiro - Fechar Item do Backlog

## Estado base

O repositorio foi zerado em 2026-05-02.
Enquanto o scaffold desktop nao for recriado, nao existe `build_desktop.bat`
nem `ControleFinanceiro.exe` para validar.

O fechamento oficial agora e:

1. atualizar backlog;
2. atualizar checkpoint;
3. validar o que for possivel para o estado atual;
4. commitar;
5. dar push.

Quando a trilha desktop recriar o build, o passo de build volta a ser obrigatorio
para itens que alterem codigo executavel.

## Passo 1 - Marcar no backlog

Abrir `obsidian-vault/05_PENDENCIAS.md` e mudar o item:

```markdown
- [x] `[M]` R0 - Scaffolding minimo do repo
```

Se a tarefa ficar incompleta, manter `[/]` e deixar uma nota clara no item.

## Passo 2 - Atualizar checkpoint

Editar `obsidian-vault/10_CHECKPOINT_ATUAL.md`:

- registrar o que foi concluido;
- atualizar a proxima tarefa;
- registrar pendencias ou riscos;
- manter a data atualizada.

## Passo 3 - Validar

Escolha a validacao de acordo com o estado do repo:

- Apenas vault/backlog: revisar markdown e rodar `git status`.
- Apos R0: rodar checks basicos do scaffold criado.
- Apos desktop existir: rodar `build_desktop.bat` e validar timestamp do exe.

Nunca declarar build desktop feito se ainda nao houver scaffold desktop.

## Passo 4 - Commit

```bash
git add -A
git commit -m "tipo(escopo): descricao curta"
```

Tipos comuns:

- `docs`
- `chore`
- `feat`
- `fix`
- `refactor`

## Passo 5 - Push

```bash
git push origin develop
```

Mensagem final esperada:

```text
Push feito no develop. Proxima sessao deve comecar pelo vault.
```

## Checklist

```text
- [ ] 05_PENDENCIAS.md atualizado
- [ ] 10_CHECKPOINT_ATUAL.md atualizado
- [ ] validacao possivel executada
- [ ] commit feito
- [ ] push feito no develop
```
