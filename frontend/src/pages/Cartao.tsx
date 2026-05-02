interface Props { month: { year: number; month: number } }

export function Cartao({ month }: Props) {
  return (
    <div>
      <h1 style={h1}>Cartão</h1>
      <p style={sub}>{month.month + 1}/{month.year}</p>
      <div style={placeholder}>Em construção (T4.2)</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, marginBottom: 4 }
const sub: React.CSSProperties = { color: '#888', fontSize: 14, marginBottom: 24 }
const placeholder: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px dashed rgba(255,255,255,0.1)',
  borderRadius: 12, padding: 40, textAlign: 'center', color: '#555',
}
