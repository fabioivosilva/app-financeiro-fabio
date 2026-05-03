export function Dashboard() {
  return (
    <div>
      <h1 style={h1}>Dashboard</h1>
      <p style={sub}>Visão geral do ciclo atual e dos próximos meses</p>
      <div style={placeholder}>Em construção (T4.1)</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }
const sub: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }
const placeholder: React.CSSProperties = {
  background: 'var(--glass-bg)',
  border: '1px dashed var(--glass-border)',
  borderRadius: 16, padding: 60, textAlign: 'center', color: 'var(--text-muted)',
}
