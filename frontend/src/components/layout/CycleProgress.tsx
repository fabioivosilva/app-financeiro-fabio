import { useState, useEffect } from 'react'

export function getCycleInfo(cycleStart?: number) {
  const diaInicio = cycleStart ?? Number(localStorage.getItem('cycleDayStart') ?? '27')
  const hoje = new Date()
  const dia = hoje.getDate()

  let inicioMes = hoje.getMonth()
  let inicioAno = hoje.getFullYear()

  if (dia < diaInicio) {
    inicioMes -= 1
    if (inicioMes < 0) { inicioMes = 11; inicioAno -= 1 }
  }

  const diaFim = diaInicio - 1 === 0 ? 28 : diaInicio - 1
  const inicio = new Date(inicioAno, inicioMes, diaInicio)
  const fimMes = inicioMes + 1 > 11 ? 0 : inicioMes + 1
  const fimAno = inicioMes + 1 > 11 ? inicioAno + 1 : inicioAno
  const fim = new Date(fimAno, fimMes, diaFim)

  const total = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1
  const passados = Math.max(1, Math.round((hoje.getTime() - inicio.getTime()) / 86400000) + 1)
  const pct = Math.min(100, (passados / total) * 100)

  const fmtData = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')

  return { total, passados, pct, inicio, fim, fmtData, diaInicio, diaFim }
}

export function CycleProgress({ compact = false }: { compact?: boolean }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const handler = () => setTick(t => t + 1)
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  const { total, passados, pct, inicio, fim, fmtData } = getCycleInfo()
  const restantes = Math.max(0, total - passados)

  return (
    <div className="cycle">
      <div className="cycle-meta">
        <span className="t-xs t-muted">CICLO ATUAL</span>
        <span className="t-xs">{fmtData(inicio)} → {fmtData(fim)}</span>
      </div>
      <div className="cycle-bar">
        <div className="cycle-fill" style={{ width: pct + '%' }} />
        <div className="cycle-marker" style={{ left: pct + '%' }} />
      </div>
      {!compact && (
        <div className="cycle-meta">
          <span className="t-xs t-muted">Dia {passados} de {total}</span>
          <span className="t-xs t-muted">{restantes} dia{restantes !== 1 ? 's' : ''} restante{restantes !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  )
}
