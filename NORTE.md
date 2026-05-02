# NORTE — App Financeiro Fabio & Thiago
> **Arquivo único de referência.** Toda IA e todo dev abre este antes de qualquer coisa.
> Backlog, estado, quem puxou o quê, sizing de sessão e protocolo — tudo aqui.
> Última atualização: 2026-05-02

---

## 👥 Time e Ferramentas

| Quem | Ferramenta | Token de Acesso |
|---|---|---|
| Fabio | Claude.ai / Claude Code VSCode | Gerenciado por Fabio |
| Thiago | Claude.ai | Gerenciado por Thiago |
| IA | Lê este arquivo primeiro, sempre | — |

**Repo:** `https://github.com/fabioivosilva/app-financeiro-fabio.git`
**Branch ativa:** `develop` — nunca commitar em `main`
**Executável:** `ControleFinanceiro\ControleFinanceiro.exe` (raiz do projeto)
**Banco:** `data\finance.db` — local, não versionar

---

## 🧠 Contexto do Produto

App financeiro **desktop Windows** (PyWebView + PyInstaller) para uso pessoal de Fabio e Thiago.
Sem cloud, sem login, sem servidor externo. Banco SQLite local em cada máquina.

**Stack:**
- Frontend: React 19 + Vite + TypeScript + TailwindCSS + Recharts
- Backend: Python 3.12 + FastAPI + SQLAlchemy + SQLite
- Desktop: PyWebView + PyInstaller onedir
- Build: `build_desktop.bat` → gera exe

**Design System (Stitch Premium):**
- Cor primária: `#820AD1` | Fundo: `#fff7fd` | Verde: `#0e8345` | Vermelho: `#ba1a1a` | Orange: `#f97316`
- Dark mode, glassmorphism, micro-animações suaves
- Fonte: Inter
- Referência visual completa: `obsidian-vault/07_UX_REFERENCE.md`

**Regra de negócio crítica:**
- Ciclo financeiro: dia 27 ao dia 26 (ex: 27/04 → 26/05 = ciclo Maio)
- 56 regras de categorização: `backend/app/seed.py` — fonte da verdade, nunca duplicar

---

## ⚡ Sizing de Sessão

| Tag | O que é | Tokens | Capacidade da sessão |
|---|---|---|---|
| `[P]` | 1 arquivo, mudança isolada | ~3–8k | 4–6 itens P |
| `[M]` | 1 endpoint + 1 componente UI | ~8–20k | 2–3 itens M |
| `[G]` | Novo modelo + backend + UI completos | ~20k+ | 1 item G |

> **Regra prática:** Nunca misturar 2 itens G numa sessão. 1G + 1P é ok. 2M + 2P é ok.

---

## 🔒 Sistema de Claims — Quem Está Puxando o Quê

Antes de começar qualquer tarefa, **marcar com `🔒 [NOME]`** no item abaixo e commitar:

```bash
git add NORTE.md
git commit -m "chore(norte): 🔒 [FABIO] inicia <nome da tarefa>"
git push origin develop
```

Ao fechar: remover o 🔒, marcar `[x]`, commitar + push.
Isto avisa o outro dev e a IA dele para não entrar em conflito.

**Status atual de claims:** *(nenhum — projeto zerado)*

---

## 📋 ROADMAP COMPLETO

### TRILHA 0 — Fundação (fazer primeiro, tudo depende disto)

- [ ] `[G]` 🏗️ **T0.1 — Setup do Zero: Backend Base**
  - Modelos SQLAlchemy: `Transaction`, `Category`, `Rule`, `Person`, `Card`, `Goal`, `Settings`
  - CRUD completo para cada modelo
  - FastAPI com routers organizados por domínio
  - `seed.py` com as 56 regras de categorização
  - Migrations simples via `database.py`
  - **Quem pode puxar:** Fabio ou Thiago
  - **Saída:** backend rodando em `localhost:8000` com dados de seed

