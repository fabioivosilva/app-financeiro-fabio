// Ciclo financeiro: dia 27 ao dia 26
function getCycleInfo() {
  const hoje = new Date()
  const dia = hoje.getDate()

  let inicioMes = hoje.getMonth()
  let inicioAno = hoje.getFullYear()

  // Se hoje >= 27, o ciclo começou no dia 27 deste mês
  // Se hoje < 27, o ciclo começou no dia 27 do mês anterior
  if (dia < 27) {
    inicioMes -= 1
    if (inicioMes < 0) { inicioMes = 11; inicioAno -= 1 }
  }

  const inicio = new Date(inicioAno, inicioMes, 27)
  const fimMes = inicioMes + 1 > 11 ? 0 : inicioMes + 1
  const fimAno = inicioMes + 1 > 11 ? inicioAno + 1 : inicioAno
  const fim = new Date(fimAno, fimMes, 26)

  const total = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1
  const passados = Math.round((hoje.getTime() - inicio.getTime()) / 86400000) + 1
  const pct = Math.min(100, (passados / total) * 100)

  const fmtData = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')

  return { total, passados, pct, inicio, fim, fmtData }
}

export function CycleProgress({ compact = false }: { compact?: boolean }) {
  const { total, passados, pct, inicio, fim, fmtData } = getCycleInfo()

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
          <span className="t-xs t-muted">{total - passados} dias restantes</span>
        </div>
      )}
    </div>
  )
}
