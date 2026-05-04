// Biblioteca de ícones Material Symbols para categorias financeiras
// https://fonts.google.com/icons?icon.style=Rounded
import { useState } from 'react'
import { Icon } from './Icon'

export interface IconOption {
  id: string
  keywords: string
}

export const FINANCIAL_ICONS: IconOption[] = [
  // Renda e Trabalho
  { id: 'work',                keywords: 'trabalho emprego salário clt' },
  { id: 'attach_money',        keywords: 'salário receita dinheiro' },
  { id: 'paid',                keywords: 'pagamento receita' },
  { id: 'account_balance_wallet', keywords: 'carteira saldo' },
  { id: 'savings',             keywords: 'cofrinho poupança meta' },
  { id: 'trending_up',         keywords: 'rendimento investimento alta' },
  { id: 'card_giftcard',       keywords: 'plr bônus 13º presente' },
  { id: 'redeem',              keywords: 'reembolso restituição' },

  // Alimentação
  { id: 'restaurant',          keywords: 'restaurante alimentação comida' },
  { id: 'lunch_dining',        keywords: 'almoço refeição' },
  { id: 'fastfood',            keywords: 'fastfood lanche burger' },
  { id: 'local_pizza',         keywords: 'pizza ifood delivery' },
  { id: 'coffee',              keywords: 'café cafeteria starbucks' },
  { id: 'shopping_basket',     keywords: 'mercado supermercado feira' },
  { id: 'liquor',              keywords: 'bebida bar cerveja vinho' },
  { id: 'icecream',            keywords: 'sobremesa doce sorvete' },

  // Casa e Família
  { id: 'home',                keywords: 'casa moradia aluguel' },
  { id: 'apartment',           keywords: 'apartamento condomínio' },
  { id: 'family_restroom',     keywords: 'família filhos' },
  { id: 'pets',                keywords: 'pet animal cachorro gato' },
  { id: 'cleaning_services',   keywords: 'limpeza faxina diarista' },
  { id: 'kitchen',             keywords: 'cozinha eletrodoméstico' },
  { id: 'water_drop',          keywords: 'água conta' },
  { id: 'bolt',                keywords: 'energia luz conta' },
  { id: 'wifi',                keywords: 'internet wifi conta' },

  // Transporte
  { id: 'directions_car',      keywords: 'carro veículo' },
  { id: 'local_gas_station',   keywords: 'gasolina combustível posto' },
  { id: 'directions_bus',      keywords: 'ônibus transporte público' },
  { id: 'two_wheeler',         keywords: 'moto motocicleta' },
  { id: 'local_taxi',          keywords: 'táxi uber 99 corrida' },
  { id: 'flight',              keywords: 'avião viagem voo' },
  { id: 'train',               keywords: 'trem metrô' },
  { id: 'local_parking',       keywords: 'estacionamento' },

  // Saúde
  { id: 'health_and_safety',   keywords: 'saúde plano' },
  { id: 'medical_services',    keywords: 'médico consulta' },
  { id: 'local_hospital',      keywords: 'hospital emergência' },
  { id: 'medication',          keywords: 'farmácia remédio' },
  { id: 'fitness_center',      keywords: 'academia gym fitness' },
  { id: 'spa',                 keywords: 'estética beleza spa' },
  { id: 'psychology',          keywords: 'terapia psicólogo' },

  // Educação
  { id: 'school',              keywords: 'escola educação' },
  { id: 'menu_book',           keywords: 'livro estudo curso' },
  { id: 'auto_stories',        keywords: 'leitura livros' },

  // Entretenimento
  { id: 'sports_esports',      keywords: 'jogos games steam playstation' },
  { id: 'movie',               keywords: 'cinema filme streaming netflix' },
  { id: 'music_note',          keywords: 'música spotify' },
  { id: 'sports_basketball',   keywords: 'esporte futebol' },
  { id: 'celebration',         keywords: 'festa evento' },
  { id: 'travel_explore',      keywords: 'viagem turismo' },
  { id: 'beach_access',        keywords: 'praia férias' },
  { id: 'casino',              keywords: 'jogo aposta loteria' },

  // Compras
  { id: 'shopping_bag',        keywords: 'compras shopping' },
  { id: 'shopping_cart',       keywords: 'carrinho compras' },
  { id: 'checkroom',           keywords: 'roupa vestuário' },
  { id: 'devices',             keywords: 'eletrônico celular tech' },
  { id: 'chair',               keywords: 'móvel decoração casa' },
  { id: 'diamond',             keywords: 'jóia presente luxo' },

  // Financeiro/Burocrático
  { id: 'credit_card',         keywords: 'cartão fatura' },
  { id: 'account_balance',     keywords: 'banco transferência' },
  { id: 'receipt_long',        keywords: 'imposto taxa' },
  { id: 'gavel',               keywords: 'imposto multa jurídico' },
  { id: 'shield',              keywords: 'seguro proteção' },
  { id: 'description',         keywords: 'documento contrato' },

  { id: 'volunteer_activism',  keywords: 'doação caridade' },
  { id: 'baby_changing_station', keywords: 'bebê filho criança' },
  { id: 'cake',                keywords: 'aniversário comemoração' },
  { id: 'park',                keywords: 'lazer parque ar livre' },
  { id: 'label',               keywords: 'outros geral' },
  { id: 'help',                keywords: 'outros' },
]


interface IconPickerProps {
  selectedIcon: string
  selectedColor: string
  onSelect: (iconId: string) => void
}

export function IconPicker({ selectedIcon, selectedColor, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const filtered = search.trim()
    ? FINANCIAL_ICONS.filter(i => i.keywords.includes(search.toLowerCase().trim()) || i.id.includes(search.toLowerCase().trim()))
    : FINANCIAL_ICONS

  return (
    <div className="icon-picker">
      <div className="icon-picker-search">
        <Icon name="search" size={16} />
        <input
          type="text"
          placeholder="Buscar ícone (ex: comida, casa, carro)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="cfg-input"
        />
      </div>
      <div className="icon-picker-grid">
        {filtered.map(opt => {
          const isSelected = opt.id === selectedIcon
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`icon-picker-cell${isSelected ? ' icon-picker-cell-on' : ''}`}
              title={opt.keywords}
              style={isSelected ? { background: `${selectedColor}22`, borderColor: selectedColor } : {}}
            >
              <Icon name={opt.id} size={20} style={isSelected ? { color: selectedColor } : {}} />
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="icon-picker-empty t-sm t-muted">Nenhum ícone encontrado.</div>
        )}
      </div>
    </div>
  )
}
