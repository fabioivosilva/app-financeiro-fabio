# UX Reference — App Financeiro Fabio

## Fonte do Design
- Protótipo: `stitch_instant_finance_tracker (4).zip`
- Ferramenta: Stitch (Google)
- Data de extração: 2026-05-01

## Telas Identificadas

### 1. Dashboard (`dashboard_financeiro/`)
- **Hero card**: Saldo do Mês em destaque (verde positivo)
- **Sub-cards**: Total Fatura, Saldo Restante
- **Gasto por Pessoa**: barras horizontais Você (purple 60%) vs Fernanda (orange 40%)
- **Limites por Categoria**: iFood/Keeta, Mercado, Farmácia com barras de progresso
- **Meta de Reserva**: barra 65% com mensagem motivacional
- **Evolução do Saldo**: gráfico de linha

### 2. Importar Dados (`importar_dados/`)
- **Upload**: Drag & drop com borda tracejada purple
- **Arquivos**: Lista com ícone PDF (vermelho) e OFX (verde)
- **Resumo**: Painel lateral com total, categorizadas, pendentes
- **Impacto**: Entradas, saídas, fatura Itaú

### 3. Transações (`transa_es/`)
- **Filtros**: Pills (Mês, Categoria, Pessoa, Origem) + Toggle Pendentes
- **Lista**: Agrupada por data, com ícone, descrição, chip categoria, pessoa, valor, status
- **Edição**: Popover para alterar categoria com busca e opção de criar regra

### 4. Cartão (`an_lise_de_cart_o_consolidada/`)
- **Hero**: Total da fatura + barra de limite
- **Tabs**: Resumo, Por pessoa, Parcelas futuras, Recorrentes
- **Por Pessoa**: Avatar + final cartão + barra de progresso
- **Por Categoria**: Lista com dots coloridos

### 5. Regras (`regras_de_automa_o/`)
- **Header**: Título + botão Nova Regra
- **Vínculos de Cartão**: Cards mapeando final → pessoa
- **Lista de Regras**: Grid com palavra-chave, categoria, pessoa, origem, ações
- **Paginação**

### 6. Metas (`metas_financeiras/`)
- **Progresso**: Valor atual vs objetivo, barra animada
- **Insight**: Card purple sólido com sugestão mensal
- **Gráfico**: SVG line chart da evolução

### 7. Configurações (`configura_es/`)
- **Pessoas**: Lista com avatares (iniciais)
- **Cartões**: Items com mini-card visual
- **Categorias**: Tabela com cor, nome, limite (separada por Fixas/Variáveis)
- **Sistema**: Pasta de importação + botão reset (zona de perigo)

## Design System

### Cores Principais
| Token | Hex | Uso |
|-------|-----|-----|
| primary | `#6200a0` | Textos e ações primárias |
| primary-container | `#820AD1` | Botões, barras, brand forte |
| background | `#fff7fd` | Canvas principal |
| on-surface | `#1f1923` | Texto principal |
| outline | `#7f7386` | Texto secundário |
| error | `#ba1a1a` | Alertas, limites estourados |
| success (custom) | `#0e8345` | Saldo positivo |
| warning (custom) | `#eab308` | Perto do limite |
| orange (Fernanda) | `#f97316` | Barra de gastos Fernanda |

### Tipografia
- **Font**: Inter (Google Fonts)
- headline-xl: 40px bold
- headline-lg: 32px semibold
- headline-md: 24px semibold
- body-lg: 18px regular
- body-md: 16px regular
- label-md: 14px medium
- label-sm: 12px semibold

### Componentes
- **Cards**: `bg-white rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.04)]`
- **Botões**: `bg-[#820AD1] text-white rounded-lg`
- **Progress bars**: `h-2 rounded-full`
- **Chips**: `rounded-full bg-tint`
- **Sidebar**: `w-64 bg-gray-50 border-r`
- **Active nav**: `bg-purple-50 text-[#820AD1] font-bold`

### Icons
- Material Symbols Outlined
- Active icons: `font-variation-settings: 'FILL' 1`

### Layout
- Grid: 12 colunas desktop, 1 coluna mobile
- Spacing base: 8px
- Card padding: 24px (p-6)
- Page margins: 16px mobile, 32px desktop
- Container max: 1200px
