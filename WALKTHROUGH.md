# Relatório de Estabilização e Feature Toggle - Importações

Este documento resume as alterações realizadas para resolver o **BUG.7** e implementar a lógica de **Feature Toggle** nas importações.

## 🚀 Novas Funcionalidades

### Sistema de Feature Toggle (Amarrado)
Implementamos uma "amarra" entre o que o usuário ativa nas configurações e o que o motor de importação executa.
- **Backend (`base.py` & `registry.py`)**: Cada parser agora possui um `bank_id`. O `ParserRegistry` filtra os parsers disponíveis com base em uma lista de `active_bank_ids` enviada pelo frontend.
- **Frontend (`Importar.tsx`)**: Agora envia a lista de bancos ativos em cada requisição de upload via campo `active_bank_ids`.
- **Identificação**: O parser de OFX foi tunado para detectar automaticamente o Itaú (via código 341 ou headers) e marcar o banco corretamente.

## 🛠️ Correções de Bugs (BUG.7)

### 1. Performance de Deduplicação
- **Arquivo**: `backend/app/parsers/dedup.py`
- **Problema**: O sistema fazia uma consulta ao banco por cada transação (N+1), causando timeouts em arquivos grandes no Windows.
- **Solução**: Agora o sistema faz uma única consulta `IN` para verificar todas as transações do lote de uma vez.

### 2. Estabilidade do Banco de Dados (Erro 500)
- **Arquivo**: `backend/app/models/transaction.py`
- **Problema**: O uso de `SAEnum` com valores acentuados ("Débito", "Crédito") causava crashes de encoding e validação no SQLAlchemy/SQLite, resultando em "Internal Server Error".
- **Solução**: Alterado o tipo das colunas `origin` e `status` para `String`, garantindo compatibilidade total com qualquer encoding de arquivo importado.

### 3. Conectividade (Failed to Fetch)
- **Arquivos**: `frontend/src/api/client.ts` e `rodar.bat`
- **Problema**: Conflito entre `localhost` (frontend) e `127.0.0.1` (backend) em alguns navegadores.
- **Solução**: O frontend agora detecta e usa o mesmo hostname da URL atual. O backend (uvicorn) foi configurado para ouvir em `0.0.0.0`.

## 📂 Estado do Banco de Dados
- O arquivo de banco de dados foi movido/identificado em `data/finance.db`.
- Foi realizado um `seed` para recriar as tabelas com o novo esquema de `String` (resolvendo os erros 500).

## 📌 Próximos Passos Sugeridos
1. Validar a importação de arquivos OFX reais com o novo sistema de `bank_hint`.
2. Seguir para o **BUG.2** (Conformidade Visual) listado no `NORTE.md`.
