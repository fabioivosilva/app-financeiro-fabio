interface Props {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function PageHeader({ title, subtitle, right }: Props) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>
      {right && <div className="page-header-right">{right}</div>}
    </div>
  )
}

interface SectionProps {
  title: string
  hint?: string
  right?: React.ReactNode
}

export function SectionHeader({ title, hint, right }: SectionProps) {
  return (
    <div className="section-header">
      <div>
        <div className="section-title">{title}</div>
        {hint && <div className="t-xs t-muted">{hint}</div>}
      </div>
      {right}
    </div>
  )
}
