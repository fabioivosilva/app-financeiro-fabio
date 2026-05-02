import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Rule } from '../types';

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rules/')
      .then(res => setRules(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Regras de Automação</h2>
          <p className="page-subtitle">{rules.length} regras cadastradas</p>
        </div>
        <button className="btn-primary">
          <span className="material-symbols-outlined">add</span>
          Nova Regra
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-outline">Carregando...</div>
      ) : (
        <div className="card p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-label-md text-outline text-left">
                <th className="px-6 py-3">Palavra-chave</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Pessoa</th>
                <th className="px-6 py-3">Origem</th>
                <th className="px-6 py-3">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-body-md font-medium">{r.keyword}</td>
                  <td className="px-6 py-3">
                    {r.category_name && (
                      <span className="chip bg-primary-50 text-primary-container">{r.category_name}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-body-md text-outline">{r.person_name || '—'}</td>
                  <td className="px-6 py-3 text-label-sm text-outline">{r.source || 'Ambas'}</td>
                  <td className="px-6 py-3 text-label-md">{r.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
