import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Rule, Category, Person } from '../types';
import Modal from '../components/Modal';

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  
  // Form State
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [personId, setPersonId] = useState<number | ''>('');
  const [source, setSource] = useState<string>('');
  const [priority, setPriority] = useState<number>(0);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/rules/'),
      api.get('/categories/'),
      api.get('/persons/')
    ])
      .then(([rRes, cRes, pRes]) => {
        setRules(rRes.data);
        setCategories(cRes.data);
        setPersons(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (rule?: Rule) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setKeyword(rule.keyword);
      setCategoryId(rule.category_id || '');
      setPersonId(rule.person_id || '');
      setSource(rule.source || '');
      setPriority(rule.priority);
    } else {
      setEditingRuleId(null);
      setKeyword('');
      setCategoryId('');
      setPersonId('');
      setSource('');
      setPriority(0);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRuleId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      keyword,
      category_id: categoryId === '' ? null : Number(categoryId),
      person_id: personId === '' ? null : Number(personId),
      source: source === '' ? null : source,
      priority: Number(priority),
      is_active: true
    };

    try {
      if (editingRuleId) {
        await api.put(`/rules/${editingRuleId}`, payload);
      } else {
        await api.post('/rules/', payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar regra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta regra?')) return;
    try {
      await api.delete(`/rules/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir regra');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Regras de Automação</h2>
          <p className="page-subtitle">{rules.length} regras cadastradas</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <span className="material-symbols-outlined">add</span>
          Nova Regra
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-outline">Carregando...</div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-label-md text-outline text-left">
                <th className="px-6 py-3">Palavra-chave</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Pessoa</th>
                <th className="px-6 py-3">Origem</th>
                <th className="px-6 py-3">Prioridade</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3 text-body-md font-medium">{r.keyword}</td>
                  <td className="px-6 py-3">
                    {r.category_name ? (
                      <span className="chip bg-primary-50 text-primary-container">{r.category_name}</span>
                    ) : (
                      <span className="text-outline text-label-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-body-md text-outline">{r.person_name || '—'}</td>
                  <td className="px-6 py-3 text-label-sm text-outline">
                    {r.source === 'bank_statement' ? 'Extrato' : r.source === 'credit_card' ? 'Cartão' : 'Ambas'}
                  </td>
                  <td className="px-6 py-3 text-label-md">{r.priority}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                      <button 
                        onClick={() => openModal(r)}
                        className="text-outline hover:text-primary-container p-1"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="text-outline hover:text-error p-1"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline">
                    Nenhuma regra cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingRuleId ? 'Editar Regra' : 'Nova Regra'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md mb-1">Palavra-chave (Keyword) *</label>
            <input 
              required
              type="text" 
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              placeholder="Ex: IFOOD"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md mb-1">Categoria Alvo</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
              >
                <option value="">(Nenhuma)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-label-md mb-1">Pessoa Alvo</label>
              <select
                value={personId}
                onChange={e => setPersonId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
              >
                <option value="">(Nenhuma)</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md mb-1">Origem Específica</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
              >
                <option value="">Qualquer origem</option>
                <option value="bank_statement">Apenas Extrato (OFX)</option>
                <option value="credit_card">Apenas Cartão (PDF)</option>
              </select>
            </div>
            <div>
              <label className="block text-label-md mb-1">Prioridade</label>
              <input 
                type="number" 
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                min="0"
                max="100"
              />
              <p className="text-xs text-outline mt-1">Quanto maior, mais prioritária (0-100)</p>
            </div>
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
              Salvar Regra
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
