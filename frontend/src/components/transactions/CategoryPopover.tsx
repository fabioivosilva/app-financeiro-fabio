import { useState, useEffect, useRef } from 'react'
import { Icon } from '../ui/Icon'
import type { Category } from '../../api/types'

interface Props {
  categories: Category[]
  currentId?: number
  onSelect: (categoryId: number) => void
  onCreateRule: () => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
}

export function CategoryPopover({ categories, currentId, onSelect, onCreateRule, onClose, anchorRef }: Props) {
  const [busca, setBusca] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)

  // Build group structure: parents first, children grouped under parent
  const parents = categories.filter(c => !c.parent_id)
  const children = categories.filter(c => !!c.parent_id)

  const [open, setOpen] = useState<Record<number, boolean>>({})

  // Populate open state once parents are available
  useEffect(() => {
    if (parents.length === 0) return
    setOpen(prev => {
      const next = { ...prev }
      parents.forEach(p => { if (!(p.id in next)) next[p.id] = true })
      return next
    })
  }, [parents.length])

  const toggle = (id: number) => setOpen(o => ({ ...o, [id]: !o[id] }))

  // When searching: flat filtered list across all children + orphan parents
  const searching = busca.trim().length > 0
  const q = busca.toLowerCase()
  const flat = searching
    ? categories.filter(c => c.name.toLowerCase().includes(q))
    : []

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

  return (
    <div ref={popoverRef} className="cat-popover">
      <div className="cat-popover-search">
        <Icon name="search" size={14} className="t-muted" />
        <input
          autoFocus
          placeholder="Buscar categoria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        {busca && (
          <button onClick={() => setBusca('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="cat-popover-body" onMouseDown={e => e.stopPropagation()}>
        {searching ? (
          flat.length > 0 ? (
            <div className="cat-popover-grid">
              {flat.map(cat => (
                <CatItem key={cat.id} cat={cat} active={cat.id === currentId} onSelect={() => { onSelect(cat.id); onClose() }} />
              ))}
            </div>
          ) : (
            <div className="cat-popover-empty">Nenhuma categoria encontrada</div>
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

      <div className="cat-popover-foot">
        <button className="btn-ghost" onClick={() => { onCreateRule(); onClose() }}>
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
