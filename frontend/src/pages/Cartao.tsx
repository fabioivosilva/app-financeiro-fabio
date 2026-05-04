import { useMemo, useState } from 'react'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { CategoryChip } from '../components/ui/Badge'
import { useCards } from '../hooks/useCards'
import { useTransacoes, formatCurrency } from '../hooks/useTransacoes'

const brl = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(value))

const shortDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(year, month - 1, day))
    .replace('.', '')
}

export function Cartao() {
  const { cards, persons, loading: cardsLoading } = useCards()
  const { transactions, categories, loading: txLoading } = useTransacoes({})
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)

  const selectedCard = useMemo(() => {
    if (selectedCardId) return cards.find(card => card.id === selectedCardId) ?? cards[0]
    return cards[0]
  }, [cards, selectedCardId])

  const cardTransactions = useMemo(() => {
    if (!selectedCard) return []
    return transactions
      .filter(tx => tx.card_id === selectedCard.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, selectedCard])

  const totalInvoice = cardTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  const limit = selectedCard?.limit_value || Math.max(totalInvoice, 1)
  const usedPct = Math.min(100, (totalInvoice / limit) * 100)
  const owner = persons.find(person => person.id === selectedCard?.person_id)
  const loading = cardsLoading || txLoading

  return (
    <div className="page page-cartao">
      <PageHeader title="Cartão" subtitle="Fatura aberta · compras importadas" />

      {loading ? (
        <Glass>
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Icon name="hourglass_empty" size={32} />
          </div>
        </Glass>
      ) : !selectedCard ? (
        <Glass className="stub-card">
          <div className="stub-icon"><Icon name="credit_card_off" size={40} /></div>
          <div className="stub-title">Nenhum cartão cadastrado</div>
          <div className="stub-sub">Os cartões aparecem aqui depois de configurar ou importar uma fatura.</div>
        </Glass>
      ) : (
        <>
          <div className="grid-2">
            <Glass className="cartao-card">
              <div className="cartao-bg">
                <div className="cartao-net">CARD</div>
                <div className="cartao-num">•••• •••• •••• {selectedCard.last4 || '0000'}</div>
                <div className="cartao-foot">
                  <div>
                    <div className="t-xs t-muted">TITULAR</div>
                    <div className="t-sm">{owner?.name?.toUpperCase() || 'SEM TITULAR'}</div>
                  </div>
                  <div>
                    <div className="t-xs t-muted">CARTÃO</div>
                    <div className="t-sm">{selectedCard.name}</div>
                  </div>
                </div>
              </div>
              <div className="cartao-info">
                <div className="t-xs t-muted">FATURA ABERTA</div>
                <div className="cartao-val">{brl(totalInvoice)}</div>
                <div className="t-xs t-muted">de {brl(limit)} de limite</div>
                <div className="cartao-bar">
                  <div className="cartao-bar-fill" style={{ width: `${usedPct}%` }} />
                </div>
              </div>
            </Glass>

            <Glass>
              <SectionHeader title="Próximas faturas" hint={`${cardTransactions.length} compras no cartão selecionado`} />
              <div className="cartao-summary-list">
                <div className="cartao-summary-row">
                  <span className="t-xs t-muted">Limite usado</span>
                  <span className="t-sm">{Math.round(usedPct)}%</span>
                </div>
                <div className="cartao-summary-row">
                  <span className="t-xs t-muted">Limite disponível</span>
                  <span className="t-sm">{brl(Math.max(0, limit - totalInvoice))}</span>
                </div>
                <div className="cartao-summary-row">
                  <span className="t-xs t-muted">Pendentes</span>
                  <span className="t-sm">{cardTransactions.filter(tx => tx.status === 'pendente' || !tx.category_id).length}</span>
                </div>
              </div>
            </Glass>
          </div>

          {cards.length > 1 && (
            <Glass padded={false}>
              <div className="cartao-tabs">
                {cards.map(card => (
                  <button
                    key={card.id}
                    className={`chip-filter ${card.id === selectedCard.id ? 'chip-filter-on' : ''}`}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <Icon name="credit_card" size={14} />
                    {card.name}
                  </button>
                ))}
              </div>
            </Glass>
          )}

          <Glass padded={false}>
            <SectionHeader
              title="Compras da fatura"
              hint={`${formatCurrency(totalInvoice)} em gastos`}
            />
            <div className="cartao-tx-list">
              {cardTransactions.length === 0 ? (
                <div className="empty-state-mini">
                  <Icon name="receipt_long" size={36} style={{ color: 'var(--text-muted-2)' }} />
                  <div className="t-sm t-muted">Nenhuma compra importada para este cartão</div>
                </div>
              ) : cardTransactions.map(tx => {
                const cat = categories.find(category => category.id === tx.category_id)
                return (
                  <div key={tx.id} className="cartao-tx-row">
                    <div className="top-row-icon" style={{ background: (cat?.color ?? '#C084FC') + '20', color: cat?.color ?? '#C084FC' }}>
                      <Icon name={(cat as any)?.icon ?? 'shopping_bag'} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                      <div className="prov-row-meta">
                        <span className="t-xs t-muted">{shortDate(tx.date)}</span>
                        {cat ? <CategoryChip label={cat.name} color={cat.color} /> : <CategoryChip label="" empty />}
                        {tx.installment_current && tx.installment_total && (
                          <span className="t-xs t-muted">parcela {tx.installment_current}/{tx.installment_total}</span>
                        )}
                      </div>
                    </div>
                    <div className="prov-val">{brl(tx.amount)}</div>
                  </div>
                )
              })}
            </div>
          </Glass>
        </>
      )}
    </div>
  )
}
