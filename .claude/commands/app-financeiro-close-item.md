# Skill: App Financeiro — Fechar Item do Backlog

Protocolo obrigatório de fechamento de tarefa no App Financeiro Fabio.
Use ao concluir qualquer feature, bugfix ou melhoria.

## Os 5 Passos de Fechamento (nesta ordem)

### 1. Marcar no Backlog
Abrir `obsidian-vault/05_PENDENCIAS.md` e mudar `[ ]` ou `[/]` para `[x]`.

### 2. Atualizar o Checkpoint
Editar `obsidian-vault/10_CHECKPOINT_ATUAL.md`:
- Adicionar o item na tabela "✅ Últimas Features Entregues"
- Atualizar "🔴 Próxima Tarefa" para o próximo item do backlog
- Atualizar a data no topo

### 3. Commit com Mensagem Descritiva
```bash
git add -A
git commit -m "tipo(escopo): descrição curta em português

- Detalhe 1 do que foi feito
- Detalhe 2 se houver"
```

Tipos: `feat` | `fix` | `chore` | `refactor` | `docs`

### 4. Build do Executável Windows
Pedir ao usuário para rodar na máquina Windows:
```bash
build_desktop.bat
```
Confirmar que `ControleFinanceiro.exe` (na raiz) tem timestamp novo.

### 5. Push para o Remoto
```bash
git push origin develop
```
Confirmar: "✅ Push feito. Thiago pode dar `git pull origin develop` para sincronizar."

---

## Checklist de Fechamento
```
- [ ] [x] marcado em 05_PENDENCIAS.md
- [ ] 10_CHECKPOINT_ATUAL.md atualizado (feature + próxima tarefa + data)
- [ ] git commit feito com mensagem descritiva
- [ ] build_desktop.bat rodado — ControleFinanceiro.exe com novo timestamp
- [ ] git push origin develop
```
