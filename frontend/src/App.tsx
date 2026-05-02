import { useMemo, useState } from 'react';

type PageId = 'dashboard' | 'importar' | 'transacoes' | 'cartao' | 'provisoes' | 'metas' | 'regras' | 'config';
type CategoryId = keyof typeof categories;
type PersonId = 'fabio' | 'fernanda' | 'shared';

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: CategoryId | null;
  person: PersonId | null;
  source: string;
  status: 'ok' | 'pendente';
};

const today = new Date(2026, 4, 8);
const cycleStart = new Date(2026, 3, 27);
const cycleEnd = new Date(2026, 4, 26);

const categories = {
  mercado: { label: 'Mercado', color: '#A855F7', icon: 'shopping_cart', budget: 1200 },
  restaurante: { label: 'Restaurante', color: '#EC4899', icon: 'restaurant', budget: 600 },
  transporte: { label: 'Transporte', color: '#06B6D4', icon: 'directions_car', budget: 500 },
  assinatura: { label: 'Assinaturas', color: '#F59E0B', icon: 'subscriptions', budget: 150 },
  saude: { label: 'Saúde', color: '#10B981', icon: 'health_and_safety', budget: 800 },
  casa: { label: 'Casa', color: '#6366F1', icon: 'home', budget: 3400 },
  lazer: { label: 'Lazer', color: '#F43F5E', icon: 'sports_esports', budget: 400 },
  salario: { label: 'Salário', color: '#22C55E', icon: 'payments', budget: 0 },
  freelance: { label: 'Freelance', color: '#14B8A6', icon: 'work', budget: 0 },
};

const people: Record<PersonId, { name: string; initials: string; color: string }> = {
  fabio: { name: 'Fabio', initials: 'F', color: '#820AD1' },
  fernanda: { name: 'Fernanda', initials: 'F', color: '#F97316' },
  shared: { name: 'Compartilhado', initials: 'C', color: '#A855F7' },
};

const transactions: Transaction[] = [
  { id: 't1', date: '2026-04-27', description: 'Salário Empresa XYZ', amount: 8500, category: 'salario', person: 'fabio', source: 'OFX Itaú', status: 'ok' },
  { id: 't2', date: '2026-05-05', description: 'Freelance Cliente A', amount: 2200, category: 'freelance', person: 'fabio', source: 'OFX Itaú', status: 'ok' },
  { id: 't3', date: '2026-04-28', description: 'PAO DE ACUCAR 2841', amount: -487.32, category: 'mercado', person: 'shared', source: 'Cartão Itaú', status: 'ok' },
  { id: 't4', date: '2026-05-02', description: 'MERCADO EXTRA', amount: -312.18, category: 'mercado', person: 'shared', source: 'Cartão Itaú', status: 'ok' },
  { id: 't5', date: '2026-05-07', description: 'HORTIFRUTI VILA', amount: -89.4, category: 'mercado', person: 'shared', source: 'OFX Itaú', status: 'ok' },
  { id: 't6', date: '2026-04-29', description: 'IFOOD*OUTBACK', amount: -156.9, category: 'restaurante', person: 'shared', source: 'Cartão Itaú', status: 'ok' },
  { id: 't7', date: '2026-05-01', description: 'STARBUCKS PAULISTA', amount: -38.5, category: 'restaurante', person: 'fabio', source: 'Cartão Itaú', status: 'ok' },
  { id: 't8', date: '2026-05-03', description: 'RAPPI*MCDONALDS', amount: -62.3, category: 'restaurante', person: 'fernanda', source: 'Cartão Itaú', status: 'ok' },
  { id: 't9', date: '2026-05-06', description: 'PADARIA SAO ROQUE', amount: -24.8, category: 'restaurante', person: 'fabio', source: 'OFX Itaú', status: 'ok' },
  { id: 't10', date: '2026-04-30', description: 'UBER *TRIP', amount: -28.4, category: 'transporte', person: 'fabio', source: 'Cartão Itaú', status: 'ok' },
  { id: 't11', date: '2026-05-04', description: 'POSTO SHELL VL MAR', amount: -245, category: 'transporte', person: 'shared', source: 'Cartão Itaú', status: 'ok' },
  { id: 't12', date: '2026-05-01', description: 'NETFLIX.COM', amount: -55.9, category: 'assinatura', person: 'shared', source: 'Cartão Itaú', status: 'ok' },
  { id: 't13', date: '2026-05-02', description: 'ENEL DISTRIBUIDORA', amount: -284, category: 'casa', person: 'shared', source: 'OFX Itaú', status: 'ok' },
  { id: 't14', date: '2026-05-05', description: 'PG*BOUTIQUE LISBOA', amount: -340, category: null, person: null, source: 'Cartão Itaú', status: 'pendente' },
  { id: 't15', date: '2026-05-06', description: 'MP*ANA SOUZA', amount: -150, category: null, person: null, source: 'OFX Itaú', status: 'pendente' },
  { id: 't16', date: '2026-05-07', description: 'TRANSF PIX RECEBIDA', amount: 320, category: null, person: null, source: 'OFX Itaú', status: 'pendente' },
];

