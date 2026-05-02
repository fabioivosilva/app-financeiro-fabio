export function Metas() {
  return (
    <div>
      <h1 style={h1}>Metas</h1>
      <div style={placeholder}>Em construção (T3.1)</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, marginBottom: 24 }
const placeholder: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px dashed rgba(255,255,255,0.1)',
  borderRadius: 12, padding: 40, textAlign: 'center', color: '#555',
}
