import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { api } from '../../api/client'
import type { Category, Person } from '../../api/types'

interface Props {
  open: boolean
  onClose: () => void
  description: string
  categoryId?: number
  categories: Category[]
  persons: Person[]
}

export function RuleModal({ open, onClose, description, categoryId, categories, persons }: Props) {
  // Extrai keyword sugerida: primeira palavra relevante da descrição
  const suggestedKeyword = description.split(/[\s*]+/)[0].toLowerCase()
  const [keyword, setKeyword] = useState(suggestedKeyword)
  const [selectedCat, setSelectedCat] = useState<number | undefined>(categoryId)
  const [selectedPerson, setSelectedPerson] = useState<number | undefined>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!keyword.trim()) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/rules/', {
        keyword: keyword.trim().toLowerCase(),
        category_id: selectedCat ?? null,
        person_id: selectedPerson ?? null,
        origin: null,
        goal_id: null,
      })
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 1200)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar regra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar regra automática"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !keyword.trim()}>
            {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Criar regra'}
          </Button>
        </>
      }
    >
      {/* Preview da descrição */}
      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', fontFamily: 'ui-monospace, monospace', fontSize: 13, color: 'var(--text-muted)' }}>
        {description}
      </div>

      {/* Keyword */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          Quando descrição contiver
        </label>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="ex: ifood, uber, amazon..."
          style={inputStyle}
        />
      </div>

      {/* Categoria */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          Classificar como categoria
        </label>
        <div className="modal-cat-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`inbox-cat ${selectedCat === cat.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setSelectedCat(selectedCat === cat.id ? undefined : cat.id)}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color ?? '#888', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 11 }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pessoa (opcional) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          Pessoa (opcional)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {persons.map(p => (
            <button
              key={p.id}
              className={`inbox-person ${selectedPerson === p.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setSelectedPerson(selectedPerson === p.id ? undefined : p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: '#F87171', padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
          {error}
        </div>
      )}
    </Modal>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(192,132,252,0.1)',
  borderRadius: 8,
  color: 'var(--text)',
  font: 'inherit',
  fontSize: 13,
  outline: 'none',
}