const provisions = [
  { description: 'Internet Vivo Fibra', day: 10, amount: -129.9, category: 'casa' as CategoryId },
  { description: 'Financiamento Carro', day: 12, amount: -890, category: 'transporte' as CategoryId },
  { description: 'Academia', day: 15, amount: -149, category: 'saude' as CategoryId },
  { description: 'Plano de Saúde', day: 20, amount: -680, category: 'saude' as CategoryId },
  { description: 'Salário Empresa XYZ', day: 27, amount: 8500, category: 'salario' as CategoryId },
];

const goals = [
  { name: 'Reserva de Emergência', target: 30000, current: 18400, color: '#22C55E', icon: 'shield' },
  { name: 'Viagem Japão 2027', target: 25000, current: 6800, color: '#EC4899', icon: 'flight' },
  { name: 'Trocar Notebook', target: 9000, current: 2100, color: '#06B6D4', icon: 'laptop_mac' },
];

const navItems: Array<{ id: PageId; label: string; icon: string; badge?: 'pending' }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'importar', label: 'Importar', icon: 'upload_file' },
  { id: 'transacoes', label: 'Transações', icon: 'receipt_long', badge: 'pending' },
  { id: 'cartao', label: 'Cartão', icon: 'credit_card' },
  { id: 'provisoes', label: 'Provisões', icon: 'event_repeat' },
  { id: 'metas', label: 'Metas', icon: 'flag' },
  { id: 'regras', label: 'Regras', icon: 'rule' },
  { id: 'config', label: 'Configurações', icon: 'settings' },
];

function brl(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function brlCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000) return `${value < 0 ? '-' : ''}R$ ${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return brl(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year.slice(2)}`;
}

function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">
      {name}
    </span>
  );
}

function Glass({ children, className = '', padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return <div className={`glass ${padded ? 'p-5 ' : ''}${className}`}>{children}</div>;
}

function Sidebar({ active, setActive, pending }: { active: PageId; setActive: (id: PageId) => void; pending: number }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="account_balance_wallet" />
        </div>
        <div>
          <div className="brand-name">Fabio</div>
          <div className="brand-sub">Financeiro</div>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={`nav-item ${active === item.id ? 'nav-item-active' : ''}`}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge === 'pending' && pending > 0 && <span className="nav-badge">{pending}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="user-chip">
          <div className="avatar" style={{ background: people.fabio.color }}>{people.fabio.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="t-sm">{people.fabio.name}</div>
            <div className="t-xs t-muted">Administrador local</div>
          </div>
        </div>
        <div className="local-chip">
          <div className="local-dot" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-xs t-muted">DADOS LOCAIS</div>
            <div className="t-xs">Banco pode zerar · nova importação</div>
          </div>
          <Icon name="lock" size={14} className="t-muted-2" />
        </div>
      </div>
    </aside>
  );
}

function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>
      {right && <div className="page-header-right">{right}</div>}
    </div>
  );
}

function SectionHeader({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <div className="section-title">{title}</div>
        {hint && <div className="t-xs t-muted">{hint}</div>}
      </div>
      {right}
    </div>
  );
}

function CycleProgress() {
  const total = Math.round((cycleEnd.getTime() - cycleStart.getTime()) / 86400000) + 1;
  const elapsed = Math.round((today.getTime() - cycleStart.getTime()) / 86400000) + 1;
  const pct = (elapsed / total) * 100;

  return (
    <div className="cycle">
      <div className="cycle-meta">
        <span className="t-xs t-muted">CICLO ATUAL</span>
        <span className="t-xs">27 abr → 26 mai</span>
      </div>
      <div className="cycle-bar">
        <div className="cycle-fill" style={{ width: `${pct}%` }} />
        <div className="cycle-marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="cycle-meta">
        <span className="t-xs t-muted">Dia {elapsed} de {total}</span>
        <span className="t-xs t-muted">{total - elapsed} dias restantes</span>
      </div>
    </div>
  );
}

