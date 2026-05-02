import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Transaction, Category } from '../types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOnly, setPendingOnly] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (pendingOnly) params.set('pending', 'true');

    Promise.all([
      api.get(`/transactions/?${params}`),
      api.get('/categories/'),
    ]).then(([txRes, catRes]) => {
      setTransactions(txRes.data);
      setCategories(catRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [month, pendingOnly]);

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
      await api.put(`/transactions/${txnId}`, { category_id: categoryId, is_reviewed: true });
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
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
        <button
          onClick={() => setPendingOnly(!pendingOnly)}
          className={`chip ${pendingOnly ? 'bg-warning/20 text-warning' : 'bg-gray-100 text-outline'}`}
        >
          ⚠ Apenas Pendentes
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
              <div className="card p-0 divide-y divide-gray-100">
                {txns.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`material-symbols-outlined text-xl ${
                        t.transaction_type === 'income' ? 'text-success' : 'text-error'
                      }`}>
                        {t.transaction_type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                      <div className="flex-1">
                        <p className="text-body-md">{t.description}</p>
                        <div className="flex gap-2 mt-1">
                          {t.category_name ? (
                            <span className="chip bg-primary-50 text-primary-container text-label-sm">
                              {t.category_name}
                            </span>
                          ) : (
                            <select
                              className="text-label-sm border rounded px-2 py-1 text-warning bg-warning/10"
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
                            <span className="chip bg-gray-100 text-outline text-label-sm">
                              {t.person_name}
                            </span>
                          )}
                          {t.source === 'credit_card' && (
                            <span className="chip bg-red-50 text-error text-label-sm">Cartão</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-body-md font-semibold ${
                        t.transaction_type === 'income' ? 'text-success' : 'text-error'
                      }`}>
                        {t.transaction_type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      {!t.is_reviewed && (
                        <span className="text-warning text-label-sm">⚠ Pendente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="card text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline mb-3 block">search_off</span>
              <p className="text-body-lg text-outline">Nenhuma transação encontrada para este período.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
