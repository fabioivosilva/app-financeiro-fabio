import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { CycleProgress } from '../components/layout/CycleProgress'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { useMetas } from '../hooks/useMetas'
import { api } from '../api/client'

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
const fmtData = (d: string) => {
  if (!d) return ''
  const parts = d.split('-')
  return `${parts[2]}/${parts[1]}`
}

export function Dashboard() {
  const navigate = useNavigate()
  const { goals } = useMetas()
  
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // O Dashboard sempre mostra o ciclo atual ao carregar
  // No futuro, podemos integrar o MonthSelector
  useEffect(() => {
    const hoje = new Date()
    // Se hoje >= 27, o ciclo que termina no mês que vem é o "atual"
    let month = hoje.getMonth() + 1
    let year = hoje.getFullYear()
    if (hoje.getDate() >= 27) {
        month += 1
        if (month > 12) { month = 1; year += 1 }
    }

    api.get(`/dashboard/summary?month=${month}&year=${year}`)
      .then(res => {
        setSummary(res)
        setLoading(false)
      })
  }, [])

  const metrics = summary?.metrics || {}
  const counts = summary?.counts || {}
  const gastosPorCat = summary?.gastos_por_cat || []
  const topGastos = summary?.top_gastos || []

  // Alertas baseados no orçamento vindo do backend
  const alertas = useMemo(() => {
    return gastosPorCat
      .filter((c: any) => c.limit && c.limit > 0)
      .map((c: any) => {
        const pct = c.valor / c.limit
        return { cat: c, usado: c.valor, limite: c.limit, pct }
      })
      .filter((a: any) => a.pct >= 0.85)
  }, [gastosPorCat])

  // Projeção simples de 6 meses (poderia vir do backend também)
  const projecao = useMemo(() => {
    if (!summary) return []
    const meses = []
    const hoje = new Date()
    
    // Simplificado: usa o delta do ciclo atual para os próximos
    const saldoAtual = metrics.actual_balance || 0
    const saldoProjetado = metrics.projected_balance || 0
    const saldoMensalLiquido = metrics.predicted_income_remaining - metrics.predicted_expense_remaining // Aproximação

    let saldoAcum = saldoProjetado
    for (let i = 0; i < 6; i++) {
      const d = new Date(hoje)
      d.setMonth(d.getMonth() + i)
      const label = d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })
      
      if (i === 0) {
        meses.push({ label, saldo: saldoProjetado, delta: saldoProjetado - saldoAtual })
      } else {
        saldoAcum += saldoMensalLiquido
        meses.push({ label, saldo: saldoAcum, delta: saldoMensalLiquido })
      }
    }
    return meses
  }, [summary])

  if (loading || !summary) return <div className="page p-8 t-center t-muted">Carregando dashboard...</div>

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
          <div className="hero-value">{brl(metrics.projected_balance)}</div>
          <div className="hero-foot">
            <span className={metrics.projected_balance - metrics.actual_balance >= 0 ? 'delta-pos' : 'delta-neg'}>
              <Icon name={metrics.projected_balance - metrics.actual_balance >= 0 ? 'arrow_upward' : 'arrow_downward'} size={14} />
              {brl(Math.abs(metrics.projected_balance - metrics.actual_balance))}
            </span>
            <span className="t-xs t-muted">depois das {counts.pending_provisions} provisões pendentes</span>
          </div>
        </Glass>

        <Glass className="hero-card">
          <div className="hero-label">
            <Icon name="payments" size={16} />
            <span>RECEITAS DO CICLO</span>
          </div>
          <div className="hero-value-sm">{brl(metrics.realized_income)}</div>
          <div className="hero-bar">
            <div className="hero-bar-fill" style={{ background: '#22C55E', width: '100%' }} />
          </div>
          <div className="t-xs t-muted">+{brl(metrics.predicted_income_remaining)} ainda esperado</div>
        </Glass>

        <Glass className="hero-card">
          <div className="hero-label">
            <Icon name="shopping_bag" size={16} />
            <span>GASTOS DO CICLO</span>
          </div>
          <div className="hero-value-sm" style={{ color: '#F472B6' }}>{brl(metrics.realized_expense)}</div>
          <div className="hero-bar">
            <div className="hero-bar-fill" style={{ background: '#EC4899', width: Math.min(100, (metrics.realized_expense / (metrics.realized_income || 1)) * 100) + '%' }} />
          </div>
          <div className="t-xs t-muted">+{brl(metrics.predicted_expense_remaining)} já comprometidos</div>
        </Glass>
      </div>

      {counts.pending_transactions > 0 && (
        <button className="alert-banner" onClick={() => navigate('/transacoes')}>
          <div className="alert-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
            <Icon name="inbox" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-md">{counts.pending_transactions} transações aguardando categorização</div>
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
          <CategoryDonut data={gastosPorCat} total={metrics.realized_expense + metrics.card_consumption} />
          <div className="cat-list">
            {gastosPorCat.slice(0, 6).map((c: any) => {
              const pctTot = (c.valor / (metrics.realized_expense + metrics.card_consumption || 1)) * 100
              const pctOrc = c.limit ? (c.valor / c.limit) * 100 : null
              return (
                <div key={c.id} className="cat-row">
                  <div className="cat-row-head">
                    <span className="cat-dot" style={{ background: c.color }} />
                    <span className="cat-name">{c.label}</span>
                    <span className="cat-pct" style={{
                         color: pctOrc !== null
                           ? (pctOrc >= 100 ? "#EF4444" : pctOrc >= 85 ? "#F59E0B" : "var(--text)")
                           : "var(--text)",
                       }}>
                         {pctOrc !== null ? Math.round(pctOrc) + "%" : Math.round(pctTot) + "%"}
                    </span>
                  </div>
                  <div className="cat-row-bar">
                    <div className="cat-row-fill" style={{ 
                        width: Math.min(100, pctOrc !== null ? pctOrc : pctTot) + '%', 
                        background: pctOrc !== null && pctOrc >= 100 ? "#EF4444"
                                  : pctOrc !== null && pctOrc >= 85  ? "#F59E0B"
                                  : c.color 
                    }} />
                  </div>
                  <div className="cat-row-foot">
                    <span className="t-xs t-muted">{brl(c.valor)}</span>
                    <span className="t-xs t-muted">
                        {c.limit ? `de ${brl(c.limit)} de orçamento` : "sem orçamento"}
                    </span>
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
                {alertas.map((a: any) => (
                  <div key={a.cat.id} className="alert-row">
                    <div className="alert-row-icon" style={{ background: (a.cat.color || '#C084FC') + '20', color: a.cat.color || '#C084FC' }}>
                      <Icon name={a.cat.icon || 'warning'} size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="t-sm">{a.cat.label}</div>
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
              {topGastos.map((t: any) => (
                <div key={t.id} className="top-row">
                  <div className="top-row-icon" style={{ background: (t.category_color || '#C084FC') + '20', color: t.category_color || '#C084FC' }}>
                    <Icon name={t.category_icon || 'shopping_cart'} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </div>
                    <div className="t-xs t-muted">
                      {fmtData(t.date)} · {t.category_name}
                    </div>
                  </div>
                  <div className="t-sm" style={{ color: '#F472B6', fontVariantNumeric: 'tabular-nums' }}>
                    {brl(t.amount)}
                  </div>
                </div>
              ))}
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
  const R = 82, r = 62, cx = 90, cy = 90

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
    // hover: push slice outward
    const dx = hovered === i ? Math.cos(aMid) * 5 : 0
    const dy = hovered === i ? Math.sin(aMid) * 5 : 0
    // label outside ring: line from R+2 to R+14, text at R+18
    const Rline0 = R + 3, Rline1 = R + 15, Rtext = R + 22
    const lx0 = cx + Rline0 * Math.cos(aMid), ly0 = cy + Rline0 * Math.sin(aMid)
    const lx1 = cx + Rline1 * Math.cos(aMid), ly1 = cy + Rline1 * Math.sin(aMid)
    const lx  = cx + Rtext  * Math.cos(aMid), ly  = cy + Rtext  * Math.sin(aMid)
    return {
      path: `M ${x1+dx} ${y1+dy} A ${R} ${R} 0 ${large} 1 ${x2+dx} ${y2+dy} L ${x3+dx} ${y3+dy} A ${r} ${r} 0 ${large} 0 ${x4+dx} ${y4+dy} Z`,
      color: d.color, pct, lx, ly, lx0, ly0, lx1, ly1, label: d.label, aMid,
    }
  })

  const hov = hovered !== null ? slices[hovered] : null

  return (
    <div className="donut-wrap">
      <svg viewBox="-20 -20 220 220" className="donut" style={{ overflow: 'visible' }}>
        {slices.map((s, i) => (
          <path
            key={i} d={s.path} fill={s.color}
            style={{ cursor: 'pointer', transition: 'all 0.15s', opacity: hovered !== null && hovered !== i ? 0.45 : 1 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <circle cx={cx} cy={cy} r={r - 1} fill="rgba(20,15,35,0.6)" />
        {/* % labels outside ring */}
        {slices.map((s, i) => {
          if (s.pct < 7) return null
          const isHov = hovered === i
          const txt = Math.round(s.pct) + '%'
          const fs = isHov ? 12.5 : 11
          const pw = txt.length * fs * 0.62 + 7
          const ph = fs + 6
          const op = hovered !== null && !isHov ? 0.25 : 1
          const lxAdj = s.lx + (Math.cos(s.aMid) > 0 ? pw/2 : -pw/2)
          return (
            <g key={i} style={{ pointerEvents: 'none', transition: 'opacity 0.15s', opacity: op }}>
              <line x1={s.lx0} y1={s.ly0} x2={s.lx1} y2={s.ly1}
                stroke={s.color} strokeWidth="1.2" strokeOpacity="0.7" />
              <rect x={lxAdj - pw/2} y={s.ly - ph/2} width={pw} height={ph} rx={ph/2}
                fill={isHov ? s.color : 'rgba(10,6,20,0.85)'}
                stroke={s.color} strokeWidth="0.8" strokeOpacity="0.6" />
              <text x={lxAdj} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                fontSize={fs} fontWeight={isHov ? 700 : 600} fill="#fff"
                fontFamily="ui-monospace,monospace"
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
