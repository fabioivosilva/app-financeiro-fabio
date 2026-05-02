# 08_PARSERS - Parser Engine

## Estado Atual

O parser engine antigo foi removido junto com o reset do repo em 2026-05-02.
Este arquivo guarda o desenho-alvo para recriar o motor sem ficar preso apenas ao Itau.

## Objetivo

Criar um motor de importacao multi-banco, com parsers pequenos, testaveis e plugaveis.

O fluxo desejado:

1. upload de arquivo;
2. deteccao de formato/banco;
3. parser especifico transforma em transacoes canonicas;
4. normalizacao;
5. deduplicacao;
6. categorizacao;
7. persistencia.

## Contrato Alvo

Cada parser deve expor algo equivalente a:

```text
can_parse(file) -> score/motivo
parse(file) -> ImportResult
```

`ImportResult` deve conter:

- instituicao;
- tipo de arquivo;
- conta/cartao quando identificado;
- periodo quando identificado;
- transacoes canonicas;
- avisos de parse;
- erros recuperaveis.

## Parsers Prioritarios

- OFX generico para extrato bancario.
- Itau Excel para fatura de cartao.
- Itau PDF para fatura de cartao, como suporte.
- Preparacao para Nubank, Inter, Santander, Bradesco, BB e C6.

## Regras Importantes

- Nao amarrar o dominio ao Itau.
- Deduplicar por identificador externo quando existir.
- Quando nao existir ID externo, usar hash canonico.
- Em cartao, incluir cartao/pessoa no hash quando disponivel.
- Guardar avisos para o usuario revisar importacoes imperfeitas.

## Historico Util

Antes do reset, existiam parsers funcionais para OFX, PDF Itau e Excel Itau.
O Excel do Itau era o caminho mais confiavel para faturas de cartao.

Arquivo real citado anteriormente para testes manuais:

```text
C:\Users\fabio\Downloads\Fatura-Excel.xls
```
