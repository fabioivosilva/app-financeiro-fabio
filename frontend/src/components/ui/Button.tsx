import { Icon } from './Icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'ghost-sm' | 'icon' | 'danger' | 'danger-outline' | 'danger-ghost'
  iconLeft?: string
  iconRight?: string
  children?: React.ReactNode
}

export function Button({
  variant = 'ghost',
  iconLeft,
  iconRight,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const cls = `btn-${variant} ${className}`
  return (
    <button className={cls} {...props}>
      {iconLeft && <Icon name={iconLeft} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
}
