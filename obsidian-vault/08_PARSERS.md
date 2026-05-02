# 08_PARSERS - Importacao

Status atual: funcional, com OFX, PDF Itau e Excel Itau. Excel e o caminho principal para faturas de cartao quando o PDF falhar.

## OFX

- Endpoint: `POST /api/imports/bank-statement-ofx`
- Parser: `backend/app/services/ofx_parser.py`
- Deduplicacao: `external_id`/FITID quando existir; fallback por hash.
- Categoriza automaticamente por regras e deixa pendente quando nao casar.

## Fatura Itau PDF

- Endpoint: `POST /api/imports/credit-card-pdf`
- Parser: `backend/app/services/itau_pdf_parser.py`
- Mantido como suporte, mas o layout do Itau varia bastante.

## Fatura Itau Excel

- Endpoint: `POST /api/imports/credit-card-excel`
- Parser: `backend/app/services/itau_excel_parser.py`
- Suporta `.xls` legado BIFF e fallback `.xlsx` sem dependencia nova.
- Extrai final do cartao, titular/primeiro nome, parcelas, compras e creditos/estornos.
- Reimportacao de duplicados pode completar `Card.person_id` e `Transaction.person_id` sem duplicar transacoes.

## Pontos de Atencao

- Arquivo real usado recentemente: `C:\Users\fabio\Downloads\Fatura-Excel.xls`.
- Taxas/servicos podem vir sem final de cartao e sem pessoa.
- Para debug, preferir testes em `backend/test_itau_excel_parser.py` e `backend/test_usability_backlog.py`.
