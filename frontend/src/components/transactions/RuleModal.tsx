import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { api } from '../../api/client'
import type { Category, Person } from '../../api/types'
import { CATEGORY_ICONS } from './TransacaoRow'

interface Props {
  open: boolean
  onClose: () => void
  description: string
  categoryId?: number
  categories: Category[]
  persons: Person[]
}

export function RuleModal({ open, onClose, description, categoryId, categories, persons }: Props) {
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
      <div className="modal-prefix">{description}</div>

      <div className="cfg-field">
        <label className="cfg-label">Quando descrição contiver</label>
        <input
          className="cfg-input"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="ex: ifood, uber, amazon..."
        />
      </div>

      <div className="cfg-field">
        <label className="cfg-label">Classificar como categoria</label>
        <div className="inbox-cat-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`inbox-cat ${selectedCat === cat.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setSelectedCat(selectedCat === cat.id ? undefined : cat.id)}
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
              className={`inbox-person ${selectedPerson === p.id ? 'inbox-cat-suggest' : ''}`}
              onClick={() => setSelectedPerson(selectedPerson === p.id ? undefined : p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="modal-error">{error}</div>
      )}
    </Modal>
  )
}
