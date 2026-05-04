import { useState, useMemo } from 'react'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { CategoryChip } from '../components/ui/Badge'
import { api } from '../api/client'
import { toast } from '../components/ui/Toast'
import { useProvisoes, type Provision } from '../hooks/useProvisoes'
import type { Category, Person, Rule, Transaction } from '../api/types'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const brlCompact = (v: number) => {
  const a = Math.abs(v)
  if (a >= 1000) return (v / 1000).toFixed(1) + 'k'
  return brl(v)
}
const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

type ProvisionView = Provision & {
  virtual?: boolean
  source?: 'card-installment'
}

function stripInstallmentSuffix(description: string) {
  return description.trim().replace(/\s+\d{1,3}\/\d{1,3}\s*$/, '').trim()
}

function normalizeInstallmentKey(description: string) {
  return stripInstallmentSuffix(description)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()
}

function amountKey(amount: number) {
  return Math.round(Math.abs(amount) * 100)
}

function buildCardInstallmentProvisions(transactions: Transaction[], provisions: Provision[]): ProvisionView[] {
  const groups = new Map<string, Transaction[]>()
  transactions
    .filter(tx => tx.installment_current && tx.installment_total && tx.installment_current < tx.installment_total)
    .forEach(tx => {
      const key = [
        normalizeInstallmentKey(tx.description),
        tx.installment_total,
        amountKey(tx.amount),
        tx.card_id ?? 'sem-cartao',
        tx.person_id ?? 'sem-pessoa',
      ].join('|')
      groups.set(key, [...(groups.get(key) ?? []), tx])
    })

  const existing = new Set(
    provisions
      .filter(p => p.type === 'parcela')
      .map(p => `${normalizeInstallmentKey(p.description)}|${p.installment_current ?? ''}|${p.installment_total ?? ''}|${p.person_id ?? 'sem-pessoa'}|${amountKey(p.amount)}`)
  )

  return Array.from(groups.values()).flatMap((items, index) => {
    const latest = [...items].sort((a, b) =>
      (b.installment_current ?? 0) - (a.installment_current ?? 0) || b.date.localeCompare(a.date) || b.id - a.id
    )[0]
    const maxCurrent = Math.max(...items.map(tx => tx.installment_current ?? 0))
    const total = latest.installment_total ?? 0
    const next = maxCurrent + 1
    if (!total || next > total) return []

    const description = stripInstallmentSuffix(latest.description)
    const existingKey = `${normalizeInstallmentKey(description)}|${next}|${total}|${latest.person_id ?? 'sem-pessoa'}|${amountKey(latest.amount)}`
    if (existing.has(existingKey)) return []

    const day = Math.min(Math.max(Number(latest.date.slice(8, 10)) || 1, 1), 31)
    const avgAmount = items.reduce((sum, tx) => sum + tx.amount, 0) / items.length

    return [{
      id: -100000 - index,
      description,
      amount: -Math.abs(avgAmount),
      day,
      type: 'parcela' as const,
      category_id: latest.category_id,
      person_id: latest.person_id,
      active: true,
      installment_current: next,
      installment_total: total,
      virtual: true,
      source: 'card-installment' as const,
    }]
  })
}

function getMonthInfo(offset: number) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + offset, 1)
}

