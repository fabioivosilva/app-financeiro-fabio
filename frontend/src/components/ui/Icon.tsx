interface Props {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, className = '', style = {} }: Props) {
  return (
    <span
      className={'material-symbols-outlined ' + className}
      style={{ fontSize: size, lineHeight: 1, ...style }}
    >
      {name}
    </span>
  )
}
