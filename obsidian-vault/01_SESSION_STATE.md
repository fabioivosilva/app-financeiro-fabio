# SESSION_STATE

## Status geral
O MVP do "App Financeiro Fabio" foi totalmente concluído. A aplicação agora opera como um executável Desktop autossuficiente (`ControleFinanceiro.exe`), construído em Python (FastAPI + Pywebview + SQLite) com a interface renderizada em React/TailwindCSS usando os tokens visuais Stitch.

## Última fase concluída
- FASE 9: Empacotamento Desktop (Pyinstaller + Pywebview) concluído com sucesso.

## Fase atual
Nenhuma, o MVP (Minimum Viable Product) especificado está 100% finalizado.

## Repo
- URL: https://github.com/fabioivosilva/app-financeiro-fabio
- Local: C:\Users\fabio\Projects\app-financeiro-fabio
- Branch: develop
- Último commit: fix(pdf): support Latam Pass dates and fix regex boundaries

## Stack
- Backend: FastAPI, SQLAlchemy, SQLite, Uvicorn, Pywebview, PyInstaller
- Frontend: React 19, Vite, TailwindCSS, Recharts

## Produto Final
- O executável encontra-se em `backend/dist/ControleFinanceiro.exe`.
- Ele roda um servidor local em background e abre uma janela web nativa no Windows.
- O banco de dados (`app.db`) será criado/preservado automaticamente na mesma pasta em que o usuário executar o arquivo `.exe`.
- Foram realizadas correções finais Pós-MVP: inclusão do filtro de Mês no Dashboard e suporte a faturas Itaú Latam Pass (com datas abreviadas).

## Próximos Passos Pós-MVP (Backlog Futuro)
- Criar a funcionalidade de backup automático e sincronização em nuvem.
- Implementar leitura automatizada de extratos Open Finance (se aplicável).
- Evoluir os gráficos Recharts com tooltips personalizados e exportação em PDF.

