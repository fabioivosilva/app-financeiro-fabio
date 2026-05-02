import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Goal } from '../types';
import Modal from '../components/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
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

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoalId(goal.id);
      setName(goal.name);
      setTargetAmount(goal.target_amount);
      setCurrentAmount(goal.current_amount);
    } else {
      setEditingGoalId(null);
      setName('');
      setTargetAmount('');
      setCurrentAmount(0); // Cofrinho novo costuma começar zerado
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoalId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount)
    };

    try {
      if (editingGoalId) {
        await api.put(`/goals/${editingGoalId}`, payload);
      } else {
        await api.post('/goals/', payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar a meta');
    }
  };

  const handleDelete = async (goal: Goal) => {
    if (!window.confirm(`Tem certeza que deseja excluir a meta "${goal.name}"?\nIsso não apagará as transações vinculadas, apenas removerá o vínculo.`)) return;
    
    try {
      await api.delete(`/goals/${goal.id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir a meta');
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading && goals.length === 0) return <div className="animate-pulse text-outline">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Metas e Cofrinhos</h2>
          <p className="page-subtitle">Gerencie seus objetivos financeiros e acompanhe a evolução</p>
        </div>
        <button className="btn-primary shadow-md hover:shadow-lg transition-shadow" onClick={() => openModal()}>
          <span className="material-symbols-outlined text-xl">add</span>
          Nova Meta
        </button>
      </div>

      {goals.length === 0 && !loading && (
        <div className="card text-center py-16 bg-surface-sidebar border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-container">
            <span className="material-symbols-outlined text-3xl">savings</span>
          </div>
          <p className="text-body-lg font-medium text-on-surface">Nenhuma meta criada</p>
          <p className="text-label-md text-outline mt-1 mb-6 max-w-md mx-auto">
            Crie "Cofrinhos" para organizar dinheiro guardado. Se você vincular uma categoria a esta meta (ex: "Viagem"), todas as despesas dela alimentarão automaticamente a sua meta.
          </p>
          <button className="text-primary-container font-semibold hover:underline" onClick={() => openModal()}>
            Criar minha primeira Meta
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const totalSaved = goal.current_amount + goal.linked_transactions_sum;
          const pct = goal.target_amount > 0 ? Math.round((totalSaved / goal.target_amount) * 100) : 0;
          const remaining = goal.target_amount - totalSaved;
          const pieData = [
            { name: 'Guardado', value: totalSaved, color: '#820AD1' },
            { name: 'Falta', value: remaining > 0 ? remaining : 0, color: '#e5e7eb' },
          ];

          return (
            <div key={goal.id} className="card flex flex-col sm:flex-row items-center gap-6 relative group overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(goal)}
                  className="w-8 h-8 rounded bg-gray-100 text-outline hover:text-primary-container flex items-center justify-center transition-colors"
                  title="Editar Meta"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(goal)}
                  className="w-8 h-8 rounded bg-gray-100 text-outline hover:text-error flex items-center justify-center transition-colors"
                  title="Excluir Meta"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>

              <div className="flex-1 w-full pt-2">
                <h3 className="text-body-lg font-semibold mb-4 pr-16">{goal.name}</h3>
                <div className="flex items-end gap-6 mb-4">
                  <div>
                    <p className="text-label-sm text-outline">Total Guardado</p>
                    <p className="text-headline-md text-primary-container">{formatCurrency(totalSaved)}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-outline">Objetivo</p>
                    <p className="text-body-lg font-medium text-on-surface">{formatCurrency(goal.target_amount)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-label-sm">
                  <span className="text-outline">Saldo manual: {formatCurrency(goal.current_amount)}</span>
                  <span className="text-success font-medium">Cofrinho: +{formatCurrency(goal.linked_transactions_sum)}</span>
                </div>

                <div className="progress-bar h-3 bg-gray-100">
                  <div
                    className={`progress-bar-fill ${pct >= 100 ? 'bg-success' : 'bg-primary-container'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-label-sm font-medium">
                  <span className={pct >= 100 ? 'text-success' : 'text-primary-container'}>
                    {pct >= 100 ? '🎉 Concluído!' : `${pct}% alcançado`}
                  </span>
                  <span className="text-outline">
                    {remaining > 0 ? `Faltam ${formatCurrency(remaining)}` : 'Meta batida!'}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-40 h-40 shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pct >= 100 && entry.name === 'Guardado' ? '#0e8345' : entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className={`text-xl font-bold ${pct >= 100 ? 'text-success' : 'text-primary-container'}`}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingGoalId ? "Editar Meta" : "Nova Meta"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md mb-1 text-on-surface">Nome da Meta *</label>
            <input 
              required
              type="text" 
              value={name}
              placeholder="Ex: Reserva de Emergência, Viagem pra Disney"
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md mb-1 text-on-surface">Valor Alvo (R$) *</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0.01"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div>
              <label className="block text-label-md mb-1 text-on-surface">Saldo Inicial (R$)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>
          <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 flex gap-3">
            <span className="material-symbols-outlined text-primary-container mt-0.5">info</span>
            <p className="text-label-sm text-primary-container">
              **Cofrinho Automático**: Para que o valor desta meta cresça sozinho, vá em **Configurações &gt; Categorias**, edite uma categoria (ex: Reserva) e vincule ela a esta meta.
            </p>
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
