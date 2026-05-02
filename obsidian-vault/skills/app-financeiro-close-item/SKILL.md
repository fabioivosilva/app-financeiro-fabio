---
name: app-financeiro-close-item
description: >
  Protocolo obrigatório de fechamento de tarefa no App Financeiro Fabio.
  Use ao concluir qualquer feature, bugfix ou melhoria — antes de considerar
  a sessão encerrada. Ativa quando o usuário disser "terminamos", "pode fechar",
  "commita", "faz o build", "marca como feito" ou ao finalizar qualquer item
  do backlog do projeto App Financeiro Fabio.
---

# Skill: App Financeiro — Fechar Item do Backlog

## Por que esta skill existe
Fabio e Thiago precisam ver o resultado no executável Windows para validar o trabalho.
Sem o build, a feature existe só no código e ninguém consegue testar.
Sem o commit + push, o outro desenvolvedor e a próxima IA ficam desatualizados.
Sem a atualização do vault, o contexto se perde na próxima sessão.

Nunca encerrar uma sessão sem executar estes 5 passos.

## Os 5 Passos de Fechamento (nesta ordem)

### 1. Marcar no Backlog
Abrir `obsidian-vault/05_PENDENCIAS.md` e mudar o item de `[ ]` ou `[/]` para `[x]`.

```markdown
# Exemplo:
- [x] **Fluxo de Aporte em Meta:** Endpoint POST /goals/{id}/deposit implementado.
```

### 2. Atualizar o Checkpoint
Editar `obsidian-vault/10_CHECKPOINT_ATUAL.md`:
- Adicionar o item na tabela "✅ Últimas Features Entregues"
- Atualizar a seção "🔴 Próxima Tarefa" para o próximo item do backlog
- Atualizar a data no topo do arquivo

### 3. Commit com Mensagem Descritiva
```bash
git add -A
git commit -m "tipo(escopo): descrição curta em português

- Detalhe 1 do que foi feito
- Detalhe 2 se houver"
```

**Tipos de commit:** `feat` (nova feature), `fix` (correção), `chore` (infra/config), `refactor`, `docs`

**Exemplos reais do projeto:**
```
feat(goals): add POST /goals/{id}/deposit endpoint and deposit modal UI
fix(cards): render spending by person summary
chore(obsidian): update checkpoint and compact session state
```

### 4. Build do Executável Windows
```bash
# Na máquina do Fabio ou Thiago — não é possível rodar no container da IA
build_desktop.bat
```

Após o build, confirmar que `ControleFinanceiro.exe` (na raiz) tem timestamp novo.
Se o `.exe` estiver aberto/travado, fechar o app antes de rodar o build.

### 5. Push para o Remoto
```bash
git push origin develop
```

Confirmar: "✅ Push feito. Thiago pode dar `git pull origin develop` para sincronizar."

---

## Checklist de Fechamento (copiar e colar)
```
- [ ] [x] marcado em 05_PENDENCIAS.md
- [ ] 10_CHECKPOINT_ATUAL.md atualizado (feature + próxima tarefa + data)
- [ ] git commit feito com mensagem descritiva
- [ ] build_desktop.bat rodado — ControleFinanceiro.exe com novo timestamp
- [ ] git push origin develop
```

## Mensagem de Handoff para Próxima IA
Ao final da sessão, deixar uma nota curta no `10_CHECKPOINT_ATUAL.md`:
```markdown
## 💬 Nota da Sessão Anterior
Feito: [o que foi implementado em 1-2 linhas]
Pendente: [se alguma coisa ficou pela metade, especificar claramente]
```