## Atualizacao de sessao - 2026-05-02T02:20:53-03:00
- Criada a skill global `obsidian-project-memory` em `C:\Users\fabio\.codex\skills\obsidian-project-memory`.
- Arquivos criados/alterados: `SKILL.md` e `agents/openai.yaml` da skill.
- Validacao executada: `quick_validate.py C:\Users\fabio\.codex\skills\obsidian-project-memory` retornou `Skill is valid!`.
- Comportamento definido: usar `00_INDEX.md`, `01_SESSION_STATE.md` e `context_manifest.json` para retomar contexto com baixo uso de tokens; atualizar session state ao final de tarefas relevantes; pedir confirmacao antes de commit.
- Pendente no repo do app financeiro: bugfix do parser PDF ainda aparece como mudanca local nao commitada (`backend/app/services/itau_pdf_parser.py` e `backend/test_itau_pdf_parser.py`), junto de arquivos locais nao rastreados de build/debug.
- Proximo passo sugerido: rebuildar o `.exe` para testar o bugfix do PDF no executavel, depois confirmar se deseja commitar as alteracoes.
## Atualizacao de sessao - 2026-05-02T02:22:19-03:00
- Skill `obsidian-project-memory` atualizada para acionar tambem em saudacoes simples como `oi`, `ola`, `bom dia`, `boa tarde` e `boa noite` quando o contexto do projeto for conhecido.
- Novo comportamento: ao receber uma saudacao em nova sessao, o Codex deve ler primeiro `00_INDEX.md`, depois `01_SESSION_STATE.md` e `context_manifest.json`, e responder com um resumo curto da sessao e o proximo passo conhecido.
- Validacao executada: `quick_validate.py C:\Users\fabio\.codex\skills\obsidian-project-memory` retornou `Skill is valid!`.
## Atualizacao de sessao - 2026-05-02T02:23:53-03:00
- Skill `obsidian-project-memory` atualizada com o fluxo padrao de bugfix: corrigir, validar, atualizar Obsidian/session state e commitar o escopo do bugfix por padrao.
- Guarda-corpo definido: commits de bugfix devem incluir apenas arquivos do fix, testes e espelhos intencionais de session state; nao incluir builds, debug files, bancos locais, imports privados ou mudancas de usuario nao relacionadas.
- Validacao executada: `quick_validate.py C:\Users\fabio\.codex\skills\obsidian-project-memory` retornou `Skill is valid!`.
- Aplicacao imediata: preparar commit do bugfix do parser PDF Latam Pass com `backend/app/services/itau_pdf_parser.py`, `backend/test_itau_pdf_parser.py` e `SESSION_STATE.md`.
## Atualizacao de sessao - 2026-05-02T02:26:44-03:00
- Rebuild do executavel desktop concluido com sucesso via `build_desktop.bat` apos o bugfix do parser PDF Latam Pass.
- Novo executavel gerado em `C:\Users\fabio\Projects\app-financeiro-fabio\backend\dist\ControleFinanceiro.exe`.
- Timestamp do novo `.exe`: `2026-05-02 02:26:35`; tamanho: `46009147` bytes.
- Observacao: o `.exe` na raiz do repo (`C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`) continua antigo, de `2026-05-02 01:48:34`; testar o executavel novo em `backend\dist`.
- Repo continua `develop...origin/develop [ahead 1]`; artefatos locais/build/debug permanecem nao rastreados e fora do commit.
## Atualizacao de sessao - 2026-05-02T02:31:33-03:00
- Corrigido fluxo de distribuicao do executavel: `build_desktop.bat` agora copia automaticamente `backend\dist\ControleFinanceiro.exe` para `ControleFinanceiro.exe` na raiz do projeto.
- Motivo: no modo PyInstaller, o banco SQLite fica relativo a pasta do `.exe`; o executavel da raiz usa `C:\Users\fabio\Projects\app-financeiro-fabio\data\finance.db`, que contem as categorias/regras ajustadas pelo usuario.
- Validacao executada: `build_desktop.bat` concluiu com sucesso.
- Resultado validado: `backend\dist\ControleFinanceiro.exe` e `ControleFinanceiro.exe` ficaram com timestamp `2026-05-02 02:31:16` e tamanho `46009438` bytes.
- Proximo uso/teste: executar `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`.
## Atualizacao de sessao - 2026-05-02T02:42:00-03:00
- Implementado aprendizado de categoria: categorizacao manual agora chama endpoint dedicado, cria regra pela descricao normalizada e aplica em transacoes iguais ainda nao revisadas.
- Dashboard ajustado para ciclo financeiro 27-26: exemplo, mes `2026-05` considera `2026-04-27` a `2026-05-26`, entao salario recebido em 27/04 entra no ciclo de maio.
- Frontend do dashboard recebeu botoes de mes anterior/proximo e mostra o intervalo real do ciclo financeiro.
- Build desktop executado. A primeira tentativa falhou ao copiar para a raiz porque o `ControleFinanceiro.exe` estava aberto; depois o executavel foi fechado e copiado manualmente.
- Resultado atual: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe` e `backend\dist\ControleFinanceiro.exe` tem timestamp `2026-05-02 02:40:35` e tamanho `46013108` bytes.
- Validacoes: `python -m unittest test_dashboard_service.py test_transaction_learning.py test_itau_pdf_parser.py`, `python -m py_compile ...`, `npm.cmd run build`, `build_desktop.bat` ate a etapa de empacotamento; copia final confirmada apos fechar o app.
- Proximo passo: testar no executavel da raiz a categorizacao manual e o dashboard do ciclo de maio.
## Atualizacao de sessao - 2026-05-02T02:53:00-03:00
- Como o bug do PDF continuou no uso real, adicionada importacao de fatura Itau por Excel (`.xls`/`.xlsx`) como caminho principal para cartao.
- Novo parser `backend/app/services/itau_excel_parser.py` le o `.xls` binario do Itau sem dependencia nova, extrai secoes por final de cartao, datas, descricoes, parcelas, compras e creditos/estornos.
- Backend ganhou endpoint `POST /imports/credit-card-excel` e reaproveita o mesmo fluxo de cartao para deduplicacao, criacao de cartao, categorizacao e pendencias.
- Frontend da tela de importacao aceita `.xls`/`.xlsx` e envia Excel para o endpoint novo, mantendo PDF e OFX.
- Validacao local com `C:\Users\fabio\Downloads\Fatura-Excel.xls`: parser encontrou 174 lancamentos, incluindo finais 1609, 8069, 5007, 5761, 4346 e uma taxa sem cartao.
- Validacoes: `python -m unittest test_itau_excel_parser.py test_itau_pdf_parser.py test_transaction_learning.py test_dashboard_service.py`, `python -m py_compile app\routers\imports.py app\services\itau_excel_parser.py`, `npm.cmd run build`, `build_desktop.bat`.
- Novo executavel para teste: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 02:52:31`, tamanho `46022907` bytes. Usar esse da raiz porque fica junto de `data\finance.db`.
- Proximo passo: testar no app da raiz importando o arquivo Excel da fatura em vez do PDF.