- [ ] `[G]` 🏗️ **T0.2 — Setup do Zero: Frontend Base**
  - Vite + React 19 + TypeScript + TailwindCSS configurados
  - Layout shell: sidebar, área de conteúdo, MonthSelector global
  - Design System implementado: tokens de cor, tipografia Inter, componentes base (Button, Card, Modal, Badge)
  - Roteamento entre páginas (react-router)
  - API client (`/src/api/`) com tipos TypeScript espelhando o backend
  - **Depende de:** T0.1 (para tipagem dos contratos)
  - **Quem pode puxar:** Fabio ou Thiago (paralelo ao T0.1 com tipos mockados)
  - **Saída:** shell navegável, sem dados reais, design system visível

- [ ] `[P]` 🏗️ **T0.3 — Setup Desktop + Build**
  - `main_desktop.py` com PyWebView + Uvicorn
  - `build_desktop.bat` funcional
  - `auto_sync.ps1` + `install_auto_sync.bat` na máquina de cada dev
  - **Depende de:** T0.1 + T0.2 mínimos rodando
  - **Quem pode puxar:** Fabio (tem a máquina Windows de referência)
  - **Saída:** `ControleFinanceiro.exe` abrindo o shell do frontend

---

### TRILHA 1 — Importação Multi-Banco *(base de dados do produto)*

> ⚠️ T1.1 antes de T1.2. Sem importação, nenhuma outra tela tem dados.

- [ ] `[G]` **T1.1 — Arquitetura de Parsers Plugável**
  - Interface base `BaseParser` com método `parse(file_bytes) -> List[TransactionRaw]`
  - `PARSER_REGISTRY = { ("itau", "excel"): ItauExcelParser, ("itau", "pdf"): ItauPdfParser, ("generic", "ofx"): OfxParser }`
  - Reescrever os 3 parsers existentes para implementar a interface
  - Endpoint único `POST /imports/upload` recebe `{ bank, format, file }`
  - Lógica de deduplicação por hash/FITID centralizada
  - **Depende de:** T0.1
  - **Quem pode puxar:** Thiago (propôs) ou Fabio
  - **Saída:** imports funcionando via API com qualquer parser registrado

- [ ] `[M]` **T1.2 — Tela de Importação** *(depende de T1.1)*
  - Dropdown: banco + formato
  - Drag & drop com ícones por tipo (PDF, Excel, OFX)
  - Resumo pós-importação: total encontrado, categorizados, pendentes
  - Lista de arquivos já importados com timestamp
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Importar Dados"
  - **Quem pode puxar:** Fabio ou Thiago

- [ ] `[M]` **T1.3 — Importação Assistida pela Pasta Padrão** *(depende de T1.2)*
  - Configuração de pasta padrão em Settings
  - Listar arquivos `.xls/.xlsx/.pdf/.ofx` não importados da pasta
  - Importar com 1 clique sem precisar navegar pelo Explorer
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 2 — Transações e Categorização

- [ ] `[M]` **T2.1 — Tela de Transações**
  - Lista agrupada por data com paginação
  - Filtros: mês, categoria, pessoa, origem, status (pill buttons)
  - Toggle "Apenas Pendentes"
  - Inline edit de categoria com busca
  - "Criar regra automática" a partir de uma transação
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Transações"
  - **Depende de:** T0.2 + T1.1 (dados reais)
  - **Quem pode puxar:** Fabio ou Thiago

- [ ] `[M]` **T2.2 — Tela de Regras de Automação**
  - CRUD de regras: palavra-chave → categoria + pessoa + origem
  - Campo `goal_id` opcional: regra pode vincular direto a uma meta
  - Card de vínculo cartão → pessoa (final do cartão → nome)
  - Grid com busca, filtros e paginação
  - Hover actions (editar, deletar)
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Regras"
  - **Depende de:** T0.2 + T2.1
  - **Quem pode puxar:** Fabio ou Thiago

- [ ] `[P]` **T2.3 — Cofrinho por Keyword/Regra**
  - Campo `keyword` em `Goal` — ao categorizar, se texto bater, vincula à meta
  - Alternativa via `Rule.goal_id` (já planejado no T2.2)
  - **Depende de:** T2.2 + T3.1
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 3 — Metas & Cofrinho

