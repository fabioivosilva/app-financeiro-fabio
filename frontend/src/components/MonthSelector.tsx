import React from 'react';

interface MonthSelectorProps {
  month: string;
  onChange: (newMonth: string) => void;
}

export default function MonthSelector({ month, onChange }: MonthSelectorProps) {
  const formatMonthLabel = (m: string) => {
    if (!m) return '';
    const [year, num] = m.split('-').map(Number);
    const dt = new Date(year, num - 1, 1);
    return dt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (delta: number) => {
    if (!month) return;
    const [year, num] = month.split('-').map(Number);
    const dt = new Date(year, num - 1 + delta, 1);
    onChange(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
      <button
        type="button"
        onClick={() => changeMonth(-1)}
        className="w-10 h-10 rounded-lg hover:bg-primary-50 text-outline hover:text-primary-container transition-colors flex items-center justify-center shrink-0"
        title="Mês anterior"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <span className="min-w-40 text-center text-label-md font-semibold text-on-surface capitalize">
        {formatMonthLabel(month)}
      </span>
      <input
        type="month"
        value={month}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-2 w-36 rounded-lg border-none text-label-md focus:outline-none focus:ring-2 focus:ring-primary-container bg-surface cursor-pointer"
        title="Selecionar mês"
      />
      <button
        type="button"
        onClick={() => changeMonth(1)}
        className="w-10 h-10 rounded-lg hover:bg-primary-50 text-outline hover:text-primary-container transition-colors flex items-center justify-center shrink-0"
        title="Próximo mês"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
