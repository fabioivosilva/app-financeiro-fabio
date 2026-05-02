# 05_PENDENCIAS

## Ativas

### FASE 0
- [ ] Concluir autenticaÃ§Ã£o GitHub CLI
- [ ] Criar repositÃ³rio privado
- [ ] Clonar e configurar branches
- [ ] Criar estrutura do repo
- [ ] Criar docs/UX_REFERENCE.md
- [ ] Commit inicial

## ConcluÃ­das
- [x] Instalar GitHub CLI
- [x] Extrair ZIP do UX
- [x] Analisar telas do UX
- [x] Criar arquivos Obsidian

---

*Ãšltima atualizaÃ§Ã£o: 2026-05-01*

### Backlog Pos-MVP - Metas inteligentes
- [x] Conectar categorias a metas automaticamente. Exemplo: categoria `Reserva` alimenta a meta `Reserva de emergencia` somando transacoes categorizadas, sem atualizar progresso manualmente.
- [x] Definir se o vinculo fica na categoria, na meta, ou em tabela/regra separada.
- [x] Ajustar backend de metas para calcular progresso por transacoes vinculadas e ajustar frontend para selecionar o vinculo.
- [x] **Categoria de Metas / Cofrinho:** Criar ou padronizar uma categoria de metas/cofrinho. Quando uma transacao do extrato for categorizada nessa categoria vinculada a uma meta, ela deve aparecer normalmente no extrato/transacoes e alimentar automaticamente o progresso da meta.
- [/] **Fluxo de Guarda em Meta:** Ao registrar uma guarda/aporte em uma meta, gerar ou vincular uma transação correspondente no extrato, para manter rastreabilidade entre dinheiro que saiu da conta e progresso do cofrinho.
- [ ] **Preenchimento Automatico pela Categoria:** Ao selecionar a categoria de metas em uma transacao, carregar/aplicar automaticamente a meta vinculada quando houver correspondencia clara.

### Backlog Pos-MVP - Melhorias de Usabilidade
- [x] **Titular do Cartao no Excel:** Extrair o primeiro nome do titular (antes de '- final') no itau_excel_parser.py, cadastrar/vincular em Person, e atualizar person_id no Card e Transaction importado. O Dashboard de Gastos por Pessoa passara a funcionar.
- [x] **Exclusao de Categorias:** Adicionar botao de lixeira na tela de Configurar Categorias que faz soft-delete (is_active = False) na API (DELETE /api/categories/{id}).
- [x] **Ordenacao de Transacoes:** Adicionar botao na aba de Transacoes para ordenar do maior valor para o menor.


- [x] **Grafico Pizza:** Adicionar labels/tooltips no grafico de pizza da aba de Resumo para mostrar visualmente a qual categoria cada fatia corresponde.
- [x] **Multiplas Metas:** Alterar a interface e backend de Metas para permitir criar, editar e excluir varias metas diferentes (atualmente suporta apenas editar um valor unico).
- [x] **MonthSelector:** Componentizar e adicionar controle de passar mês com setas nas páginas de Transações, Cartão e Dashboard.




### Backlog Pos-MVP - Cartoes
- [x] **Gasto por Pessoa no Cartao:** Corrigir a aba `Analise de Cartao` para exibir corretamente o grafico `Gasto por Pessoa no Cartao` quando ha total de fatura/transacoes no ciclo. Investigar se o problema vem de `person_id` ausente em algumas transacoes, valores negativos no BarChart, filtro por ciclo/cartao, ou altura/renderizacao do grafico.
- [x] **Diagnostico Visual da Aba Cartao:** Quando houver total de fatura mas o grafico por pessoa estiver vazio, mostrar aviso explicando quantas transacoes estao sem pessoa e sugerir reimportar Excel ou revisar titulares dos cartoes.

