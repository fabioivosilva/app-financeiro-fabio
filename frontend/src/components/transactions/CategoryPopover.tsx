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

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(busca.toLowerCase())
  )

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, anchorRef])

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
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
      </div>

      <div className="cat-popover-grid">
        {filtered.map(cat => (
          <button
            key={cat.id}
            className={`cat-popover-item ${cat.id === currentId ? 'cat-popover-item-on' : ''}`}
            onClick={() => { onSelect(cat.id); onClose() }}
          >
            <span className="cat-popover-dot" style={{ background: cat.color ?? '#888' }} />
            <span>{cat.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="cat-popover-empty">
            Nenhuma categoria encontrada
          </div>
        )}
      </div>

      <div className="cat-popover-foot">
        <button
          className="btn-ghost"
          onClick={() => { onCreateRule(); onClose() }}
        >
          <Icon name="rule" size={14} />
          Criar regra automática
        </button>
      </div>
    </div>
  )
}
