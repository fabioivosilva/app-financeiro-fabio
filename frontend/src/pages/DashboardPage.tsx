import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Dashboard } from '../types';

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-outline">Carregando...</div>;
  if (!data) return <div className="text-error">Erro ao carregar dashboard</div>;

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Resumo financeiro de {data.month}</p>

      {/* Hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <p className="text-label-md opacity-80">Saldo do Mês</p>
          <p className="text-headline-md mt-1">{formatCurrency(data.monthly_balance)}</p>
        </div>
        <div className="card">
          <p className="text-label-md text-outline">Total Entradas</p>
          <p className="text-headline-md text-success mt-1">{formatCurrency(data.total_income)}</p>
        </div>
        <div className="card">
          <p className="text-label-md text-outline">Total Saídas</p>
          <p className="text-headline-md text-error mt-1">{formatCurrency(data.total_expenses)}</p>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spending by person */}
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-4">Gasto por Pessoa</h3>
          <div className="space-y-3">
            {data.spending_by_person.map(p => (
              <div key={p.person_id}>
                <div className="flex justify-between text-label-md mb-1">
                  <span>{p.person_name}</span>
                  <span>{formatCurrency(p.total)} ({p.percentage}%)</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${
                      p.person_name === 'Fernanda' ? 'bg-fernanda' : 'bg-primary-container'
                    }`}
                    style={{ width: `${Math.min(p.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category limits */}
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-4">Limites por Categoria</h3>
          <div className="space-y-3">
            {data.category_limits.map(cl => (
              <div key={cl.category_id}>
                <div className="flex justify-between text-label-md mb-1">
                  <span>{cl.category_name}</span>
                  <span className={cl.over_budget ? 'text-error font-bold' : ''}>
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
          </div>
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Reserve goal */}
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-2">Meta de Reserva</h3>
          <p className="text-headline-md text-primary-container">{data.reserve_percentage}%</p>
          <div className="progress-bar mt-2">
            <div
              className="progress-bar-fill bg-primary-container"
              style={{ width: `${Math.min(data.reserve_percentage, 100)}%` }}
            />
          </div>
          <p className="text-label-sm text-outline mt-2">
            {formatCurrency(data.reserve_current)} de {formatCurrency(data.reserve_goal)}
          </p>
        </div>

        {/* Card total */}
        <div className="card">
          <p className="text-label-md text-outline">Fatura Cartão</p>
          <p className="text-headline-md text-error mt-1">{formatCurrency(data.credit_card_total)}</p>
        </div>

        {/* Pending */}
        <div className="card">
          <p className="text-label-md text-outline">Pendentes de Revisão</p>
          <p className="text-headline-md text-warning mt-1">{data.pending_review_count}</p>
          {data.pending_review_count > 0 && (
            <p className="text-label-sm text-outline mt-1">transações aguardando categorização</p>
          )}
        </div>
      </div>

      {/* Spending by category */}
      {data.spending_by_category.length > 0 && (
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-4">Gastos por Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.spending_by_category.map(sc => (
              <div key={sc.category_id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-container" />
                <div>
                  <p className="text-label-md">{sc.category_name}</p>
                  <p className="text-label-sm text-outline">{formatCurrency(sc.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
