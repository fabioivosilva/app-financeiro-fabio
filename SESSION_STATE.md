# SESSION_STATE

## Status geral
Projeto em inicialização. FASE 0 concluída: repositório criado, memória Obsidian configurada, UX analisado.

## Última fase concluída
- FASE 0: Planejamento, repo, Obsidian e análise do UX local.

## Fase atual
Preparando para FASE 1 — Backend base.

## Decisões técnicas tomadas
- SQLite como banco local
- FastAPI como backend
- React + Vite + TypeScript + TailwindCSS no frontend
- OFX como formato principal do extrato (ofxparse)
- PDF como formato da fatura Itaú (pdfplumber)
- UX do Stitch como referência visual obrigatória
- Repositório privado: app-financeiro-fabio
- Obsidian Vault como memória operacional
- Entrega final como .exe Windows
- pywebview + PyInstaller para desktop
- Não usar login, cloud, Open Finance, SaaS ou Upgrade Pro

## Arquivos criados/editados
- .gitignore
- README.md
- SESSION_STATE.md
- docs/UX_REFERENCE.md
- Estrutura de diretórios (backend/, frontend/, desktop/, data/, imports/, samples/)

## Endpoints implementados
Nenhum ainda.

## Telas implementadas
Nenhuma ainda.

## Parsers implementados
- OFX: não iniciado
- PDF Itaú: não iniciado

## Banco de dados
- Modelos: não criados
- Tabelas: não criadas
- Seeds: não implementados

## Desktop / EXE
- pywebview: não iniciado
- PyInstaller: não iniciado
- Executável: não gerado

## Pendências
- FASE 1: Criar FastAPI, models, database, seed, endpoints básicos

## Próximos passos recomendados
1. Iniciar FASE 1 (backend base)
2. Criar models SQLAlchemy
3. Criar database.py
4. Criar seed.py
5. Criar endpoints CRUD

## Problemas encontrados
- GitHub CLI não estava instalado (resolvido via winget)
- GitHub CLI não autenticado (resolvido via gh auth login)

## Obsidian
- Cofre: fabio
- Caminho do projeto: C:\Users\fabio\OneDrive\Documentos\Projetos\app-financeiro-fabio\
- Arquivos criados: 00_INDEX.md a 09_COMANDOS.md + context_manifest.json
- Último índice atualizado: 2026-05-01

## Como continuar em nova sessão
1. Ler SESSION_STATE.md do repositório (este arquivo)
2. Ler 00_INDEX.md do Obsidian
3. Ler context_manifest.json
4. Identificar fase atual (FASE 1 — Backend base)
5. Nunca recomeçar do zero se houver estado salvo
