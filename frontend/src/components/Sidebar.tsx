import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',              icon: 'dashboard',       label: 'Dashboard' },
  { to: '/importar',      icon: 'upload_file',     label: 'Importar' },
  { to: '/transacoes',    icon: 'receipt_long',    label: 'Transações' },
  { to: '/cartao',        icon: 'credit_card',     label: 'Cartão' },
  { to: '/regras',        icon: 'tune',            label: 'Regras' },
  { to: '/metas',         icon: 'savings',         label: 'Metas' },
  { to: '/configuracoes', icon: 'settings',        label: 'Configurações' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-sidebar border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-headline-md text-primary-container flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          Financeiro
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span
              className="material-symbols-outlined text-xl"
              style={undefined}
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-label-sm text-outline">v0.1.0 — Local</p>
      </div>
    </aside>
  );
}