function Dashboard({ setActive }: { setActive: (id: PageId) => void }) {
  const stats = useMemo(() => {
    const ok = transactions.filter((item) => item.status === 'ok');
    const income = ok.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
    const expenses = -ok.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0);
    const byCategory = Object.keys(categories).map((id) => {
      const categoryId = id as CategoryId;
      const total = -ok.filter((item) => item.category === categoryId && item.amount < 0).reduce((sum, item) => sum + item.amount, 0);
      return { id: categoryId, total, ...categories[categoryId] };
    }).filter((item) => item.total > 0).sort((a, b) => b.total - a.total);
    const pending = transactions.filter((item) => item.status === 'pendente').length;
    const projected = income - expenses + provisions.reduce((sum, item) => sum + item.amount, 0);
    return { income, expenses, projected, byCategory, pending };
  }, []);

  return (
    <div className="page page-dashboard">
      <PageHeader title="Dashboard" subtitle="Visão geral do ciclo atual e dos próximos meses" right={<CycleProgress />} />

      <div className="hero-grid">
        <Glass className="hero-card hero-card-projetado">
          <div className="hero-label"><Icon name="trending_up" size={16} /><span>SALDO PROJETADO · FIM DO CICLO</span></div>
          <div className="hero-value">{brl(stats.projected)}</div>
          <div className="hero-foot">
            <span className={stats.projected >= 0 ? 'delta-pos' : 'delta-neg'}>{brl(Math.abs(stats.projected))}</span>
            <span className="t-xs t-muted">depois das provisões pendentes</span>
          </div>
        </Glass>
        <Glass className="hero-card">
          <div className="hero-label"><Icon name="payments" size={16} /><span>RECEITAS DO CICLO</span></div>
          <div className="hero-value-sm">{brl(stats.income)}</div>
          <div className="hero-bar"><div className="hero-bar-fill" style={{ background: '#22C55E', width: '100%' }} /></div>
          <div className="t-xs t-muted">ciclo 27-26</div>
        </Glass>
        <Glass className="hero-card">
          <div className="hero-label"><Icon name="shopping_bag" size={16} /><span>GASTOS DO CICLO</span></div>
          <div className="hero-value-sm" style={{ color: '#F472B6' }}>{brl(stats.expenses)}</div>
          <div className="hero-bar"><div className="hero-bar-fill" style={{ background: '#EC4899', width: `${Math.min(100, (stats.expenses / stats.income) * 100)}%` }} /></div>
          <div className="t-xs t-muted">cartão + conta corrente</div>
        </Glass>
      </div>

      {stats.pending > 0 && (
        <button className="alert-banner" type="button" onClick={() => setActive('transacoes')}>
          <div className="alert-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}><Icon name="inbox" /></div>
          <div style={{ flex: 1 }}>
            <div className="t-md">{stats.pending} transações aguardando categorização</div>
            <div className="t-xs t-muted">Revisar uma a uma para manter o dashboard preciso</div>
          </div>
          <span className="btn-ghost">Revisar <Icon name="arrow_forward" size={16} /></span>
        </button>
      )}

      <Glass className="proj-card">
        <SectionHeader title="Próximos 6 meses" hint="Fluxo projetado com receitas, despesas e saldo" right={<button className="btn-ghost" onClick={() => setActive('provisoes')}>Gerenciar provisões <Icon name="arrow_forward" size={14} /></button>} />
        <ProjectionBars />
      </Glass>

      <div className="grid-2">
        <Glass>
          <SectionHeader title="Gastos por categoria" hint="Ciclo atual" />
          <CategoryDonut data={stats.byCategory} total={stats.expenses} />
          <div className="cat-list">
            {stats.byCategory.slice(0, 6).map((item) => {
              const budget = item.budget || stats.expenses;
              const pct = (item.total / budget) * 100;
              return (
                <div key={item.id} className="cat-row">
                  <div className="cat-row-head">
                    <span className="cat-dot" style={{ background: item.color }} />
                    <span className="cat-name">{item.label}</span>
                    <span className="cat-pct">{Math.round(pct)}%</span>
                  </div>
                  <div className="cat-row-bar">
                    <div className="cat-row-fill" style={{ width: `${Math.min(100, pct)}%`, background: item.color }} />
                  </div>
                  <div className="cat-row-foot">
                    <span className="t-xs t-muted">{brl(-item.total)}</span>
                    <span className="t-xs t-muted">{item.budget ? `de ${brl(-item.budget)}` : 'sem orçamento'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Glass>

        <div className="col-stack">
          <Glass>
            <SectionHeader title="Top gastos do ciclo" />
            <div className="top-list">
              {transactions.filter((item) => item.status === 'ok' && item.amount < 0).sort((a, b) => a.amount - b.amount).slice(0, 5).map((item) => {
                const category = item.category ? categories[item.category] : categories.mercado;
                return (
                  <div key={item.id} className="top-row">
                    <div className="top-row-icon" style={{ background: `${category.color}20`, color: category.color }}><Icon name={category.icon} size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                      <div className="t-xs t-muted">{formatDate(item.date)} · {category.label}</div>
                    </div>
                    <div className="t-sm" style={{ color: '#F472B6', fontVariantNumeric: 'tabular-nums' }}>{brl(item.amount)}</div>
                  </div>
                );
              })}
            </div>
          </Glass>

          <Glass>
            <SectionHeader title="Metas & cofrinhos" right={<button className="btn-ghost" onClick={() => setActive('metas')}>Ver todas</button>} />
            <div className="metas-list">
              {goals.map((goal) => {
                const pct = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.name} className="meta-row">
                    <div className="meta-icon" style={{ background: `${goal.color}20`, color: goal.color }}><Icon name={goal.icon} size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="meta-head"><span className="t-sm">{goal.name}</span><span className="t-xs t-muted">{Math.round(pct)}%</span></div>
                      <div className="meta-bar"><div className="meta-fill" style={{ width: `${pct}%`, background: goal.color }} /></div>
                      <div className="t-xs t-muted">{brlCompact(goal.current)} de {brlCompact(goal.target)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Glass>
        </div>
      </div>
    </div>
  );
}

function ProjectionBars() {
  const rows = [
    { label: 'mai/26', income: 10700, expense: 6100, balance: 4600 },
    { label: 'jun/26', income: 8500, expense: 5420, balance: 3080 },
    { label: 'jul/26', income: 8500, expense: 4890, balance: 3610 },
    { label: 'ago/26', income: 8500, expense: 5120, balance: 3380 },
    { label: 'set/26', income: 8500, expense: 4700, balance: 3800 },
    { label: 'out/26', income: 8500, expense: 4550, balance: 3950 },
  ];
  const max = Math.max(...rows.flatMap((item) => [item.income, item.expense, item.balance]));

  return (
    <div className="grid-3">
      {rows.map((item) => (
        <div key={item.label} className="glass p-5">
          <div className="t-xs t-muted">{item.label}</div>
          <div className="timeline-bars" style={{ width: '100%', height: 96, margin: '12px 0' }}>
            <div className="timeline-bar timeline-bar-in" style={{ height: `${(item.income / max) * 90}%` }} />
            <div className="timeline-bar timeline-bar-out" style={{ height: `${(item.expense / max) * 90}%` }} />
            <div className="timeline-bar" style={{ height: `${(item.balance / max) * 90}%`, background: 'linear-gradient(180deg, #C084FC, rgba(130,10,209,0.3))' }} />
          </div>
          <div className="timeline-month-total">{brl(item.balance)}</div>
        </div>
      ))}
    </div>
  );
}

function CategoryDonut({ data, total }: { data: Array<{ total: number; color: string }>; total: number }) {
  let start = 0;
  const gradient = data.map((item) => {
    const pct = (item.total / total) * 100;
    const part = `${item.color} ${start}% ${start + pct}%`;
    start += pct;
    return part;
  }).join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ borderRadius: '50%', background: `conic-gradient(${gradient})` }} />
      <div className="donut-center">
        <div className="t-xs t-muted">TOTAL CICLO</div>
        <div className="donut-total">{brl(-total)}</div>
      </div>
    </div>
  );
}

function Importar() {
  return (
    <div className="page">
      <PageHeader title="Importar arquivos" subtitle="Novo fluxo visual preparado para OFX, Excel e PDF" />
      <div className="grid-2">
        <Glass className="dropzone">
          <div className="dropzone-inner">
            <div className="dropzone-icon"><Icon name="cloud_upload" size={36} /></div>
            <div className="dropzone-title">Arraste arquivos para importar</div>
            <div className="dropzone-sub">OFX, XLS, XLSX e PDF serão reconectados à API real na migração B2</div>
            <button className="btn-primary">Selecionar arquivos</button>
            <div className="dropzone-tags"><span className="tag">OFX</span><span className="tag">EXCEL</span><span className="tag">PDF</span></div>
          </div>
        </Glass>
        <div className="col-stack">
          {['Capturadas', 'Auto-categorizadas', 'Pendentes'].map((label, index) => (
            <Glass key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-val">{[174, 151, 23][index]}</div>
            </Glass>
          ))}
        </div>
      </div>
    </div>
  );
}

function Transacoes() {
  return (
    <div className="page">
      <PageHeader title="Transações do ciclo" subtitle="Ciclo 27 abr → 26 mai" />
      <Glass padded={false}>
        {transactions.map((item) => {
          const category = item.category ? categories[item.category] : null;
          return (
            <div key={item.id} className={`tx-row ${item.status === 'pendente' ? 'tx-row-pending' : ''}`}>
              <div className="tx-icon" style={{ background: `${category?.color || '#F59E0B'}20`, color: category?.color || '#F59E0B' }}>
                <Icon name={category?.icon || 'help'} size={18} />
              </div>
              <div className="tx-main">
                <div className="tx-desc">{item.description}</div>
                <div className="tx-meta t-xs t-muted">{formatDate(item.date)} · {item.source}</div>
              </div>
              <span className={category ? 'cat-chip' : 'cat-chip cat-chip-empty'} style={category ? { background: `${category.color}1f`, color: category.color, border: `1px solid ${category.color}40` } : undefined}>
                {category?.label || 'Sem categoria'}
              </span>
              <div className={`tx-val ${item.amount > 0 ? 'tx-val-pos' : ''}`}>{brl(item.amount)}</div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}

function Provisoes() {
  return (
    <div className="page">
      <PageHeader title="Provisões e futuro" subtitle="Eventos recorrentes e parcelas do ciclo" />
      <div className="grid-3">
        {['Junho', 'Julho', 'Agosto'].map((month, index) => (
          <Glass key={month} className="stat-card">
            <div className="stat-label">{month}</div>
            <div className="stat-val">{brl([-5420, -4890, -5120][index])}</div>
          </Glass>
        ))}
      </div>
      <Glass padded={false}>
        {provisions.map((item) => {
          const category = categories[item.category];
          return (
            <div key={item.description} className="prov-row">
              <div className="prov-day"><div className="prov-day-num">{item.day}</div><div className="prov-day-mes">dia</div></div>
              <div className="prov-icon" style={{ background: `${category.color}20`, color: category.color }}><Icon name={category.icon} size={18} /></div>
              <div><div className="t-sm">{item.description}</div><div className="t-xs t-muted">{category.label}</div></div>
              <div className={`prov-val ${item.amount > 0 ? 'tx-val-pos' : ''}`}>{brl(item.amount)}</div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}

function StubPage({ id }: { id: PageId }) {
  const titles: Record<PageId, string> = {
    dashboard: 'Dashboard',
    importar: 'Importar',
    transacoes: 'Transações',
    cartao: 'Cartão',
    provisoes: 'Provisões',
    metas: 'Metas',
    regras: 'Regras',
    config: 'Configurações',
  };
  return (
    <div className="page">
      <PageHeader title={titles[id]} subtitle="Tela nova do protótipo carregada como base da migração" />
      <Glass className="stub-card">
        <div className="stub-icon"><Icon name={id === 'config' ? 'settings' : 'auto_awesome'} size={40} /></div>
        <div className="stub-title">{titles[id]} v2</div>
        <div className="stub-sub">O frontend antigo foi removido do fluxo. Esta tela fica pronta para reconectar na API real na próxima fatia.</div>
      </Glass>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<PageId>('dashboard');
  const pending = transactions.filter((item) => item.status === 'pendente').length;

  const page = {
    dashboard: <Dashboard setActive={setActive} />,
    importar: <Importar />,
    transacoes: <Transacoes />,
    cartao: <StubPage id="cartao" />,
    provisoes: <Provisoes />,
    metas: <StubPage id="metas" />,
    regras: <StubPage id="regras" />,
    config: <StubPage id="config" />,
  }[active];

  return (
    <div className="app">
      <Sidebar active={active} setActive={setActive} pending={pending} />
      <main className="main">{page}</main>
    </div>
  );
}