## Checkpoint de contexto - 2026-05-02T03:00:00-03:00
- Nova feature colocada no backlog: conectar categorias a metas automaticamente.
- Exemplo desejado: se existir uma meta `Reserva de emergencia` e uma categoria `Reserva`, toda transacao categorizada como `Reserva` deve somar automaticamente no progresso da meta, sem edicao manual na aba Metas.
- Escopo provavel para proxima sessao: modelar vinculo `Category -> Goal` ou regra por categoria, ajustar backend de metas para calcular progresso a partir de transacoes vinculadas, e ajustar frontend para permitir selecionar/editar esse vinculo na categoria ou na meta.
- Como a sessao esta perto do limite de contexto, parar antes de implementar. Proxima sessao deve ler Obsidian, revisar modelos `Category`, `Goal`, `Transaction`, router/tela de metas e decidir o desenho minimo.

## Atualizacao de sessao - 2026-05-02T03:00:00-03:00
- Corrigido erro `Method Not Allowed` ao importar Excel no executavel: havia processos antigos usando a porta fixa `8000`, entao a janela nova podia conversar com um backend velho sem a rota `/imports/credit-card-excel`.
- `backend/main_desktop.py` agora escolhe uma porta livre a cada abertura e passa essa porta para o Uvicorn e para a janela PyWebView, evitando conflito com sessoes antigas.
- Confirmado no codigo atual que as rotas de importacao existem: `GET /api/imports/`, `POST /api/imports/bank-statement-ofx`, `POST /api/imports/credit-card-pdf`, `POST /api/imports/credit-card-excel`.
- Processos antigos do `ControleFinanceiro.exe`/backend foram encerrados; porta `8000` deixou de ter listener ativo.
- Validacoes: `python -m py_compile main_desktop.py app\routers\imports.py app\services\itau_excel_parser.py`, `python -m unittest test_itau_excel_parser.py`, `build_desktop.bat`.
- Novo executavel para teste: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 02:59:28`, tamanho `46022243` bytes.

## Atualizacao de sessao - 2026-05-02T03:13:08-03:00
- Rebuild do executavel desktop concluido com sucesso via `build_desktop.bat` apos implementacao da regra contabil (exclude_from_totals) iniciada na sessao anterior.
- Novo executavel gerado e validado em `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`.
- Proximo passo sugerido pelo Backlog: iniciar funcionalidade de **Metas Inteligentes** (conectar categorias diretamente a metas para calculo automatico de progresso).


## Checkpoint de fim de sessao - 2026-05-02T03:28:18-03:00
- Sessao encerrada a pedido do usuario devido ao horario e pressao de tokens.
- Aprovada a decisao de extrair apenas o PRIMEIRO NOME do titular do cartao na leitura de Excel Ita�.
- Tres novos itens foram detalhados e adicionados ao arquivo 05_PENDENCIAS.md:
  1. Extracao de titular (primeiro nome) do Excel Ita� para popular 'Gastos por Pessoa' no Dashboard.
  2. Botao de exclusao logica (soft-delete) de Categorias na aba de Configuracoes.
  3. Botao para ordenacao de valor decrescente (maior para o menor) na aba de Transacoes.
- Proxima sessao deve iniciar lendo este checkpoint e o arquivo de Pendencias, e implementar essas melhorias antes da funcionalidade de 'Metas Inteligentes'.


## Atualizacao de sessao - 2026-05-02T03:31:47-03:00
- Adicionados itens ao backlog em 05_PENDENCIAS.md conforme pedido: tooltips no grafico de pizza e funcionalidade de multiplas metas.
- Meta automatica atrelada a categorias ja constava no backlog (Metas Inteligentes).
- Efetuando commit unificado das mudancas de regra contabil (exclude_from_totals) geradas pelo Codex e da atualizacao de session state.


## Handoff / Final de Sessao (Antigravity -> Codex / Futuro) - 2026-05-02T03:33:39-03:00
- Sessao finalizada garantindo o sincronismo total entre reposit�rio e Obsidian.
- Ideia adicionada ao backlog: Aba de Insights (Inteligencia Financeira para corte de gastos e simulacao de metas).
- **Instrucao para proxima IA (Antigravity ou Codex):**
  Ao iniciar a sessao amanha, LEIA O ARQUIVO  5_PENDENCIAS.md para ver as prioridades (Titular do Cartao Excel, Soft-Delete Categorias, Ordenacao Transacoes, Multiplas Metas, Insights). Nao ha c�digo quebrado. O executavel na raiz (ControleFinanceiro.exe) esta estavel com as regras contabeis aplicadas.


## Atualizacao de sessao - 2026-05-02T10:08:49-03:00
- Implementado pacote de usabilidade pos-MVP: titular do cartao no Excel Itau, exclusao logica de categorias e ordenacao por maior valor na aba Transacoes.
- Parser Excel agora propaga `cardholder_first_name` por secao de cartao; importacao cria/reusa `Person` pelo primeiro nome normalizado, vincula `Card.person_id` e grava `Transaction.person_id`.
- Categorias ganharam `DELETE /api/categories/{id}` com soft-delete (`is_active = False`); listagem padrao oculta inativas sem apagar historico.
- Frontend: Configuracoes ganhou botao de lixeira por categoria; Transacoes ganhou seletor de ordenacao `Mais recentes` / `Maior valor`.
- Validacoes: `python -m unittest test_dashboard_service.py test_transaction_learning.py test_itau_pdf_parser.py test_accounting_rules.py test_itau_excel_parser.py test_usability_backlog.py`, `python -m py_compile app\routers\imports.py app\routers\categories.py app\services\itau_excel_parser.py`, `npm.cmd run build`, `build_desktop.bat`.
- Novo executavel validado: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 10:08:12`, tamanho `46028185` bytes.
- Artefatos locais nao rastreados de build/debug continuam fora do commit por intencao.
- Proximo passo sugerido: testar importando a fatura Excel real e confirmar se o Dashboard `Gastos por Pessoa` separa Fabio/Fernanda corretamente; depois seguir para tooltips do grafico de pizza ou Metas Inteligentes.

