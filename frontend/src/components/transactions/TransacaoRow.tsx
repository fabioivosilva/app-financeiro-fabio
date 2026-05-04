import { useState, useRef } from 'react'
import { Icon } from '../ui/Icon'
import { CategoryChip } from '../ui/Badge'
import { CategoryPopover } from './CategoryPopover'
import { RuleModal } from './RuleModal'
import { formatCurrency, isTransactionPending } from '../../hooks/useTransacoes'
import { api } from '../../api/client'
import { toast } from '../ui/Toast'
import type { Transaction, Category, Person } from '../../api/types'

interface Props {
  tx: Transaction
  categories: Category[]
  persons: Person[]
  onUpdated?: () => void
}

export const CATEGORY_ICONS: Record<string, string> = {
  // Fixas
  'Moradia': 'home', 'Casa': 'home',
  'Aluguel': 'home_work', 'Condomínio': 'apartment', 'Luz': 'bolt', 'Internet/TV': 'wifi',
  'Saúde': 'favorite',
  'Plano de saúde': 'medical_services', 'Academia': 'fitness_center',
  'Educação': 'school', 'Cursos online': 'menu_book',
  'Assinaturas': 'subscriptions',
  'Streaming': 'movie', 'Música': 'music_note', 'Software': 'code',
  // Variáveis
  'Alimentação': 'restaurant',
  'Restaurante': 'restaurant_menu', 'Delivery': 'delivery_dining', 'Café/Lanche': 'local_cafe',
  'iFood': 'delivery_dining',
  'Mercado': 'shopping_cart',
  'Supermercado': 'shopping_cart', 'Feira': 'eco', 'Padaria': 'bakery_dining',
  'Farmácia': 'local_pharmacy',
  'Transporte': 'directions_car',
  'Apps': 'local_taxi', 'Combustível': 'local_gas_station', 'Estacionamento': 'local_parking',
  'Lazer': 'sports_esports',
  'Cinema/Teatro': 'theaters', 'Viagem': 'flight', 'Hobbies': 'palette',
  'Outros': 'category',
  // Receitas
  'Salário': 'payments', 'CLT': 'badge', '13°/Bônus': 'redeem',
  'Freelance': 'engineering', 'Projetos': 'work',
  'Receitas': 'payments',
  // Internas
  'Transferência': 'swap_horiz', 'Entre contas': 'swap_horiz', 'Cofrinho': 'savings',
}

export function TransacaoRow({ tx, categories, persons, onUpdated }: Props) {
  const [showPopover, setShowPopover] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const chipRef = useRef<HTMLSpanElement>(null)

  const cat = categories.find(c => c.id === tx.category_id)
  const person = persons.find(p => p.id === tx.person_id)
  const isPending = isTransactionPending(tx)
  const isPositive = tx.amount > 0

  const iconName = cat ? (CATEGORY_ICONS[cat.name] ?? 'category') : 'help_outline'
  const iconColor = cat?.color ?? 'rgba(192,132,252,0.5)'
  const installmentLabel = tx.installment_current && tx.installment_total
    ? `${tx.installment_current}/${tx.installment_total}`
    : null

  async function handleSelectCategory(categoryId: number) {
    try {
      const chosenCat = categories.find(c => c.id === categoryId)
      await api.put(`/transactions/${tx.id}`, { ...tx, category_id: categoryId, status: 'confirmado' })
      const keyword = tx.description.trim().split(/\s+/).slice(0, 2).join(' ')
      await api.post('/rules/', { keyword, category_id: categoryId, person_id: tx.person_id ?? null, origin: null, goal_id: null })
      const { updated } = await api.post<{ updated: number }>('/rules/apply', {})
      const sub = updated > 1 ? `+${updated - 1} transação semelhante categorizada` : undefined
      toast(`Categoria salva: ${chosenCat?.name ?? ''}`, sub)
      onUpdated?.()
    } catch {
      toast('Erro ao salvar categoria', undefined, 'error')
    }
  }

  return (
    <>
      <div className={`tx-row ${isPending ? 'tx-row-pending' : ''}`}>
        {/* Ícone */}
        <div className="tx-icon" style={{ background: iconColor + '20', color: iconColor }}>
          <Icon name={iconName} size={18} />
        </div>

        {/* Descrição + meta */}
        <div className="tx-main">
          <div className="tx-desc">{tx.description}</div>
          <div className="tx-meta" style={{ position: 'relative' }}>
            {/* Chip clicável para editar categoria */}
            <span
              ref={chipRef}
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => setShowPopover(v => !v)}
              title="Clique para editar categoria"
            >
              {cat
                ? <CategoryChip label={cat.name} color={cat.color} icon={iconName} />
                : <CategoryChip label="" empty />
              }
              {showPopover && (
                <CategoryPopover
                  categories={categories}
                  persons={persons}
                  currentId={tx.category_id}
                  onSelect={handleSelectCategory}

                  onClose={() => setShowPopover(false)}
                  anchorRef={chipRef as React.RefObject<HTMLElement>}
                  txKeyword={tx.description.trim().split(/\s+/).slice(0, 2).join(' ')}
                />
              )}
            </span>

            {person && <span className="t-xs t-muted">{person.name}</span>}
            {tx.origin !== 'Débito' && <span className="t-xs t-muted">{tx.origin}</span>}
            {installmentLabel && <span className="t-xs t-muted">parcela {installmentLabel}</span>}
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

      {/* Modal criar regra */}
      <RuleModal
        open={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        description={tx.description}
        categoryId={tx.category_id}
        categories={categories}
        persons={persons}
      />
    </>
  )
}
