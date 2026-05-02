import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Person, Card, Category } from '../types';

export default function SettingsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/persons/'), api.get('/cards/'), api.get('/categories/')])
      .then(([pRes, cRes, catRes]) => {
        setPersons(pRes.data);
        setCards(cRes.data);
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-outline">Carregando...</div>;

  const fixedCats = categories.filter(c => c.kind === 'fixed');
  const varCats = categories.filter(c => c.kind === 'variable');
  const incomeCats = categories.filter(c => c.kind === 'income');

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <h2 className="page-title">Configurações</h2>
      <p className="page-subtitle">Gerencie pessoas, cartões e categorias</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persons */}
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-4">Pessoas</h3>
          <div className="space-y-2">
            {persons.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center text-label-md font-bold">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-body-md">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="card">
          <h3 className="text-body-lg font-semibold mb-4">Cartões</h3>
          {cards.length === 0 ? (
            <p className="text-label-md text-outline">Nenhum cartão cadastrado. Importe uma fatura para detectar automaticamente.</p>
          ) : (
            <div className="space-y-2">
              {cards.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="material-symbols-outlined text-primary-container">credit_card</span>
                  <span className="text-body-md">•••• {c.last_digits}</span>
                  {c.description && <span className="text-label-sm text-outline">({c.description})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="card">
        <h3 className="text-body-lg font-semibold mb-4">Categorias</h3>
        {[
          { label: 'Categorias Fixas', items: fixedCats },
          { label: 'Categorias Variáveis', items: varCats },
          { label: 'Receitas', items: incomeCats },
        ].map(group => (
          <div key={group.label} className="mb-6">
            <h4 className="text-label-md text-outline mb-2 uppercase tracking-wider">{group.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {group.items.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                  <span className="text-body-md flex-1">{cat.name}</span>
                  {cat.monthly_limit && (
                    <span className="text-label-sm text-outline">{formatCurrency(cat.monthly_limit)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
