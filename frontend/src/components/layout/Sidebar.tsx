import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',          label: 'Dashboard',    icon: '▦' },
  { to: '/transacoes', label: 'Transações',  icon: '↕' },
  { to: '/importar',  label: 'Importar',     icon: '⬆' },
  { to: '/regras',    label: 'Regras',       icon: '⚙' },
  { to: '/metas',     label: 'Metas',        icon: '◎' },
  { to: '/cartao',    label: 'Cartão',       icon: '▣' },
]

export function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <span style={{ color: '#820AD1', fontWeight: 700, fontSize: 18 }}>$</span>
        <span style={{ fontWeight: 700, fontSize: 15, marginLeft: 8 }}>Financeiro</span>
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? 'rgba(130,10,209,0.15)' : 'transparent',
              color: isActive ? '#c084fc' : '#aaa',
              borderLeft: isActive ? '3px solid #820AD1' : '3px solid transparent',
            })}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
            <span style={{ fontSize: 14 }}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '12px 16px', fontSize: 11, color: '#444' }}>
        App Financeiro v0.1
      </div>
    </aside>
  )
}

const sidebarStyle: React.CSSProperties = {
  width: 220,
  minWidth: 220,
  height: '100svh',
  background: '#141414',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column',
}

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '20px 16px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  marginBottom: 8,
}

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 16px',
  textDecoration: 'none',
  transition: 'background 0.15s',
  cursor: 'pointer',
}
