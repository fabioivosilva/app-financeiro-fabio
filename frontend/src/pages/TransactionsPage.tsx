import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Transaction, Category, Person } from '../types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedPerson, setSelectedPerson] = useState<number | ''>('');
  const [selectedSource, setSelectedSource] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (pendingOnly) params.set('pending', 'true');
    if (selectedCategory !== '') params.set('category_id', selectedCategory.toString());
    if (selectedPerson !== '') params.set('person_id', selectedPerson.toString());
    if (selectedSource !== '') params.set('source', selectedSource);

    Promise.all([
      api.get(`/transactions/?${params}`),
      api.get('/categories/'),
      api.get('/persons/'),
    ]).then(([txRes, catRes, pRes]) => {
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setPersons(pRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [month, pendingOnly, selectedCategory, selectedPerson, selectedSource]);

  const formatCurrency = (v: number) =>
    Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  // Group by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = t.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const updateCategory = async (txnId: number, categoryId: number) => {
    try {
      await api.post(`/transactions/${txnId}/categorize`, {
        category_id: categoryId,
        create_rule: true,
        apply_similar: true,
      });
      loadData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Transações</h2>
          <p className="page-subtitle">{transactions.length} transações encontradas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface"
        />
        
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
          className="px-4 py-2 rounded-full border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface cursor-pointer"
        >
          <option value="">Todas as Categorias</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedPerson}
          onChange={e => setSelectedPerson(e.target.value ? Number(e.target.value) : '')}
          className="px-4 py-2 rounded-full border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface cursor-pointer"
        >
          <option value="">Todas as Pessoas</option>
          {persons.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={selectedSource}
          onChange={e => setSelectedSource(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface cursor-pointer"
        >
          <option value="">Todas as Origens</option>
          <option value="bank_statement">Extrato Bancário</option>
          <option value="credit_card">Cartão de Crédito</option>
        </select>

        <button
          onClick={() => setPendingOnly(!pendingOnly)}
          className={`chip px-4 py-2 cursor-pointer transition-colors ${pendingOnly ? 'bg-warning text-white' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}
        >
          <span className="material-symbols-outlined text-sm mr-1">warning</span>
          Pendentes
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-outline">Carregando...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <h3 className="text-label-md text-outline mb-2 uppercase tracking-wider">
                {formatDate(date)}
              </h3>
              <div className="card p-0 divide-y divide-gray-100 shadow-sm hover:shadow-card transition-shadow">
                {txns.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        t.transaction_type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        <span className="material-symbols-outlined text-xl">
                          {t.transaction_type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-body-md font-medium text-on-surface">{t.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {t.category_name ? (
                            <span className="chip bg-primary-50 text-primary-container border border-primary-100 text-xs">
                              {t.category_name}
                            </span>
                          ) : (
                            <select
                              className="text-xs border rounded-full px-2 py-0.5 text-warning bg-warning/10 border-warning/20 focus:outline-none focus:ring-1 focus:ring-warning"
                              onChange={(e) => updateCategory(t.id, Number(e.target.value))}
                              defaultValue=""
                            >
                              <option value="" disabled>Categorizar...</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          )}
                          {t.person_name && (
                            <span className="chip bg-orange-50 text-orange-600 border border-orange-100 text-xs">
                              {t.person_name}
                            </span>
                          )}
                          {t.source === 'credit_card' && (
                            <span className="chip bg-blue-50 text-blue-600 border border-blue-100 text-xs flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">credit_card</span>
                              Cartão
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-body-md font-semibold ${
                        t.transaction_type === 'income' ? 'text-success' : 'text-on-surface'
                      }`}>
                        {t.transaction_type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      {!t.is_reviewed && (
                        <p className="text-warning text-xs font-medium mt-1">⚠ Pendente</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="card text-center py-16 bg-surface-sidebar border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <p className="text-body-lg font-medium text-on-surface">Nenhuma transação encontrada</p>
              <p className="text-label-md text-outline mt-1">Tente ajustar os filtros ou importar novos dados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
