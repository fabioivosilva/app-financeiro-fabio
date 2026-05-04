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
import type { Category } from '../api/types'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const brlCompact = (v: number) => {
  const a = Math.abs(v)
  if (a >= 1000) return (v / 1000).toFixed(1) + 'k'
  return brl(v)
}

function getMonthLabels() {
  const labels: string[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    labels.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''))
  }
  return labels
}

export function Provisoes() {
  const { provisions, categories, loading, error, refetch } = useProvisoes()
  const [view, setView] = useState<'timeline' | 'lista'>('timeline')
  const [selMes, setSelMes] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const monthLabels = useMemo(getMonthLabels, [])

  const meses = useMemo(() => {
    return monthLabels.map((label, i) => {
      const items = provisions.filter(p => {
        if (!p.active) return false
        if (p.type === 'parcela') {
          const cur = (p.installment_current ?? 1) + i
          return cur <= (p.installment_total ?? 1)
        }
        return true
      }).map(p => ({
        ...p,
        parcelaLabel: p.type === 'parcela'
          ? `${(p.installment_current ?? 1) + i}/${p.installment_total}`
          : null,
      }))
      const compromisso = -items.filter(p => p.amount < 0).reduce((s, p) => s + p.amount, 0)
      const receita = items.filter(p => p.amount > 0).reduce((s, p) => s + p.amount, 0)
      return { label, items, compromisso, receita, total: receita - compromisso }
    })
  }, [provisions, monthLabels])

  async function handleDelete(id: number) {
    setDeleting(id)
    try {
      await api.delete(`/provisions/${id}`)
      toast('Provisão removida')
      refetch()
    } finally { setDeleting(null) }
  }

  if (loading) return (
    <div className="page"><Glass><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><Icon name="hourglass_empty" size={32} /></div></Glass></div>
  )
  if (error) return (
    <div className="page"><Glass><div style={{ padding: 20, color: '#F87171' }}>{error}</div></Glass></div>
  )

  return (
    <div className="page page-provisoes">
      <PageHeader
        title="Provisões"
        subtitle="Receitas e despesas recorrentes que ainda vão acontecer"
        right={
          <div className="seg-control">
            <button className={view === 'timeline' ? 'seg-on' : ''} onClick={() => setView('timeline')}>
              <Icon name="timeline" size={16} /> Timeline
            </button>
            <button className={view === 'lista' ? 'seg-on' : ''} onClick={() => setView('lista')}>
              <Icon name="list" size={16} /> Lista
            </button>
          </div>
        }
      />

      {/* Resumo */}
      <div className="grid-3">
        <Glass className="stat-card">
          <div className="stat-label">PROVISÕES ATIVAS</div>
          <div className="stat-val">{provisions.filter(p => p.active).length}</div>
          <div className="t-xs t-muted">
            {provisions.filter(p => p.type === 'parcela').length} parcelas · {provisions.filter(p => p.type === 'mensal').length} mensais
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
          meses={meses}
          sel={selMes}
          onSel={setSelMes}
          categories={categories}
          onAdd={() => setShowModal(true)}
        />
      )}
      {view === 'lista' && (
        <ListaView
          provisions={provisions}
          categories={categories}
          deleting={deleting}
          onDelete={handleDelete}
          onAdd={() => setShowModal(true)}
        />
      )}

      {showModal && (
        <NovaProvisaoModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); refetch() }}
        />
      )}
    </div>
  )
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function TimelineView({ meses, sel, onSel, categories, onAdd }: {
  meses: any[]; sel: number; onSel: (i: number) => void
  categories: Category[]; onAdd: () => void
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
              <div className="timeline-bars">
                <div className="timeline-bar timeline-bar-out" style={{ height: Math.min(100, (mes.compromisso / 6000) * 100) + '%' }} />
                <div className="timeline-bar timeline-bar-in" style={{ height: Math.min(100, (mes.receita / 10000) * 100) + '%' }} />
              </div>
              <div className="timeline-month-total" style={{ color: mes.total >= 0 ? '#22C55E' : '#F472B6' }}>
                {mes.total >= 0 ? '+' : ''}{brlCompact(mes.total)}
              </div>
            </button>
          ))}
        </div>
      </Glass>

      <Glass>
        <SectionHeader
          title={`Eventos em ${m?.label}`}
          hint={`${m?.items.length ?? 0} ocorrências · saldo ${m?.total >= 0 ? '+' : ''}${brl(m?.total ?? 0)}`}
          right={<button className="btn-primary" onClick={onAdd}><Icon name="add" size={14} /> Nova provisão</button>}
        />
        {m?.items.length === 0 ? (
          <div className="empty-state-mini">
            <Icon name="event_available" size={32} style={{ color: 'var(--text-muted-2)' }} />
            <div className="t-sm t-muted">Nenhuma provisão para este mês</div>
          </div>
        ) : (
          <div className="prov-list">
            {[...m.items].sort((a: any, b: any) => a.day - b.day).map((p: any) => {
              const cat = categories.find(c => c.id === p.category_id)
              const done = p.day <= today && sel === 0
              return (
                <div key={p.id + sel} className={`prov-row${done ? ' prov-row-done' : ''}`}>
                  <div className="prov-day">
                    <div className="prov-day-num">{p.day}</div>
                    <div className="prov-day-mes">{m.label.split('/')[0]}</div>
                  </div>
                  <div className="prov-icon" style={{ background: (cat?.color ?? '#888') + '20', color: cat?.color ?? '#888' }}>
                    <Icon name={(cat as any)?.icon ?? 'event'} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-sm">{p.description}{p.parcelaLabel ? ` (${p.parcelaLabel})` : ''}</div>
                    <div className="prov-row-meta">
                      {cat && <CategoryChip label={cat.name} color={cat.color} />}
                      <span className="t-xs t-muted">{p.type === 'mensal' ? 'Mensal' : 'Parcela'}</span>
                    </div>
                  </div>
                  <div className={`prov-val${p.amount > 0 ? ' tx-val-pos' : ''}`}>{brl(p.amount)}</div>
                  <div className="prov-status">
                    {done
                      ? <span className="prov-tag prov-tag-done"><Icon name="check_circle" size={14} /> Realizada</span>
                      : <span className="t-xs t-muted">pendente</span>
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

// ─── Lista ────────────────────────────────────────────────────────────────────

function ListaView({ provisions, categories, deleting, onDelete, onAdd }: {
  provisions: Provision[]; categories: Category[]
  deleting: number | null; onDelete: (id: number) => void; onAdd: () => void
}) {
  return (
    <Glass padded={false}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(192,132,252,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="t-sm" style={{ fontWeight: 600 }}>Todas as provisões</span>
        <button className="btn-primary" onClick={onAdd}><Icon name="add" size={14} /> Nova provisão</button>
      </div>
      <div className="lista-prov">
        <div className="lista-prov-head lista-prov-grid">
          <div>Descrição</div><div>Categoria</div><div>Tipo</div><div>Dia</div><div>Valor</div><div />
        </div>
        {provisions.length === 0 ? (
          <div className="empty-state-mini">
            <Icon name="event_note" size={36} style={{ color: 'var(--text-muted-2)' }} />
            <div className="t-sm t-muted">Nenhuma provisão cadastrada</div>
          </div>
        ) : provisions.map(p => {
          const cat = categories.find(c => c.id === p.category_id)
          return (
            <div key={p.id} className="lista-prov-row lista-prov-grid">
              <div className="t-sm">{p.description}</div>
              <div>{cat ? <CategoryChip label={cat.name} color={cat.color} /> : <span className="t-xs t-muted">—</span>}</div>
              <div className="t-xs t-muted">
                {p.type === 'parcela' ? `Parcela ${p.installment_current}/${p.installment_total}` : 'Mensal'}
              </div>
              <div className="t-xs t-muted">dia {p.day}</div>
              <div className={`t-sm${p.amount > 0 ? ' tx-val-pos' : ''}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(p.amount)}</div>
              <div>
                <button className="btn-icon" onClick={() => onDelete(p.id)} disabled={deleting === p.id}>
                  <Icon name={deleting === p.id ? 'hourglass_empty' : 'delete_outline'} size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}

// ─── Modal Nova Provisão ──────────────────────────────────────────────────────

function NovaProvisaoModal({ categories, onClose, onSaved }: {
  categories: Category[]; onClose: () => void; onSaved: () => void
}) {
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa')
  const [recorrencia, setRecorrencia] = useState<'mensal' | 'parcela'>('mensal')
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [dia, setDia] = useState(5)
  const [catId, setCatId] = useState<number | null>(null)
  const [parcelas, setParcelas] = useState(12)
  const [saving, setSaving] = useState(false)

  const amount = tipo === 'receita'
    ? Math.abs(parseFloat(valor.replace(',', '.')) || 0)
    : -(Math.abs(parseFloat(valor.replace(',', '.')) || 0))

  async function handleSave() {
    if (!desc || !valor) return
    setSaving(true)
    try {
      await api.post('/provisions/', {
        description: desc,
        amount,
        day: dia,
        type: recorrencia,
        category_id: catId,
        active: true,
        installment_current: recorrencia === 'parcela' ? 1 : null,
        installment_total: recorrencia === 'parcela' ? parcelas : null,
      })
      toast(`Provisão "${desc}" criada`)
      onSaved()
    } finally { setSaving(false) }
  }

  const previewCat = categories.find(c => c.id === catId)

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova provisão"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!desc || !valor || saving}>
            {saving ? 'Salvando...' : 'Criar provisão'}
          </Button>
        </>
      }
    >
      {/* Tipo */}
      <div className="cfg-field">
        <label className="cfg-label">Tipo</label>
        <div className="seg-control" style={{ alignSelf: 'start' }}>
          <button className={tipo === 'despesa' ? 'seg-on' : ''} onClick={() => setTipo('despesa')}>
            <Icon name="trending_down" size={14} /> Despesa
          </button>
          <button className={tipo === 'receita' ? 'seg-on' : ''} onClick={() => setTipo('receita')}>
            <Icon name="trending_up" size={14} /> Receita
          </button>
        </div>
      </div>

      {/* Descrição */}
      <div className="cfg-field">
        <label className="cfg-label">Descrição</label>
        <input autoFocus className="cfg-input" placeholder="Netflix, Aluguel, Salário..." value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      {/* Valor + Dia */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="cfg-field" style={{ flex: 1 }}>
          <label className="cfg-label">Valor (R$)</label>
          <input className="cfg-input" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} style={{ fontFamily: 'ui-monospace, monospace' }} />
        </div>
        <div className="cfg-field" style={{ flex: '0 0 90px' }}>
          <label className="cfg-label">Dia do mês</label>
          <input type="number" min={1} max={28} className="cfg-input cfg-input-num" value={dia} onChange={e => setDia(Number(e.target.value))} />
        </div>
      </div>

      {/* Recorrência */}
      <div className="cfg-field">
        <label className="cfg-label">Recorrência</label>
        <div className="seg-control" style={{ alignSelf: 'start' }}>
          <button className={recorrencia === 'mensal' ? 'seg-on' : ''} onClick={() => setRecorrencia('mensal')}>
            <Icon name="event_repeat" size={14} /> Mensal contínua
          </button>
          <button className={recorrencia === 'parcela' ? 'seg-on' : ''} onClick={() => setRecorrencia('parcela')}>
            <Icon name="format_list_numbered" size={14} /> Parcelada
          </button>
        </div>
        {recorrencia === 'parcela' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span className="t-sm t-muted">em</span>
            <input type="number" min={2} max={120} className="cfg-input cfg-input-num" value={parcelas} onChange={e => setParcelas(Number(e.target.value))} />
            <span className="t-sm t-muted">parcelas mensais</span>
          </div>
        )}
      </div>

      {/* Categoria */}
      <div className="cfg-field">
        <label className="cfg-label">Categoria</label>
        <div className="inbox-cat-grid">
          {categories.filter(c => !c.parent_id).map(c => (
            <button key={c.id} className={`inbox-cat${catId === c.id ? ' inbox-cat-suggest' : ''}`} onClick={() => setCatId(catId === c.id ? null : c.id)}>
              <Icon name={(c as any).icon ?? 'label'} size={16} style={{ color: c.color ?? '#888' }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {desc && valor && (
        <div className="modal-preview">
          <div className="t-xs t-muted">PRÉ-VISUALIZAÇÃO</div>
          <div className="modal-preview-row">
            <div className="prov-day">
              <div className="prov-day-num">{dia}</div>
              <div className="prov-day-mes">de cada mês</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="t-sm">{desc}</div>
              <div className="prov-row-meta">
                {previewCat && <CategoryChip label={previewCat.name} color={previewCat.color} />}
                <span className="t-xs t-muted">{recorrencia === 'mensal' ? 'Mensal' : `Parcela 1/${parcelas}`}</span>
              </div>
            </div>
            <div className={`prov-val${tipo === 'receita' ? ' tx-val-pos' : ''}`}>
              {tipo === 'receita' ? '+' : '-'}R$ {valor || '0,00'}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
