import { useState, useMemo } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { TransacaoRow } from '../components/transactions/TransacaoRow'
import { useTransacoes, groupByDate, formatDate, formatCurrency } from '../hooks/useTransacoes'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function Transacoes() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [tab, setTab] = useState<'todas' | 'pendentes'>('todas')
  const [busca, setBusca] = useState('')
  const [filtroCat, setFiltroCat] = useState<number | undefined>()
  const [filtroPessoa, setFiltroPessoa] = useState<number | undefined>()

  const filters = {
    month, year,
    status: tab === 'pendentes' ? 'pendente' : undefined,
    category_id: filtroCat,
    person_id: filtroPessoa,
  }

  const { transactions, categories, persons, loading, error, refetch } = useTransacoes(filters)

  const filtered = useMemo(() => {
    if (!busca) return transactions
    return transactions.filter(t =>
      t.description.toLowerCase().includes(busca.toLowerCase())
    )
  }, [transactions, busca])

  const grupos = useMemo(() => groupByDate(filtered), [filtered])
  const pendentes = transactions.filter(t => t.status === 'pendente').length
  const totalGastos = filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="page">
      <PageHeader
        title="Transações"
        subtitle={`${filtered.length} transações · ${formatCurrency(totalGastos)} em gastos`}
        right={
          pendentes > 0 ? (
            <button className="btn-primary" onClick={() => setTab('pendentes')}>
              <Icon name="inbox" size={16} />
              {pendentes} pendentes
            </button>
          ) : undefined
        }
      />

      {/* Filtros */}
      <Glass padded={false} className="filters-bar">
        {/* Linha 1: busca + seletor mês */}
        <div className="filters-row">
          <div className="search-wrap" style={{ flex: 1 }}>
            <Icon name="search" size={18} className="t-muted" />
            <input
              placeholder="Buscar por descrição..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn-icon" onClick={prevMonth}><Icon name="chevron_left" size={18} /></button>
            <span style={{ fontSize: 13, minWidth: 80, textAlign: 'center', fontWeight: 500 }}>
              {MONTHS[month - 1]} {year}
            </span>
            <button className="btn-icon" onClick={nextMonth}><Icon name="chevron_right" size={18} /></button>
          </div>
        </div>

        {/* Linha 2: tabs + chips */}
        <div className="filters-row">
          <div className="tab-group">
            <button className={`tab ${tab === 'todas' ? 'tab-active' : ''}`} onClick={() => setTab('todas')}>
              Todas
              <span className={`tab-count ${pendentes > 0 ? 'tab-count-warn' : ''}`}>{filtered.length}</span>
            </button>
            <button className={`tab ${tab === 'pendentes' ? 'tab-active' : ''}`} onClick={() => setTab('pendentes')}>
              Pendentes
              {pendentes > 0 && <span className="tab-count tab-count-warn">{pendentes}</span>}
            </button>
          </div>

          <div className="filter-group">
            {/* Filtro categoria */}
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                className={`chip-filter ${filtroCat === cat.id ? 'chip-filter-on' : ''}`}
                onClick={() => setFiltroCat(filtroCat === cat.id ? undefined : cat.id)}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color ?? '#888', display: 'inline-block' }} />
                {cat.name}
                {filtroCat === cat.id && (
                  <span className="chip-x"><Icon name="close" size={12} /></span>
                )}
              </button>
            ))}

            {/* Filtro pessoa */}
            {persons.map(p => (
              <button
                key={p.id}
                className={`chip-filter ${filtroPessoa === p.id ? 'chip-filter-on' : ''}`}
                onClick={() => setFiltroPessoa(filtroPessoa === p.id ? undefined : p.id)}
              >
                {p.name}
                {filtroPessoa === p.id && (
                  <span className="chip-x"><Icon name="close" size={12} /></span>
                )}
              </button>
            ))}

            {(filtroCat || filtroPessoa) && (
              <button className="chip-clear" onClick={() => { setFiltroCat(undefined); setFiltroPessoa(undefined) }}>
                <Icon name="filter_list_off" size={12} /> Limpar
              </button>
            )}
          </div>
        </div>
      </Glass>

      {/* Lista */}
      {loading && (
        <Glass>
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Icon name="hourglass_empty" size={32} />
            <div style={{ marginTop: 8, fontSize: 13 }}>Carregando transações...</div>
          </div>
        </Glass>
      )}

      {error && (
        <Glass>
          <div style={{ padding: 40, textAlign: 'center', color: '#F87171' }}>
            <Icon name="error_outline" size={32} />
            <div style={{ marginTop: 8, fontSize: 13 }}>{error}</div>
          </div>
        </Glass>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Glass>
          <div className="empty-state-mini">
            <Icon name="receipt_long" size={48} style={{ color: 'var(--text-muted-2)' }} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>Nenhuma transação encontrada</div>
            <div className="t-sm t-muted">Tente ajustar os filtros ou importe um extrato</div>
          </div>
        </Glass>
      )}

      {!loading && !error && grupos.map(([dateStr, txs]) => (
        <Glass key={dateStr} padded={false} className="day-group">
          <div className="day-header">
            <div className="day-label">
              <span style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(dateStr)}</span>
              <span className="t-xs t-muted">{txs.length} transações</span>
            </div>
            <span className="t-sm t-muted">
              {formatCurrency(txs.reduce((s, t) => s + t.amount, 0))}
            </span>
          </div>
          {txs.map(tx => (
            <TransacaoRow key={tx.id} tx={tx} categories={categories} persons={persons} onUpdated={refetch} />
          ))}
        </Glass>
      ))}
    </div>
  )
}
