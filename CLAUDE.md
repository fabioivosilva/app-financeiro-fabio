# App Financeiro — Guia para Agentes de IA

## 🚨 UMA ÚNICA LEITURA OBRIGATÓRIA AO INICIAR
Ler **apenas** `NORTE.md` na raiz do projeto.
Ele contém: roadmap, sizing, claims, protocolo de fechamento, stack, design system e comandos.
Não ler mais nada do vault a menos que NORTE.md direcione.

## Início de Sessão
```bash
git checkout develop
git pull origin develop
# Ler NORTE.md
# Checar 🔒 claims ativos
# Apresentar orçamento da sessão ao usuário
```

## Ao Iniciar uma Tarefa
```bash
# Marcar 🔒 [NOME] no item em NORTE.md
git add NORTE.md && git commit -m "chore(norte): 🔒 [FABIO] inicia TXX" && git push origin develop
```

## Ao Fechar uma Tarefa
```bash
# Marcar [x] em NORTE.md, remover 🔒
git add -A
git commit -m "feat(TXX): descrição"
# Instruir usuário a rodar build_desktop.bat
git push origin develop
```
