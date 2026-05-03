---
name: app-financeiro-close-item
description: Protocolo obrigatorio de fechamento de tarefa no App Financeiro Fabio. Use ao concluir qualquer item do roadmap/backlog, especialmente itens marcados em NORTE.md com claim ativo.
---

# App Financeiro - Fechar Item

## Estado Base

O repo atual esta em `develop` e possui backend FastAPI e frontend React/Vite. Neste reset, `build_desktop.bat` pode ainda nao existir; confirmar no workspace antes de declarar build desktop.

Arquivos de controle:

- `NORTE.md`: fonte do snapshot, roadmap e claims.
- `obsidian-vault/07_UX_REFERENCE.md`: resumo visual.
- `C:\Users\fabio\Downloads\App-financeiro`: referencia visual detalhada para frontend.

## Fechamento

1. Validar a implementacao com os checks relevantes.
   - Frontend: `npm.cmd run build` em `frontend`.
   - Backend Python: `backend\.venv\Scripts\python.exe -m py_compile <arquivos>` e testes relevantes quando existirem.
   - Desktop: rodar `.\build_desktop.bat` quando o arquivo existir e a tarefa alterar codigo executavel ou frontend empacotado.
2. Atualizar `NORTE.md`.
   - Marcar o item concluido com `[x]`.
   - Remover o cadeado do item concluido.
   - Atualizar o SNAPSHOT: `STATUS`, `PROXIMA`, `CLAIMS`.
3. Atualizar memoria compacta quando houver mudanca relevante.
   - Preferir `NORTE.md` para o fluxo novo.
   - Usar Obsidian apenas para detalhes/handoff curto que ajudem a proxima sessao.
4. Conferir `git status --short`.
   - Nao incluir `.pyc`, banco local, exe gerado ou artefatos privados.
5. Commitar o escopo da tarefa.
   - Exemplo: `git commit -m "feat(T3.1): implementa tela de metas"`.
6. Fazer push para `origin develop` somente quando autorizado.

## Guardrails

- Nunca declarar T concluida sem atualizar `NORTE.md`.
- Nunca declarar build desktop feito se `build_desktop.bat` nao existir ou nao rodou com sucesso.
- Nunca commitar artefatos locais de runtime/build por acidente.
- Se o push for bloqueado por politica ou permissao, registrar que o commit ficou local e pedir aprovacao explicita.
