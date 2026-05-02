# 07_UX_REFERENCE

## Fonte do UX
- Arquivo: `stitch_instant_finance_tracker (4).zip`
- Local: `C:\Users\fabio\Downloads\`
- Extraído em: `C:\Users\fabio\Downloads\stitch_ux_extracted\`

## Telas Identificadas

### 1. Dashboard (`dashboard_financeiro/`)
- Hero card: Saldo do Mês (R$ 2.450,00) em destaque verde
- Sub-cards: Total Fatura (R$ 8.600), Saldo Restante
- Gasto por Pessoa: barras Você (60%, purple) vs Fernanda (40%, orange)
- Limites por Categoria: iFood (verde), Mercado (vermelho-estourou), Farmácia (amarelo)
- Meta de Reserva: barra de progresso 65%
- Evolução do Saldo: card com gráfico placeholder

### 2. Importar Dados (`importar_dados/`)
- Área drag & drop com borda tracejada purple
- Lista de arquivos selecionados (PDF e OFX com ícones distintos)
- Botão "Processar Importação"
- Painel lateral direito: Resumo da Importação
  - Total encontrado, categorizadas automaticamente, pendentes de revisão
  - Impacto financeiro: entradas, saídas, fatura

### 3. Transações (`transa_es/`)
- Filtros: Mês, Categoria, Pessoa, Origem (pill buttons rounded-full)
- Toggle "Apenas Pendentes"
- Agrupamento por data (ex: "24 de Outubro")
- Cada item: ícone, descrição, origem, chip categoria, pessoa, valor, status (✓ ou ⚠)
- Popover de edição de categoria com busca e opção "Criar regra automática"

### 4. Cartão (`an_lise_de_cart_o_consolidada/`)
- Hero: Total da Fatura com barra de limite usado
- Tabs: Resumo | Por pessoa | Parcelas futuras | Recorrentes
- Card "Por Pessoa": Titular (Final 4321) e Fernanda (Final 9876) com barras
- Card "Por Categoria": lista com dots coloridos e valores

### 5. Regras (`regras_de_automa_o/`)
- Header com botão "Nova Regra"
- Card esquerdo: Vínculo de Cartões (final → pessoa)
- Card direito: Lista de regras em grid
  - Colunas: Palavra-chave, Categoria (chip), Pessoa, Origem, Ações
  - Ações aparecem no hover
  - Busca + filtros
  - Paginação

### 6. Metas (`metas_financeiras/`)
- Header: "Reserva de Emergência" com prazo
- Card progresso (2 cols): valor atual, objetivo, barra 65%, faltam, concluído
- Card insight (purple sólido): sugestão mensal (R$ 875)
- Gráfico evolução da reserva: SVG line chart com pontos

### 7. Configurações (`configura_es/`)
- Grid 2 colunas:
  - Pessoas: lista com avatares (US, FE)
  - Cartões: items com mini-card visual
  - Categorias (full width): tabela com cor, nome, limite, ações
    - Separadores: "Categorias Fixas" e "Categorias Variáveis"
  - Sistema (full width): pasta importação + zona de perigo (reset)

## Design System

### Cores
| Token | Valor | Uso |
|-------|-------|-----|
| primary | #6200a0 | Textos e ações primárias |
| primary-container | #820AD1 | Botões, barras, brand forte |
| background | #fff7fd | Canvas principal |
| surface | #fff7fd | Background de superfícies |
| on-surface | #1f1923 | Texto principal |
| outline | #7f7386 | Texto secundário, labels |
| error | #ba1a1a | Alertas, exceder limites |
| Verde positivo | #0e8345 | Saldo positivo, dentro do limite |
| Amarelo alerta | #eab308 | Perto do limite |
| Orange Fernanda | #f97316 | Barra de gastos Fernanda |

### Tipografia
- Font: **Inter**
- headline-xl: 40px/48px bold
- headline-lg: 32px/40px semibold
- headline-md: 24px/32px semibold
- body-lg: 18px/28px regular
- body-md: 16px/24px regular
- label-md: 14px/20px medium
- label-sm: 12px/16px semibold

### Componentes
- Cards: bg-white, rounded-[24px], shadow 0 4px 12px rgba(0,0,0,0.04)
- Botões primários: bg-[#820AD1], text-white, rounded-lg
- Progress bars: h-2, rounded-full, bg gray track
- Chips/Pills: rounded-full, bg tint leve
- Sidebar: w-64, bg-gray-50, border-r
- Active nav: bg-purple-50, text-[#820AD1], font-bold

---

*Última atualização: 2026-05-01*
