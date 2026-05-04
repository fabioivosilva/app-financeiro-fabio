import { useState, useRef } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CategoryChip } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { api } from '../api/client'
import { toast } from '../components/ui/Toast'
import { useRegras } from '../hooks/useRegras'
import { CATEGORY_ICONS } from '../components/transactions/TransacaoRow'

export function Regras() {
  const { rules, categories, persons, loading, error, refetch, deleteRule } = useRegras()
  const [showNew, setShowNew] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<number | null>(null)
  const [busca, setBusca] = useState('')

  async function handleDelete(id: number) {
    setDeleting(id)
    try { await deleteRule(id) }
    finally { setDeleting(null) }
  }

  async function handleApply() {
    setApplying(true)
    setApplyResult(null)
    try {
      const res = await api.post<{ updated: number }>('/rules/apply', {})
      setApplyResult(res.updated)
      refetch()
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="page page-regras">
      <PageHeader
        title="Regras de categorização"
        subtitle="Quando uma transação contém o keyword, ela é auto-categorizada"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {applyResult !== null && (
              <span className="t-xs t-muted">
                <Icon name="check_circle" size={13} style={{ color: '#22C55E', verticalAlign: 'middle' }} />
                {' '}{applyResult} categorizadas
              </span>
            )}
            <Button variant="ghost" iconLeft="rule" onClick={handleApply} disabled={applying}>
              {applying ? 'Aplicando...' : 'Aplicar regras'}
            </Button>
            <Button variant="primary" iconLeft="add" onClick={() => setShowNew(true)}>
              Nova regra
            </Button>
          </div>
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

      {!loading && !error && (
        <Glass padded={false}>
          {/* Busca */}
          <div className="regras-search">
            <Icon name="search" size={15} className="t-muted" />
            <input
              placeholder="Buscar por keyword ou categoria..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {busca && (
              <button onClick={() => setBusca('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>
                <Icon name="close" size={14} />
              </button>
            )}
            <span className="t-xs t-muted" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {rules.length} regra{rules.length !== 1 ? 's' : ''}
            </span>
          </div>

          {rules.length === 0 ? (
            <div className="empty-state-mini">
              <Icon name="rule" size={40} style={{ color: 'var(--text-muted-2)' }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>Nenhuma regra encontrada</div>
              <div className="t-sm t-muted">Crie uma regra para categorizar transações automaticamente</div>
            </div>
          ) : (() => {
            const q = busca.toLowerCase()
            const filtered = busca
              ? rules.filter(r => {
                  const cat = categories.find(c => c.id === r.category_id)
                  return r.keyword.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q)
                })
              : rules

            if (filtered.length === 0) return (
              <div className="empty-state-mini">
                <Icon name="search_off" size={32} style={{ color: 'var(--text-muted-2)' }} />
                <div className="t-sm t-muted">Nenhuma regra para "{busca}"</div>
              </div>
            )

            // Group by parent category (if subcategory, use parent)
            const groups: { catId: number | null; catName: string; color?: string; rules: typeof rules }[] = []
            const seen = new Set<number | null>()
            filtered.forEach(r => {
              const cat = categories.find(c => c.id === r.category_id)
              const parent = cat?.parent_id ? categories.find(c => c.id === cat.parent_id) : null
              const groupCat = parent ?? cat
              const key = groupCat?.id ?? null
              if (!seen.has(key)) {
                seen.add(key)
                groups.push({ catId: key, catName: groupCat?.name ?? 'Sem categoria', color: groupCat?.color, rules: [] })
              }
              groups.find(g => g.catId === key)!.rules.push(r)
            })
            groups.sort((a, b) => a.catName.localeCompare(b.catName))

            return (
              <div className="lista-prov">
                <div className="lista-prov-head lista-regras-grid">
                  <div>Keyword</div>
                  <div>Categoria</div>
                  <div>Pessoa</div>
                  <div />
                </div>
                {groups.map(g => (
                  <div key={g.catId ?? 'null'}>
                    <div className="regras-group-header">
                      <span className="cat-popover-dot" style={{ background: g.color ?? '#666' }} />
                      <span>{g.catName}</span>
                      <span className="t-xs t-muted">{g.rules.length} regra{g.rules.length !== 1 ? 's' : ''}</span>
                    </div>
                    {g.rules.map(rule => {
                      const cat = categories.find(c => c.id === rule.category_id)
                      const person = persons.find(p => p.id === rule.person_id)
                      return editing === rule.id ? (
                        <EditRuleRow
                          key={rule.id}
                          rule={rule}
                          categories={categories}
                          persons={persons}
                          onSaved={() => { setEditing(null); refetch() }}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <div key={rule.id} className="lista-prov-row lista-regras-grid">
                          <div className="t-sm" style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text)' }}>"{rule.keyword}"</div>
                          <div>{cat ? <CategoryChip label={cat.name} color={cat.color} /> : <CategoryChip label="" empty />}</div>
                          <div className="t-xs t-muted">{person?.name ?? 'Todas'}</div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-icon" onClick={() => setEditing(rule.id)} title="Editar">
                              <Icon name="edit" size={15} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDelete(rule.id)} disabled={deleting === rule.id} title="Excluir">
                              <Icon name={deleting === rule.id ? 'hourglass_empty' : 'delete_outline'} size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })()}
        </Glass>
      )}

      {/* Modal nova regra */}
      <NewRuleModal
        open={showNew}
        onClose={() => setShowNew(false)}
        categories={categories}
        persons={persons}
        onSaved={refetch}
      />
    </div>
  )
}

// ─── New Rule Modal ────────────────────────────────────────────────────────────

interface NewRuleModalProps {
  open: boolean
  onClose: () => void
  categories: ReturnType<typeof useRegras>['categories']
  persons: ReturnType<typeof useRegras>['persons']
  onSaved: () => void
}

function NewRuleModal({ open, onClose, categories, persons, onSaved }: NewRuleModalProps) {
  const [keyword, setKeyword] = useState('')
  const [catId, setCatId] = useState<number | undefined>()
  const [personId, setPersonId] = useState<number | undefined>()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSave() {
    if (!keyword.trim()) return
    setSaving(true); setErr(null)
    try {
      await api.post('/rules/', { keyword: keyword.trim().toLowerCase(), category_id: catId ?? null, person_id: personId ?? null, origin: null, goal_id: null })
      setKeyword(''); setCatId(undefined); setPersonId(undefined)
      onSaved(); onClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Regra"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !keyword.trim()}>
            {saving ? 'Salvando...' : 'Criar regra'}
          </Button>
        </>
      }
    >
      <div className="cfg-field">
        <label className="cfg-label">Palavra-chave</label>
        <input
          autoFocus
          className="cfg-input"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="ex: ifood, netflix, uber..."
        />
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Categoria</label>
        <div className="modal-cat-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`inbox-cat ${catId === cat.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setCatId(catId === cat.id ? undefined : cat.id)}
            >
              <Icon name={CATEGORY_ICONS[cat.name] ?? 'label'} size={16} style={{ color: cat.color ?? '#888' }} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Pessoa (opcional)</label>
        <div className="inbox-people-row">
          {persons.map(p => (
            <button
              key={p.id}
              className={`inbox-person ${personId === p.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setPersonId(personId === p.id ? undefined : p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {err && <div className="modal-error">{err}</div>}
    </Modal>
  )
}

// ─── Edit Rule Row ─────────────────────────────────────────────────────────────

interface EditRuleRowProps {
  rule: ReturnType<typeof useRegras>['rules'][0]
  categories: ReturnType<typeof useRegras>['categories']
  persons: ReturnType<typeof useRegras>['persons']
  onSaved: () => void
  onCancel: () => void
}

function EditRuleRow({ rule, categories, persons, onSaved, onCancel }: EditRuleRowProps) {
  const [keyword, setKeyword] = useState(rule.keyword)
  const [catId, setCatId] = useState<number | undefined>(rule.category_id ?? undefined)
  const [personId, setPersonId] = useState<number | undefined>(rule.person_id ?? undefined)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function save() {
    if (!keyword.trim()) return
    setSaving(true)
    try {
      await api.put(`/rules/${rule.id}`, { keyword: keyword.trim(), category_id: catId ?? null, person_id: personId ?? null, origin: null, goal_id: null })
      const { updated } = await api.post<{ updated: number }>('/rules/apply', {})
      toast('Regra atualizada', updated > 0 ? `+${updated} transação${updated > 1 ? 'ões' : ''} recategorizadas` : undefined)
      onSaved()
    } finally { setSaving(false) }
  }

  return (
    <div className="lista-prov-row regra-edit-row">
      <input
        ref={inputRef}
        autoFocus
        className="regra-edit-input"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
      />
      <select className="regra-edit-select" value={catId ?? ''} onChange={e => setCatId(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">Sem categoria</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className="regra-edit-select" value={personId ?? ''} onChange={e => setPersonId(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">Todas</option>
        {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn-icon" onClick={save} disabled={saving} title="Salvar" style={{ color: '#22C55E' }}>
          <Icon name={saving ? 'hourglass_empty' : 'check'} size={16} />
        </button>
        <button className="btn-icon" onClick={onCancel} title="Cancelar">
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  )
}
