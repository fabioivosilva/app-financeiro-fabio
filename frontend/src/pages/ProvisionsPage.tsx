import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Provision, ProvisionOccurrence, Category } from '../types';
import Modal from '../components/Modal';

const RECURRENCE_LABEL: Record<string, string> = {
  once: 'Uma vez',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  annual: 'Anual',
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-warning bg-warning/10' },
  realized: { label: 'Realizado', color: 'text-success bg-success/10' },
  adjusted: { label: 'Ajustado', color: 'text-outline bg-gray-100' },
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');

export default function ProvisionsPage() {
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    description: '',
    amount: '' as number | '',
    type: 'expense',
    category_id: '' as number | '',
    recurrence: 'monthly',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/provisions/'),
      api.get('/categories/'),
    ])
      .then(([pRes, cRes]) => {
        setProvisions(pRes.data);
        setCategories(cRes.data.filter((c: Category) => c.is_active));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (p?: Provision) => {
    if (p) {
      setEditingId(p.id);
      setForm({
        description: p.description,
        amount: p.amount,
        type: p.type,
        category_id: p.category_id ?? '',
        recurrence: p.recurrence,
        start_date: p.start_date,
        end_date: p.end_date ?? '',
        notes: p.notes ?? '',
      });
    } else {
      setEditingId(null);
      const today = new Date().toISOString().slice(0, 10);
      setForm({
        description: '',
        amount: '',
        type: 'expense',
        category_id: '',
        recurrence: 'monthly',
        start_date: today,
        end_date: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      type: form.type,
      category_id: form.category_id !== '' ? Number(form.category_id) : null,
      recurrence: form.recurrence,
      start_date: form.start_date,
      end_date: form.end_date || null,
      notes: form.notes || null,
    };
    try {
      if (editingId) {
        await api.put(`/provisions/${editingId}`, payload);
      } else {
        await api.post('/provisions/', payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar provisão');
    }
  };

  const handleDelete = async (p: Provision) => {
    if (!window.confirm(`Excluir "${p.description}"? As ocorrências também serão removidas.`)) return;
    try {
      await api.delete(`/provisions/${p.id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir provisão');
    }
  };

  const handleOccurrenceStatus = async (
    provisionId: number,
    occ: ProvisionOccurrence,
    newStatus: string,
  ) => {
    try {
      await api.patch(`/provisions/${provisionId}/occurrences/${occ.id}`, { status: newStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPendingExpense = provisions.reduce((acc, p) => {
    if (p.type !== 'expense') return acc;
    return acc + p.occurrences.filter(o => o.status === 'pending').reduce((s, o) => s + o.expected_amount, 0);
  }, 0);

  const totalPendingIncome = provisions.reduce((acc, p) => {
    if (p.type !== 'income') return acc;
    return acc + p.occurrences.filter(o => o.status === 'pending').reduce((s, o) => s + o.expected_amount, 0);
  }, 0);

  if (loading && provisions.length === 0)
    return <div className="animate-pulse text-outline">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Provisões</h2>
          <p className="page-subtitle">Registre despesas e receitas futuras esperadas e acompanhe a realização</p>
        </div>
        <button className="btn-primary shadow-md hover:shadow-lg transition-shadow" onClick={() => openModal()}>
          <span className="material-symbols-outlined text-xl">add</span>
          Nova Provisão
        </button>
      </div>

      {/* Stats */}
      {provisions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card py-4">
            <p className="text-label-sm text-outline mb-1">A Pagar (pendente)</p>
            <p className="text-headline-md text-error font-bold">{fmt(totalPendingExpense)}</p>
          </div>
          <div className="card py-4">
            <p className="text-label-sm text-outline mb-1">A Receber (pendente)</p>
            <p className="text-headline-md text-success font-bold">{fmt(totalPendingIncome)}</p>
          </div>
          <div className="card py-4">
            <p className="text-label-sm text-outline mb-1">Provisões Ativas</p>
            <p className="text-headline-md text-primary-container font-bold">{provisions.length}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {provisions.length === 0 && !loading && (
        <div className="card text-center py-16 bg-surface-sidebar border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-container">
            <span className="material-symbols-outlined text-3xl">event_repeat</span>
          </div>
          <p className="text-body-lg font-medium text-on-surface">Nenhuma provisão cadastrada</p>
          <p className="text-label-md text-outline mt-1 mb-6 max-w-md mx-auto">
            Registre assinaturas, parcelas de fatura e prestações para visualizar seu fluxo de caixa futuro.
          </p>
          <button className="text-primary-container font-semibold hover:underline" onClick={() => openModal()}>
            Criar minha primeira Provisão
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {provisions.map((p) => {
          const total = p.pending_count + p.realized_count;
          const pct = total > 0 ? Math.round((p.realized_count / total) * 100) : 0;
          const isExpanded = expandedId === p.id;
          const catName = categories.find(c => c.id === p.category_id)?.name;

          return (
            <div key={p.id} className="card overflow-hidden">
              {/* Card header row */}
              <div className="flex items-start gap-4 group relative">
                {/* Type indicator */}
                <div className={`w-2 self-stretch rounded-full flex-shrink-0 ${p.type === 'expense' ? 'bg-error' : 'bg-success'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-label-sm px-2 py-0.5 rounded-full font-medium ${p.type === 'expense' ? 'text-error bg-error/10' : 'text-success bg-success/10'}`}>
                      {p.type === 'expense' ? 'Despesa' : 'Receita'}
                    </span>
                    <span className="text-label-sm px-2 py-0.5 rounded-full bg-gray-100 text-outline">
                      {RECURRENCE_LABEL[p.recurrence]}
                    </span>
                    {catName && (
                      <span className="text-label-sm px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container">
                        {catName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-body-lg font-semibold text-on-surface">{p.description}</h3>
                    <span className="text-headline-sm font-bold text-on-surface">{fmt(p.amount)}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-label-sm text-outline">
                    <span>Início: {fmtDate(p.start_date)}</span>
                    {p.end_date && <span>Fim: {fmtDate(p.end_date)}</span>}
                    {p.notes && <span className="truncate max-w-xs">{p.notes}</span>}
                  </div>
                </div>

                {/* Progress + actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(p)}
                      className="w-7 h-7 rounded bg-gray-100 text-outline hover:text-primary-container flex items-center justify-center transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="w-7 h-7 rounded bg-gray-100 text-outline hover:text-error flex items-center justify-center transition-colors"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-label-sm text-outline">{p.realized_count} de {total} realizadas</p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-full rounded-full bg-primary-container transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="text-label-sm text-primary-container hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    {isExpanded ? 'Recolher' : 'Ver ocorrências'}
                  </button>
                </div>
              </div>

              {/* Occurrences list */}
              {isExpanded && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="space-y-2">
                    {p.occurrences.length === 0 && (
                      <p className="text-label-sm text-outline">Nenhuma ocorrência gerada.</p>
                    )}
                    {p.occurrences.map((occ) => {
                      const s = STATUS_LABEL[occ.status] ?? STATUS_LABEL.pending;
                      return (
                        <div key={occ.id} className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-label-sm text-outline w-24">{fmtDate(occ.expected_date)}</span>
                            <span className="text-body-sm font-medium">{fmt(occ.expected_amount)}</span>
                            {occ.notes && <span className="text-label-sm text-outline truncate max-w-xs">{occ.notes}</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-label-sm px-2 py-0.5 rounded-full font-medium ${s.color}`}>
                              {s.label}
                            </span>
                            {occ.status === 'pending' && (
                              <button
                                onClick={() => handleOccurrenceStatus(p.id, occ, 'realized')}
                                className="text-label-sm text-success hover:underline"
                                title="Marcar como realizado"
                              >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              </button>
                            )}
                            {occ.status === 'realized' && (
                              <button
                                onClick={() => handleOccurrenceStatus(p.id, occ, 'pending')}
                                className="text-label-sm text-outline hover:text-error"
                                title="Desfazer realização"
                              >
                                <span className="material-symbols-outlined text-[18px]">undo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Editar Provisão' : 'Nova Provisão'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-label-md mb-1 text-on-surface">Tipo *</label>
            <div className="flex gap-3">
              {[
                { value: 'expense', label: 'Despesa', color: 'border-error text-error' },
                { value: 'income', label: 'Receita', color: 'border-success text-success' },
              ].map(opt => (
                <label key={opt.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={form.type === opt.value}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="sr-only"
                  />
                  <div className={`text-center py-2 rounded-lg border-2 font-medium text-body-sm transition-all ${
                    form.type === opt.value ? opt.color + ' bg-opacity-5' : 'border-gray-200 text-outline'
                  }`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-label-md mb-1 text-on-surface">Descrição *</label>
            <input
              required
              type="text"
              value={form.description}
              placeholder="Ex: Netflix, Parcela Empréstimo, Aluguel"
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          {/* Valor + Recorrência */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md mb-1 text-on-surface">Valor (R$) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value ? Number(e.target.value) : '' }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div>
              <label className="block text-label-md mb-1 text-on-surface">Recorrência *</label>
              <select
                required
                value={form.recurrence}
                onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
              >
                <option value="once">Uma vez</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-label-md mb-1 text-on-surface">Categoria (opcional)</label>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-white"
            >
              <option value="">Sem categoria</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md mb-1 text-on-surface">Data inicial *</label>
              <input
                required
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div>
              <label className="block text-label-md mb-1 text-on-surface">Data final (opcional)</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-label-md mb-1 text-on-surface">Notas (opcional)</label>
            <textarea
              value={form.notes}
              placeholder="Observações adicionais..."
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
            />
          </div>

          {form.recurrence !== 'once' && (
            <div className="bg-primary-50 p-3 rounded-lg border border-primary-100 flex gap-3">
              <span className="material-symbols-outlined text-primary-container mt-0.5 text-[18px]">info</span>
              <p className="text-label-sm text-primary-container">
                As ocorrências serão geradas automaticamente. Você pode marcar cada uma como "Realizada" conforme for efetivando.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-outline hover:bg-gray-50 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Salvar Alterações' : 'Criar Provisão'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
