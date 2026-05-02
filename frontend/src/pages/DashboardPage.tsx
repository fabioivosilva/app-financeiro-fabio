import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { Dashboard } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import MonthSelector from '../components/MonthSelector';

const COLORS = ['#820AD1', '#f97316', '#0e8345', '#eab308', '#ba1a1a', '#0ea5e9', '#d946ef', '#64748b'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/?month=${selectedMonth}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  if (loading && !data) return <div className="animate-pulse text-outline">Carregando...</div>;
  if (!data) return <div className="text-error">Erro ao carregar dashboard</div>;

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatPercent = (v: number) =>
    `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderVariation = (current: number, previous: number, isInverse = false) => {
    if (!previous || previous === 0) return null;
    const diff = ((current - previous) / previous) * 100;
    if (Math.abs(diff) < 0.1) return null;
    const isIncrease = diff > 0;
    const isPositive = isInverse ? !isIncrease : isIncrease;
    const colorClass = isPositive ? 'text-success' : 'text-error';
    
    return (
      <span className={`inline-flex items-center gap-0.5 font-bold ${colorClass}`} title={`Anterior: ${formatCurrency(previous)}`}>
        <span className="material-symbols-outlined text-sm">
          {isIncrease ? 'trending_up' : 'trending_down'}
        </span>
        {Math.abs(diff).toFixed(0)}%
      </span>
    );
  };

  // Prepare data for BarChart (Person Spending)
  const personChartData = [...data.spending_by_person]
    .sort((a, b) => b.total - a.total)
    .map(p => ({
      name: p.person_name || 'Sem Pessoa',
      total: p.total,
      fill: p.person_name === 'Fernanda' ? '#f97316' : '#820AD1'
    }));

  // Prepare data for PieChart (Category Spending)
  const sortedCategorySpending = [...data.spending_by_category].sort((a, b) => b.total - a.total);
  const totalCategorySpending = sortedCategorySpending.reduce((sum, c) => sum + c.total, 0);
  const categoryChartData = sortedCategorySpending.map((c, index) => ({
    name: c.category_name,
    value: c.total,
    percentage: totalCategorySpending > 0 ? (c.total / totalCategorySpending) * 100 : 0,
    color: COLORS[index % COLORS.length]
  }));

  const sortedCategoryLimits = [...data.category_limits].sort((a, b) => {
    if (a.over_budget !== b.over_budget) return a.over_budget ? -1 : 1;
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.spent - a.spent;
  });

  const renderPieLabel = ({ name, percent }: any) => {
    if (!percent || percent < 0.08) return '';
    return `${name} ${formatPercent(percent * 100)}`;
  };

  const renderCategoryTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-card">
        <p className="text-label-md font-semibold text-on-surface">{item.name}</p>
        <p className="text-label-sm text-outline">
          {formatCurrency(item.value)} ({formatPercent(item.percentage)})
        </p>
      </div>
    );
  };

  const limitStatus = (spent: number, limit: number) => {
    const delta = Math.abs(spent - limit);
    if (spent > limit) {
      return { text: `Estourou ${formatCurrency(delta)}`, className: 'text-error' };
    }
    return { text: `Faltam ${formatCurrency(delta)}`, className: 'text-outline' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Ciclo financeiro de {formatDate(data.period_start)} a {formatDate(data.period_end)}
          </p>
        </div>
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Ciclo financeiro de {formatDate(data.period_start)} a {formatDate(data.period_end)}
          </p>
        </div>
        <MonthSelector month={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transition-transform hover:-translate-y-1">
          <p className="text-label-md opacity-80">Saldo do Mês</p>
          <p className="text-headline-md mt-1">{formatCurrency(data.monthly_balance)}</p>
        </div>
        <div
          className="card transition-transform hover:-translate-y-1 cursor-pointer hover:ring-2 hover:ring-success/30"
          onClick={() => navigate(`/transacoes?month=${selectedMonth}&source=bank_statement`)}
          title="Ver entradas do mês"
        >
          <div className="flex items-baseline justify-between">
            <p className="text-label-md text-outline">Total Entradas</p>
            {renderVariation(data.total_income, data.previous_income)}
          </div>
          <p className="text-headline-md text-success mt-1">{formatCurrency(data.total_income)}</p>
          <p className="text-label-sm text-outline mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">open_in_new</span> Ver transações
          </p>
        </div>
        <div
          className="card transition-transform hover:-translate-y-1 cursor-pointer hover:ring-2 hover:ring-error/30"
          onClick={() => navigate(`/transacoes?month=${selectedMonth}`)}
          title="Ver saídas do mês"
        >
          <div className="flex items-baseline justify-between">
            <p className="text-label-md text-outline">Total Saídas</p>
            {renderVariation(data.total_expenses, data.previous_expenses, true)}
          </div>
          <p className="text-headline-md text-error mt-1">{formatCurrency(data.total_expenses)}</p>
          <p className="text-label-sm text-outline mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">open_in_new</span> Ver transações
          </p>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by person Bar Chart */}
        <div className="card flex flex-col">
          <h3 className="text-body-lg font-semibold mb-4">Gasto por Pessoa</h3>
          {personChartData.length > 0 ? (
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={personChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `R$ ${value}`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {personChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
              <span className="material-symbols-outlined text-3xl text-gray-300">group</span>
              <p className="text-label-md text-outline">Nenhum gasto por pessoa neste mês.</p>
              <p className="text-label-sm text-outline">Importe uma fatura Excel para vincular titulares aos cartões.</p>
            </div>
          )}
        </div>

        {/* Category limits */}
        <div className="card flex flex-col">
          <h3 className="text-body-lg font-semibold mb-4">Limites por Categoria</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-64 custom-scrollbar">
            {sortedCategoryLimits.map(cl => (
              <div key={cl.category_id}>
                <div className="flex justify-between gap-3 text-label-md mb-1">
                  <div className="min-w-0">
                    <p className="truncate">{cl.category_name}</p>
                    <p className={`text-label-sm font-medium ${limitStatus(cl.spent, cl.limit).className}`}>
                      {limitStatus(cl.spent, cl.limit).text}
                    </p>
                  </div>
                  <span className={`shrink-0 text-right ${cl.over_budget ? 'text-error font-bold' : ''}`}>
                    {formatCurrency(cl.spent)} / {formatCurrency(cl.limit)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${
                      cl.over_budget ? 'bg-error' : cl.percentage > 75 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(cl.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {data.category_limits.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-6 h-full">
                <span className="material-symbols-outlined text-3xl text-gray-300">speed</span>
                <p className="text-label-md text-outline">Nenhum limite configurado.</p>
                <button
                  onClick={() => navigate('/configuracoes')}
                  className="text-label-sm text-primary-container hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  Configurar limites
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending by category Pie Chart */}
        <div className="card col-span-1 lg:col-span-2 flex flex-col">
          <h3 className="text-body-lg font-semibold mb-4">Gastos por Categoria</h3>
          {categoryChartData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center h-64">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={renderCategoryTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center max-h-64 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-3">
                  {categoryChartData.map((sc) => (
                    <div key={sc.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sc.color }} />
                      <div className="truncate">
                        <p className="text-label-md truncate" title={sc.name}>{sc.name}</p>
                        <p className="text-label-sm text-outline">
                          {formatCurrency(sc.value)} • {formatPercent(sc.percentage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
              <span className="material-symbols-outlined text-3xl text-gray-300">pie_chart</span>
              <p className="text-label-md text-outline">Nenhum gasto categorizado neste mês.</p>
              <button
                onClick={() => navigate(`/transacoes?month=${selectedMonth}&pending=true`)}
                className="text-label-sm text-primary-container hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">label</span>
                Categorizar pendentes
              </button>
            </div>
          )}
        </div>

        {/* Small insights col */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-body-lg font-semibold">Minhas Metas</h3>
              <button 
                onClick={() => navigate('/metas')}
                className="text-outline hover:text-primary-container flex items-center"
                title="Ver todas as metas"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {data.goals.length === 0 ? (
                <p className="text-label-sm text-outline text-center py-4">Nenhuma meta configurada.</p>
              ) : data.goals.map(g => (
                <div key={g.id}>
                  <div className="flex justify-between text-label-sm mb-1">
                    <span className="font-medium truncate pr-2" title={g.name}>{g.name}</span>
                    <span className={`shrink-0 font-bold ${g.percentage >= 100 ? 'text-success' : 'text-primary-container'}`}>
                      {g.percentage}%
                    </span>
                  </div>
                  <div className="progress-bar h-1.5 mb-1 bg-gray-100">
                    <div
                      className={`progress-bar-fill ${g.percentage >= 100 ? 'bg-success' : 'bg-primary-container'}`}
                      style={{ width: `${Math.min(g.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-outline text-right">
                    {formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`card transition-transform hover:-translate-y-1 ${data.pending_review_count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-warning/30' : ''}`}
            onClick={() => data.pending_review_count > 0 && navigate(`/transacoes?month=${selectedMonth}&pending=true`)}
            title={data.pending_review_count > 0 ? 'Clique para revisar' : ''}
          >
            <p className="text-label-md text-outline">Pendentes de Revisão</p>
            <div className="flex items-center gap-3 mt-1">
              <p className={`text-headline-md ${data.pending_review_count > 0 ? 'text-warning' : 'text-success'}`}>
                {data.pending_review_count}
              </p>
              {data.pending_review_count > 0 && (
                <span className="material-symbols-outlined text-warning animate-pulse">warning</span>
              )}
            </div>
            {data.pending_review_count > 0 && (
              <p className="text-label-sm text-warning mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">open_in_new</span> Revisar agora
              </p>
            )}
          </div>

          {/* Top 3 Gastos */}
          {sortedCategorySpending.length > 0 && (
            <div className="card">
              <h3 className="text-body-lg font-semibold mb-3">🔥 Top Gastos</h3>
              <div className="space-y-3">
                {sortedCategorySpending.slice(0, 3).map((c, i) => (
                  <div key={c.category_id} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      i === 0 ? 'bg-error' : i === 1 ? 'bg-warning' : 'bg-orange-400'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md font-medium truncate">{c.category_name}</p>
                      <p className="text-label-sm text-outline">{formatCurrency(c.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