## Atualizacao de sessao - 2026-05-02T10:20:00-03:00
- Decisao aplicada: o estado de sessao passa a existir somente no Obsidian (`01_SESSION_STATE.md`).
- Removido o espelho `SESSION_STATE.md` do repositorio e adicionado `SESSION_STATE.md` ao `.gitignore` para evitar recriacao acidental.
- Atualizados `00_INDEX.md`, `03_PLANO_DE_FASES.md` e `06_ARQUITETURA.md` para remover a orientacao antiga de espelho no repo.
- Proximo passo: futuras sessoes devem ler/escrever apenas o Obsidian para memoria de projeto; commits do repo nao devem incluir session state.

## Atualizacao de sessao - 2026-05-02T10:27:00-03:00
- Corrigida a aba Analise de Cartao: a busca de transacoes agora usa o ciclo financeiro 27-26 via `GET /transactions?cycle=true`, alinhando maio com o periodo `2026-04-27` a `2026-05-26`.
- Corrigida a reimportacao de Excel Itau: quando a transacao ja existe por hash, o importador agora usa o titular do Excel para preencher `Card.person_id` e `Transaction.person_id` em registros antigos que estavam sem pessoa, sem duplicar lancamentos.
- O grafico `Gasto por Pessoa no Cartao` agora usa valores absolutos para barras de gasto.
- Validacoes: `python -m unittest test_dashboard_service.py test_transaction_learning.py test_itau_pdf_parser.py test_accounting_rules.py test_itau_excel_parser.py test_usability_backlog.py`, `python -m py_compile app\crud.py app\routers\imports.py app\routers\transactions.py app\services\dashboard_service.py`, `npm.cmd run build`, `build_desktop.bat`.
- Novo executavel: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 10:26:31`, tamanho `46028264` bytes.
- Observacao operacional: para preencher Fabio/Fernanda nos 174 lancamentos antigos do banco local, reimportar a fatura Excel uma vez no app novo; a importacao deve pular duplicados e apenas completar os vinculos de pessoa/cartao.

## Atualizacao de sessao - 2026-05-02T10:30:39-03:00
- Melhorada a exibicao de cartoes: API `/cards/` agora retorna `person_name` junto de `person_id`.
- Tela Configuracoes > Cartoes mostra uma segunda linha `Cartao de Nome` ou `Pessoa nao identificada` para cada final de cartao.
- Seletor da aba Analise de Cartao tambem mostra `Cartao final XXXX - Nome` quando o titular estiver vinculado.
- Validacoes: `python -m unittest test_usability_backlog.py`, `python -m py_compile app\routers\cards.py app\schemas.py`, `npm.cmd run build`, `build_desktop.bat`.
- Novo executavel: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 10:30:19`, tamanho `46029295` bytes.
- Observacao: cartoes antigos continuam mostrando `Pessoa nao identificada` ate reimportar o Excel no app novo, que preenche os vinculos de titular nos duplicados.

