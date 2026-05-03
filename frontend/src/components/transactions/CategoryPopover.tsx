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
    <div ref={popoverRef} style={popoverStyle}>
      {/* Busca */}
      <div style={searchStyle}>
        <Icon name="search" size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          autoFocus
          placeholder="Buscar categoria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Grid de categorias */}
      <div className="inbox-cat-grid" style={{ padding: '6px 8px' }}>
        {filtered.map(cat => (
          <button
            key={cat.id}
            className={`inbox-cat ${cat.id === currentId ? 'inbox-cat-suggest' : ''}`}
            onClick={() => { onSelect(cat.id); onClose() }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color ?? '#888', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: 12 }}>
            Nenhuma categoria encontrada
          </div>
        )}
      </div>

      {/* Criar regra automática */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(192,132,252,0.08)' }}>
        <button
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
          onClick={() => { onCreateRule(); onClose() }}
        >
          <Icon name="rule" size={14} />
          Criar regra automática
        </button>
      </div>
    </div>
  )
}

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: 50,
  top: 'calc(100% + 6px)',
  left: 0,
  minWidth: 280,
  background: 'rgba(28, 20, 50, 0.98)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(192, 132, 252, 0.18)',
  borderRadius: 10,
  boxShadow: '0 12px 32px -8px rgba(0,0,0,0.5)',
  animation: 'ddOpen 0.12s ease-out',
}

const searchStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  borderBottom: '1px solid rgba(192,132,252,0.08)',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text)',
  font: 'inherit',
  fontSize: 13,
}
