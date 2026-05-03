export function Cartao() {
  return (
    <div>
      <h1 style={h1}>Cartão</h1>
      <div style={placeholder}>Em construção (T4.2)</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }
const placeholder: React.CSSProperties = {
  background: 'var(--glass-bg)',
  border: '1px dashed var(--glass-border)',
  borderRadius: 16, padding: 60, textAlign: 'center', color: 'var(--text-muted)',
}
