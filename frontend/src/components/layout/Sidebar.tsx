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
    <aside style={sidebarStyle}>
      {/* Brand */}
      <div style={brandStyle}>
        <div style={brandMarkStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_balance_wallet</span>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>Fabio</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Financeiro</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive
                ? 'linear-gradient(90deg, rgba(130,10,209,0.2), rgba(130,10,209,0.06))'
                : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(192,132,252,0.18)' : 'none',
            })}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: 'inherit' }}
            >
              {icon}
            </span>
            <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={footerStyle}>
        <div style={localChipStyle}>
          <div style={localDotStyle} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>DADOS LOCAIS</div>
            <div style={{ fontSize: 11 }}>SQLite · privado</div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--text-muted-2)' }}>lock</span>
        </div>
      </div>
    </aside>
  )
}

const sidebarStyle: React.CSSProperties = {
  width: 240,
  minWidth: 240,
  height: '100svh',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 14px',
  background: 'rgba(10, 6, 18, 0.4)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(192, 132, 252, 0.07)',
  position: 'sticky',
  top: 0,
}

const brandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '6px 10px 22px',
}

const brandMarkStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'linear-gradient(135deg, #820AD1, #C084FC)',
  display: 'grid',
  placeItems: 'center',
  color: 'white',
  boxShadow: '0 8px 24px -8px rgba(130, 10, 209, 0.6)',
  flexShrink: 0,
}

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 10,
  textDecoration: 'none',
  transition: 'background 0.15s, color 0.15s',
  cursor: 'pointer',
  border: 'none',
}

const footerStyle: React.CSSProperties = {
  paddingTop: 16,
  borderTop: '1px solid rgba(192, 132, 252, 0.08)',
}

const localChipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(192, 132, 252, 0.06)',
}

const localDotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#22C55E',
  boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
  flexShrink: 0,
}
