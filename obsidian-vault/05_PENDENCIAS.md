# 05_PENDENCIAS - Backlog de Reconstrucao

## Legenda de Tamanho

| Tag | Tamanho | O que significa |
|---|---|---|
| `[P]` | Pequeno | Mudanca isolada, baixo risco |
| `[M]` | Medio | Um modulo/tela/endpoint com validacao |
| `[G]` | Grande | Fundacao ou feature transversal |

## Contexto

Em 2026-05-02 o repo foi zerado. So o `obsidian-vault/` permaneceu.

Objetivo: reconstruir o App Financeiro Fabio do zero, sem reaproveitar a carcaça antiga.

## Regras Fixas do Produto

- App desktop local, sem SaaS e sem login.
- Banco SQLite local.
- Ciclo financeiro: dia 27 ao dia 26.
- UI: dark mode, glassmorphism, primario `#820AD1`, fonte Inter, Material Symbols.
- Importacao deve suportar multiplos bancos e formatos.
- Parsers devem nascer plugaveis, nao acoplados ao Itau.

---

## Trilha R - Reset e Scaffolding

- [ ] `[M]` **R0 - Scaffolding minimo do repo**
  - Criar `.gitignore`, `README.md`, `frontend/`, `backend/` e `build_desktop.bat`
  - Frontend: React + Vite + TypeScript
  - Backend: FastAPI + SQLite
  - Validar build basico do frontend e py_compile do backend

- [ ] `[M]` **R1 - Contratos de dominio minimo**
  - Definir modelos conceituais: Transaction, ImportBatch, Account, Institution, ParserRun
  - Escrever contratos JSON esperados entre backend e frontend
  - Documentar ciclo 27-26 no README/backend docs

- [ ] `[M]` **R2 - Shell visual novo**
  - Criar layout escuro/glass do zero
  - Sidebar com Dashboard, Importar, Transacoes, Provisoes, Metas, Configuracoes
  - Sem dados reais ainda, apenas navegação e estados vazios

---

## Trilha P - Motor de Parsers Plugavel

- [ ] `[G]` **P1 - Interface BaseParser multi-banco**
  - Criar `BaseParser` com `parse(file_bytes, context) -> ParseResult`
  - Criar `ParseResult`, `ParsedTransaction`, `ParserError`
  - Campos obrigatorios: data, descricao, valor, origem, banco, conta/cartao quando houver

- [ ] `[M]` **P2 - Registry de parsers**
  - Criar `ParserRegistry`
  - Chave por banco + formato: exemplo `itau:ofx`, `itau:credit_card_excel`
  - Endpoint/listagem para frontend saber parsers disponiveis

- [ ] `[M]` **P3 - Parser OFX generico**
  - Implementar parser OFX como primeiro parser multi-banco
  - Nao assumir Itau no contrato
  - Testes unitarios com OFX sintético

- [ ] `[M]` **P4 - Parser Itau Excel Cartao**
  - Recriar/adaptar parser de Excel Itau como plugin
  - Extrair final do cartao, titular quando existir, parcelas e creditos
  - Testes unitarios

- [ ] `[M]` **P5 - Parser Itau PDF Cartao**
  - Recriar/adaptar parser PDF Itau como plugin secundario
  - Manter como fallback ao Excel
  - Testes unitarios

- [ ] `[M]` **P6 - Preparar novos bancos**
  - Criar estrutura para Nubank, Banco do Brasil, Santander, Caixa ou outros
  - Definir checklist para adicionar banco novo sem alterar core

---

## Trilha B - Backend Novo

- [ ] `[M]` **B1 - SQLite e repositorios minimos**
  - Criar schema inicial: imports, transactions, institutions, accounts
  - Deduplicacao por hash normalizado e external_id quando existir
  - Script de init/migrations simples

- [ ] `[M]` **B2 - Endpoint de importacao unico**
  - `POST /api/imports`
  - Recebe arquivo + banco + formato/parser
  - Retorna capturadas, inseridas, duplicadas e erros

- [ ] `[M]` **B3 - Endpoints de leitura**
  - `GET /api/transactions`
  - `GET /api/dashboard`
  - Filtros por ciclo 27-26, banco, origem e pendentes

- [ ] `[M]` **B4 - Categorias e regras v1**
  - Categorias iniciais versionadas
  - Regras simples por palavra-chave
  - Transacao importada sem match fica pendente

---

## Trilha F - Frontend Novo

- [ ] `[G]` **F1 - Dashboard conectado**
  - KPIs do ciclo
  - Gastos por categoria
  - Fluxo futuro em barras agrupadas
  - Estados vazios quando banco estiver limpo

- [ ] `[G]` **F2 - Importar conectado**
  - Selecionar banco e formato
  - Upload unico
  - Resumo da extracao
  - Lista de importacoes recentes

- [ ] `[M]` **F3 - Transacoes conectado**
  - Lista/tabela do ciclo
  - Filtros
  - Pendentes em destaque

- [ ] `[M]` **F4 - Configuracoes base**
  - Bancos/parsers disponiveis
  - Categorias
  - Zona de perigo para reset local

---

## Trilha D - Desktop

- [ ] `[M]` **D1 - PyWebView/PyInstaller limpo**
  - Recriar entrada desktop
  - Porta local livre
  - Splash simples
  - Build onedir

- [ ] `[P]` **D2 - Build automatizado**
  - `build_desktop.bat` sem pausa
  - Copiar executavel para pasta final
  - Documentar qual `.exe` abrir

---

## Trilha S - Segurança

- [ ] `[P]` **S1 - Plano de criptografia local**
  - Avaliar SQLCipher ou alternativa
  - Definir impacto em backup/restauracao

- [ ] `[P]` **S2 - Hardening local**
  - CORS restrito no desktop
  - Porta aleatoria
  - Remover debug/build artifacts do Git
