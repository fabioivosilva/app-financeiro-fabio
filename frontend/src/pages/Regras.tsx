import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CategoryChip } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { api } from '../api/client'
import { useRegras } from '../hooks/useRegras'
import { CATEGORY_ICONS } from '../components/transactions/TransacaoRow'

export function Regras() {
  const { rules, categories, persons, loading, error, refetch, deleteRule } = useRegras()
  const [showNew, setShowNew] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<number | null>(null)

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
          <div className="lista-prov">
            <div className="lista-prov-head lista-regras-grid">
              <div>Quando descrição contém</div>
              <div>Categorizar como</div>
              <div>Aplicada em</div>
              <div />
            </div>

            {rules.length === 0 && (
              <div className="empty-state-mini">
                <Icon name="rule" size={40} style={{ color: 'var(--text-muted-2)' }} />
                <div style={{ fontSize: 14, fontWeight: 500 }}>Nenhuma regra encontrada</div>
                <div className="t-sm t-muted">Crie uma regra para categorizar transações automaticamente</div>
              </div>
            )}

            {rules.map(rule => {
              const cat = categories.find(c => c.id === rule.category_id)
              const person = persons.find(p => p.id === rule.person_id)
              return (
                <div key={rule.id} className="lista-prov-row lista-regras-grid">
                  <div className="t-sm" style={{ fontFamily: 'ui-monospace, monospace' }}>"{rule.keyword}"</div>
                  <div>
                    {cat
                      ? <CategoryChip label={cat.name} color={cat.color} />
                      : <CategoryChip label="" empty />
                    }
                  </div>
                  <div className="t-xs t-muted">{person?.name ?? 'Todas'}</div>
                  <div>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(rule.id)}
                      disabled={deleting === rule.id}
                      title="Excluir regra"
                    >
                      <Icon name={deleting === rule.id ? 'hourglass_empty' : 'more_vert'} size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
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
        <div className="inbox-cat-grid">
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