export function Provisoes() {
  const { provisions, categories, persons, rules, transactions, loading, error, refetch } = useProvisoes()
  const [view, setView] = useState<'timeline' | 'calendario' | 'lista'>('timeline')
  const [selMes, setSelMes] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingProvision, setEditingProvision] = useState<Provision | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [togglingActive, setTogglingActive] = useState<number | null>(null)
  const [importing, setImporting] = useState(false)
  const [reinforcing, setReinforcing] = useState(false)

  async function handleReinforceAuto() {
    setReinforcing(true)
    try {
      const result = await api.post<{ processed: number; provisions_affected: number }>('/provisions/reinforce-auto', {})
      toast(`${result.provisions_affected} provisão(ões) criadas/atualizadas`, `${result.processed} transações verificadas`, result.provisions_affected > 0 ? 'success' : 'info')
      refetch()
    } finally { setReinforcing(false) }
  }

  const projectedInstallments = useMemo(
    () => buildCardInstallmentProvisions(transactions, provisions),
    [transactions, provisions],
  )

  const allProvisions = useMemo<ProvisionView[]>(
    () => [...provisions, ...projectedInstallments],
    [provisions, projectedInstallments],
  )

  const meses = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = getMonthInfo(i)
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
    const items = allProvisions.filter(p => {
      if (!p.active) return false
      if (p.type === 'parcela') return (p.installment_current ?? 1) + i <= (p.installment_total ?? 1)
      return true
    }).map(p => ({
      ...p,
      parcelaLabel: p.type === 'parcela' ? `${(p.installment_current ?? 1) + i}/${p.installment_total}` : null,
    }))
    const compromisso = -items.filter(p => p.amount < 0).reduce((s, p) => s + p.amount, 0)
    const receita = items.filter(p => p.amount > 0).reduce((s, p) => s + p.amount, 0)
    return { label, items, compromisso, receita, total: receita - compromisso, date: d }
  }), [allProvisions])

  async function handleDelete(id: number) {
    setDeleting(id)
    try { await api.delete(`/provisions/${id}`); toast('Provisão removida'); refetch() }
    finally { setDeleting(null) }
  }

  async function handleToggleActive(p: Provision) {
    setTogglingActive(p.id)
    try {
      await api.put(`/provisions/${p.id}`, { ...p, active: !p.active })
      toast(
        !p.active ? `"${p.description}" reativada` : `"${p.description}" desativada`,
        undefined,
        !p.active ? 'success' : 'info',
      )
      refetch()
    } finally { setTogglingActive(null) }
  }

  async function handleImportInstallments() {
    setImporting(true)
    try {
      const result = await api.post<{ created: number; skipped: number }>('/provisions/import-installments', {})
      const sub = result.skipped > 0 ? `${result.skipped} compra${result.skipped > 1 ? 's' : ''} já estava${result.skipped > 1 ? 'm' : ''} provisionada${result.skipped > 1 ? 's' : ''}` : undefined
      toast(`${result.created} provisão${result.created === 1 ? '' : 'es'} criada${result.created === 1 ? '' : 's'}`, sub, result.created > 0 ? 'success' : 'info')
      refetch()
    } finally {
      setImporting(false)
    }
  }

  function openEdit(p: Provision) {
    setEditingProvision(p)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProvision(null)
  }

  const inativas = provisions.filter(p => !p.active).length

  if (loading) return <div className="page"><Glass><div style={{ padding: 40, textAlign: 'center' }}><Icon name="hourglass_empty" size={32} className="t-muted" /></div></Glass></div>
  if (error) return <div className="page"><Glass><div style={{ padding: 20, color: '#F87171' }}>{error}</div></Glass></div>

  return (
    <div className="page page-provisoes">
      <PageHeader
        title="Provisões"
        subtitle="Receitas e despesas recorrentes que ainda vão acontecer"
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-ghost" onClick={handleReinforceAuto} disabled={reinforcing} title="Re-dispara provisão automática em todas as transações categorizadas">
              <Icon name={reinforcing ? 'hourglass_empty' : 'autorenew'} size={14} />
              {reinforcing ? 'Atualizando...' : 'Sincronizar provisões'}
            </button>
            <div className="seg-control">
              <button className={view === 'timeline' ? 'seg-on' : ''} onClick={() => setView('timeline')}>
                <Icon name="timeline" size={16} /> Timeline
              </button>
              <button className={view === 'calendario' ? 'seg-on' : ''} onClick={() => setView('calendario')}>
                <Icon name="calendar_month" size={16} /> Calendário
              </button>
              <button className={view === 'lista' ? 'seg-on' : ''} onClick={() => setView('lista')}>
                <Icon name="list" size={16} /> Lista
              </button>
            </div>
          </div>
        }
      />

      <div className="grid-3">
        <Glass className="stat-card">
          <div className="stat-label">PROVISÕES ATIVAS</div>
          <div className="stat-val">{allProvisions.filter(p => p.active).length}</div>
          <div className="t-xs t-muted">
            {allProvisions.filter(p => p.type === 'parcela').length} parcelas · {projectedInstallments.length} do cartão
            {inativas > 0 && <span style={{ color: 'var(--text-muted)' }}> · {inativas} inativa{inativas > 1 ? 's' : ''}</span>}
          </div>
        </Glass>
        <Glass className="stat-card">
          <div className="stat-label">COMPROMETIDO / MÊS</div>
          <div className="stat-val" style={{ color: '#F472B6' }}>{brl(meses[0]?.compromisso ?? 0)}</div>
          <div className="t-xs t-muted">Soma das despesas recorrentes</div>
        </Glass>
        <Glass className="stat-card">
          <div className="stat-label">RECEITAS ESPERADAS / MÊS</div>
          <div className="stat-val" style={{ color: '#22C55E' }}>{brl(meses[0]?.receita ?? 0)}</div>
          <div className="t-xs t-muted">Salário + recorrentes</div>
        </Glass>
      </div>

      {view === 'timeline' && (
        <TimelineView
          meses={meses} sel={selMes} onSel={setSelMes}
          categories={categories} persons={persons}
          importing={importing} onImport={handleImportInstallments}
          onAdd={() => setShowModal(true)} onEdit={openEdit}
        />
      )}
      {view === 'calendario' && <CalendarView mes={meses[0]} categories={categories} />}
      {view === 'lista' && (
        <ListaView
          provisions={allProvisions} categories={categories} persons={persons}
          deleting={deleting} togglingActive={togglingActive}
          importing={importing} onImport={handleImportInstallments}
          onDelete={handleDelete} onAdd={() => setShowModal(true)}
          onEdit={openEdit} onToggleActive={handleToggleActive}
        />
      )}

      {showModal && (
        <ProvisaoModal
          categories={categories}
          persons={persons}
          rules={rules}
          editing={editingProvision}
          onClose={closeModal}
          onSaved={() => { closeModal(); refetch() }}
        />
      )}
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelineView({ meses, sel, onSel, categories, persons, importing, onImport, onAdd, onEdit }: {
  meses: any[]; sel: number; onSel: (i: number) => void
  categories: Category[]; persons: Person[]; importing: boolean; onImport: () => void
  onAdd: () => void; onEdit: (p: Provision) => void
}) {
  const m = meses[sel]
  const today = new Date().getDate()

  return (
    <>
      <Glass>
        <SectionHeader title="6 meses à frente" hint="Clique em um mês para ver os eventos" />
        <div className="timeline-strip">
          {meses.map((mes, i) => (
            <button key={i} className={`timeline-month${sel === i ? ' timeline-month-on' : ''}`} onClick={() => onSel(i)}>
              <div className="timeline-month-label">{mes.label}</div>
              <div className="timeline-saldo" style={{ color: mes.total >= 0 ? '#22C55E' : '#F472B6' }}>
                {mes.total >= 0 ? '+' : ''}{brlCompact(mes.total)}
              </div>
              {(() => {
                const pct = mes.receita > 0 ? Math.min(100, (mes.compromisso / mes.receita) * 100) : 100
                const color = pct < 70 ? '#22C55E' : pct < 100 ? '#F59E0B' : '#F472B6'
                return (
                  <div className="timeline-commit-bar">
                    <div className="timeline-commit-fill" style={{ width: pct + '%', background: color }} />
                  </div>
                )
              })()}
            </button>
          ))}
        </div>
      </Glass>
      <Glass>
        <SectionHeader
          title={`Eventos em ${m?.label}`}
          hint={`${m?.items.length ?? 0} ocorrências · saldo ${m?.total >= 0 ? '+' : ''}${brl(m?.total ?? 0)}`}
          right={
            <div className="section-actions">
              <button className="btn-ghost" onClick={onImport} disabled={importing}>
                <Icon name={importing ? 'hourglass_empty' : 'credit_card'} size={14} />
                {importing ? 'Importando...' : 'Importar parcelas pendentes'}
              </button>
              <button className="btn-primary" onClick={onAdd}><Icon name="add" size={14} /> Nova provisão</button>
            </div>
          }
        />
        {!m?.items.length ? (
          <div className="empty-state-mini">
            <Icon name="event_available" size={32} style={{ color: 'var(--text-muted-2)' }} />
            <div className="t-sm t-muted">Nenhuma provisão para este mês</div>
          </div>
        ) : (
          <div className="prov-list">
            {[...m.items].sort((a: any, b: any) => a.day - b.day).map((p: any) => {
              const cat = categories.find(c => c.id === p.category_id)
              const person = persons.find(pe => pe.id === p.person_id)
              const done = p.day <= today && sel === 0
              return (
                <div key={p.id + sel} className={`prov-row${done ? ' prov-row-done' : ''}`}>
                  <div className="prov-day">
                    <div className="prov-day-num">{p.day}</div>
                    <div className="prov-day-mes">{m.label.split('/')[0]}</div>
                  </div>
                  <div className="prov-icon" style={{ background: (cat?.color ?? '#888') + '20', color: cat?.color ?? '#888', position: 'relative' }}>
                    <Icon name={(cat as any)?.icon ?? 'event'} size={18} />
                    {(p.type === 'parcela' || p.virtual) && (
                      <span style={{ position: 'absolute', bottom: -3, right: -3, background: 'var(--glass-bg, #1e1a2e)', borderRadius: 4, width: 14, height: 14, display: 'grid', placeItems: 'center' }}>
                        <Icon name="credit_card" size={10} style={{ color: '#64748B' }} />
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-sm">{p.description}{p.parcelaLabel ? ` (${p.parcelaLabel})` : ''}</div>
                    <div className="prov-row-meta">
                      {cat && <CategoryChip label={cat.name} color={cat.color} />}
                      {person && <span className="t-xs t-muted">{person.name}</span>}
                      {p.virtual && <span className="t-xs t-muted">Cartão</span>}
                      <span className="t-xs t-muted">{p.type === 'mensal' ? 'Mensal' : 'Parcela'}</span>
                    </div>
                  </div>
                  <div className={`prov-val${p.amount > 0 ? ' tx-val-pos' : ''}`}>{brl(p.amount)}</div>
                  <div className="prov-status">
                    {done
                      ? <span className="prov-tag prov-tag-done"><Icon name="check_circle" size={14} /> Realizada</span>
                      : !p.virtual && (
                        <button className="btn-ghost btn-ghost-sm" onClick={() => onEdit(p as Provision)}>
                          <Icon name="edit" size={14} /> Editar
                        </button>
                      )
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Glass>
    </>
  )
}

// ─── Calendário ───────────────────────────────────────────────────────────────

function CalendarView({ mes, categories }: { mes: any; categories: Category[] }) {
  if (!mes) return null
  const date: Date = mes.date
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const startDow = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const byDay: Record<number, any[]> = {}
  mes.items.forEach((p: any) => { byDay[p.day] = byDay[p.day] || []; byDay[p.day].push(p) })
  const today = new Date()
  const isCurrentMonth = today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()

  return (
    <Glass>
      <SectionHeader title={mes.label} hint="Eventos recorrentes neste mês" />
      <div className="cal-grid">
        {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="cal-cell cal-cell-empty" />
          const evs = byDay[d] || []
          const isToday = isCurrentMonth && d === today.getDate()
          return (
            <div key={i} className={`cal-cell${isToday ? ' cal-cell-today' : ''}`}>
              <div className="cal-day-num">{d}</div>
              {evs.slice(0, 2).map((p: any) => {
                const cat = categories.find(c => c.id === p.category_id)
                return (
                  <div key={p.id} className="cal-ev" style={{ background: (cat?.color ?? '#888') + '25', borderLeft: `2px solid ${cat?.color ?? '#888'}` }}>
                    <span style={{ color: cat?.color ?? '#888', fontWeight: 600, fontSize: 10 }}>{brlCompact(p.amount)}</span>
                    <span className="t-muted-2" style={{ fontSize: 10 }}>{p.description.split(' ')[0]}</span>
                  </div>
                )
              })}
              {evs.length > 2 && <div className="t-xs t-muted">+{evs.length - 2}</div>}
            </div>
          )
        })}
      </div>
    </Glass>
  )
}

// ─── Lista ────────────────────────────────────────────────────────────────────

function ListaView({ provisions, categories, persons, deleting, togglingActive, importing, onImport, onDelete, onAdd, onEdit, onToggleActive }: {
  provisions: ProvisionView[]; categories: Category[]; persons: Person[]
  deleting: number | null; togglingActive: number | null; importing: boolean
  onImport: () => void; onDelete: (id: number) => void; onAdd: () => void
  onEdit: (p: Provision) => void; onToggleActive: (p: Provision) => void
}) {
  return (
    <Glass padded={false}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(192,132,252,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="t-sm" style={{ fontWeight: 600 }}>Todas as provisões</span>
        <div className="section-actions">
          <button className="btn-ghost" onClick={onImport} disabled={importing}>
            <Icon name={importing ? 'hourglass_empty' : 'credit_card'} size={14} />
            {importing ? 'Importando...' : 'Importar parcelas pendentes'}
          </button>
          <button className="btn-primary" onClick={onAdd}><Icon name="add" size={14} /> Nova provisão</button>
        </div>
      </div>
      <div className="lista-prov">
        <div className="lista-prov-head lista-prov-grid">
          <div>Descrição</div><div>Categoria</div><div>Tipo</div><div>Dia</div><div>Valor</div><div />
        </div>
        {!provisions.length ? (
          <div className="empty-state-mini">
            <Icon name="event_note" size={36} style={{ color: 'var(--text-muted-2)' }} />
            <div className="t-sm t-muted">Nenhuma provisão cadastrada</div>
          </div>
        ) : [...provisions].sort((a, b) => a.day - b.day).map(p => {
          const cat = categories.find(c => c.id === p.category_id)
          const person = persons.find(pe => pe.id === (p as any).person_id)
          const inactive = !p.active
          return (
            <div key={p.id} className="lista-prov-row lista-prov-grid" style={inactive ? { opacity: 0.45 } : undefined}>
              <div className="t-sm">
                {p.description}
                {person ? <span className="t-xs t-muted" style={{ marginLeft: 6 }}>· {person.name}</span> : null}
                {inactive && <span className="t-xs t-muted" style={{ marginLeft: 6 }}>(inativa)</span>}
              </div>
              <div>{cat ? <CategoryChip label={cat.name} color={cat.color} /> : <span className="t-xs t-muted">—</span>}</div>
              <div className="t-xs t-muted" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {p.type === 'parcela' && <Icon name="credit_card" size={11} />}
                {p.type === 'parcela' ? `${p.installment_current}/${p.installment_total}` : 'Mensal'}
              </div>
              <div className="t-xs t-muted">dia {p.day}</div>
              <div className={`t-sm${p.amount > 0 ? ' tx-val-pos' : ''}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(p.amount)}</div>
              <div style={{ display: 'flex', gap: 2 }}>
                {p.virtual ? (
                  <span className="t-xs t-muted"><Icon name="credit_card" size={14} /></span>
                ) : (
                  <>
                    <button className="btn-icon" title="Editar" onClick={() => onEdit(p as Provision)}>
                      <Icon name="edit" size={15} />
                    </button>
                    <button
                      className="btn-icon"
                      title={p.active ? 'Desativar' : 'Reativar'}
                      onClick={() => onToggleActive(p as Provision)}
                      disabled={togglingActive === p.id}
                    >
                      <Icon name={togglingActive === p.id ? 'hourglass_empty' : p.active ? 'pause_circle' : 'play_circle'} size={15} />
                    </button>
                    <button className="btn-icon" title="Excluir" onClick={() => onDelete(p.id)} disabled={deleting === p.id}>
                      <Icon name={deleting === p.id ? 'hourglass_empty' : 'delete_outline'} size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}

// ─── Modal Provisão (criar e editar) ─────────────────────────────────────────

function ProvisaoModal({ categories, persons, rules, editing, onClose, onSaved }: {
  categories: Category[]; persons: Person[]; rules: Rule[]
  editing?: Provision | null
  onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!editing

  const [tipo, setTipo] = useState<'despesa' | 'receita'>(() =>
    editing ? (editing.amount > 0 ? 'receita' : 'despesa') : 'despesa'
  )
  const [recorrencia, setRecorrencia] = useState<'mensal' | 'parcela'>(() =>
    editing ? (editing.type as 'mensal' | 'parcela') : 'mensal'
  )
  const [desc, setDesc] = useState(editing?.description ?? '')
  const [valor, setValor] = useState(editing ? String(Math.abs(editing.amount).toFixed(2)).replace('.', ',') : '')
  const [dia, setDia] = useState(editing?.day ?? 5)
  const [catId, setCatId] = useState<number | null>(editing?.category_id ?? null)
  const [personId, setPersonId] = useState<number | null>(editing?.person_id ?? null)
  const [parcelas, setParcelas] = useState(editing?.installment_total ?? 12)
  const [saving, setSaving] = useState(false)

  // Filtra categorias pelo tipo selecionado
  const catsFiltradas = categories.filter(c => {
    if ((c as any).parent_id) return false
    const t = (c as any).type ?? ''
    if (tipo === 'receita') return t === 'receita'
    return t === 'fixa' || t === 'variavel' || t === ''
  })

  // Limpa categoria selecionada se não estiver na lista filtrada
  const catValida = catsFiltradas.some(c => c.id === catId)

  function handleDescChange(val: string) {
    setDesc(val)
    if (val.length < 3) return
    const norm = normalize(val)
    const matched = rules.find(r => norm.includes(normalize(r.keyword)) || normalize(r.keyword).includes(norm))
    if (matched?.category_id && !catId) setCatId(matched.category_id)
    if (matched?.person_id && !personId) setPersonId(matched.person_id)
  }

  const amount = tipo === 'receita'
    ? Math.abs(parseFloat(valor.replace(',', '.')) || 0)
    : -(Math.abs(parseFloat(valor.replace(',', '.')) || 0))

  async function handleSave() {
    if (!desc || !valor) return
    setSaving(true)
    try {
      const payload = {
        description: desc, amount, day: dia, type: recorrencia,
        category_id: catValida ? catId : null,
        person_id: personId,
        installment_current: recorrencia === 'parcela' ? (editing?.installment_current ?? 1) : null,
        installment_total: recorrencia === 'parcela' ? parcelas : null,
      }
      if (isEdit && editing) {
        await api.put(`/provisions/${editing.id}`, { ...payload, active: editing.active })
        toast(`Provisão "${desc}" atualizada`, undefined, 'success')
      } else {
        await api.post('/provisions/', { ...payload, active: true })
        toast(`Provisão "${desc}" criada`, undefined, 'success')
      }
      onSaved()
    } finally { setSaving(false) }
  }

  const previewCat = catValida ? categories.find(c => c.id === catId) : undefined
  const ruleMatch = desc.length >= 3 ? rules.find(r => normalize(desc).includes(normalize(r.keyword)) || normalize(r.keyword).includes(normalize(desc))) : null

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Editar provisão' : 'Nova provisão'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!desc || !valor || saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar provisão'}
          </Button>
        </>
      }
    >
      <div className="cfg-field">
        <label className="cfg-label">Tipo</label>
        <div className="seg-control" style={{ alignSelf: 'start' }}>
          <button className={tipo === 'despesa' ? 'seg-on' : ''} onClick={() => { setTipo('despesa'); setCatId(null) }}><Icon name="trending_down" size={14} /> Despesa</button>
          <button className={tipo === 'receita' ? 'seg-on' : ''} onClick={() => { setTipo('receita'); setCatId(null) }}><Icon name="trending_up" size={14} /> Receita</button>
        </div>
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Descrição</label>
        <input autoFocus className="cfg-input" placeholder="Netflix, Aluguel, Salário..." value={desc} onChange={e => handleDescChange(e.target.value)} />
        {ruleMatch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11, color: '#C084FC' }}>
            <Icon name="auto_awesome" size={12} />
            Categoria sugerida pela regra "{ruleMatch.keyword}"
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div className="cfg-field" style={{ flex: 1 }}>
          <label className="cfg-label">Valor (R$)</label>
          <input className="cfg-input" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} style={{ fontFamily: 'ui-monospace, monospace' }} />
        </div>
        <div className="cfg-field" style={{ flex: '0 0 90px' }}>
          <label className="cfg-label">Dia do mês</label>
          <input type="number" min={1} max={31} className="cfg-input cfg-input-num" value={dia} onChange={e => setDia(Number(e.target.value))} />
        </div>
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Recorrência</label>
        <div className="seg-control" style={{ alignSelf: 'start' }}>
          <button className={recorrencia === 'mensal' ? 'seg-on' : ''} onClick={() => setRecorrencia('mensal')}><Icon name="event_repeat" size={14} /> Mensal contínua</button>
          <button className={recorrencia === 'parcela' ? 'seg-on' : ''} onClick={() => setRecorrencia('parcela')}><Icon name="format_list_numbered" size={14} /> Parcelada</button>
        </div>
        {recorrencia === 'parcela' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span className="t-sm t-muted">em</span>
            <input type="number" min={2} max={120} className="cfg-input cfg-input-num" value={parcelas} onChange={e => setParcelas(Number(e.target.value))} />
            <span className="t-sm t-muted">parcelas mensais</span>
          </div>
        )}
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Categoria</label>
        <div className="modal-cat-grid">
          {catsFiltradas.map(c => (
            <button key={c.id} className={`inbox-cat${catId === c.id ? ' inbox-cat-suggest' : ''}`} onClick={() => setCatId(catId === c.id ? null : c.id)}>
              <Icon name={(c as any).icon ?? 'label'} size={16} style={{ color: c.color ?? '#888' }} />
              <span>{c.name}</span>
            </button>
          ))}
          {catsFiltradas.length === 0 && (
            <div className="t-xs t-muted">Nenhuma categoria de {tipo} cadastrada.</div>
          )}
        </div>
      </div>

      {persons.length > 0 && (
        <div className="cfg-field">
          <label className="cfg-label">Pessoa (opcional)</label>
          <div className="inbox-people-row">
            {persons.map(p => (
              <button key={p.id} className={`inbox-person${personId === p.id ? ' inbox-cat-suggest' : ''}`} onClick={() => setPersonId(personId === p.id ? null : p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {desc && valor && (
        <div className="modal-preview">
          <div className="t-xs t-muted">PRÉ-VISUALIZAÇÃO</div>
          <div className="modal-preview-row">
            <div className="prov-day"><div className="prov-day-num">{dia}</div><div className="prov-day-mes">de cada mês</div></div>
            <div className="prov-icon" style={{ background: (previewCat?.color ?? '#888') + '20', color: previewCat?.color ?? '#888' }}>
              <Icon name={(previewCat as any)?.icon ?? 'event'} size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="t-sm">{desc}</div>
              <div className="prov-row-meta">
                {previewCat && <CategoryChip label={previewCat.name} color={previewCat.color} />}
                <span className="t-xs t-muted">{recorrencia === 'mensal' ? 'Mensal' : `Parcela 1/${parcelas}`}</span>
              </div>
            </div>
            <div className={`prov-val${tipo === 'receita' ? ' tx-val-pos' : ''}`}>{tipo === 'receita' ? '+' : '-'}R$ {valor}</div>
          </div>
        </div>
      )}
    </Modal>
  )
}
