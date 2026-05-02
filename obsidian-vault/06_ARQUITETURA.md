# 06_ARQUITETURA

## Estado Atual

Nao ha arquitetura implementada no repo. O codigo foi removido em 2026-05-02.

## Arquitetura Alvo

```text
frontend/
  React + Vite + TypeScript
  UI dark/glass, sem reaproveitar paginas antigas

backend/
  FastAPI
  SQLite local
  Parser engine plugavel

desktop/
  PyWebView + PyInstaller onedir
```

## Principio Principal

Parsers sao plugins. O core nao deve conhecer detalhes de Itau, Nubank ou qualquer banco especifico.

Fluxo alvo:

1. Usuario escolhe banco/formato ou o sistema detecta.
2. Registry escolhe parser.
3. Parser retorna transacoes normalizadas.
4. Backend deduplica e persiste.
5. Frontend exibe dashboard/transacoes do ciclo 27-26.
