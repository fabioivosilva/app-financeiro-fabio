import { Icon } from '../ui/Icon'
import { CategoryChip } from '../ui/Badge'
import { formatCurrency } from '../../hooks/useTransacoes'
import type { Transaction, Category, Person } from '../../api/types'

interface Props {
  tx: Transaction
  categories: Category[]
  persons: Person[]
}

const CATEGORY_ICONS: Record<string, string> = {
  'Alimentação': 'restaurant',
  'iFood': 'delivery_dining',
  'Mercado': 'shopping_cart',
  'Farmácia': 'local_pharmacy',
  'Transporte': 'directions_car',
  'Moradia': 'home',
  'Saúde': 'favorite',
  'Educação': 'school',
  'Lazer': 'sports_esports',
  'Outros': 'category',
}

export function TransacaoRow({ tx, categories, persons }: Props) {
  const cat = categories.find(c => c.id === tx.category_id)
  const person = persons.find(p => p.id === tx.person_id)
  const isPending = tx.status === 'pendente'
  const isPositive = tx.amount > 0

  const iconName = cat ? (CATEGORY_ICONS[cat.name] ?? 'category') : 'help_outline'
  const iconColor = cat?.color ?? 'rgba(192,132,252,0.5)'

  const installmentLabel = tx.installment_current && tx.installment_total
    ? `${tx.installment_current}/${tx.installment_total}`
    : null

  return (
    <div className={`tx-row ${isPending ? 'tx-row-pending' : ''}`}>
      {/* Ícone categoria */}
      <div
        className="tx-icon"
        style={{ background: iconColor + '20', color: iconColor }}
      >
        <Icon name={iconName} size={18} />
      </div>

      {/* Descrição + meta */}
      <div className="tx-main">
        <div className="tx-desc">{tx.description}</div>
        <div className="tx-meta">
          {cat && (
            <CategoryChip label={cat.name} color={cat.color} icon={iconName} />
          )}
          {!cat && <CategoryChip label="" empty />}
          {person && (
            <span className="t-xs t-muted">{person.name}</span>
          )}
          {tx.origin !== 'Débito' && (
            <span className="t-xs t-muted">{tx.origin}</span>
          )}
          {installmentLabel && (
            <span className="t-xs t-muted">parcela {installmentLabel}</span>
          )}
          {isPending && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              pendente
            </span>
          )}
        </div>
      </div>

      {/* Valor */}
      <div className={`tx-val ${isPositive ? 'tx-val-pos' : ''}`}>
        {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
      </div>
    </div>
  )
}
