import { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import type { Card, Transaction } from '../types';

export default function CardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [selectedCardId, setSelectedCardId] = useState<number | ''>('');

  const loadData = () => {
    setLoading(true);
    
    Promise.all([
      api.get('/cards/'),
      api.get(`/transactions/?source=credit_card&month=${month}`),
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

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
        />
        
        {cards.length > 0 && (
          <select
            value={selectedCardId}
            onChange={e => setSelectedCardId(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 rounded-lg border border-gray-200 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
          >
            <option value="">Todos os cartões</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                Cartão final {c.last_digits} {c.description ? `(${c.description})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse text-outline">Carregando...</div>
      ) : cards.length === 0 ? (
        <div className="card text-center py-12">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">credit_card</span>
          <p className="text-body-lg text-outline">Nenhum cartão cadastrado.</p>
          <p className="text-label-md text-outline mt-1">Importe uma fatura PDF para começar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-error to-red-500 text-white">
            <p className="text-label-md opacity-80">Total da Fatura (Mês)</p>
            <p className="text-headline-xl mt-1">{formatCurrency(totalCard)}</p>
          </div>

          <div className="card p-0">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-body-md text-outline">Nenhuma transação neste período.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-label-md text-outline text-left">
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Parcela</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-label-sm text-outline">{formatDate(t.date)}</td>
                      <td className="px-6 py-3 text-body-md font-medium">{t.description}</td>
                      <td className="px-6 py-3">
                        {t.category_name ? (
                          <span className="chip bg-primary-50 text-primary-container">{t.category_name}</span>
                        ) : (
                          <span className="text-warning text-label-sm">Sem categoria</span>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
