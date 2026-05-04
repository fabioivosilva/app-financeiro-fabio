import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'

type ToastType = 'success' | 'info' | 'error'

interface ToastItem {
  id: number
  message: string
  sub?: string
  type: ToastType
}

// Global emitter
let _emit: ((msg: string, sub?: string, type?: ToastType) => void) | null = null

export function toast(message: string, sub?: string, type: ToastType = 'success') {
  _emit?.(message, sub, type)
}

const ICONS: Record<ToastType, string> = {
  success: 'task_alt',
  info: 'info',
  error: 'error_outline',
}
const COLORS: Record<ToastType, string> = {
  success: '#22C55E',
  info: '#C084FC',
  error: '#F87171',
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  let counter = 0

  const emit = useCallback((message: string, sub?: string, type: ToastType = 'success') => {
    const id = ++counter
    setToasts(prev => [...prev, { id, message, sub, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  useEffect(() => {
    _emit = emit
    return () => { _emit = null }
  }, [emit])

  if (toasts.length === 0) return null

  return createPortal(
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="toast-item">
          <div className="toast-icon" style={{ color: COLORS[t.type] }}>
            <Icon name={ICONS[t.type]} size={18} />
          </div>
          <div className="toast-body">
            <div className="toast-msg">{t.message}</div>
            {t.sub && <div className="toast-sub">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}
