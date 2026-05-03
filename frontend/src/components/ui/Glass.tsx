interface Props {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padded?: boolean
  hover?: boolean
  onClick?: () => void
}

export function Glass({ children, className = '', style = {}, padded = true, hover = false, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={[
        'glass',
        padded ? 'p-5' : '',
        hover ? 'glass-hover' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </div>
  )
}
