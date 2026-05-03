import { useState } from 'react'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface Props {
  value: { year: number; month: number }
  onChange: (v: { year: number; month: number }) => void
}

export function MonthSelector({ value, onChange }: Props) {
  function prev() {
    if (value.month === 0) onChange({ year: value.year - 1, month: 11 })
    else onChange({ year: value.year, month: value.month - 1 })
  }
  function next() {
    if (value.month === 11) onChange({ year: value.year + 1, month: 0 })
    else onChange({ year: value.year, month: value.month + 1 })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={prev} style={btnStyle}>&lt;</button>
      <span style={{ fontWeight: 600, fontSize: 15, minWidth: 80, textAlign: 'center' }}>
        {MONTHS[value.month]} {value.year}
      </span>
      <button onClick={next} style={btnStyle}>&gt;</button>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e5e5e5',
  borderRadius: 6,
  width: 28,
  height: 28,
  cursor: 'pointer',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export function useMonth() {
  const now = new Date()
  return useState({ year: now.getFullYear(), month: now.getMonth() })
}
