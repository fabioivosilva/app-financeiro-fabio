# CHANGELOG — App Financeiro
> Itens concluídos do roadmap. Mantido fora do NORTE.md para economizar tokens em sessões.
> Para auditoria detalhada: `git log`.



## Sessão 2026-05-04 — Limpeza e baixas em massa
- ✅ **BUG.CFG.1 — Dia de ciclo limitado a 28 em Configurações** · *Claude.ai · baixa em 2026-05-04*
  Input do dia de ciclo agora aceita 1-31. `getCycleInfo` ajusta automaticamente para o último
  dia do mês quando o dia escolhido não existe (ex: 31 em fevereiro vira 28/29).
  Files: `frontend/src/pages/Config.tsx`, `frontend/src/components/layout/CycleProgress.tsx`.

- ✅ **BUG.3 — Modais, popovers e dropdowns sem quebra visual** · *Codex · baixa em 2026-05-04*
  Grids de categorias em modais migrados para `modal-cat-grid`; preview da Nova Provisão com `prov-icon`;
  popover de categoria saiu de `<span>` e ganhou limite de altura; chips/dropdowns com ellipsis;
  modal de senha PDF usa `modal-backdrop`, `modal-head`, `modal-foot` e `cfg-input`.
  Confirmado em commits `6a83e5f` e `4d4168b`.


- ✅ **T0.3 — Script de Execução** · *baixa em 2026-05-04*
  rodar.bat + auto_sync.ps1 + instalar_sync.bat funcionando

- ✅ **T2.1 — Tela de Transações** · *baixa em 2026-05-04*
  590 linhas, filtros, MonthSelector, busca, inline edit — completa

- ✅ **T2.2 — Tela de Regras** · *baixa em 2026-05-04*
  345 linhas, RuleModal, CRUD completo, busca por keyword/categoria

- ✅ **T3.1 — Tela de Metas** · *baixa em 2026-05-04*
  428 linhas, cards de progresso, modal, cálculo de aporte mensal

- ✅ **T3.3 — Insight de Meta** · *baixa em 2026-05-04*
  Aporte mensal necessário calculado e exibido em Metas.tsx (entregue dentro de T3.1)

- ✅ **T6.4 — Seção Sistema funcional** · *baixa em 2026-05-04*
  SistemaSection em Config.tsx com pasta de importação persistida

- [x] `[G]` **BUG.1 — Auditoria UI/API de todos os menus** · *Thiago + Fabio · CONCLUÍDO 2026-05-03*
  Resultado: Dashboard🔴placeholder, Importar🟡funcional/BUG.4, Transações🟡funcional/BUG.2-3, Cartão🔴placeholder, Provisões🔴placeholder(sem backend), Metas🟢funcional, Regras🟢funcional, Config🔴placeholder. Backend: todas as rotas existem exceto provisions e settings.
  **Fixes entregues:** filtro "Ciclo atual" (dia 27→26) em Transações + suggestCategory agora usa regras reais do backend.

- [x] `[M]` **T_PROV.1 — Auto-importar parcelas do cartão como provisões futuras** · *Codex · CONCLUÍDO 2026-05-04*
  **Objetivo:** detectar transações parceladas já importadas e gerar provisões para as parcelas restantes.

  **Lógica:**
  - Buscar `GET /transactions/` e filtrar onde `installment_current IS NOT NULL AND installment_current < installment_total`
  - Agrupar por descrição normalizada (mesmo item em meses diferentes = mesma compra)
  - Para cada grupo: pegar a parcela mais recente (`max(installment_current)`), calcular quantas faltam (`installment_total - max_current`)
  - Para cada parcela restante: criar uma `Provision` com:
    - `description` = descrição da transação (sem " N/M")
    - `amount` = valor médio das parcelas já vistas (negativo)
    - `day` = dia do mês da transação original
    - `type` = "parcela"
    - `installment_current` = próxima parcela (max_current + 1)
    - `installment_total` = installment_total da transação
    - `category_id` = category_id da transação
    - `active` = true

  **Frontend:** botão "Importar parcelas pendentes" no header da tela Provisões (ao lado de Nova provisão).
  Ao clicar: `POST /provisions/import-installments` → mostra toast com quantas foram criadas → refetch.

  **Backend:** nova rota `POST /provisions/import-installments` em `backend/app/routers/provisions.py`.
  Deve evitar duplicatas: checar se já existe provisão com mesma descrição normalizada e parcela futura antes de criar.

  **Arquivos a editar:**
  - `backend/app/routers/provisions.py` — adicionar rota import-installments
  - `frontend/src/pages/Provisoes.tsx` — botão no header + chamada API + toast
  - `frontend/src/hooks/useProvisoes.ts` — já tem transactions disponível
  **Resultado Codex:** migration idempotente adiciona `person_id`, `installment_current`
  e `installment_total` em `provisions`; `POST /provisions/import-installments`
  agrupa compras parceladas por descrição normalizada, cria a próxima provisão futura
  sem duplicar e preserva categoria/pessoa; tela Provisões ganhou botão
  "Importar parcelas pendentes" com toast e refetch.

