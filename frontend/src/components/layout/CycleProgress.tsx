import { useState, useEffect } from 'react'

export function getCycleInfo(cycleStart?: number) {
  const diaInicioRaw = cycleStart ?? Number(localStorage.getItem('cycleDayStart') ?? '27')
  const hoje = new Date()
  const dia = hoje.getDate()

  // Helper: último dia de um mês/ano específico
  const ultimoDiaDoMes = (ano: number, mes: number) => new Date(ano, mes + 1, 0).getDate()

  // Clamp do dia de início para o mês corrente (ex: dia 31 em fevereiro vira 28/29)
  const clampDia = (ano: number, mes: number, d: number) => Math.min(d, ultimoDiaDoMes(ano, mes))

  let inicioMes = hoje.getMonth()
  let inicioAno = hoje.getFullYear()

  // Se hoje é antes do dia de início (já considerando clamp), ciclo começou no mês anterior
  const diaInicioAtual = clampDia(inicioAno, inicioMes, diaInicioRaw)
  if (dia < diaInicioAtual) {
    inicioMes -= 1
    if (inicioMes < 0) { inicioMes = 11; inicioAno -= 1 }
  }

  const diaInicio = clampDia(inicioAno, inicioMes, diaInicioRaw)
  const inicio = new Date(inicioAno, inicioMes, diaInicio)

  // Fim do ciclo = dia anterior ao próximo início (também sob clamp do mês seguinte)
  let fimMes = inicioMes + 1
  let fimAno = inicioAno
  if (fimMes > 11) { fimMes = 0; fimAno += 1 }
  const proxInicio = clampDia(fimAno, fimMes, diaInicioRaw)
  const fim = new Date(fimAno, fimMes, proxInicio - 1)
  const diaFim = fim.getDate()

  const total = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1
  const hojeNorm = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const passados = Math.max(1, Math.round((hojeNorm.getTime() - inicio.getTime()) / 86400000) + 1)
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
