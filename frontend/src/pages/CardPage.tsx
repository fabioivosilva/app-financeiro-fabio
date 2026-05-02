import { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import type { Card, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumo' | 'transacoes'>('resumo');
  
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [selectedCardId, setSelectedCardId] = useState<number | ''>('');

  const loadData = () => {
    setLoading(true);
    
    Promise.all([
      api.get('/cards/'),
      api.get(`/transactions/?source=credit_card&month=${month}&cycle=true`),
    ]).then(([cRes, txRes]) => {
      setCards(cRes.data);
      setTransactions(txRes.data);
      if (cRes.data.length > 0 && selectedCardId === '') {
        setSelectedCardId(cRes.data[0].id);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [month]);

  const filteredTransactions = useMemo(() => {
    if (selectedCardId === '') return transactions;
    return transactions.filter(t => t.card_id === selectedCardId);
  }, [transactions, selectedCardId]);

  const totalCard = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  const personChartData = useMemo(() => {
    const personMap = new Map<string, number>();
    filteredTransactions.forEach(t => {
      const name = t.person_name || 'Sem Pessoa';
      personMap.set(name, (personMap.get(name) || 0) + t.amount);
    });
    
    return Array.from(personMap.entries()).map(([name, total]) => ({
      name,
      total: Math.abs(total),
      fill: name === 'Fernanda' ? '#f97316' : '#820AD1'
    }));
  }, [filteredTransactions]);

  const formatCurrency = (v: number) =>
    Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Análise de Cartão</h2>
          <p className="page-subtitle">Consolidação da fatura do cartão de crédito</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface"
        />
        
        {cards.length > 0 && (
          <select
            value={selectedCardId}
            onChange={e => setSelectedCardId(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 rounded-full border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface cursor-pointer"
          >
            <option value="">Todos os cartões</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                Cartão final {c.last_digits}{c.person_name ? ` - ${c.person_name}` : ''}{c.description ? ` (${c.description})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse text-outline">Carregando...</div>
      ) : cards.length === 0 ? (
        <div className="card text-center py-16 bg-surface-sidebar border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
            <span className="material-symbols-outlined text-3xl">credit_card</span>
          </div>
          <p className="text-body-lg font-medium text-on-surface">Nenhum cartão cadastrado.</p>
          <p className="text-label-md text-outline mt-1">Importe uma fatura PDF para começar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-error to-red-500 text-white transition-transform hover:-translate-y-1">
            <p className="text-label-md opacity-80">Total da Fatura (Ciclo)</p>
            <p className="text-headline-xl mt-1">{formatCurrency(totalCard)}</p>
          </div>

          <div className="border-b border-gray-200 flex gap-6">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`pb-3 px-2 text-label-md font-medium transition-colors border-b-2 ${
                activeTab === 'resumo' ? 'border-primary-container text-primary-container' : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              Resumo
            </button>
            <button
              onClick={() => setActiveTab('transacoes')}
              className={`pb-3 px-2 text-label-md font-medium transition-colors border-b-2 ${
                activeTab === 'transacoes' ? 'border-primary-container text-primary-container' : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              Transações
            </button>
          </div>

          {activeTab === 'resumo' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card flex flex-col">
                <h3 className="text-body-lg font-semibold mb-4">Gasto por Pessoa no Cartão</h3>
                {personChartData.length > 0 ? (
                  <div className="h-64 w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={personChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$ ${value}`} />
                        <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {personChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-label-md text-outline flex-1 flex items-center justify-center">Sem dados suficientes.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-0 shadow-sm">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">receipt_long</span>
                  <p className="text-body-md text-outline">Nenhuma transação neste período.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-label-md text-outline text-left bg-gray-50/50">
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Parcela</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(t => (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-label-sm text-outline font-medium">{formatDate(t.date)}</td>
                          <td className="px-6 py-3 text-body-md font-medium text-on-surface">{t.description}</td>
                          <td className="px-6 py-3">
                            {t.category_name ? (
                              <span className="chip bg-primary-50 text-primary-container border border-primary-100 text-xs">
                                {t.category_name}
                              </span>
                            ) : (
                              <span className="chip bg-warning/10 text-warning border border-warning/20 text-xs">Sem categoria</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-label-sm text-outline">
                            {t.installment_current && t.installment_total 
                              ? `${t.installment_current}/${t.installment_total}` 
                              : '—'}
                          </td>
                          <td className="px-6 py-3 text-right text-body-md font-semibold text-error">
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
