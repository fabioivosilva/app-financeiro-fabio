# Setup do Projeto - Thiago

## Como Comecar

```bash
git clone https://github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio
git checkout develop
git pull origin develop
```

Leia **apenas** `NORTE.md` — é a única fonte de verdade do projeto.
Leia só o bloco SNAPSHOT (primeiras ~20 linhas). Ele tem tudo que precisa para começar.

## Prompt para Claude

```text
Projeto: App Financeiro Fabio & Thiago
Repo já clonado em: <caminho local>

INÍCIO OBRIGATÓRIO:
1. git checkout develop && git pull origin develop
2. Ler APENAS o bloco SNAPSHOT no topo de NORTE.md (primeiras ~20 linhas)
3. Me apresentar: claims ativos + próxima tarefa + orçamento da sessão

Depois do SNAPSHOT, aguarda minha confirmação antes de qualquer código.
```

## Dinamica

- Ao iniciar uma tarefa: marcar `🔒 [THIAGO]` no item em NORTE.md + commit + push.
- Ao concluir: remover 🔒, marcar `[x]`, atualizar SNAPSHOT, commitar e dar push.
- Sempre branch `develop`. Nunca `main`.
- Sem .exe — app roda via `rodar.bat` + browser (`localhost:5173`).
- Parsers plugáveis e multi-banco (não acoplados ao Itaú).

## Rodar o app localmente

```bash
# Opção 1 — script completo
./rodar.bat

# Opção 2 — manual
cd frontend && npm run dev        # localhost:5173
cd backend && uvicorn app.main:app --port 8000  # quando T0.1 estiver pronto
```
