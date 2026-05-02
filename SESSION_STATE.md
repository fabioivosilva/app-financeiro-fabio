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

## Atualização de sessão - 2026-05-02T02:23:53-03:00
- Corrigido bug no parser PDF Itaú/Latam Pass que deslocava o final do cartão entre seções da fatura.
- Ajustado parser para reconhecer cabeçalhos `final XXXX`, ignorar totais antes de trocar a seção de cartão e preservar créditos/estornos `- R$` como redução da fatura.
- Adicionado teste unitário `backend/test_itau_pdf_parser.py` cobrindo seções Latam Pass, parcelas e crédito.
- Validações: `python -m unittest test_itau_pdf_parser.py`, `python test_parser.py` e `python -m py_compile app/services/itau_pdf_parser.py test_itau_pdf_parser.py`.
- Próximo passo: rebuildar o `ControleFinanceiro.exe` para testar o fix dentro do executável.

## Atualização de sessão - 2026-05-02T02:30:00-03:00
- Ajustado fluxo de build desktop para copiar automaticamente `backend\dist\ControleFinanceiro.exe` para `ControleFinanceiro.exe` na raiz do projeto.
- Regra operacional: usar/testar o `.exe` da raiz, pois ele fica junto de `data\finance.db` e preserva as categorias/regras ajustadas pelo usuário.
- O artefato em `backend\dist` continua sendo gerado pelo PyInstaller, mas não deve ser o executável principal de uso diário quando o banco real está em `data\finance.db`.
- Validação executada: `build_desktop.bat` concluiu com sucesso e deixou `backend\dist\ControleFinanceiro.exe` e `ControleFinanceiro.exe` com timestamp `2026-05-02 02:31:16` e tamanho `46009438` bytes.

## Atualização de sessão - 2026-05-02T02:42:00-03:00
- Implementado aprendizado de categoria: ao categorizar manualmente uma transação pendente, o sistema cria uma regra pela descrição normalizada e aplica a categoria em transações iguais ainda não revisadas.
- Dashboard ajustado para ciclo financeiro 27-26: o mês de maio considera 27/04 a 26/05, cobrindo salário recebido no mês anterior.
- Frontend do dashboard ganhou botões de mês anterior/próximo e exibe o intervalo real do ciclo financeiro.
- Build desktop validado e copiado para a raiz: `ControleFinanceiro.exe` e `backend\dist\ControleFinanceiro.exe` ficaram com timestamp `2026-05-02 02:40:35` e tamanho `46013108` bytes.
- Validações: `python -m unittest test_dashboard_service.py test_transaction_learning.py test_itau_pdf_parser.py`, `python -m py_compile ...`, `npm.cmd run build`, `build_desktop.bat`.
