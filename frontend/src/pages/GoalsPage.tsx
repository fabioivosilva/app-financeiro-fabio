import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Goal } from '../types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/goals/').then(r => setGoals(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return <div className="animate-pulse text-outline">Carregando...</div>;

  const goal = goals[0];
  if (!goal) return null;

  const pct = goal.target_amount > 0
    ? Math.round((goal.current_amount / goal.target_amount) * 100)
    : 0;

  const remaining = goal.target_amount - goal.current_amount;
  const monthsLeft = 12;
  const monthlySuggestion = remaining > 0 ? remaining / monthsLeft : 0;

  return (
    <div className="space-y-6">
      <h2 className="page-title">Metas Financeiras</h2>
      <p className="page-subtitle">{goal.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress card */}
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-4">Progresso</h3>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-label-sm text-outline">Atual</p>
              <p className="text-headline-md text-primary-container">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div>
              <p className="text-label-sm text-outline">Objetivo</p>
              <p className="text-headline-md">{formatCurrency(goal.target_amount)}</p>
            </div>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-bar-fill bg-primary-container"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-label-sm text-outline">
            <span>{pct}% concluído</span>
            <span>Faltam {formatCurrency(remaining)}</span>
          </div>
        </div>

        {/* Insight card */}
        <div className="card bg-gradient-to-br from-primary-container to-primary text-white">
          <h3 className="text-body-lg font-semibold mb-2 opacity-90">💡 Sugestão Mensal</h3>
          <p className="text-headline-lg">{formatCurrency(monthlySuggestion)}</p>
          <p className="text-label-md opacity-80 mt-2">
            Para atingir sua meta em {monthsLeft} meses
          </p>
        </div>
      </div>
    </div>
  );
}
