import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { CycleProgress } from '../components/layout/CycleProgress'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { useTransacoes } from '../hooks/useTransacoes'
import { useMetas } from '../hooks/useMetas'

const META_COLORS = ['#820AD1', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6']
const META_ICONS = ['savings', 'home', 'directions_car', 'flight', 'laptop', 'beach_access']

// Format BRL values
const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const brlCompact = (v: number) => {
  const abs = Math.abs(v)
  if (abs >= 1000000) return (v / 1000000).toFixed(1) + 'M'
  if (abs >= 1000) return (v / 1000).toFixed(1) + 'k'
  return brl(v)
}
const fmtData = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

export function Dashboard() {
  const navigate = useNavigate()
  const { transactions = [], categories = [] } = useTransacoes({})
  const { goals } = useMetas()

  const { receitas, gastos, gastosPorCat, topGastos, pendentes, alertas } = useMemo(() => {
    const ok = transactions.filter(t => t.status === 'confirmado')
    const receitas = ok.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const gastos = -ok.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)

    const byCat: Record<number, number> = {}
    ok.filter(t => t.amount < 0).forEach(t => {
      if (t.category_id) byCat[t.category_id] = (byCat[t.category_id] || 0) + (-t.amount)
    })

    const gastosPorCat = Object.entries(byCat)
      .map(([id, v]) => {
        const cat = categories.find(c => c.id === parseInt(id))
        return { id: parseInt(id), valor: v, label: cat?.name || '', color: cat?.color || '#C084FC', icon: cat?.icon || 'shopping_cart' }
      })
      .sort((a, b) => b.valor - a.valor)

    const topGastos = ok.filter(t => t.amount < 0).sort((a, b) => a.amount - b.amount).slice(0, 5)
    const pendentes = transactions.filter(t => t.status === 'pendente' || !t.category_id).length

    const alertas = categories
      .filter(c => c.limit_value && c.limit_value > 0)
      .map(c => {
        const usado = byCat[c.id] || 0
        const pct = usado / c.limit_value!
        return { cat: c, usado, limite: c.limit_value!, pct }
      })
      .filter(a => a.pct >= 0.85)

    return { receitas, gastos, gastosPorCat, topGastos, pendentes, alertas }
  }, [transactions, categories])

  const saldoAtual = receitas - gastos
  const saldoProjetado = saldoAtual // simplified projection
  const provisoesRestantes: any[] = [] // TODO: connect to real provisões
  const receitaRestante = 0
  const compromissoRestante = 0

  const projecao = useMemo(() => {
    const meses = []
    let saldoAcum = saldoAtual
    const hoje = new Date()
    const labelsM: string[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(hoje)
      d.setMonth(d.getMonth() + i)
      labelsM.push(d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }).replace(/\//g, '/'))
    }
    for (let i = 0; i < 6; i++) {
      if (i === 0) {
        meses.push({ label: labelsM[i], saldo: saldoProjetado, delta: saldoProjetado - saldoAtual })
        saldoAcum = saldoProjetado
      } else {
        saldoAcum += saldoAtual * 0.3
        meses.push({ label: labelsM[i], saldo: saldoAcum, delta: saldoAtual * 0.3 })
      }
    }
    return meses
  }, [saldoProjetado, saldoAtual])

  return (
    <div className="page page-dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do ciclo atual e dos próximos meses"
        right={<CycleProgress />}
      />

      {/* HERO METRICS */}
      <div className="hero-grid">
        <Glass className="hero-card hero-card-projetado">
          <div className="hero-label">
            <Icon name="trending_up" size={16} />
            <span>SALDO PROJETADO · FIM DO CICLO</span>
          </div>
          <div className="hero-value">{brl(saldoProjetado)}</div>
          <div className="hero-foot">
            <span className={saldoProjetado - saldoAtual >= 0 ? 'delta-pos' : 'delta-neg'}>
              <Icon name={saldoProjetado - saldoAtual >= 0 ? 'arrow_upward' : 'arrow_downward'} size={14} />
              {brl(Math.abs(saldoProjetado - saldoAtual))}
            </span>
            <span className="t-xs t-muted">depois das {provisoesRestantes.length} provisões pendentes</span>
          </div>
        </Glass>

        <Glass className="hero-card">
          <div className="hero-label">
            <Icon name="payments" size={16} />
            <span>RECEITAS DO CICLO</span>
          </div>
          <div className="hero-value-sm">{brl(receitas)}</div>
          <div className="hero-bar">
            <div className="hero-bar-fill" style={{ background: '#22C55E', width: '100%' }} />
          </div>
          <div className="t-xs t-muted">+{brl(receitaRestante)} ainda esperado</div>
        </Glass>

        <Glass className="hero-card">
          <div className="hero-label">
            <Icon name="shopping_bag" size={16} />
            <span>GASTOS DO CICLO</span>
          </div>
          <div className="hero-value-sm" style={{ color: '#F472B6' }}>{brl(gastos)}</div>
          <div className="hero-bar">
            <div className="hero-bar-fill" style={{ background: '#EC4899', width: Math.min(100, (gastos / receitas) * 100) + '%' }} />
          </div>
          <div className="t-xs t-muted">+{brl(compromissoRestante)} já comprometidos</div>
        </Glass>
      </div>

      {pendentes > 0 && (
        <button className="alert-banner" onClick={() => navigate('/transacoes')}>
          <div className="alert-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
            <Icon name="inbox" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-md">{pendentes} transações aguardando categorização</div>
            <div className="t-xs t-muted">Revisar uma a uma para manter o dashboard preciso</div>
          </div>
          <span className="btn-ghost">
            Revisar <Icon name="arrow_forward" size={16} />
          </span>
        </button>
      )}

      {/* PROJEÇÃO 6 MESES */}
      <Glass className="proj-card">
        <SectionHeader
          title="Próximos 6 meses"
          hint="Saldo projetado considerando provisões mensais e parcelas ativas"
          right={
            <button className="btn-ghost" onClick={() => navigate('/provisoes')}>
              Gerenciar provisões <Icon name="arrow_forward" size={14} />
            </button>
          }
        />
        <ProjectionChart meses={projecao} />
      </Glass>

      <div className="grid-2">
        {/* GASTOS POR CATEGORIA */}
        <Glass>
          <SectionHeader
            title="Gastos por categoria"
            hint="Ciclo atual"
            right={<button className="btn-ghost"><Icon name="more_horiz" size={16} /></button>}
          />
          <CategoryDonut data={gastosPorCat} total={gastos} />
          <div className="cat-list">
            {gastosPorCat.slice(0, 6).map(c => {
              const pctTot = (c.valor / gastos) * 100
              return (
                <div key={c.id} className="cat-row">
                  <div className="cat-row-head">
                    <span className="cat-dot" style={{ background: c.color }} />
                    <span className="cat-name">{c.label}</span>
                    <span className="cat-pct">{Math.round(pctTot)}%</span>
                  </div>
                  <div className="cat-row-bar">
                    <div className="cat-row-fill" style={{ width: Math.min(100, pctTot) + '%', background: c.color }} />
                  </div>
                  <div className="cat-row-foot">
                    <span className="t-xs t-muted">{brl(-c.valor)}</span>
                    <span className="t-xs t-muted">sem orçamento</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Glass>

        {/* RIGHT COLUMN */}
        <div className="col-stack">
          {alertas.length > 0 && (
            <Glass>
              <SectionHeader
                title="Alertas"
                hint={`${alertas.length} ${alertas.length === 1 ? 'categoria' : 'categorias'} próximas do limite`}
              />
              <div className="alert-list">
                {alertas.map(a => (
                  <div key={a.cat.id} className="alert-row">
                    <div className="alert-row-icon" style={{ background: (a.cat.color || '#C084FC') + '20', color: a.cat.color || '#C084FC' }}>
                      <Icon name={(a.cat as any).icon || 'warning'} size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="t-sm">{a.cat.name}</div>
                      <div className="t-xs t-muted">{brl(a.usado)} de {brl(a.limite)}</div>
                    </div>
                    <div className={`alert-pct${a.pct >= 1 ? ' alert-pct-over' : ''}`}>
                      {Math.round(a.pct * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          )}

          <Glass>
            <SectionHeader title="Top gastos do ciclo" />
            <div className="top-list">
              {topGastos.map(t => {
                const cat = categories.find(c => c.id === t.category_id)
                return (
                  <div key={t.id} className="top-row">
                    <div className="top-row-icon" style={{ background: (cat?.color || '#C084FC') + '20', color: cat?.color || '#C084FC' }}>
                      <Icon name={(cat as any)?.icon || 'shopping_cart'} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </div>
                      <div className="t-xs t-muted">
                        {fmtData(t.date)} · {cat?.name || 'Sem categoria'}
                      </div>
                    </div>
                    <div className="t-sm" style={{ color: '#F472B6', fontVariantNumeric: 'tabular-nums' }}>
                      {brl(t.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          </Glass>

          <Glass>
            <SectionHeader
              title="Metas & cofrinhos"
              right={<button className="btn-ghost" onClick={() => navigate('/metas')}>Ver todas</button>}
            />
            <div className="metas-list">
              {goals.slice(0, 4).map((m, idx) => {
                const cor = META_COLORS[idx % META_COLORS.length]
                const icon = META_ICONS[idx % META_ICONS.length]
                const pct = m.target > 0 ? (m.current / m.target) * 100 : 0
                return (
                  <div key={m.id} className="meta-row">
                    <div className="meta-icon" style={{ background: cor + '20', color: cor }}>
                      <Icon name={icon} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="meta-head">
                        <span className="t-sm">{m.name}</span>
                        <span className="t-xs t-muted">{Math.round(pct)}%</span>
                      </div>
                      <div className="meta-bar">
                        <div className="meta-fill" style={{ width: Math.min(100, pct) + '%', background: cor }} />
                      </div>
                      <div className="t-xs t-muted">{brlCompact(m.current)} de {brlCompact(m.target)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Glass>
        </div>
      </div>
    </div>
  )
}

// ---------- Projection chart (custom SVG area) ----------
function ProjectionChart({ meses }: { meses: Array<{ label: string; saldo: number; delta: number }> }) {
  const W = 1000,
    H = 220,
    PAD_L = 60,
    PAD_R = 20,
    PAD_T = 20,
    PAD_B = 36
  const innerW = W - PAD_L - PAD_R,
    innerH = H - PAD_T - PAD_B
  const max = Math.max(...meses.map(m => m.saldo)) * 1.1
  const min = Math.min(0, ...meses.map(m => m.saldo)) * 1.1
  const range = max - min || 1
  const x = (i: number) => PAD_L + (i / (meses.length - 1)) * innerW
  const y = (v: number) => PAD_T + (1 - (v - min) / range) * innerH

  const linePath = meses.map((m, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(m.saldo)}`).join(' ')
  const areaPath = `${linePath} L ${x(meses.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`

  const ticks = 4
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => min + (range / ticks) * i)

  return (
    <div className="proj-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="proj-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#820AD1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#820AD1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {tickVals.map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.05)" />
            <text x={PAD_L - 8} y={y(v) + 4} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">
              {brlCompact(v)}
            </text>
          </g>
        ))}
        <line x1={PAD_L} x2={W - PAD_R} y1={y(0)} y2={y(0)} stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
        <path d={areaPath} fill="url(#projGrad)" />
        <path d={linePath} fill="none" stroke="#C084FC" strokeWidth="2" />
        {meses.map((m, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(m.saldo)} r={i === 0 ? 5 : 4} fill={i === 0 ? '#fff' : '#C084FC'} stroke="#820AD1" strokeWidth="2" />
            <text x={x(i)} y={y(m.saldo) - 12} fontSize="11" fill="#fff" textAnchor="middle" fontWeight="600" fontFamily="ui-monospace, monospace">
              {brlCompact(m.saldo)}
            </text>
            <text x={x(i)} y={H - 14} fontSize="11" fill="rgba(255,255,255,0.55)" textAnchor="middle" fontFamily="ui-monospace, monospace">
              {m.label}
            </text>
          </g>
        ))}
        <g>
          <line x1={x(0)} x2={x(0)} y1={PAD_T} y2={H - PAD_B} stroke="rgba(192,132,252,0.3)" strokeDasharray="2,3" />
          <text x={x(0)} y={PAD_T - 6} fontSize="10" fill="#C084FC" textAnchor="middle">
            FIM CICLO
          </text>
        </g>
      </svg>
    </div>
  )
}

// ---------- Donut ----------
function CategoryDonut({ data, total }: { data: any[]; total: number }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const R = 70, r = 52, cx = 90, cy = 90

  let acc = 0
  const slices = data.map((d, i) => {
    const start = acc / total
    acc += d.valor
    const end = acc / total
    const pct = (end - start) * 100
    const mid = (start + end) / 2
    const a1 = start * Math.PI * 2 - Math.PI / 2
    const a2 = end * Math.PI * 2 - Math.PI / 2
    const aMid = mid * Math.PI * 2 - Math.PI / 2
    const large = end - start > 0.5 ? 1 : 0
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1)
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2)
    const x3 = cx + r * Math.cos(a2), y3 = cy + r * Math.sin(a2)
    const x4 = cx + r * Math.cos(a1), y4 = cy + r * Math.sin(a1)
    // label position: midpoint of arc at radius between r and R
    const Rlabel = (R + r) / 2 + (hovered === i ? 6 : 0)
    const lx = cx + Rlabel * Math.cos(aMid)
    const ly = cy + Rlabel * Math.sin(aMid)
    // hover: push slice outward from center
    const dx = hovered === i ? Math.cos(aMid) * 5 : 0
    const dy = hovered === i ? Math.sin(aMid) * 5 : 0
    return {
      path: `M ${x1+dx} ${y1+dy} A ${R} ${R} 0 ${large} 1 ${x2+dx} ${y2+dy} L ${x3+dx} ${y3+dy} A ${r} ${r} 0 ${large} 0 ${x4+dx} ${y4+dy} Z`,
      color: d.color, pct, lx, ly, label: d.label,
    }
  })

  const hov = hovered !== null ? slices[hovered] : null

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 180 180" className="donut" style={{ overflow: 'visible' }}>
        {slices.map((s, i) => (
          <path
            key={i} d={s.path} fill={s.color}
            style={{ cursor: 'pointer', transition: 'all 0.15s', opacity: hovered !== null && hovered !== i ? 0.45 : 1 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <circle cx={cx} cy={cy} r={r - 1} fill="rgba(20,15,35,0.6)" />
        {/* % labels on slices > 5% */}
        {slices.map((s, i) => {
          if (s.pct < 5) return null
          const isHov = hovered === i
          const txt = Math.round(s.pct) + '%'
          const fs = isHov ? 10.5 : 8.5
          const pw = txt.length * fs * 0.62 + 8
          const ph = fs + 7
          const op = hovered !== null && !isHov ? 0 : 1
          return (
            <g key={i} style={{ pointerEvents: 'none', transition: 'opacity 0.15s', opacity: op }}>
              <rect x={s.lx - pw/2} y={s.ly - ph/2} width={pw} height={ph} rx={ph/2}
                fill="rgba(0,0,0,0.55)" />
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                fontSize={fs} fontWeight={isHov ? 700 : 600} fill="#fff"
                fontFamily="ui-monospace,monospace" letterSpacing="-0.3"
              >{txt}</text>
            </g>
          )
        })}
      </svg>
      <div className="donut-center" style={{ pointerEvents: 'none' }}>
        {hov ? (
          <>
            <div className="t-xs" style={{ color: hov.color, fontWeight: 600, maxWidth: 70, textAlign: 'center', lineHeight: 1.2 }}>{hov.label}</div>
            <div className="donut-total" style={{ color: hov.color }}>{Math.round(hov.pct)}%</div>
          </>
        ) : (
          <>
            <div className="t-xs t-muted">TOTAL CICLO</div>
            <div className="donut-total">{brl(total)}</div>
          </>
        )}
      </div>
    </div>
  )
}
