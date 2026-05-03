import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { TransacaoRow } from '../components/transactions/TransacaoRow'
import { useTransacoes, groupByDate, formatDate, formatCurrency, isTransactionPending } from '../hooks/useTransacoes'

type Tab = 'todas' | 'pendentes'
type Ordem = 'data-desc' | 'data-asc' | 'valor-desc' | 'valor-asc'
type FiltroValor = null | 'entradas' | 'saidas' | 'grandes'
type FiltroData = null | 'hoje' | '7d' | 'ciclo'
type FiltroStatus = null | 'categorizada' | 'pendente' | 'vinculada'

export function Transacoes() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const [tab, setTab] = useState<Tab>('todas')
  const [busca, setBusca] = useState('')
  const [filtroCat, setFiltroCat] = useState<number | undefined>()
  const [filtroPessoa, setFiltroPessoa] = useState<number | undefined>()
  const [filtroValor, setFiltroValor] = useState<FiltroValor>(null)
  const [filtroData, setFiltroData] = useState<FiltroData>(null)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>(null)
  const [ordem, setOrdem] = useState<Ordem>('data-desc')

  const filters = {
    month, year,
  }

  const { transactions, categories, persons, loading, error, refetch } = useTransacoes(filters)

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (tab === 'pendentes') list = list.filter(isTransactionPending)
    if (filtroCat) list = list.filter(t => t.category_id === filtroCat)
    if (filtroPessoa) list = list.filter(t => t.person_id === filtroPessoa)
    if (filtroValor === 'entradas') list = list.filter(t => t.amount > 0)
    if (filtroValor === 'saidas') list = list.filter(t => t.amount < 0)
    if (filtroValor === 'grandes') list = list.filter(t => Math.abs(t.amount) >= 200)
    if (filtroStatus === 'categorizada') list = list.filter(t => t.category_id && t.status !== 'pendente')
    if (filtroStatus === 'pendente') list = list.filter(isTransactionPending)
    if (filtroStatus === 'vinculada') list = list.filter(t => t.goal_id)
    if (filtroData === 'hoje') list = list.filter(t => t.date === toISODate(new Date()))
    if (filtroData === '7d') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      list = list.filter(t => new Date(t.date + 'T00:00:00') >= cutoff)
    }
    if (busca) list = list.filter(t => t.description.toLowerCase().includes(busca.toLowerCase()))
    if (ordem === 'data-desc') list.sort((a, b) => b.date.localeCompare(a.date))
    if (ordem === 'data-asc') list.sort((a, b) => a.date.localeCompare(b.date))
    if (ordem === 'valor-desc') list.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    if (ordem === 'valor-asc') list.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
    return list
  }, [transactions, tab, filtroCat, filtroPessoa, filtroValor, filtroData, filtroStatus, busca, ordem])

  const grupos = useMemo(() => (
    ordem.startsWith('data') ? groupByDate(filtered) : [['__flat', filtered] as [string, typeof filtered]]
  ), [filtered, ordem])
  const pendentes = transactions.filter(isTransactionPending).length
  const totalGastos = filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const filtrosAtivos = [filtroCat, filtroPessoa, filtroValor, filtroData, filtroStatus].filter(Boolean).length

  return (
    <div className="page page-transacoes">
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

      <Glass padded={false} className="filters-bar">
        <div className="filters-row">
          <div className="search-wrap">
            <Icon name="search" size={18} className="t-muted" />
            <input
              placeholder="Buscar por descrição..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <div className="tab-group">
            <button className={`tab ${tab === 'todas' ? 'tab-active' : ''}`} onClick={() => setTab('todas')}>
              Todas
              <span className="tab-count">{transactions.length}</span>
            </button>
            <button className={`tab ${tab === 'pendentes' ? 'tab-active' : ''}`} onClick={() => setTab('pendentes')}>
              Pendentes
              {pendentes > 0 && <span className="tab-count tab-count-warn">{pendentes}</span>}
            </button>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <FilterDropdown<Ordem>
              icon="sort"
              label="Ordenar"
              value={ordem}
              options={[
                { v: 'data-desc', l: 'Data ↓ (recente primeiro)' },
                { v: 'data-asc', l: 'Data ↑ (antiga primeiro)' },
                { v: 'valor-desc', l: 'Valor ↓ (maior primeiro)' },
                { v: 'valor-asc', l: 'Valor ↑ (menor primeiro)' },
              ]}
              onChange={setOrdem}
              dismissable={false}
            />
            <FilterDropdown<FiltroValor>
              icon="payments"
              label="Valor"
              value={filtroValor}
              options={[
                { v: 'entradas', l: 'Apenas entradas' },
                { v: 'saidas', l: 'Apenas saídas' },
                { v: 'grandes', l: 'Acima de R$ 200' },
              ]}
              onChange={setFiltroValor}
            />
            <FilterDropdown<FiltroData>
              icon="event"
              label="Data"
              value={filtroData}
              options={[
                { v: 'hoje', l: 'Hoje' },
                { v: '7d', l: 'Últimos 7 dias' },
                { v: 'ciclo', l: 'Ciclo atual' },
              ]}
              onChange={setFiltroData}
            />
            <FilterDropdown<FiltroStatus>
              icon="flag"
              label="Status"
              value={filtroStatus}
              options={[
                { v: 'categorizada', l: 'Categorizada' },
                { v: 'pendente', l: 'Pendente' },
                { v: 'vinculada', l: 'Vinculada à meta' },
              ]}
              onChange={setFiltroStatus}
            />
            <FilterDropdown<number | null>
              icon="category"
              label="Categoria"
              value={filtroCat ?? null}
              options={categories.map(cat => ({ v: cat.id, l: cat.name }))}
              onChange={value => setFiltroCat(value ?? undefined)}
            />
            <FilterDropdown<number | null>
              icon="person"
              label="Pessoa"
              value={filtroPessoa ?? null}
              options={persons.map(person => ({ v: person.id, l: person.name }))}
              onChange={value => setFiltroPessoa(value ?? undefined)}
            />

            {filtrosAtivos > 0 && (
              <button className="chip-clear" onClick={() => {
                setFiltroCat(undefined); setFiltroPessoa(undefined); setFiltroValor(null); setFiltroData(null); setFiltroStatus(null)
              }}>
                <Icon name="filter_alt_off" size={14} /> Limpar {filtrosAtivos}
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

      {!loading && !error && filtered.length > 0 && (
        <Glass padded={false}>
          {grupos.map(([dateStr, txs]) => (
            <div key={dateStr} className="day-group">
              {dateStr !== '__flat' && (
                <div className="day-header">
                  <div className="day-label">
                    <span className="t-sm">{formatDate(dateStr)}</span>
                    <span className="t-xs t-muted">· {txs.length} transações</span>
                  </div>
                  <span className="t-xs t-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(txs.reduce((s, t) => s + t.amount, 0))}
                  </span>
                </div>
              )}
              {txs.map(tx => (
                <TransacaoRow key={tx.id} tx={tx} categories={categories} persons={persons} onUpdated={refetch} />
              ))}
            </div>
          ))}
        </Glass>
      )}
    </div>
  )
}

interface FilterOption<T> {
  v: NonNullable<T>
  l: string
}

interface FilterDropdownProps<T> {
  icon: string
  label: string
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
  dismissable?: boolean
}

function FilterDropdown<T>({ icon, label, value, options, onChange, dismissable = true }: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(option => option.v === value)

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (dismissable && value && (event.target as HTMLElement).closest('.chip-x')) {
      onChange(null as T)
      return
    }
    setOpen(value => !value)
  }

  return (
    <div className={`filter-dd ${open ? 'filter-dd-open' : ''}`} ref={ref}>
      <button className={`chip-filter ${value ? 'chip-filter-on' : ''}`} onClick={handleClick}>
        <Icon name={icon} size={14} />
        <span>{selected ? selected.l : label}</span>
        {dismissable && value
          ? <span className="chip-x"><Icon name="close" size={14} /></span>
          : <Icon name="expand_more" size={14} />}
      </button>
      {open && (
        <div className="filter-dd-menu">
          {options.map(option => (
            <button
              key={String(option.v)}
              className={`filter-dd-opt ${option.v === value ? 'filter-dd-opt-on' : ''}`}
              onClick={() => { onChange(option.v as T); setOpen(false) }}
            >
              {option.v === value && <Icon name="check" size={14} />}
              <span style={{ marginLeft: option.v === value ? 0 : 22 }}>{option.l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}
