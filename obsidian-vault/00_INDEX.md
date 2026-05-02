# App Financeiro Fabio — Índice de Memória
> Mapa rapido do vault. Nao varrer tudo: escolher pelo tipo de pergunta.

## Fonte da Verdade

O arquivo central para retomar desenvolvimento e:

`10_CHECKPOINT_ATUAL.md`

Ele responde: onde paramos, qual a proxima tarefa, quem esta com claim ativo,
quais regras nao podem ser quebradas e qual protocolo usar ao fechar item.

`05_PENDENCIAS.md` e o backlog vivo. Ele complementa o checkpoint, mas nao substitui
o handoff central.

Arquivos antigos de handoff fora deste fluxo devem ser removidos para evitar
contexto duplicado.

## 🚀 Início Obrigatório de Sessão (nesta ordem)
1. `10_CHECKPOINT_ATUAL.md` — handoff canonico, onde parou, proxima tarefa, protocolo de fechamento
2. `05_PENDENCIAS.md` — backlog vivo com todos os itens e status

## Onde Buscar por Necessidade

| Pergunta | Abrir |
|---|---|
| Onde a última IA parou? Qual é a próxima tarefa? | `10_CHECKPOINT_ATUAL.md` |
| Backlog completo, itens pendentes e concluídos | `05_PENDENCIAS.md` |
| Stack, comandos de build/test, porta do backend | `09_COMANDOS.md` e `context_manifest.json` |
| Arquitetura atual, fluxo de dados, estrutura de pastas | `06_ARQUITETURA.md` |
| Decisões técnicas estáveis (stack, dedup, ciclo financeiro) | `02_DECISOES_TECNICAS.md` |
| Parsers OFX / PDF / Excel — regras e estado atual | `08_PARSERS.md` |
| Design System Stitch — cores, componentes, estilo visual | `07_UX_REFERENCE.md` |
| Histórico antigo (apenas referência) | `03_PLANO_DE_FASES.md`, `04_LOG_DE_EXECUCAO.md` |

## Arquivos Ativos (leitura frequente)
- **`10_CHECKPOINT_ATUAL.md`** — handoff canônico entre IAs. Sempre atualizar ao fechar item.
- **`05_PENDENCIAS.md`** — backlog vivo. Marcar `[x]` ao concluir.
- **`context_manifest.json`** — índice leve de caminhos, stack e comandos.
- **`09_COMANDOS.md`** — comandos de dev, teste e build prontos para copiar.

## Arquivos Sob Demanda (ler só quando necessário)
- `02_DECISOES_TECNICAS.md` — stack e decisões estáveis.
- `06_ARQUITETURA.md` — estrutura atual do app.
- `07_UX_REFERENCE.md` — design Stitch; usar para dúvidas de UI/estilo.
- `08_PARSERS.md` — detalhes de parsers de importação.

## Arquivos Históricos (raramente necessários)
- `03_PLANO_DE_FASES.md` — plano original do MVP já concluído.
- `04_LOG_DE_EXECUCAO.md` — log inicial de criação.

## Repo e Caminhos Rápidos
- Local Fabio: `C:\Users\fabio\Projects\app-financeiro-fabio`
- Local Thiago: ver setup de Thiago
- Branch: `develop`
- Executável: `ControleFinanceiro.exe` (raiz do projeto)
- Banco: `data\finance.db` (ao lado do executável)

*Ultima curadoria: 2026-05-02 — Codex*
