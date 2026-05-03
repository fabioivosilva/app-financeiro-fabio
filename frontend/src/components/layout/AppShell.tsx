import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Dashboard } from '../../pages/Dashboard'
import { Transacoes } from '../../pages/Transacoes'
import { Importar } from '../../pages/Importar'
import { Regras } from '../../pages/Regras'
import { Metas } from '../../pages/Metas'
import { Cartao } from '../../pages/Cartao'
import { Provisoes } from '../../pages/Provisoes'
import { Config } from '../../pages/Config'

export function AppShell() {
  return (
    <div className="app">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/importar"   element={<Importar />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/cartao"     element={<Cartao />} />
          <Route path="/provisoes"  element={<Provisoes />} />
          <Route path="/metas"      element={<Metas />} />
          <Route path="/regras"     element={<Regras />} />
          <Route path="/config"     element={<Config />} />
        </Routes>
      </main>
    </div>
  )
}
