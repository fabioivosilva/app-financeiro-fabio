import { Icon } from './Icon'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'warn' | 'success' | 'error' | 'pending'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClass = {
    default:  'cfg-badge',
    warn:     'cfg-badge cfg-badge-warn',
    success:  'cfg-badge cfg-badge-success',
    error:    'cfg-badge cfg-badge-error',
    pending:  'cfg-badge cfg-badge-pending',
  }[variant]
  return <span className={`${variantClass} ${className}`}>{children}</span>
}

interface ChipProps {
  label: string
  color?: string
  icon?: string
  empty?: boolean
}

export function CategoryChip({ label, color, icon, empty }: ChipProps) {
  if (empty) {
    return (
      <span className="cat-chip cat-chip-empty">
        <Icon name="help" size={14} />
        <span>Sem categoria</span>
      </span>
    )
  }
  return (
    <span
      className="cat-chip"
      style={{
        background: color ? color + '1f' : 'rgba(192,132,252,0.12)',
        color: color ?? 'var(--primary-2)',
        border: `1px solid ${color ? color + '40' : 'rgba(192,132,252,0.25)'}`,
      }}
    >
      {icon && <Icon name={icon} size={14} />}
      <span>{label}</span>
    </span>
  )
}

interface NavBadgeProps { count: number }

export function NavBadge({ count }: NavBadgeProps) {
  if (!count) return null
  return <span className="nav-badge">{count}</span>
}
