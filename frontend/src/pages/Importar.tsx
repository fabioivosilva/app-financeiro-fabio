export function Importar() {
  return (
    <div>
      <h1 style={h1}>Importar Dados</h1>
      <div style={placeholder}>Em construção (T1.2)</div>
    </div>
  )
}

const h1: React.CSSProperties = { fontSize: 22, fontWeight: 700, marginBottom: 24 }
const placeholder: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px dashed rgba(255,255,255,0.1)',
  borderRadius: 12, padding: 40, textAlign: 'center', color: '#555',
}
