import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/importar', icon: 'upload_file', label: 'Importar' },
  { to: '/transacoes', icon: 'receipt_long', label: 'Transações' },
  { to: '/cartao', icon: 'credit_card', label: 'Cartão' },
  { to: '/provisoes', icon: 'event_repeat', label: 'Provisões' },
  { to: '/metas', icon: 'flag', label: 'Metas' },
  { to: '/regras', icon: 'rule', label: 'Regras' },
  { to: '/configuracoes', icon: 'settings', label: 'Configurações' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-white/[0.08] bg-surface-sidebar px-4 py-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-tint text-white shadow-glow">
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            account_balance_wallet
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-title-sm text-white">Fabio Financeiro</h1>
          <div className="mt-1 inline-flex items-center rounded-full border border-primary-tint/20 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-primary-tint">
            Institutional Grade
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Navegação principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'group flex h-11 items-center gap-3 rounded-md px-3 text-body-sm transition duration-200',
                isActive
                  ? 'border border-primary-tint/20 bg-primary/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border border-transparent text-on-surface-variant hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white',
              ].join(' ')
            }
          >
            <span className="material-symbols-outlined text-[21px] text-current" aria-hidden="true">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-5 space-y-3 border-t border-white/[0.08] pt-4">
        <div className="glass-card flex items-center gap-3 rounded-md px-3 py-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.75)]" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Dados locais
            </div>
            <div className="truncate text-xs text-white">SQLite protegido no desktop</div>
          </div>
          <span className="material-symbols-outlined text-sm text-on-surface-variant" aria-hidden="true">
            lock
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-tint/30 bg-primary/25 text-sm font-bold text-primary-tint">
            FS
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">Fabio Silva</div>
            <div className="truncate text-xs text-on-surface-variant">Administrador local</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