- [ ] `[M]` **T3.1 — Tela de Metas (CRUD + Progresso)**
  - Cards de metas com barra de progresso
  - Criar/editar/deletar meta: nome, valor objetivo, prazo, categoria vinculada
  - Progresso calculado automaticamente via transações da categoria vinculada
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Metas"
  - **Depende de:** T0.2 + T2.1
  - **Quem pode puxar:** Fabio ou Thiago

- [ ] `[M]` **T3.2 — Aporte Manual em Meta**
  - Botão "Registrar Aporte" no card da meta
  - Modal: valor, descrição, data
  - Endpoint `POST /goals/{id}/deposit` → cria Transaction + atualiza progresso
  - Transação aparece no extrato com origem `Aporte Manual`
  - **Depende de:** T3.1
  - **Quem pode puxar:** Fabio ou Thiago

- [ ] `[P]` **T3.3 — Insight de Meta**
  - Card lateral roxo: "Para atingir X até DD/MM, guarde R$ Y/mês"
  - Cálculo simples: (objetivo - atual) / meses restantes
  - **Depende de:** T3.1
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 4 — Dashboard e Cartão

- [ ] `[G]` **T4.1 — Dashboard Principal**
  - Hero card: Saldo do Mês em destaque (receitas - despesas)
  - Sub-cards: Total Fatura, Saldo Restante
  - Gastos por Pessoa: barras Fabio vs Thiago (ou quem for)
  - Limites por Categoria: verde/amarelo/vermelho baseado em `category.limit`
  - Meta de Reserva: barra de progresso da meta principal
  - Comparativo com ciclo anterior (badge +/- %)
  - Top 3 categorias de gasto
  - MonthSelector global no header
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Dashboard"
  - **Depende de:** T0.2 + T2.1 + T3.1
  - **Quem pode puxar:** Fabio ou Thiago

- [ ] `[M]` **T4.2 — Tela de Análise de Cartão**
  - Hero: Total da Fatura + barra de limite usado
  - Tabs: Resumo | Por Pessoa | Parcelas Futuras | Recorrentes
  - Card Por Pessoa: titular vs adicional com barras
  - Card Por Categoria: lista com dots coloridos
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Cartão"
  - **Depende de:** T4.1
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 5 — Provisões e Fluxo de Caixa *(feature estrutural)*

> Atacar em sequência. Cada item depende do anterior.

- [ ] `[G]` **T5.1 — Modelo Base de Provisões**
  - Novo modelo `Provision`: descrição, valor, tipo (despesa/receita), categoria, recorrência, datas
  - Ao criar provisão recorrente → gera `ProvisionOccurrence` com datas futuras e status
  - CRUD completo + tela "Provisões" no frontend
  - Casos: assinaturas, parcelas, prestações de empréstimo
  - Ao criar: perguntar se única, mensal, trimestral ou anual
  - **Depende de:** T0.1 + T2.1
  - **Quem pode puxar:** Thiago (propôs)

- [ ] `[G]` **T5.2 — Vinculação Provisão ↔ Transação Real** *(depende de T5.1)*
  - Ao importar: sugerir atrelar transação a uma `ProvisionOccurrence` pendente
  - Se valor diferir: perguntar causa (variação normal vs. juros/encargos)
  - Se juros: registrar diferença como transação separada em categoria "Juros e Encargos"
  - Atualizar status da ocorrência para "realizada"
  - **Quem pode puxar:** Thiago ou Fabio

- [ ] `[G]` **T5.3 — Fluxo de Caixa Futuro** *(depende de T5.1 + T5.2)*
  - Nova aba: projeção mês a mês
  - Colunas: Receitas previstas | Despesas previstas | Saldo projetado
  - Distinguir: realizado (importado) vs provisionado (futuro)
  - Drill-down por mês
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 6 — Configurações e Sistema