- [x] `[P]` **T_CAT.1 — Busca no popover traz categoria pai + subcategorias** · *CONCLUÍDO 2026-05-04*
  Quando o usuário digita no campo de busca do `CategoryPopover` e o resultado bate com um pai (ex: "Lazer"),
  exibir também todas as subcategorias desse pai logo abaixo — mesmo comportamento dos grupos colapsáveis,
  mas acionado pela busca. Hoje retorna só o pai e o usuário não consegue escolher a sub.

- [x] `[P]` **T_CAT.2 — Botão rápido "Nova categoria/subcategoria" no popover** · *CONCLUÍDO 2026-05-04*
  Adicionar botão no rodapé do `CategoryPopover` (ao lado de "Criar regra automática") para cadastrar
  uma nova categoria ou subcategoria inline sem sair do fluxo de categorização.
  Ao confirmar: salva via `POST /categories/`, executa `/rules/apply` em massa e navega para
  Configurações > Categorias para o usuário ver o resultado registrado.
  Gatilho natural: busca sem resultado + botão "Criar '{{termo}}'".

- [x] `[M]` **BUG.4 — Remover mocks ou sinalizar claramente o que ainda é mock** · *Thiago · CONCLUÍDO 2026-05-03*
  Importar: substituído sampleImports por localStorage (loadHistory/saveHistory). Histórico persiste entre sessões, começa vazio, empty state adicionado. Nenhum dado fake restante identificado nas demais telas funcionais.

- [x] `[P]` **BUG.5 — Script dev confiável** · *Codex · CONCLUÍDO 2026-05-03*
  `rodar.bat` melhorado: mata portas 8000/5173 antes de subir, usa Python da venv para `uvicorn`, fixa backend em `127.0.0.1`, sobe Vite em `localhost` e retorna exit code 0. Validado com portas ocupadas: `/docs`, `/categories/`, `/` e `/config` responderam 200; Fabio autorizou baixa.

- [x] `[P]` **BUG.6 — Fetch error no importador Itaú** · *Codex · CONCLUÍDO 2026-05-03*
  Corrigido o caminho de fetch da tela Importar: upload agora usa a URL central da API (`API_BASE_URL`), normaliza `localhost`/`::1` para `127.0.0.1:8000`, mostra erro claro quando a API não responde e o CORS aceita portas Vite locais `517x`.
  Observação: se o arquivo real do Itaú retornar erro de parser/formato depois da conexão, abrir item separado com o modelo do arquivo.

- [x] `[P]` **BUG.7 — Importação Itaú OFX/XLSX ainda falha após PDF funcionar** · *CONCLUÍDO 2026-05-03*
  O erro "backend indisponível" era um erro de CORS/Timeout causado por N+1 queries no deduplicate (lento no Windows).
  **Fixes:** Deduplicação otimizada para query única (IN) + tratamento de erro robusto no router + aumento do sample de detecção Excel. Validado com arquivos reais do Fabio.

- [x] `[P]` **BUG.8 — Navegação de ciclos na tela Transações** · *CONCLUÍDO 2026-05-03*
  Adicionado navegador de ciclo com setas ← → acima dos filtros. Label mostra mês/ano atual. Seta esquerda volta meses; seta direita avança (desabilitada no mês atual). Botão "Todas" remove filtro de mês e carrega histórico completo. useTransacoes agora aceita month/year opcionais.

- [x] `[G]` **T0.1 — Backend Base** · *Fabio · CONCLUÍDO*
  FastAPI + SQLAlchemy + SQLite · 7 modelos · 8 routers CRUD · seed com Fabio/Fernanda/cartões/10 cats/regras/meta/transações
  **Saída:** `localhost:8000` funcionando com dados de seed

- [x] `[G]` **T0.2a — Frontend Shell** · *Fabio · CONCLUÍDO*
  Vite + React 19 + TS + Tailwind · AppShell + Sidebar + MonthSelector · react-router · API client tipado · 6 pages placeholder

