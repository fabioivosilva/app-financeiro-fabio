import { useEffect } from 'react'
import { Icon } from './Icon'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'default' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'default' }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <Button variant="icon" onClick={onClose}>
            <Icon name="close" size={20} />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
