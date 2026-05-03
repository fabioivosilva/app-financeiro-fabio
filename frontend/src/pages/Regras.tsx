import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CategoryChip } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { api } from '../api/client'
import { useRegras } from '../hooks/useRegras'

export function Regras() {
  const { rules, categories, persons, loading, error, refetch, deleteRule } = useRegras()
  const [busca, setBusca] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const filtered = rules.filter(r =>
    r.keyword.toLowerCase().includes(busca.toLowerCase())
  )

  async function handleDelete(id: number) {
    setDeleting(id)
    try { await deleteRule(id) }
    finally { setDeleting(null) }
  }

  return (
    <div className="page">
      <PageHeader
        title="Regras"
        subtitle={`${rules.length} regras de categorização automática`}
        right={
          <Button variant="primary" iconLeft="add" onClick={() => setShowNew(true)}>
            Nova Regra
          </Button>
        }
      />

      {/* Busca */}
      <Glass padded={false}>
        <div style={{ padding: '10px 12px' }}>
          <div className="search-wrap">
            <Icon name="search" size={18} className="t-muted" />
            <input
              placeholder="Buscar por palavra-chave..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>
      </Glass>

      {/* Tabela */}
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
          {/* Header */}
          <div style={headerRowStyle}>
            <span style={{ flex: 2, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Palavra-chave</span>
            <span style={{ flex: 2, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Categoria</span>
            <span style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pessoa</span>
            <span style={{ width: 60 }} />
          </div>

          {filtered.length === 0 && (
            <div className="empty-state-mini">
              <Icon name="rule" size={40} style={{ color: 'var(--text-muted-2)' }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>Nenhuma regra encontrada</div>
              <div className="t-sm t-muted">Crie uma regra para categorizar transações automaticamente</div>
            </div>
          )}

          {filtered.map(rule => {
            const cat = categories.find(c => c.id === rule.category_id)
            const person = persons.find(p => p.id === rule.person_id)
            return (
              <div key={rule.id} style={ruleRowStyle}>
                {/* Keyword */}
                <span style={{ flex: 2 }}>
                  <span style={keywordStyle}>{rule.keyword}</span>
                </span>

                {/* Categoria */}
                <span style={{ flex: 2 }}>
                  {cat
                    ? <CategoryChip label={cat.name} color={cat.color} />
                    : <span className="t-xs t-muted">—</span>
                  }
                </span>

                {/* Pessoa */}
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)' }}>
                  {person?.name ?? '—'}
                </span>

                {/* Ações */}
                <span style={{ width: 60, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deleting === rule.id}
                    title="Excluir regra"
                  >
                    <Icon name="delete" size={16} style={{ color: deleting === rule.id ? 'var(--text-muted-2)' : '#F87171' }} />
                  </button>
                </span>
              </div>
            )
          })}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Palavra-chave</label>
        <input
          autoFocus
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="ex: ifood, netflix, uber..."
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Categoria</label>
        <div className="modal-cat-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`inbox-cat ${catId === cat.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setCatId(catId === cat.id ? undefined : cat.id)}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color ?? '#888', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 11 }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Pessoa (opcional)</label>
        <div style={{ display: 'flex', gap: 8 }}>
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

      {err && <div style={{ fontSize: 12, color: '#F87171' }}>{err}</div>}
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headerRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '10px 16px',
  background: 'rgba(0,0,0,0.2)',
  borderBottom: '1px solid rgba(192,132,252,0.06)',
}

const ruleRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 16px',
  borderBottom: '1px solid rgba(192,132,252,0.04)',
  transition: 'background 0.15s',
}

const keywordStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 13,
  padding: '2px 8px',
  borderRadius: 6,
  background: 'rgba(192,132,252,0.08)',
  border: '1px solid rgba(192,132,252,0.12)',
  color: 'var(--primary-2)',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(192,132,252,0.1)',
  borderRadius: 8,
  color: 'var(--text)', font: 'inherit', fontSize: 13, outline: 'none',
}
