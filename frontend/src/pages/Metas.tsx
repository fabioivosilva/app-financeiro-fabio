import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { api } from '../api/client'
import type { Category, Goal } from '../api/types'

type GoalPayload = {
  name: string
  target: number
  current: number
  deadline: string | null
  category_id: number | null
  keyword: string | null
  icon: string | null
}

const goalIcons = ['shield', 'flight', 'laptop_mac', 'savings', 'flag', 'home']
const goalColors = ['#22C55E', '#EC4899', '#06B6D4', '#A855F7', '#F59E0B', '#14B8A6']

export function Metas() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Goal | null>(null)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get<Goal[]>('/goals/'),
      api.get<Category[]>('/categories/'),
    ])
      .then(([goalData, categoryData]) => {
        if (cancelled) return
        setGoals(goalData)
        setCategories(categoryData)
        setError(null)
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar metas') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  const totalGuardado = useMemo(() => goals.reduce((sum, goal) => sum + Number(goal.current || 0), 0), [goals])
  const totalAlvo = useMemo(() => goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0), [goals])

  function refresh() {
    setTick(t => t + 1)
  }

  async function deleteGoal(id: number) {
    await api.delete<void>(`/goals/${id}`)
    setSelected(null)
    refresh()
  }

  return (
    <div className="page page-metas">
      <PageHeader
        title="Metas & Cofrinhos"
        subtitle={`${goals.length} metas · ${brl(totalGuardado)} guardados de ${brl(totalAlvo)}`}
        right={
          <Button variant="primary" iconLeft="add" onClick={() => setShowNew(true)}>
            Nova meta
          </Button>
        }
      />

      {loading && (
        <Glass>
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Icon name="hourglass_empty" size={32} />
          </div>
        </Glass>
      )}

      {error && (
        <Glass>
          <div style={{ padding: 20, color: '#F87171', fontSize: 13 }}>{error}</div>
        </Glass>
      )}

      {!loading && !error && goals.length === 0 && (
        <Glass className="stub-card">
          <div className="stub-icon"><Icon name="flag" size={40} /></div>
          <div className="stub-title">Metas & Cofrinhos</div>
          <div className="stub-sub">Crie uma meta para acompanhar o dinheiro guardado por categoria.</div>
          <Button variant="primary" iconLeft="add" onClick={() => setShowNew(true)}>Nova meta</Button>
        </Glass>
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="grid-3">
          {goals.map((goal, index) => {
            const visual = getGoalVisual(goal, categories, index)
            const pct = percent(goal.current, goal.target)
            return (
              <Glass key={goal.id} className="meta-card meta-card-clickable" onClick={() => setSelected(goal)}>
                <div className="meta-card-icon" style={{ background: visual.color + '25', color: visual.color }}>
                  <Icon name={visual.icon} size={28} />
                </div>
                <div className="meta-card-name">{goal.name}</div>
                <div className="meta-card-val">{brl(goal.current)}</div>
                <div className="meta-card-alvo">de {brl(goal.target)}</div>
                <div className="meta-bar">
                  <div className="meta-fill" style={{ width: pct + '%', background: visual.color }} />
                </div>
                <div className="t-xs t-muted">
                  {Math.round(pct)}% concluído · faltam {brlCompact(Math.max(goal.target - goal.current, 0))}
                </div>
                <div className="meta-card-hint">
                  <Icon name="open_in_full" size={12} /> Ver detalhes
                </div>
              </Glass>
            )
          })}
        </div>
      )}

      {selected && (
        <MetaDetailModal
          goal={selected}
          categories={categories}
          goalIndex={goals.findIndex(goal => goal.id === selected.id)}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected)
            setSelected(null)
          }}
          onDelete={deleteGoal}
          onAported={refresh}
        />
      )}

      <GoalFormModal
        open={showNew}
        title="Nova meta"
        categories={categories}
        onClose={() => setShowNew(false)}
        onSaved={refresh}
      />

      <GoalFormModal
        open={Boolean(editing)}
        title="Editar meta"
        goal={editing ?? undefined}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          setSelected(null)
          refresh()
        }}
      />
    </div>
  )
}

interface DetailProps {
  goal: Goal
  categories: Category[]
  goalIndex: number
  onClose: () => void
  onEdit: () => void
  onAported: () => void
  onDelete: (id: number) => Promise<void>
}