- [x] `[M]` **T0.2b — Design System** · *Fabio · CONCLUÍDO*
  Icon, Button, Glass, Badge, CategoryChip, Modal, PageHeader, SectionHeader, CycleProgress
  CSS completo fiel ao design de referência (styles.css) · tokens corretos · Inter + Material Symbols
  - [ ] Cor primary: separar #6200a0 (texto) de #820AD1 (brand/botões)
  - [ ] Backlog v2: switch light/dark mode (tokens já preparados no index.css)
  **NOTA:** design light mode em elaboração com designer (Claude.ai) — sessão estourou tokens antes de concluir. Arquivo incompleto. Retomar quando designer tiver nova sessão.

- [x] `[G]` **T1.1 — Parsers Plugáveis** · *Fabio · CONCLUÍDO*
  Interface `BaseParser` · `PARSER_REGISTRY` · parsers OFX, Itaú Excel e Itaú PDF · endpoint único `POST /imports/upload` · deduplicação centralizada.
  **Detalhe técnico:** `08_PARSERS.md`

- [x] `[M]` **T1.2 — Tela de Importação** · *Thiago · CONCLUÍDO 2026-05-03*
  Drag & drop · upload real `POST /imports/upload` · resumo pós-import · histórico via localStorage (loadHistory/saveHistory) · começa vazio · empty state adicionado. BUG.4 fechado.
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Importar Dados"

- [x] `[P]` **T1.2b — Conectar Bancos Ativos → Tela de Importar** · *Codex · CONCLUÍDO 2026-05-03*
  Hoje a tela de Importar aceita qualquer arquivo e não sabe quais bancos o usuário usa.
  Após T6.2, a seleção de bancos existe em `localStorage` com a chave `cfg_bancos_ativos`.

  **O que fazer (tudo no frontend — sem tocar no backend):**

  1. Em `frontend/src/pages/Importar.tsx`, adicionar no topo da função `Importar()`:
  ```ts
  const bancosAtivos: string[] = JSON.parse(localStorage.getItem('cfg_bancos_ativos') || '[]')
  ```

  2. Logo abaixo, definir o mapa de bancos (copiar de Config.tsx — `BANCOS_DISPONIVEIS`).
  Filtrar pelo que está ativo:
  ```ts
  const bancosVisiveis = BANCOS_DISPONIVEIS.filter(b => bancosAtivos.includes(b.id))
  ```

  3. No JSX, substituir o texto estático da dropzone:
  ```
  "Suporta OFX (qualquer banco), CSV (Nubank, Inter e outros)..."
  ```
  Por chips dinâmicos dos bancos ativos + seus formatos. Ex:
  ```tsx
  <div className="import-bancos-ativos">
    {bancosVisiveis.map(b => (
      <span key={b.id} className="cfg-banco-chip">{b.logo} {b.label}</span>
    ))}
  </div>
  ```

  4. Se `bancosAtivos` estiver vazio → mostrar aviso:
  ```tsx
  <p>Nenhum banco configurado. <a href="/config">Configure em Configurações → Bancos</a></p>
  ```

  **Não mexer:** lógica de upload, endpoint `POST /imports/upload`, `localStorage` do histórico.
  **CSS reutilizar:** `.cfg-banco-chip` já existe em `index.css`.
  **Resultado Codex:** `Config.tsx` e `Importar.tsx` usam mapa compartilhado `frontend/src/config/banks.ts`; Importar mostra chips dos bancos ativos e bloqueia arquivo de banco reconhecido quando esse banco está desativado.

- [x] `[M]` **T6.1 — Tela de Configurações** · *Fabio · CONCLUÍDO 2026-05-03*
  Sidebar nav + Pessoas (CRUD, avatar com cores) + Cartões (CRUD, mini-card) + Categorias (CRUD, grid por tipo, search/filtro) + Sistema (pasta import via localStorage) + Zona de Perigo (confirmação com digitação).
  **Ref visual:** `07_UX_REFERENCE.md` → seção "Configurações"

---

- [x] `[P]` **T6.2 — Seção Bancos em Configurações** · *Claude.ai 2026-05-03*
  Cards selecionáveis por banco (Itaú, C6, Nubank, Inter, Bradesco, Santander, Mercado Pago).
  Toggle ativo/inativo com check visual. Formatos suportados por banco como chips.
  Persiste em localStorage. Nav lateral atualizado. CSS seguindo design system.

- [x] `[P]` **T6.3 — Status de disponibilidade dos bancos** · *CONCLUÍDO 2026-05-03*
  Campo `available` adicionado em BankConfig. Bradesco, Santander e Mercado Pago marcados como `available: false`. Card desabilitado (opacidade + pointer-events), ícone `construction`, chip laranja "Em construção". Toggle bloqueado para bancos indisponíveis.