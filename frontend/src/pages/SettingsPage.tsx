import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Person, Card, Category, Goal } from '../types';
import Modal from '../components/Modal';

type ModalType = 'person' | 'category' | null;

export default function SettingsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Person Form State
  const [personName, setPersonName] = useState('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catKind, setCatKind] = useState('variable');
  const [catLimit, setCatLimit] = useState<number | ''>('');
  const [catColor, setCatColor] = useState('#cccccc');
  const [catExcludeFromTotals, setCatExcludeFromTotals] = useState(false);
  const [catGoalId, setCatGoalId] = useState<number | ''>('');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/persons/'), api.get('/cards/'), api.get('/categories/'), api.get('/goals/')])
      .then(([pRes, cRes, catRes, goalRes]) => {
        setPersons(pRes.data);
        setCards(cRes.data);
        setCategories(catRes.data);
        setGoals(goalRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPersonModal = (p?: Person) => {
    setModalType('person');
    if (p) {
      setEditingId(p.id);
      setPersonName(p.name);
    } else {
      setEditingId(null);
      setPersonName('');
    }
  };

  const openCategoryModal = (c?: Category) => {
    setModalType('category');
    if (c) {
      setEditingId(c.id);
      setCatName(c.name);
      setCatKind(c.kind);
      setCatLimit(c.monthly_limit || '');
      setCatColor(c.color || '#cccccc');
      setCatExcludeFromTotals(c.exclude_from_totals);
      setCatGoalId(c.goal_id || '');
    } else {
      setEditingId(null);
      setCatName('');
      setCatKind('variable');
      setCatLimit('');
      setCatColor('#820AD1');
      setCatExcludeFromTotals(false);
      setCatGoalId('');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingId(null);
  };

  const handlePersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/persons/${editingId}`, { name: personName });
      } else {
        await api.post('/persons/', { name: personName });
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar pessoa');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: catName,
      kind: catKind,
      monthly_limit: catLimit === '' ? null : Number(catLimit),
      color: catColor,
      exclude_from_totals: catExcludeFromTotals,
      goal_id: catGoalId === '' ? null : Number(catGoalId)
    };
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories/', payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar categoria');
    }
  };

  const handleCategoryDelete = async (category: Category) => {
    if (!window.confirm(`Excluir a categoria "${category.name}"? As transações antigas continuam preservadas.`)) {
      return;
    }
    try {
      await api.delete(`/categories/${category.id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir categoria');
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return <div className="animate-pulse text-outline">Carregando...</div>;

  const fixedCats = categories.filter(c => c.kind === 'fixed' && !c.exclude_from_totals);
  const varCats = categories.filter(c => c.kind === 'variable' && !c.exclude_from_totals);
  const incomeCats = categories.filter(c => c.kind === 'income' && !c.exclude_from_totals);
  const transferCats = categories.filter(c => c.kind === 'transfer' || c.exclude_from_totals);

  return (
    <div className="space-y-6">
      <h2 className="page-title">Configurações</h2>
      <p className="page-subtitle">Gerencie pessoas, cartões e categorias</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persons */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body-lg font-semibold">Pessoas</h3>
            <button 
              onClick={() => openPersonModal()}
              className="text-primary-container hover:bg-primary-50 p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="space-y-2 flex-1">
            {persons.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center text-label-md font-bold">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-body-md flex-1">{p.name}</span>
                <button 
                  onClick={() => openPersonModal(p)}
                  className="opacity-0 group-hover:opacity-100 text-outline hover:text-primary-container p-1 transition-opacity"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body-lg font-semibold">Cartões</h3>
          </div>
          {cards.length === 0 ? (
            <p className="text-label-md text-outline">Nenhum cartão cadastrado. Importe uma fatura para detectar automaticamente.</p>
          ) : (
            <div className="space-y-2 flex-1">
              {cards.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="material-symbols-outlined text-primary-container">credit_card</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md">•••• {c.last_digits}</p>
                    <p className="text-label-sm text-outline">
                      {c.person_name ? `Cartão de ${c.person_name}` : 'Pessoa não identificada'}
                    </p>
                  </div>
                  {c.description && <span className="text-label-sm text-outline">({c.description})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body-lg font-semibold">Categorias</h3>
          <button 
            onClick={() => openCategoryModal()}
            className="text-primary-container hover:bg-primary-50 p-1 rounded transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        
        {[
          { label: 'Categorias Fixas', items: fixedCats },
          { label: 'Categorias Variáveis', items: varCats },
          { label: 'Receitas', items: incomeCats },
          { label: 'Movimentações Internas', items: transferCats },
        ].map(group => (
          <div key={group.label} className="mb-6">
            <h4 className="text-label-md text-outline mb-2 uppercase tracking-wider">{group.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {group.items.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                  <span className="text-body-md flex-1">{cat.name}</span>
                  {cat.monthly_limit && (
                    <span className="text-label-sm text-outline">{formatCurrency(cat.monthly_limit)}</span>
                  )}
                  {cat.exclude_from_totals && (
                    <span className="text-label-sm text-outline">fora dos totais</span>
                  )}
                  <button 
                    onClick={() => openCategoryModal(cat)}
                    className="opacity-0 group-hover:opacity-100 text-outline hover:text-primary-container p-1 transition-opacity"
                    title="Editar categoria"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button
                    onClick={() => handleCategoryDelete(cat)}
                    className="opacity-0 group-hover:opacity-100 text-outline hover:text-error p-1 transition-opacity"
                    title="Excluir categoria"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={modalType === 'person'} 
        onClose={closeModal} 
        title={editingId ? 'Editar Pessoa' : 'Nova Pessoa'}
      >
        <form onSubmit={handlePersonSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md mb-1">Nome *</label>
            <input 
              required
              type="text" 
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-outline hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Pessoa</button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={modalType === 'category'} 
        onClose={closeModal} 
        title={editingId ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-label-md mb-1">Nome *</label>
            <input 
              required
              type="text" 
              value={catName}
              onChange={e => setCatName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md mb-1">Tipo *</label>
              <select
                value={catKind}
                onChange={e => setCatKind(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
              >
                <option value="variable">Variável</option>
                <option value="fixed">Fixa</option>
                <option value="income">Receita</option>
                <option value="transfer">Movimentação interna</option>
              </select>
            </div>
            <div>
              <label className="block text-label-md mb-1">Cor</label>
              <input 
                type="color" 
                value={catColor}
                onChange={e => setCatColor(e.target.value)}
                className="w-full h-[42px] px-1 py-1 border border-gray-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-label-md mb-1">Limite Mensal (Opcional)</label>
            <input 
              type="number" 
              step="0.01"
              value={catLimit}
              onChange={e => setCatLimit(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div>
            <label className="block text-label-md mb-1">Vincular a uma Meta (Cofrinho Opcional)</label>
            <select
              value={catGoalId}
              onChange={e => setCatGoalId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
            >
              <option value="">-- Não vincular --</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <p className="text-label-sm text-outline mt-1">Transações desta categoria irão alimentar automaticamente a meta selecionada.</p>
          </div>
          <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={catExcludeFromTotals}
              onChange={e => setCatExcludeFromTotals(e.target.checked)}
              className="mt-1"
            />
            <span className="text-body-md">
              Não contabilizar esta categoria nos gastos, limites e dashboard
            </span>
          </label>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-outline hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Categoria</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