## Atualizacao de sessao - 2026-05-02T10:35:45-03:00
- Melhorada a usabilidade do Dashboard em uma fatia pequena.
- Grafico `Gastos por Categoria`: categorias ordenadas por maior gasto, tooltip customizado com categoria/valor/percentual, legenda com percentual e labels nas fatias maiores.
- Grafico `Gasto por Pessoa`: pessoas ordenadas por maior gasto.
- Lista `Limites por Categoria`: ordenada com categorias estouradas primeiro, depois maior percentual consumido.
- Backlog `05_PENDENCIAS.md` atualizado: item Grafico Pizza marcado como concluido e nova secao `Dashboard UX` adicionada com melhorias futuras fatiadas.
- Validacoes: `npm.cmd run build`; `build_desktop.bat` gerou `backend\dist\ControleFinanceiro.exe`, mas a copia inicial para a raiz falhou porque havia duas instancias abertas do app. Processos `ControleFinanceiro.exe` encerrados e copia manual para a raiz concluida.
- Novo executavel: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 10:35:01`, tamanho `46030062` bytes.

## Atualizacao de sessao - 2026-05-02T10:40:00-03:00
- Usuario perguntou se precisa abrir dois executaveis e relatou demora para abrir.
- Esclarecimento operacional: usar apenas `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`; `backend\dist\ControleFinanceiro.exe` e artefato de build.
- Backlog atualizado com secao `Desktop e Performance`: otimizar startup do executavel e evitar confusao entre executaveis.

## Atualizacao de sessao - 2026-05-02T10:42:35-03:00
- Adicionada busca local na tela `Regras de Automacao`, filtrando por palavra-chave, categoria, pessoa, origem e prioridade.
- Corrigido banco local para exibicao de titulares dos cartoes em Configuracoes: reprocessado `C:\Users\fabio\Downloads\Fatura-Excel.xls` com o importador novo.
- Resultado do backfill: 174 lancamentos lidos, 0 importados, 174 duplicados pulados; cartoes 1609/8069/5007/5761 vinculados a Fabio e 4346 vinculado a Fernanda; 172 transacoes de cartao agora tem pessoa vinculada.
- Validacoes: `npm.cmd run build`, `build_desktop.bat`.
- Novo executavel: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 10:42:20`, tamanho `46029385` bytes.

## Atualizacao de sessao - 2026-05-02T10:47:00-03:00
- Usuario sugeriu card `Sistema` em Configuracoes com `Pasta de Importacao` e `Zona de Perigo`.
- Ideia registrada no backlog como `Sistema e Importacao`, separada em fatias: configurar pasta padrao, importacao assistida lendo/sugerindo arquivos dessa pasta, e reset local com confirmacao forte.
- Observacao: isso pode melhorar o fluxo de importacao futuramente, mas envolve backend/settings + UI + leitura segura de diretorio, entao deve ser tratado como tarefa propria.

## Atualizacao de sessao - 2026-05-02T10:47:39-03:00
- Implementada fatia pequena `Alertas de Limite` no Dashboard.
- Lista `Limites por Categoria` agora mostra `Estourou R$ X` para categorias acima do limite e `Faltam R$ Y` para categorias ainda dentro do limite.
- Backlog `05_PENDENCIAS.md` atualizado marcando `Alertas de Limite` como concluido.
- Validacoes: `npm.cmd run build`; `build_desktop.bat` gerou `backend\dist\ControleFinanceiro.exe`, a copia inicial para a raiz falhou por lock temporario, e a copia manual para `ControleFinanceiro.exe` foi concluida.
- Novo executavel: `C:\Users\fabio\Projects\app-financeiro-fabio\ControleFinanceiro.exe`, timestamp `2026-05-02 10:47:08`, tamanho `46030499` bytes.

