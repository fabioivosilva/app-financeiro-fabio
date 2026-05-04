import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { TransacaoRow } from '../components/transactions/TransacaoRow'
import { CategoryPopover } from '../components/transactions/CategoryPopover'
import { api } from '../api/client'
import type { Category, Person, Rule, Transaction } from '../api/types'
import { useTransacoes, groupByDate, formatDate, formatCurrency, isTransactionPending } from '../hooks/useTransacoes'

type Tab = 'todas' | 'pendentes' | 'inbox'
type Ordem = 'data-desc' | 'data-asc' | 'valor-desc' | 'valor-asc'
type FiltroValor = null | 'entradas' | 'saidas' | 'grandes'
type FiltroData = null | 'hoje' | '7d' | 'ciclo'
type FiltroStatus = null | 'categorizada' | 'pendente' | 'vinculada'

function cycleFromOffset(offset: number | null): { month?: number; year?: number; label: string } {
  if (offset === null) return { label: 'Todas' }
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  return {
    month: d.getMonth() + 1,
    year: d.getFullYear(),
    label: d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', ''),
  }
}

export function Transacoes() {
  const [cycleOffset, setCycleOffset] = useState<number | null>(0)
  const [tab, setTab] = useState<Tab>('todas')
  const [busca, setBusca] = useState('')
  const [filtroCat, setFiltroCat] = useState<number | undefined>()
  const [filtroPessoa, setFiltroPessoa] = useState<number | undefined>()
  const [filtroValor, setFiltroValor] = useState<FiltroValor>(null)
  const [filtroData, setFiltroData] = useState<FiltroData>(null)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>(null)
  const [ordem, setOrdem] = useState<Ordem>('data-desc')

  const cycle = cycleFromOffset(cycleOffset)
  const filters = { month: cycle.month, year: cycle.year }

  const { transactions, categories, persons, rules, loading, error, refetch } = useTransacoes(filters)

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
    if (filtroData === 'ciclo') {
      const today = new Date()
      const m = today.getMonth()
      const y = today.getFullYear()
      const start = new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 27)
      const end = new Date(y, m, 26)
      list = list.filter(t => {
        const d = new Date(t.date + 'T00:00:00')
        return d >= start && d <= end
      })
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
  const pendingTransactions = useMemo(
    () => transactions.filter(isTransactionPending).sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  )
  const pendentes = pendingTransactions.length
  const totalGastos = filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const filtrosAtivos = [filtroCat, filtroPessoa, filtroValor, filtroData, filtroStatus].filter(Boolean).length

  if (tab === 'inbox') {
    return (
      <PendingInbox
        transactions={pendingTransactions}
        categories={categories}
        persons={persons}
        rules={rules}
        loading={loading}
        error={error}
        onClose={() => setTab('todas')}
        onUpdated={refetch}
      />
    )
  }

  return (
    <div className="page page-transacoes">
      <PageHeader
        title="Transações"
        subtitle={`${filtered.length} transações · ${formatCurrency(totalGastos)} em gastos`}
        right={
          pendentes > 0 ? (
            <button className="btn-primary" onClick={() => setTab('inbox')}>
              <Icon name="inbox" size={16} />
              Revisar {pendentes} pendentes
            </button>
          ) : undefined
        }
      />

      <div className="cycle-nav">
        <button className="btn-ghost cycle-nav-arrow" onClick={() => setCycleOffset(o => (o ?? 0) - 1)}>
          <Icon name="chevron_left" size={20} />
        </button>
        <span className="cycle-nav-label">{cycle.label}</span>
        <button
          className="btn-ghost cycle-nav-arrow"
          onClick={() => setCycleOffset(o => o === null ? null : o + 1)}
          disabled={cycleOffset === null || cycleOffset >= 0}
        >
          <Icon name="chevron_right" size={20} />
        </button>
        <button
          className={`chip-filter cycle-nav-todas${cycleOffset === null ? ' chip-filter-on' : ''}`}
          onClick={() => setCycleOffset(null)}
        >
          Todas
        </button>
      </div>

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

interface PendingInboxProps {
  transactions: Transaction[]
  categories: Category[]
  persons: Person[]
  rules: Rule[]
  loading: boolean
  error: string | null
  onClose: () => void
  onUpdated: () => void
}

function PendingInbox({ transactions, categories, persons, rules, loading, error, onClose, onUpdated }: PendingInboxProps) {
  const [doneIds, setDoneIds] = useState<number[]>([])
  const pending = transactions.filter(tx => !doneIds.includes(tx.id))
  const tx = pending[0]
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const pickerAnchorRef = useRef<HTMLButtonElement>(null)
  const reviewed = Math.min(doneIds.length, transactions.length)

  useEffect(() => {
    if (!tx) return
    setSelectedCat(suggestCategory(tx, categories, rules)?.id ?? null)
    setSelectedPerson(tx.person_id ?? null)
    setShowPicker(false)
  }, [tx?.id])

  if (loading) return (
    <div className="page page-inbox">
      <Glass className="inbox-done">
        <Icon name="hourglass_empty" size={40} className="t-muted" />
        <div className="inbox-done-title">Carregando pendentes...</div>
      </Glass>
    </div>
  )

  if (error) return (
    <div className="page page-inbox">
      <Glass className="inbox-done">
        <Icon name="error_outline" size={40} style={{ color: '#F87171' }} />
        <div className="inbox-done-title">Erro ao carregar</div>
        <div className="inbox-done-sub">{error}</div>
        <button className="btn-primary" onClick={onClose}>Voltar</button>
      </Glass>
    </div>
  )

  if (!tx) return (
    <div className="page page-inbox-done">
      <Glass className="inbox-done">
        <div className="inbox-done-icon"><Icon name="task_alt" size={48} /></div>
        <div className="inbox-done-title">Tudo categorizado!</div>
        <div className="inbox-done-sub">{transactions.length} transações revisadas. Dashboard atualizado.</div>
        <button className="btn-primary" onClick={onClose}>Voltar para transações</button>
      </Glass>
    </div>
  )

  const selectedCatObj = categories.find(c => c.id === selectedCat)
  const keyword = ruleKeyword(tx.description)
  const similares = pending.filter(t =>
    t.id !== tx.id && normalizeText(t.description).includes(normalizeText(keyword))
  ).length

  function skip() { setDoneIds(prev => [...prev, tx.id]) }

  async function categorize() {
    if (!selectedCat) return
    setSaving(true)
    try {
      await api.put<Transaction>(`/transactions/${tx.id}`, {
        ...tx, category_id: selectedCat, person_id: selectedPerson, status: 'confirmado',
      })
      await api.post('/rules/', {
        keyword, category_id: selectedCat, person_id: selectedPerson, origin: null, goal_id: null,
      })
      await api.post('/rules/apply', {})
      const similarIds = pending
        .filter(t => t.id !== tx.id && normalizeText(t.description).includes(normalizeText(keyword)))
        .map(t => t.id)
      setDoneIds(prev => [...prev, tx.id, ...similarIds])
      onUpdated()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page page-inbox">
      <div className="inbox-head">
        <button className="btn-ghost" onClick={onClose}>
          <Icon name="arrow_back" size={16} /> Sair
        </button>
        <div className="inbox-progress">
          <div className="t-xs t-muted">REVISANDO</div>
          <div className="inbox-counter">{reviewed + 1} <span className="t-muted">/ {transactions.length}</span></div>
        </div>
        <div className="inbox-bar">
          <div className="inbox-bar-fill" style={{ width: `${(reviewed / transactions.length) * 100}%` }} />
        </div>
      </div>

      <Glass className="inbox-card">
        <div className="inbox-source">
          <Icon name={tx.origin === 'Crédito' ? 'credit_card' : 'upload_file'} size={14} />
          {tx.origin} · {shortDate(tx.date)}
        </div>
        <div className="inbox-desc">{tx.description}</div>
        <div className={`inbox-val ${tx.amount > 0 ? 'tx-val-pos' : ''}`}>
          {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
        </div>

        <div className="inbox-cat-section">
          <div className="t-xs t-muted" style={{ marginBottom: 8 }}>CATEGORIA</div>
          {selectedCatObj ? (
            <div className="inbox-cat-chosen">
              <span className="cat-popover-dot" style={{ background: selectedCatObj.color ?? '#888', width: 10, height: 10 }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedCatObj.name}</span>
              <button
                ref={pickerAnchorRef}
                className="btn-ghost"
                style={{ marginLeft: 'auto', fontSize: 12, padding: '3px 8px' }}
                onClick={() => setShowPicker(v => !v)}
              >
                Trocar <Icon name="expand_more" size={13} />
              </button>
            </div>
          ) : (
            <button
              ref={pickerAnchorRef}
              className="inbox-cat-empty-btn"
              onClick={() => setShowPicker(v => !v)}
            >
              <Icon name="category" size={16} className="t-muted" />
              <span className="t-muted">Escolher categoria...</span>
              <Icon name="expand_more" size={14} className="t-muted" style={{ marginLeft: 'auto' }} />
            </button>
          )}
          {showPicker && (
            <div style={{ position: 'relative' }}>
              <CategoryPopover
                categories={categories}
                currentId={selectedCat ?? undefined}
                onSelect={id => { setSelectedCat(id); setShowPicker(false) }}

                onClose={() => setShowPicker(false)}
                anchorRef={pickerAnchorRef as React.RefObject<HTMLElement>}
              />
            </div>
          )}
        </div>

        <div className="inbox-people">
          <div className="t-xs t-muted">VINCULAR A</div>
          <div className="inbox-people-row">
            {persons.map(person => (
              <button
                key={person.id}
                className={`inbox-person ${selectedPerson === person.id ? 'inbox-cat-suggest' : ''}`}
                onClick={() => setSelectedPerson(p => p === person.id ? null : person.id)}
              >
                <span className="pessoa-avatar" style={avatarStyle(person.id)}>{initials(person.name)}</span>
                {person.name}
              </button>
            ))}
          </div>
        </div>

        <div className="inbox-rule-hint">
          <Icon name="auto_awesome" size={13} style={{ color: '#C084FC' }} />
          <span>
            Regra criada para <strong>"{keyword}"</strong>
            {similares > 0 && <> · <span style={{ color: '#C084FC' }}>+{similares} similar{similares > 1 ? 'es' : ''} categorizad{similares > 1 ? 'as' : 'a'} automaticamente</span></>}
          </span>
        </div>

        <div className="inbox-actions">
          <button className="btn-ghost" onClick={skip} disabled={saving}>
            <Icon name="skip_next" size={16} /> Pular
          </button>
          <button className="btn-primary" onClick={categorize} disabled={!selectedCat || saving}>
            {saving ? 'Salvando...' : similares > 0 ? `Categorizar +${similares + 1}` : 'Categorizar'}
            <Icon name="arrow_forward" size={16} />
          </button>
        </div>
      </Glass>
    </div>
  )
}

function suggestCategory(tx: Transaction, categories: Category[], rules: Rule[]): Category | undefined {
  const text = normalizeText(tx.description)
  const matchedRule = rules.find(r => r.category_id && text.includes(normalizeText(r.keyword)))
  if (matchedRule) return categories.find(cat => cat.id === matchedRule.category_id)
  if (tx.amount > 0) return categories.find(cat => normalizeText(cat.name).includes('salario')) ?? categories.find(cat => normalizeText(cat.name) === 'outros')
  return categories.find(cat => normalizeText(cat.name) === 'outros') ?? categories[0]
}

function ruleKeyword(description: string) {
  return description.trim().split(/\s+/).slice(0, 2).join(' ')
}

function shortDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(year, month - 1, day))
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
}

function avatarStyle(id: number) {
  const colors = ['#820AD1', '#06B6D4', '#C084FC', '#22C55E']
  const color = colors[id % colors.length]
  return { background: `${color}30`, color, border: `1px solid ${color}50` }
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}
