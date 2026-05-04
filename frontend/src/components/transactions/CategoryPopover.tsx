import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { api } from '../../api/client'
import { toast } from '../ui/Toast'
import type { Category } from '../../api/types'

interface Props {
  categories: Category[]
  currentId?: number
  onSelect: (categoryId: number) => void
  onCreateRule: () => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
  onCategoryCreated?: (cat: Category) => void
  txKeyword?: string  // keyword da transação atual para criar regra automática
}

export function CategoryPopover({ categories, currentId, onSelect, onCreateRule, onClose, anchorRef, onCategoryCreated, txKeyword }: Props) {
  const [busca, setBusca] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Group structure
  const parents = categories.filter(c => !c.parent_id)
  const children = categories.filter(c => !!c.parent_id)

  const [open, setOpen] = useState<Record<number, boolean>>({})
  useEffect(() => {
    if (parents.length === 0) return
    setOpen(prev => {
      const next = { ...prev }
      parents.forEach(p => { if (!(p.id in next)) next[p.id] = true })
      return next
    })
  }, [parents.length])
  const toggle = (id: number) => setOpen(o => ({ ...o, [id]: !o[id] }))

  // T_CAT.1 — busca: se pai bate, inclui também suas subcategorias
  const searching = busca.trim().length > 0
  const q = busca.toLowerCase()
  const flat: Category[] = searching ? (() => {
    const result: Category[] = []
    const seen = new Set<number>()
    categories.forEach(c => {
      if (!c.name.toLowerCase().includes(q)) return
      if (!seen.has(c.id)) { result.push(c); seen.add(c.id) }
      // if it's a parent, pull in its children too
      if (!c.parent_id) {
        children.filter(ch => ch.parent_id === c.id).forEach(ch => {
          if (!seen.has(ch.id)) { result.push(ch); seen.add(ch.id) }
        })
      }
    })
    return result
  })() : []

  // T_CAT.2 — inline form state
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const newInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creating) {
      setNewName(busca)
      // If search matched exactly one parent, pre-select it as parent
      if (flatParents.length === 1) setNewParentId(flatParents[0].id)
      setTimeout(() => newInputRef.current?.focus(), 50)
    }
  }, [creating])

  async function saveNewCategory() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      // 1. Cria categoria
      const created = await api.post<Category>('/categories/', {
        name: newName.trim(),
        parent_id: newParentId ?? null,
        color: null, icon: null, exclude_totals: false,
      })
      // 2. Cria regra ligando keyword da transação à nova categoria
      const keyword = txKeyword ?? newName.trim().split(/\s+/).slice(0, 2).join(' ')
      await api.post('/rules/', {
        keyword, category_id: created.id, person_id: null, origin: null, goal_id: null,
      })
      // 3. Aplica em massa em todas as transações existentes
      const { updated } = await api.post<{ updated: number }>('/rules/apply', {})
      onCategoryCreated?.(created)
      // 4. Seleciona na transação atual e fecha
      onSelect(created.id)
      onClose()
      const sub = updated > 0 ? `+${updated} transação${updated > 1 ? 'ões' : ''} categorizadas automaticamente` : undefined
      toast(`Categoria "${created.name}" criada`, sub)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, anchorRef])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Group search results by parent for display
  const flatParents = flat.filter(c => !c.parent_id)
  const flatOrphans = flat.filter(c => !!c.parent_id && !flatParents.find(p => p.id === c.parent_id))

  return (
    <div ref={popoverRef} className="cat-popover" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
      <div className="cat-popover-search">
        <Icon name="search" size={14} className="t-muted" />
        <input
          autoFocus
          placeholder="Buscar categoria..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setCreating(false) }}
        />
        {busca && (
          <button onMouseDown={e => e.stopPropagation()} onClick={() => { setBusca(''); setCreating(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="cat-popover-body" onMouseDown={e => e.stopPropagation()}>
        {searching ? (
          flat.length > 0 ? (
            // T_CAT.1: pai primeiro, depois suas subs indentadas, depois órfãos
            <>
              {flatParents.map(parent => {
                const subs = flat.filter(c => c.parent_id === parent.id)
                return (
                  <div key={parent.id} className="cat-group" style={{ borderBottom: 'none' }}>
                    <div className="cat-group-header" style={{ cursor: 'default' }}>
                      <span className="cat-popover-dot" style={{ background: parent.color ?? '#888' }} />
                      <span className="cat-group-name">{parent.name}</span>
                      {subs.length > 0 && <span className="t-xs t-muted" style={{ marginLeft: 4 }}>{subs.length} sub</span>}
                    </div>
                    <div className="cat-popover-grid cat-group-subs">
                      <CatItem cat={parent} active={parent.id === currentId} onSelect={() => { onSelect(parent.id); onClose() }} />
                      {subs.map(cat => (
                        <CatItem key={cat.id} cat={cat} active={cat.id === currentId} onSelect={() => { onSelect(cat.id); onClose() }} />
                      ))}
                    </div>
                  </div>
                )
              })}
              {flatOrphans.length > 0 && (
                <div className="cat-popover-grid" style={{ padding: '4px 10px 10px' }}>
                  {flatOrphans.map(cat => (
                    <CatItem key={cat.id} cat={cat} active={cat.id === currentId} onSelect={() => { onSelect(cat.id); onClose() }} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="cat-popover-empty">
              <span>Nenhum resultado para "<strong>{busca}</strong>"</span>
              {!creating && (
                <button className="btn-ghost" style={{ marginTop: 6, fontSize: 12 }} onMouseDown={e => e.stopPropagation()} onClick={() => setCreating(true)}>
                  <Icon name="add" size={14} /> Criar "{busca}"
                </button>
              )}
            </div>
          )
        ) : (
          parents.map(parent => {
            const subs = children.filter(c => c.parent_id === parent.id)
            const isOpen = parent.id in open ? open[parent.id] : true
            const isActive = parent.id === currentId
            return (
              <div key={parent.id} className="cat-group">
                <div className="cat-group-header" onMouseDown={e => e.stopPropagation()} onClick={() => subs.length > 0 ? toggle(parent.id) : (onSelect(parent.id), onClose())}>
                  <span className="cat-popover-dot" style={{ background: parent.color ?? '#888' }} />
                  <span className="cat-group-name">{parent.name}</span>
                  {isActive && <span className="cat-group-active-dot" />}
                  {subs.length > 0
                    ? <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={14} className="t-muted" />
                    : <Icon name="check" size={14} style={{ opacity: isActive ? 1 : 0, color: 'var(--primary-2)' }} />
                  }
                </div>
                {isOpen && subs.length > 0 && (
                  <div className="cat-popover-grid cat-group-subs">
                    {subs.map(cat => (
                      <CatItem key={cat.id} cat={cat} active={cat.id === currentId} onSelect={() => { onSelect(cat.id); onClose() }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* T_CAT.2 — inline create form */}
      {creating && (
        <div className="cat-create-form" onMouseDown={e => e.stopPropagation()}>
          <div className="t-xs t-muted" style={{ marginBottom: 6 }}>NOVA CATEGORIA</div>
          <input
            ref={newInputRef}
            className="cat-create-input"
            placeholder="Nome da categoria"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveNewCategory(); if (e.key === 'Escape') setCreating(false) }}
          />
          <select
            className="cat-create-select"
            value={newParentId ?? ''}
            onChange={e => setNewParentId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Categoria raiz</option>
            {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="cat-create-actions">
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setCreating(false)}>Cancelar</button>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={saveNewCategory} disabled={!newName.trim() || saving}>
              {saving ? 'Salvando...' : 'Criar e selecionar'}
            </button>
          </div>
        </div>
      )}

      <div className="cat-popover-foot" onMouseDown={e => e.stopPropagation()}>
        {!creating && (
          <button className="btn-ghost" onMouseDown={e => e.stopPropagation()} onClick={() => setCreating(true)}>
            <Icon name="add_circle" size={14} />
            Nova categoria
          </button>
        )}
        <button className="btn-ghost" onMouseDown={e => e.stopPropagation()} onClick={() => { onCreateRule(); onClose() }}>
          <Icon name="rule" size={14} />
          Criar regra automática
        </button>
      </div>
    </div>
  )
}

function CatItem({ cat, active, onSelect }: { cat: Category; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={`cat-popover-item${active ? ' cat-popover-item-on' : ''}`}
      onClick={onSelect}
    >
      <span className="cat-popover-dot" style={{ background: cat.color ?? '#888' }} />
      <span>{cat.name}</span>
    </button>
  )
}
