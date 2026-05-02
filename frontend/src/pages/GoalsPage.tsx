import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Goal } from '../types';
import Modal from '../components/Modal';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    api.get('/goals/')
      .then(r => setGoals(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setName(goal.name);
    setTargetAmount(goal.target_amount);
    setCurrentAmount(goal.current_amount);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoalId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoalId) return;

    try {
      await api.put(`/goals/${editingGoalId}`, {
        name,
        target_amount: targetAmount,
        current_amount: currentAmount
      });
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar a meta');
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Metas Financeiras</h2>
          <p className="page-subtitle">{goal.name}</p>
        </div>
        <button className="btn-primary" onClick={() => openModal(goal)}>
          <span className="material-symbols-outlined text-xl">edit</span>
          Editar Meta
        </button>
      </div>

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

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Editar Meta">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md mb-1">Nome da Meta *</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label className="block text-label-md mb-1">Valor Alvo (R$) *</label>
            <input 
              required
              type="number" 
              step="0.01"
              value={targetAmount}
              onChange={e => setTargetAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label className="block text-label-md mb-1">Valor Atual Guardado (R$) *</label>
            <input 
              required
              type="number" 
              step="0.01"
              value={currentAmount}
              onChange={e => setCurrentAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={closeModal}
              className="px-4 py-2 text-outline hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