## Atualizacao de sessao - 2026-05-02T10:50:00-03:00
- Usuario reportou que a aba `Analise de Cartao` ainda nao mostra o grafico `Gasto por Pessoa no Cartao`, mesmo com total de fatura no ciclo.
- Registrado no backlog como `Backlog Pos-MVP - Cartoes`: corrigir grafico por pessoa e adicionar diagnostico visual quando houver total mas dados por pessoa estiverem ausentes.
- Observacao para proxima fatia: investigar `CardPage.tsx`, endpoint `/transactions?source=credit_card&month=YYYY-MM&cycle=true`, presenca de `person_name`, valores negativos/positivos no BarChart e renderizacao/altura do grafico.

## Atualizacao de sessao - 2026-05-02T10:52:00-03:00
- Usuario pediu para avaliar criptografia e varredura de brechas de seguranca.
- Backlog atualizado com secao `Seguranca`: avaliacao de criptografia local, plano de senha/master key, varredura de brechas e hardening do desktop.
- Observacao: tratar como trilha propria e fatiada, pois envolve risco de perda de acesso aos dados se criptografia/senha forem mal desenhadas.

## Memoria - regra de compactacao
- Manter Obsidian como indice rapido do projeto: registrar decisoes, pendencias e handoffs curtos; evitar logs verbosos de comandos ou detalhes que ja estao no git.

## Curadoria de memoria - 2026-05-02
- Reorganizado  0_INDEX.md como mapa rapido;  3_PLANO_DE_FASES.md e  4_LOG_DE_EXECUCAO.md marcados como historicos;  2,  6,  8,  9 e context_manifest.json atualizados para refletir o estado atual sem logs verbosos.


## Handoff curto - 2026-05-02T10:58:23-03:00
- Corrigido resumo da aba Analise de Cartao: gasto por pessoa virou lista de barras robusta com valor, percentual e aviso de transacoes sem pessoa. Build desktop validado; exe real timestamp 2026-05-02 10:58:06.


## Nota curta - Metas/Cofrinho
- Regra de produto registrada: aportes em metas/cofrinhos devem existir como transacoes no extrato e alimentar a meta automaticamente via categoria vinculada.


## Checkpoint compacto - 2026-05-02T11:02:19-03:00
- Pausa por rate limit baixo. Ultimo commit: `68020cf fix(cards): render spending by person summary`.
- Repo sem mudancas rastreadas pendentes; apenas artefatos locais nao rastreados permanecem fora do git: `ControleFinanceiro.exe`, `backend/ControleFinanceiro.spec`, `backend/data/`, `backend/pdf_debug.txt`, `backend/test.py`, `backend/test_parser.py`.
- Obsidian reorganizado: usar `00_INDEX.md` como mapa, `05_PENDENCIAS.md` como backlog, `01_SESSION_STATE.md` apenas para handoff curto.
- Proximos itens bons: Configuracao de Pasta de Importacao; bug/diagnostico restante da aba Cartao se reaparecer; Desktop/Performance; Metas/Cofrinho com transacoes vinculadas.

## Atualizacao de sessao - 2026-05-02T11:13:00-03:00
- Trocado PyInstaller --onefile por --onedir. Pasta ControleFinanceiro contendo os modulos extraidos roda muito mais rapido.
- Adicionada tela Splash Screen em HTML injetado direto via webview, roda imediatamente na abertura do .exe enquanto uvicorn liga via thread background.
- Modulo requests adicionado ao requirements do app/pyinstaller.
- Melhorias UI: Atalhos clicaveis no Dashboard (Entradas/Saidas/Pendentes vao para extrato filtrado), Top 3 Gastos (ranking rapido) incluso no Dashboard, Estados vazios com acoes diretas (botoes de importacao/categorizacao) nas telas Dashboard e Cartao.
- Novo build empacotado na raiz ControleFinanceiro\ControleFinanceiro.exe.
