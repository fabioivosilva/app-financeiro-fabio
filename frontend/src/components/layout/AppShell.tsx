import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MonthSelector, useMonth } from './MonthSelector'
import { Dashboard } from '../../pages/Dashboard'
import { Transacoes } from '../../pages/Transacoes'
import { Importar } from '../../pages/Importar'
import { Regras } from '../../pages/Regras'
import { Metas } from '../../pages/Metas'
import { Cartao } from '../../pages/Cartao'

export function AppShell() {
  const [month, setMonth] = useMonth()

  return (
    <div style={{ display: 'flex', height: '100svh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={headerStyle}>
          <MonthSelector value={month} onChange={setMonth} />
        </header>
        <main style={mainStyle}>
          <Routes>
            <Route path="/"           element={<Dashboard month={month} />} />
            <Route path="/transacoes" element={<Transacoes month={month} />} />
            <Route path="/importar"   element={<Importar />} />
            <Route path="/regras"     element={<Regras />} />
            <Route path="/metas"      element={<Metas />} />
            <Route path="/cartao"     element={<Cartao month={month} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '12px 24px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  background: '#0d0d0d',
}

const mainStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 24,
}
