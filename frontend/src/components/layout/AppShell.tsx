import { useEffect, useState } from 'react'
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
import { Onboarding } from '../../pages/Onboarding'
import { api } from '../../api/client'

export function AppShell() {
  const [checked, setChecked] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    api.get('/perfil/').then(data => {
      setNeedsOnboarding(data === null || data === undefined)
    }).catch(() => {
      setNeedsOnboarding(false) // se backend offline, não bloquear
    }).finally(() => setChecked(true))
  }, [])

  if (!checked) return null

  if (needsOnboarding) {
    return <Onboarding onDone={() => setNeedsOnboarding(false)} />
  }

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
