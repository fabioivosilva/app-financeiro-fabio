import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',           label: 'Dashboard',      icon: 'dashboard' },
  { to: '/importar',   label: 'Importar',       icon: 'upload_file' },
  { to: '/transacoes', label: 'Transações',     icon: 'receipt_long' },
  { to: '/cartao',     label: 'Cartão',         icon: 'credit_card' },
  { to: '/provisoes',  label: 'Provisões',      icon: 'event_repeat' },
  { to: '/metas',      label: 'Metas',          icon: 'flag' },
  { to: '/regras',     label: 'Regras',         icon: 'rule' },
  { to: '/config',     label: 'Configurações',  icon: 'settings' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_balance_wallet</span>
        </div>
        <div>
          <div className="brand-name">Fabio</div>
          <div className="brand-sub">Financeiro</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="local-chip">
          <div className="local-dot" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-xs t-muted">DADOS LOCAIS</div>
            <div className="t-xs">SQLite · privado</div>
          </div>
          <span className="material-symbols-outlined t-muted-2" style={{ fontSize: 14 }}>lock</span>
        </div>
      </div>
    </aside>
  )
}