- [ ] `[M]` **T6.1 — Tela de Configurações**
  - Grid 2 colunas: Pessoas, Cartões, Categorias (full-width), Sistema (full-width)
  - Pessoas: adicionar/editar com avatar (iniciais)
  - Cartões: vínculo final → pessoa + limite
  - Categorias: tabela com cor, nome, limite, soft-delete, separadores Fixas/Variáveis
  - Sistema: pasta de importação + Zona de Perigo (reset com confirmação forte)
  - **Referência visual:** `07_UX_REFERENCE.md` → seção "Configurações"
  - **Depende de:** T0.2
  - **Pode ser feito em paralelo com T1, T2, T3**
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 7 — Insights & IA *(melhor após Trilha 5)*

- [ ] `[G]` **T7.1 — Aba de Insights**
  - Gastos acima da média histórica (alerta automático)
  - Sugestões de corte por categoria
  - Simulação de metas: "se economizar R$ X no iFood, chego na meta Y em Z meses"
  - Com T5 implementado: projeção de quando as metas serão atingidas
  - **Depende de:** T4.1 + T5.3
  - **Quem pode puxar:** Fabio ou Thiago

---

### TRILHA 8 — Segurança *(trilha própria, não bloqueia nada)*

- [ ] `[P]` **T8.1 — Avaliação de Criptografia Local** — avaliar SQLCipher vs chave derivada
- [ ] `[P]` **T8.2 — Plano de Senha/Master Key** — UX de senha mestre
- [ ] `[M]` **T8.3 — Varredura de Brechas** — deps, CORS, localhost, path traversal
- [ ] `[M]` **T8.4 — Hardening do Desktop** — porta aleatória, remoção de debug

---

## 📊 Visão Geral do Roadmap

```
TRILHA 0 (Fundação)    T0.1──T0.2──T0.3
                              │
TRILHA 1 (Importação)  ───── T1.1──T1.2──T1.3
                              │
TRILHA 2 (Transações)  ───── T2.1──T2.2──T2.3
                              │      │
TRILHA 3 (Metas)       ───── T3.1──T3.2──T3.3
                              │
TRILHA 4 (Dashboard)   ───── T4.1──T4.2
                              │
TRILHA 5 (Provisões)   ───── T5.1──T5.2──T5.3
                              │
TRILHA 6 (Config)      ───── T6.1 (paralelo com T1-T3)
                              │
TRILHA 7 (Insights)    ─────────────────── T7.1 (após T4+T5)
TRILHA 8 (Segurança)   ─── qualquer momento, não bloqueia
```

**Estimativa total:** ~20 sessões de desenvolvimento (mix de G, M, P)

---

## ✅ Protocolo de Fechamento de Item (OBRIGATÓRIO)

Ao concluir qualquer item:

```bash
# 1. Marcar [x] neste arquivo (NORTE.md) e remover o 🔒
# 2. git add NORTE.md
# 3. git add -A
# 4. git commit -m "feat(T0.1): descrição do que foi feito"
# 5. Rodar build_desktop.bat (Windows, na máquina local)
# 6. git push origin develop
```

Sem esses 6 passos, o item não está fechado.

---

## 🔧 Comandos Rápidos

```bash
# Dev — Backend
cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000

# Dev — Frontend
cd frontend && npm run dev

# Build exe
.\build_desktop.bat

# Sync automático (após instalar)
schtasks /run /tn "AppFinanceiroAutoSync"

# Testes backend
cd backend && .venv\Scripts\python.exe -m unittest discover
```

---

## 📁 Vault — Quando Ler Cada Arquivo

| Dúvida | Arquivo |
|---|---|
| Design System, cores, componentes | `obsidian-vault/07_UX_REFERENCE.md` |
| Parsers OFX/PDF/Excel (detalhes técnicos) | `obsidian-vault/08_PARSERS.md` |
| Decisões técnicas estáveis (stack, dedup) | `obsidian-vault/02_DECISOES_TECNICAS.md` |
| Onboarding do Thiago | `obsidian-vault/THIAGO_SETUP.md` |
| Skills das IAs | `obsidian-vault/skills/` |

*Para tudo mais: este arquivo (NORTE.md) é suficiente.*

---
*Gerado em: 2026-05-02 | Próxima tarefa: T0.1 — Setup Backend Base*
