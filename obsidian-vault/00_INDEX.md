# App Financeiro Fabio - Indice de Memoria

Use este arquivo como mapa rapido. Nao varrer o vault inteiro: escolha o arquivo pela pergunta.

## Onde Buscar

| Necessidade | Abrir |
|---|---|
| Estado atual, ultimo handoff, proximo passo | `01_SESSION_STATE.md` |
| Backlog e prioridades | `05_PENDENCIAS.md` |
| Caminhos, repo, comandos principais, stack atual | `context_manifest.json` e `09_COMANDOS.md` |
| Arquitetura atual do app | `06_ARQUITETURA.md` |
| Decisoes tecnicas estaveis | `02_DECISOES_TECNICAS.md` |
| Parsers/importacao OFX, PDF, Excel | `08_PARSERS.md` |
| Referencia visual original | `07_UX_REFERENCE.md` |
| Plano original do MVP, apenas historico | `03_PLANO_DE_FASES.md` |
| Log inicial antigo, apenas historico | `04_LOG_DE_EXECUCAO.md` |

## Arquivos Ativos

- `01_SESSION_STATE.md`: memoria operacional curta. Fonte unica de session state; nao existe espelho no repo.
- `05_PENDENCIAS.md`: backlog vivo. Preferir itens curtos, agrupados por area.
- `context_manifest.json`: indice leve para caminhos, stack e comandos.
- `09_COMANDOS.md`: comandos atuais de dev, teste e build.

## Referencias Sob Demanda

- `02_DECISOES_TECNICAS.md`: stack e decisoes que raramente mudam.
- `06_ARQUITETURA.md`: estrutura atual e fluxo de dados.
- `07_UX_REFERENCE.md`: design original do Stitch; usar apenas para duvidas de UI/estilo.
- `08_PARSERS.md`: estado e regras dos parsers/importadores.

## Historico

- `03_PLANO_DE_FASES.md`: plano original do MVP ja concluido.
- `04_LOG_DE_EXECUCAO.md`: log inicial de criacao do projeto.

## Regras de Uso

1. Comecar por este indice.
2. Para trabalho novo: ler `01_SESSION_STATE.md` e `05_PENDENCIAS.md`.
3. Para codigo: usar o repo como fonte final da verdade.
4. Manter o Obsidian compacto: decisoes, pendencias e handoffs curtos; detalhes ficam no git.

## Repo

- Local: `C:\Users\fabio\Projects\app-financeiro-fabio`
- Branch: `develop`
- Executavel de uso: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`
- Banco local: `C:\Users\fabio\Projects\app-financeiro-fabio\data\finance.db`

Ultima curadoria: 2026-05-02