### Backlog Pos-MVP - Dashboard UX
- [x] **Alertas de Limite:** Na lista `Limites por Categoria`, mostrar texto de acao como `Estourou R$ X` ou `Faltam R$ Y`, mantendo os estouros no topo.
- [x] **Atalhos do Dashboard:** Tornar cards como `Pendentes de Revisao`, `Total Saidas` e categorias/limites clicaveis para abrir Transacoes ja filtradas.
- [x] **Ranking Rapido:** Adicionar um mini bloco `Top gastos do ciclo` com as 3 maiores categorias e/ou maiores transacoes.
- [x] **Comparativo por Ciclo:** Mostrar variacao contra o ciclo anterior em entradas, saidas, saldo e principais categorias.
- [x] **Estados Vazios Guiados:** Melhorar mensagens quando nao houver dados em pessoa/categoria/limites, apontando a acao esperada: importar fatura, categorizar pendentes ou configurar limites.
- [ ] **Previsão de Gastos Futuros (Provisão):** Mostrar no Dashboard ou numa nova aba quanto já está comprometido para os próximos meses baseado em parcelas existentes.



### Backlog Pos-MVP - Seguranca
- [ ] **Avaliacao de Criptografia Local:** Mapear opcoes para proteger o banco `data\finance.db` e/ou backups locais. Avaliar SQLCipher, criptografia de arquivo, chave derivada de senha, armazenamento seguro de chave no Windows e impacto no app desktop.
- [ ] **Plano de Senha/Master Key:** Se criptografia for adotada, definir UX de senha mestre, recuperacao/perda de senha, troca de senha e comportamento ao abrir o app.
- [ ] **Varredura de Brechas de Seguranca:** Fazer auditoria tecnica do app local: dependencias Python/Node, endpoints FastAPI, CORS, exposicao em localhost, upload/importacao de arquivos, path traversal, dados sensiveis em logs/artefatos e permissao do banco local.
- [ ] **Hardening do Desktop:** Revisar empacotamento PyInstaller/PyWebView, porta local aleatoria, acesso ao backend apenas local, cabecalhos/API e remocao de arquivos debug/test soltos antes de distribuicao.

### Backlog Pos-MVP - Desktop e Performance
- [x] **Otimizar abertura do aplicativo:** investigar demora no startup do `ControleFinanceiro.exe` da raiz. Possiveis causas: PyInstaller onefile extraindo arquivos, inicializacao do FastAPI/Uvicorn, PyWebView e frontend bundle grande. Avaliar build `onedir`, tela de carregamento, reducao do bundle e mensagens claras para usar apenas o executavel da raiz.
- [ ] **Evitar confusao entre executaveis:** melhorar documentacao ou script de build para deixar claro que o usuario deve abrir somente `ControleFinanceiro.exe` na raiz; `backend\dist\ControleFinanceiro.exe` e apenas artefato intermediario.


### Backlog Pos-MVP - Sistema e Importacao
- [x] **Configuracao de Pasta de Importacao:** Adicionar card `Sistema` em Configuracoes com campo `Pasta de Importacao` persistido em `settings`, para o usuario informar onde salva faturas/extratos (ex: `C:\Financeiro\Importar`).
- [ ] **Importacao Assistida pela Pasta Padrao:** Usar a pasta configurada para facilitar o processo de importacao: listar/sugerir arquivos `.xls`, `.xlsx`, `.pdf` e `.ofx` encontrados, destacar arquivos ainda nao importados e permitir importar com menos cliques.
- [x] **Zona de Perigo / Reset Local:** Planejar botao `Resetar Dados Locais` com confirmacao forte, backup recomendado e escopo bem claro antes de apagar banco local.

### Backlog Pos-MVP - Inteligencia e Insights
- [ ] **Menu de Insights/IA:** Criar uma aba dedicada para analise financeira avancada. Funcionalidades esperadas:
  - Identificacao de onde os gastos estao altos demais.
  - Sugestoes de onde e possivel cortar gastos.
  - Simulacao de metas (ex: 'Se eu economizar R em ifood, chego na meta Y meses mais rapido?').
  - *Nota de estudo futuro:* Pode envolver cruzar a tabela de categorias com o historico de transacoes e as multiplas metas para gerar esse relatorio inteligente.