function MetaDetailModal({ goal, categories, goalIndex, onClose, onEdit, onDelete, onAported }: DetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAporte, setShowAporte] = useState(false)
  const [aportes, setAportes] = useState<{ id: number; date: string; amount: number; description: string }[]>([])
  const visual = getGoalVisual(goal, categories, goalIndex)

  useEffect(() => {
    api.get<{ id: number; date: string; amount: number; description: string }[]>(
      `/transactions/?goal_id=${goal.id}`
    ).then(txs => setAportes((txs ?? []).slice(0, 8)))
  }, [goal.id])
  const category = categories.find(cat => cat.id === goal.category_id)
  const pct = percent(goal.current, goal.target)
  const falta = Math.max(goal.target - goal.current, 0)
  const months = monthsUntil(goal.deadline)
  const monthlyNeed = months > 0 ? falta / months : falta

  async function handleDelete() {
    setDeleting(true)
    try { await onDelete(goal.id) }
    finally { setDeleting(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="meta-card-icon" style={{ background: visual.color + '25', color: visual.color, width: 48, height: 48 }}>
              <Icon name={visual.icon} size={24} />
            </div>
            <div>
              <div className="modal-title">{goal.name}</div>
              <div className="t-xs t-muted">{category ? `Categoria · ${category.name}` : 'Meta · cofrinho ativo'}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="meta-detail-hero">
            <div className="meta-detail-row">
              <div>
                <div className="t-xs t-muted">GUARDADO</div>
                <div className="meta-detail-val" style={{ color: visual.color }}>{brl(goal.current)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="t-xs t-muted">META</div>
                <div className="meta-detail-val">{brl(goal.target)}</div>
              </div>
            </div>
            <div className="meta-bar meta-bar-lg">
              <div className="meta-fill" style={{ width: pct + '%', background: visual.color }} />
            </div>
            <div className="meta-detail-row" style={{ marginTop: 4 }}>
              <span className="t-sm" style={{ color: visual.color, fontWeight: 600 }}>{Math.round(pct)}% concluído</span>
              <span className="t-sm t-muted">faltam {brl(falta)}</span>
            </div>
          </div>

          <div className="grid-3">
            <div className="meta-stat">
              <div className="t-xs t-muted">APORTE NECESSÁRIO/MÊS</div>
              <div className="meta-stat-val">{brl(monthlyNeed)}</div>
            </div>
            <div className="meta-stat">
              <div className="t-xs t-muted">PRAZO</div>
              <div className="meta-stat-val">{goal.deadline ? formatDate(goal.deadline) : 'Livre'}</div>
              <div className="t-xs t-muted">{months > 0 ? `${months} meses restantes` : 'sem data definida'}</div>
            </div>
            <div className="meta-stat">
              <div className="t-xs t-muted">REGRA AUTO</div>
              <div className="meta-stat-val" style={{ fontSize: 16 }}>{category?.name ?? 'Sem categoria'}</div>
              <div className="t-xs t-muted">por transações vinculadas</div>
            </div>
          </div>

          {aportes.length > 0 && (
            <div className="meta-historico">
              <div className="t-xs t-muted" style={{ marginBottom: 8 }}>HISTÓRICO DE APORTES</div>
              {aportes.map(a => {
                const [y, m, d] = a.date.split('-').map(Number)
                const mesLabel = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
                return (
                  <div key={a.id} className="meta-aporte-row">
                    <span className="meta-aporte-mes">{mesLabel}</span>
                    <span className="t-xs t-muted" style={{ flex: 1 }}>{a.description}</span>
                    <span className="meta-aporte-val">{brl(a.amount)}</span>
                  </div>
                )
              })}
            </div>
          )}

          <button className="meta-add-aporte" type="button" onClick={() => setShowAporte(true)}>
            <Icon name="add_circle" size={18} />
            <span>Fazer aporte manual</span>
          </button>

          {showAporte && (
            <AporteModal
              goal={goal}
              onClose={() => setShowAporte(false)}
              onSaved={() => {
                setShowAporte(false)
                onAported()
                api.get<{ id: number; date: string; amount: number; description: string }[]>(
                  `/transactions/?goal_id=${goal.id}`
                ).then(txs => setAportes((txs ?? []).slice(0, 8)))
              }}
            />
          )}
        </div>

        <div className="modal-foot modal-foot-split">
          {!confirmDelete ? (
            <>
              <button className="btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
                <Icon name="delete" size={14} /> Excluir
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={onClose}>Fechar</button>
                <button className="btn-primary" onClick={onEdit}>
                  <Icon name="edit" size={14} /> Editar meta
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="t-sm" style={{ color: '#FCA5A5' }}>
                <Icon name="warning" size={14} /> Excluir esta meta?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                  <Icon name="delete_forever" size={14} /> Confirmar exclusão
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface GoalFormProps {
  open: boolean
  title: string
  goal?: Goal
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

const GOAL_ICONS = ['savings', 'home', 'flight', 'shield', 'laptop_mac', 'directions_car', 'school', 'beach_access', 'flag', 'favorite']

function GoalFormModal({ open, title, goal, categories, onClose, onSaved }: GoalFormProps) {
  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(goal?.target ? String(goal.target) : '')
  const [current, setCurrent] = useState(goal?.current ? String(goal.current) : '0')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')
  const [categoryId, setCategoryId] = useState<number | undefined>(goal?.category_id)
  const [icon, setIcon] = useState<string | undefined>((goal as any)?.icon ?? undefined)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(goal?.name ?? '')
    setTarget(goal?.target ? String(goal.target) : '')
    setCurrent(goal?.current ? String(goal.current) : '0')
    setDeadline(goal?.deadline ?? '')
    setIcon((goal as any)?.icon ?? undefined)
    setCategoryId(goal?.category_id)
    setErr(null)
  }, [goal, open])

  async function handleSave() {
    const parsedTarget = toNumber(target)
    const parsedCurrent = toNumber(current)
    if (!name.trim() || parsedTarget <= 0) return

    const payload: GoalPayload = {
      name: name.trim(),
      target: parsedTarget,
      current: parsedCurrent,
      deadline: deadline || null,
      category_id: categoryId ?? null,
      keyword: goal?.keyword ?? null,
      icon: icon ?? null,
    }

    setSaving(true)
    setErr(null)
    try {
      if (goal) await api.put<Goal>(`/goals/${goal.id}`, payload)
      else await api.post<Goal>('/goals/', payload)
      onSaved()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao salvar meta')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim() || toNumber(target) <= 0}>
            {saving ? 'Salvando...' : 'Salvar meta'}
          </Button>
        </>
      }
    >
      <div className="cfg-field">
        <label className="cfg-label">Nome</label>
        <input className="cfg-input" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>

      <div className="grid-2">
        <div className="cfg-field">
          <label className="cfg-label">Objetivo</label>
          <input className="cfg-input" value={target} onChange={e => setTarget(e.target.value)} inputMode="decimal" />
        </div>
        <div className="cfg-field">
          <label className="cfg-label">Valor inicial</label>
          <input className="cfg-input" value={current} onChange={e => setCurrent(e.target.value)} inputMode="decimal" />
        </div>
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Prazo</label>
        <input className="cfg-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Ícone</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GOAL_ICONS.map(ic => (
            <button
              key={ic} type="button"
              onClick={() => setIcon(icon === ic ? undefined : ic)}
              style={{
                width: 38, height: 38, borderRadius: 10, border: '1px solid',
                borderColor: icon === ic ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                background: icon === ic ? 'rgba(130,10,209,0.2)' : 'rgba(255,255,255,0.04)',
                color: icon === ic ? 'var(--primary)' : 'var(--text-muted)',
                display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Icon name={ic} size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Categoria vinculada</label>
        <div className="modal-cat-grid">
          <button
            type="button"
            className={`inbox-cat${!categoryId ? ' inbox-cat-suggest' : ''}`}
            onClick={() => setCategoryId(undefined)}
          >
            <Icon name="label" size={16} />
            <span>Sem categoria</span>
          </button>
          {categories.filter(c => !(c as any).parent_id).map(c => (
            <button
              key={c.id}
              type="button"
              className={`inbox-cat${categoryId === c.id ? ' inbox-cat-suggest' : ''}`}
              onClick={() => setCategoryId(categoryId === c.id ? undefined : c.id)}
            >
              <Icon name={(c as any).icon ?? 'label'} size={16} style={{ color: c.color ?? '#888' }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {err && <div style={{ fontSize: 12, color: '#F87171' }}>{err}</div>}
    </Modal>
  )
}

function getGoalVisual(goal: Goal, categories: Category[], index: number) {
  const category = categories.find(cat => cat.id === goal.category_id)
  return {
    color: category?.color ?? goalColors[Math.max(index, 0) % goalColors.length],
    icon: (goal as any).icon ?? goalIcons[Math.max(index, 0) % goalIcons.length],
  }
}

function percent(current: number, target: number) {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.max(0, (current / target) * 100))
}

function toNumber(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function brl(n: number) {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n || 0)
  return sign + 'R$ ' + abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function brlCompact(n: number) {
  const abs = Math.abs(n || 0)
  if (abs >= 1000) return (n < 0 ? '-' : '') + 'R$ ' + (abs / 1000).toFixed(abs >= 10000 ? 0 : 1) + 'k'
  return brl(n)
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function monthsUntil(value?: string) {
  if (!value) return 0
  const now = new Date()
  const target = new Date(value + 'T00:00:00')
  const months = (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth()
  return Math.max(months, 0)
}

function AporteModal({ goal, onClose, onSaved }: { goal: Goal; onClose: () => void; onSaved: () => void }) {
  const [valor, setValor] = useState('')
  const [desc, setDesc] = useState('Aporte Manual')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const amount = parseFloat(valor.replace(',', '.'))
    if (!amount || amount <= 0) return
    setSaving(true)
    try {
      await api.post(`/goals/${goal.id}/deposit`, { amount, description: desc || 'Aporte Manual', date: data })
      onSaved()
    } finally { setSaving(false) }
  }

  return (
    <Modal open onClose={onClose} title="Registrar aporte"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !valor}>
            {saving ? 'Salvando...' : 'Registrar'}
          </Button>
        </>
      }
    >
      <div className="cfg-field">
        <label className="cfg-label">Valor (R$)</label>
        <input autoFocus className="cfg-input" placeholder="0,00" value={valor}
          onChange={e => setValor(e.target.value)} style={{ fontFamily: 'ui-monospace, monospace' }} />
      </div>
      <div className="cfg-field">
        <label className="cfg-label">Descrição</label>
        <input className="cfg-input" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div className="cfg-field">
        <label className="cfg-label">Data</label>
        <input type="date" className="cfg-input" value={data} onChange={e => setData(e.target.value)} />
      </div>
    </Modal>
  )
}
