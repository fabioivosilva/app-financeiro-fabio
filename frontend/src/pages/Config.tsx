import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader, SectionHeader } from '../components/layout/PageHeader'
import { Glass } from '../components/ui/Glass'
import { Icon } from '../components/ui/Icon'
import { IconPicker } from '../components/ui/IconPicker'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { api } from '../api/client'
import { toast } from '../components/ui/Toast'
import type { Card, Category, Person, Rule, Settings } from '../api/types'
import { CATEGORY_ICONS } from '../components/transactions/TransacaoRow'
import { BANCOS_DISPONIVEIS, BANKS_STORAGE_KEY, loadBancosAtivos } from '../config/banks'

const PERSON_COLORS = ['#820AD1', '#06B6D4', '#C084FC', '#22C55E', '#F59E0B', '#F472B6']
function personColor(id: number) { return PERSON_COLORS[id % PERSON_COLORS.length] }
function initials(name: string) { return name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() }
function fmtCurrency(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v) }

const GRUPOS = [
  { id: 'fixa',     label: 'Fixas',                  icon: 'lock',        color: '#6366F1' },
  { id: 'variavel', label: 'Variáveis',              icon: 'trending_up', color: '#EC4899' },
  { id: 'receita',  label: 'Receitas',               icon: 'payments',    color: '#22C55E' },
  { id: 'interna',  label: 'Movimentações internas', icon: 'swap_horiz',  color: '#94A3B8' },
]

export function Config() {
  const [persons, setPersons] = useState<Person[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [secao, setSecao] = useState('pessoas')

  const refPessoas = useRef<HTMLElement>(null)
  const refCategorias = useRef<HTMLElement>(null)
  const refBancos = useRef<HTMLElement>(null)
  const refSistema = useRef<HTMLElement>(null)
  const refPerigo = useRef<HTMLElement>(null)

  const [bancosAtivos, setBancosAtivos] = useState<string[]>(loadBancosAtivos)
  function toggleBanco(id: string) {
    const ativando = !bancosAtivos.includes(id)
    const next = ativando ? [...bancosAtivos, id] : bancosAtivos.filter(b => b !== id)
    localStorage.setItem(BANKS_STORAGE_KEY, JSON.stringify(next))
    setBancosAtivos(next)
    const banco = BANCOS_DISPONIVEIS.find(b => b.id === id)
    toast(
      ativando ? `${banco?.label ?? id} ativado` : `${banco?.label ?? id} desativado`,
      ativando ? 'Formatos de importação habilitados' : 'Removido da importação',
      ativando ? 'success' : 'info'
    )
  }

  const [personModal, setPersonModal] = useState<{ open: boolean; editing?: Person }>({ open: false })
  const [cardModal, setCardModal] = useState<{ open: boolean; editing?: Card }>({ open: false })
  const [catModal, setCatModal] = useState<{ open: boolean; editing?: Category; parentId?: number }>({ open: false })

  function load() {
    setLoading(true)
    Promise.all([
      api.get<Person[]>('/persons/'),
      api.get<Card[]>('/cards/'),
      api.get<Category[]>('/categories/'),
      api.get<Rule[]>('/rules/'),
    ]).then(([p, c, cat, rls]) => {
      setPersons(p); setCards(c); setCategories(cat); setRules(rls)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const scrollingRef = useRef(false)

  // Atualiza item ativo conforme o usuário rola
  useEffect(() => {
    const sectionRefs: [string, React.RefObject<HTMLElement | null>][] = [
      ['pessoas', refPessoas], ['categorias', refCategorias],
      ['bancos', refBancos], ['sistema', refSistema], ['perigo', refPerigo],
    ]
    const observer = new IntersectionObserver(
      entries => {
        if (scrollingRef.current) return
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          const found = sectionRefs.find(([, ref]) => ref.current === visible[0].target)
          if (found) setSecao(found[0])
        }
      },
      { threshold: 0, rootMargin: '0px 0px -55% 0px' }
    )
    sectionRefs.forEach(([, ref]) => { if (ref.current) observer.observe(ref.current) })
    return () => observer.disconnect()
  }, [loading])

  function goTo(id: string) {
    setSecao(id)
    scrollingRef.current = true
    setTimeout(() => { scrollingRef.current = false }, 900)
    const map: Record<string, React.RefObject<HTMLElement | null>> = {
      pessoas: refPessoas, categorias: refCategorias, bancos: refBancos, sistema: refSistema, perigo: refPerigo,
    }
    const target = map[id]?.current
    if (!target) return
    // Walk up the DOM to find the scrollable container and accumulate offsetTop
    let el: HTMLElement | null = target
    let offsetTop = 0
    while (el && el !== document.body) {
      offsetTop += el.offsetTop
      const parent = el.offsetParent as HTMLElement | null
      if (parent && getComputedStyle(parent).overflowY !== 'visible') {
        parent.scrollTo({ top: offsetTop - 16, behavior: 'smooth' })
        return
      }
      el = parent
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function deletePerson(id: number) {
    if (!confirm('Remover pessoa?')) return
    try {
      await api.delete(`/persons/${id}`)
      toast('Pessoa removida', undefined, 'info')
      load()
    } catch {
      toast('Erro ao remover pessoa', undefined, 'error')
    }
  }

  async function deleteCard(id: number) {
    if (!confirm('Remover cartão?')) return
    try {
      await api.delete(`/cards/${id}`)
      toast('Cartão removido', undefined, 'info')
      load()
    } catch {
      toast('Erro ao remover cartão', undefined, 'error')
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Remover categoria?')) return
    try {
      await api.delete(`/categories/${id}`)
      toast('Categoria removida', undefined, 'info')
      load()
    } catch {
      toast('Erro ao remover categoria', undefined, 'error')
    }
  }

  const navItems = [
    { id: 'pessoas',    label: 'Pessoas & Cartões', icon: 'group' },
    { id: 'categorias', label: 'Categorias',        icon: 'label' },
    { id: 'bancos',     label: 'Bancos',            icon: 'account_balance' },
    { id: 'sistema',    label: 'Sistema',           icon: 'tune' },
    { id: 'perigo',     label: 'Zona de Perigo',    icon: 'warning', danger: true },
  ]

  return (
    <div className="page page-config">
      <PageHeader title="Configurações" subtitle="Pessoas, cartões, categorias e ajustes do sistema" />

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
      ) : (
        <div className="cfg-layout">
          <aside className="cfg-side">
            {navItems.map(it => (
              <button
                key={it.id}
                className={`cfg-side-item${secao === it.id ? ' cfg-side-item-on' : ''}${it.danger ? ' cfg-side-item-danger' : ''}`}
                onClick={() => goTo(it.id)}
              >
                <Icon name={it.icon} size={18} />
                <span>{it.label}</span>
              </button>
            ))}
          </aside>

          <div className="cfg-content">
            {/* Pessoas & Cartões */}
            <section ref={refPessoas}>
              <div className="cfg-section-head">
                <div>
                  <div className="cfg-section-title">Pessoas & Cartões</div>
                  <div className="t-xs t-muted">Vincule transações a pessoas e cartões aos seus titulares</div>
                </div>
              </div>
              <div className="grid-2">
                <Glass>
                  <SectionHeader
                    title="Pessoas"
                    hint={`${persons.length} cadastradas`}
                    right={
                      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 12px' }}
                        onClick={() => setPersonModal({ open: true })}>
                        <Icon name="person_add" size={14} /> Adicionar
                      </button>
                    }
                  />
                  <div className="pessoa-grid">
                    {persons.map(p => {
                      const cor = personColor(p.id)
                      const cardCount = cards.filter(c => c.person_id === p.id).length
                      return (
                        <div key={p.id} className="pessoa-card">
                          <div className="pessoa-card-avatar" style={{ background: `linear-gradient(135deg, ${cor}, ${cor}80)` }}>
                            {initials(p.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="t-sm">{p.name}</div>
                            <div className="t-xs t-muted">{cardCount} cartão{cardCount !== 1 ? 'ões' : ''} vinculado{cardCount !== 1 ? 's' : ''}</div>
                          </div>
                          <div className="pessoa-actions">
                            <button className="btn-icon" onClick={() => setPersonModal({ open: true, editing: p })}><Icon name="edit" size={16} /></button>
                            <button className="btn-icon" onClick={() => deletePerson(p.id)}><Icon name="delete" size={16} /></button>
                          </div>
                        </div>
                      )
                    })}
                    {persons.length === 0 && <div className="t-sm t-muted" style={{ padding: 12 }}>Nenhuma pessoa cadastrada.</div>}
                  </div>
                </Glass>

                <Glass>
                  <SectionHeader
                    title="Cartões"
                    hint={`${cards.length} cadastrados`}
                    right={
                      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 12px' }}
                        onClick={() => setCardModal({ open: true })}>
                        <Icon name="add_card" size={14} /> Adicionar
                      </button>
                    }
                  />
                  <div className="cartao-mini-grid">
                    {cards.map(c => {
                      const owner = persons.find(p => p.id === c.person_id)
                      const cor = owner ? personColor(owner.id) : '#820AD1'
                      return (
                        <div key={c.id} className="cartao-mini">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div className="cartao-mini-bandeira">CARTÃO</div>
                            <div style={{ display: 'flex', gap: 2, opacity: 0.7 }}>
                              <button className="btn-icon" style={{ padding: 2 }} onClick={() => setCardModal({ open: true, editing: c })}><Icon name="edit" size={13} /></button>
                              <button className="btn-icon" style={{ padding: 2 }} onClick={() => deleteCard(c.id)}><Icon name="delete" size={13} /></button>
                            </div>
                          </div>
                          <div className="cartao-mini-num">{c.last4 ? `•••• ${c.last4}` : c.name}</div>
                          <div className="cartao-mini-foot">
                            <div className="cartao-mini-nome">{c.name}{c.limit_value ? ` · ${fmtCurrency(c.limit_value)}` : ''}</div>
                            {owner && (
                              <div className="cartao-mini-pessoa">
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: cor + '30', color: cor, border: `1px solid ${cor}50`, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600 }}>
                                  {initials(owner.name)}
                                </div>
                                <span className="t-xs">{owner.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {cards.length === 0 && <div className="t-sm t-muted" style={{ padding: 12 }}>Nenhum cartão cadastrado.</div>}
                  </div>
                </Glass>
              </div>
            </section>

            {/* Categorias */}
            <section ref={refCategorias}>
              <CategoriaSection
                categories={categories}
                rules={rules}
                onEdit={cat => setCatModal({ open: true, editing: cat })}
                onDelete={deleteCategory}
                onAdd={() => setCatModal({ open: true })}
                onAddSub={parentId => setCatModal({ open: true, parentId })}
              />
            </section>

            {/* Bancos */}
            <section ref={refBancos} className="cfg-section">
              <SectionHeader title="Bancos" hint="Selecione os bancos que você utiliza. Apenas os formatos de importação destes bancos serão exibidos." />
              <div className="cfg-bancos-grid">
                {BANCOS_DISPONIVEIS.map(banco => {
                  const disponivel = banco.available !== false
                  const ativo = disponivel && bancosAtivos.includes(banco.id)
                  return (
                    <button
                      key={banco.id}
                      type="button"
                      onClick={() => disponivel && toggleBanco(banco.id)}
                      className={`cfg-banco-card${ativo ? ' cfg-banco-card-on' : ''}${!disponivel ? ' cfg-banco-card-disabled' : ''}`}
                      aria-pressed={ativo}
                      aria-disabled={!disponivel}
                      title={!disponivel ? 'Em construção — parser não disponível ainda' : undefined}
                    >
                      <div className="cfg-banco-top">
                        <span className="cfg-banco-logo">
                          <img src={banco.icon} alt="" aria-hidden="true" />
                        </span>
                        <span className={`cfg-banco-check${ativo ? ' cfg-banco-check-on' : ''}`}>
                          <Icon name={!disponivel ? 'construction' : ativo ? 'check_circle' : 'radio_button_unchecked'} size={20} />
                        </span>
                      </div>
                      <p className="cfg-banco-nome">{banco.label}</p>
                      <div className="cfg-banco-formatos">
                        {!disponivel
                          ? <span className="cfg-banco-chip cfg-banco-chip-wip">Em construção</span>
                          : banco.formatos.map(f => <span key={f} className="cfg-banco-chip">{f}</span>)
                        }
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Sistema */}
            <section ref={refSistema}>
              <SistemaSection />
              <SyncSection onApplied={load} />
            </section>

            {/* Zona de Perigo */}
            <section ref={refPerigo}>
              <ZonaPerigoSection />
            </section>
          </div>
        </div>
      )}

      {/* Modais */}
      <PersonModal
        open={personModal.open}
        editing={personModal.editing}
        onClose={() => setPersonModal({ open: false })}
        onSaved={load}
      />
      <CardModal
        open={cardModal.open}
        editing={cardModal.editing}
        persons={persons}
        onClose={() => setCardModal({ open: false })}
        onSaved={load}
      />
      <CategoryModal
        open={catModal.open}
        editing={catModal.editing}
        parentId={catModal.parentId}
        parent={
          catModal.parentId
            ? categories.find(c => c.id === catModal.parentId)
            : catModal.editing?.parent_id
              ? categories.find(c => c.id === catModal.editing!.parent_id)
              : undefined
        }
        onClose={() => setCatModal({ open: false })}
        onSaved={load}
      />
    </div>
  )
}

// ─── Categorias ────────────────────────────────────────────────────────────────

function CategoriaSection({ categories, rules, onEdit, onDelete, onAdd, onAddSub }: {
  categories: Category[]
  rules: Rule[]
  onEdit: (c: Category) => void
  onDelete: (id: number) => void
  onAdd: () => void
  onAddSub: (parentId: number) => void
}) {
  const [busca, setBusca] = useState('')
  const [grupo, setGrupo] = useState('todos')

  const COLLAPSE_KEY = 'cfg_cat_groups_collapsed'
  const [collapsed, setCollapsed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '[]') } catch { return [] }
  })
  function toggleGroup(id: string) {
    setCollapsed(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next))
      return next
    })
  }

  const topLevel = useMemo(() => categories.filter(c => !c.parent_id), [categories])

  const filtered = useMemo(() => topLevel.filter(c => {
    if (grupo !== 'todos' && (c.type ?? 'variavel') !== grupo) return false
    if (busca && !c.name.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  }), [topLevel, busca, grupo])

  const grouped = useMemo(() => {
    const out: Record<string, Category[]> = {}
    filtered.forEach(c => { const t = c.type ?? 'variavel'; (out[t] = out[t] || []).push(c) })
    return out
  }, [filtered])

  return (
    <>
      <div className="cfg-section-head">
        <div>
          <div className="cfg-section-title">Categorias</div>
          <div className="t-xs t-muted">{topLevel.length} categorias</div>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 12px' }} onClick={onAdd}>
          <Icon name="add" size={14} /> Nova categoria
        </button>
      </div>

      <Glass padded={false} className="cfg-cat-toolbar">
          <div className="search-wrap" style={{ flex: 1, minWidth: 180 }}>
            <Icon name="search" size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar categoria..."
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', font: 'inherit', fontSize: 13, flex: 1 }}
            />
          </div>
          <div className="cfg-grupo-tabs">
            <button className={`cfg-grupo${grupo === 'todos' ? ' cfg-grupo-on' : ''}`} onClick={() => setGrupo('todos')}>
              Todas <span style={{ fontSize: 11, opacity: 0.6 }}>{topLevel.length}</span>
            </button>
            {GRUPOS.map(g => {
              const count = topLevel.filter(c => (c.type ?? 'variavel') === g.id).length
              return (
                <button
                  key={g.id}
                  className={`cfg-grupo${grupo === g.id ? ' cfg-grupo-on' : ''}`}
                  onClick={() => setGrupo(g.id)}
                  style={grupo === g.id ? { borderColor: g.color, background: g.color + '20' } : {}}
                >
                  <Icon name={g.icon} size={14} style={{ color: g.color }} />
                  {g.label}
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
                </button>
              )
            })}
          </div>
      </Glass>

      {GRUPOS.filter(g => grouped[g.id]?.length).map(g => {
        const isCollapsed = collapsed.includes(g.id)
        return (
        <div key={g.id} className={`cfg-cat-group${isCollapsed ? ' cfg-cat-group-collapsed' : ''}`}>
          <button type="button" className="cfg-cat-group-head" onClick={() => toggleGroup(g.id)}>
            <div className="cfg-cat-group-icon" style={{ background: g.color + '20', color: g.color }}>
              <Icon name={g.icon} size={16} />
            </div>
            <div className="cfg-cat-group-title">{g.label}</div>
            <div className="t-xs t-muted">{grouped[g.id].length} categorias</div>
            <Icon name="expand_more" size={18} className="cfg-cat-group-chevron" />
          </button>
          {!isCollapsed && (
            <div className="cfg-cat-grid">
              {grouped[g.id].map(cat => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  subs={categories.filter(c => c.parent_id === cat.id)}
                  rules={rules}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddSub={onAddSub}
                />
              ))}
            </div>
          )}
        </div>
        )
      })}

      {filtered.length === 0 && (
        <Glass>
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Icon name="search_off" size={32} />
            <div className="t-sm" style={{ marginTop: 8 }}>Nenhuma categoria encontrada</div>
          </div>
        </Glass>
      )}
    </>
  )
}

function CategoryCard({ cat, subs, rules, onEdit, onDelete, onAddSub }: {
  cat: Category
  subs: Category[]
  rules: Rule[]
  onEdit: (c: Category) => void
  onDelete: (id: number) => void
  onAddSub: (parentId: number) => void
}) {
  const [open, setOpen] = useState(false)
  const color = cat.color ?? '#888'
  return (
    <div className={`cfg-cat-card${open ? ' cfg-cat-card-open' : ''}`} style={{ ['--cat-color' as string]: color }}>
      <div className="cfg-cat-card-bar" />
      <div className="cfg-cat-card-head">
        <div className="cfg-cat-card-icon" style={{ background: color + '25', color }}>
          <Icon name={cat.icon ?? CATEGORY_ICONS[cat.name] ?? 'label'} size={18} />
        </div>
        <div className="cfg-cat-card-name">{cat.name}</div>
        <div className="cfg-cat-card-actions">
          <button className="btn-icon" title="Editar" onClick={() => onEdit(cat)}><Icon name="edit" size={14} /></button>
          <button className="btn-icon" title="Excluir" onClick={() => onDelete(cat.id)}><Icon name="delete" size={14} /></button>
        </div>
      </div>
      <div className="cfg-cat-card-badges">
        {cat.exclude_totals
          ? <span className="cfg-badge" style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)' }}>
              <Icon name="visibility_off" size={12} /> Fora dos totais
            </span>
          : cat.limit_value
            ? <span className="cfg-badge"><Icon name="speed" size={12} /> {fmtCurrency(cat.limit_value)}/mês</span>
            : <span className="t-xs t-muted">Sem regras especiais</span>
        }
      </div>
      <button className="cfg-sub-toggle" onClick={() => setOpen(o => !o)}>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={16} />
        <span>{subs.length > 0 ? `${subs.length} subcategoria${subs.length > 1 ? 's' : ''}` : 'Adicionar subcategoria'}</span>
        {!open && subs.length > 0 && (
          <div className="cfg-sub-preview">
            {subs.slice(0, 4).map(s => (
              <div key={s.id} className="cfg-sub-dot" style={{ background: color + '30', color }} title={s.name}>
                <Icon name={s.icon ?? CATEGORY_ICONS[s.name] ?? 'label'} size={11} />
              </div>
            ))}
            {subs.length > 4 && <div className="cfg-sub-more">+{subs.length - 4}</div>}
          </div>
        )}
      </button>
      {open && (
        <div className="cfg-sub-list">
          {subs.map(s => (
            <div key={s.id} className="cfg-sub-row">
              <div className="cfg-sub-icon" style={{ background: color + '20', color }}>
                <Icon name={s.icon ?? CATEGORY_ICONS[s.name] ?? 'label'} size={13} />
              </div>
              <div className="cfg-sub-name">{s.name}</div>
              <div className="cfg-sub-meta">
                <span className="cfg-sub-meta-item" title="Palavras-chave">
                  <Icon name="key" size={11} /> {rules.filter(r => r.category_id === s.id).length}
                </span>
              </div>
              <button className="btn-icon btn-icon-sm" onClick={() => onEdit(s)}><Icon name="edit" size={12} /></button>
              <button className="btn-icon btn-icon-sm" onClick={() => onDelete(s.id)}><Icon name="close" size={12} /></button>
            </div>
          ))}
          <button className="cfg-sub-add" onClick={() => onAddSub(cat.id)}>
            <Icon name="add" size={14} /> Nova subcategoria
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sistema ────────────────────────────────────────────────────────────────���──

function SistemaSection() {
  const savedPasta = localStorage.getItem('importFolder') ?? ''
  const savedDia = Number(localStorage.getItem('cycleDayStart') ?? '27')

  const [pasta, setPasta] = useState(savedPasta)
  const [diaCiclo, setDiaCiclo] = useState(savedDia)
  const [savedBackendPasta, setSavedBackendPasta] = useState(savedPasta)
  const [savedBackendDia, setSavedBackendDia] = useState(savedDia)
  const [justSaved, setJustSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const dirty = pasta !== savedBackendPasta || diaCiclo !== savedBackendDia

  useEffect(() => {
    let alive = true
    api.get<Settings>('/imports/settings')
      .then(settings => {
        if (!alive) return
        const folder = settings.default_import_folder ?? savedPasta
        const day = settings.cycle_start_day ?? savedDia
        setPasta(folder)
        setDiaCiclo(day)
        setSavedBackendPasta(folder)
        setSavedBackendDia(day)
        localStorage.setItem('importFolder', folder)
        localStorage.setItem('cycleDayStart', String(day))
      })
      .catch(() => {
        setSavedBackendPasta(savedPasta)
        setSavedBackendDia(savedDia)
      })
    return () => { alive = false }
  }, [savedDia, savedPasta])

  async function handleSave() {
    let day = String(Math.min(31, Math.max(1, diaCiclo)))
    setSaving(true)
    try {
      const settings = await api.put<Settings>('/imports/settings', {
        default_import_folder: pasta.trim(),
        cycle_start_day: Number(day),
      })
      const folder = settings.default_import_folder ?? ''
      const savedDay = settings.cycle_start_day ?? Number(day)
      day = String(savedDay)
      setPasta(folder)
      setDiaCiclo(savedDay)
      setSavedBackendPasta(folder)
      setSavedBackendDia(savedDay)
      localStorage.setItem('importFolder', folder)
      localStorage.setItem('cycleDayStart', String(savedDay))
      window.dispatchEvent(new StorageEvent('storage', { key: 'cycleDayStart', newValue: String(savedDay) }))
    } catch {
      setSaving(false)
      toast('Erro ao salvar', 'Nao consegui gravar as configuracoes no backend', 'error')
      return
    }
    localStorage.setItem('cycleDayStart', day)
    window.dispatchEvent(new StorageEvent('storage', { key: 'cycleDayStart', newValue: day }))
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
    setSaving(false)
    toast('Configurações salvas', `Pasta e ciclo (dia ${day}) atualizados`)
  }

  return (
    <>
      <div className="cfg-section-head">
        <div>
          <div className="cfg-section-title">Sistema</div>
          <div className="t-xs t-muted">Ajustes gerais do app</div>
        </div>
      </div>
      <Glass>
        <div className="cfg-form">
          <div className="cfg-field">
            <label className="cfg-label"><Icon name="folder" size={16} /> Pasta de importação padrão</label>
            <div className="cfg-hint">Caminho onde o app procura novos extratos automaticamente</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="cfg-input"
                value={pasta}
                onChange={e => setPasta(e.target.value)}
                placeholder="C:\Users\...\Financeiro\Importacoes"
                style={{ userSelect: 'text', pointerEvents: 'auto' }}
              />
              <button
                className="btn-ghost"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={async () => {
                  try {
                    // @ts-ignore — File System Access API
                    const dir = await window.showDirectoryPicker({ mode: 'read' })
                    // Browser não expõe caminho completo — pré-preenche o nome para o usuário completar
                    if (!pasta) setPasta(dir.name)
                    else setPasta(p => p.endsWith('\\') || p.endsWith('/') ? p + dir.name : p + '\\' + dir.name)
                  } catch {
                    // usuário cancelou
                  }
                }}
              >
                <Icon name="folder_open" size={15} />
                Procurar
              </button>
            </div>
          </div>
          <div className="cfg-field">
            <label className="cfg-label"><Icon name="event" size={16} /> Dia de início do ciclo</label>
            <div className="cfg-hint">Define o período mensal usado nos relatórios (ex: 27 → 26)</div>
            <div className="cfg-input-row">
              <input type="number" min={1} max={31} className="cfg-input cfg-input-num" value={diaCiclo} onChange={e => setDiaCiclo(Number(e.target.value))} />
              <span className="t-sm t-muted">do mês</span>
            </div>
            <div className="cfg-hint" style={{ marginTop: 4, fontSize: 11 }}>Dias 29-31: nos meses sem esse dia, ajusta automaticamente para o último dia do mês.</div>
          </div>
          <div className="cfg-form-foot">
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px', opacity: dirty || justSaved || saving ? 1 : 0.4 }}
              onClick={handleSave}
              disabled={saving || (!dirty && !justSaved)}
            >
              <Icon name={saving ? 'hourglass_empty' : justSaved ? 'check' : 'save'} size={14} />
              {justSaved ? 'Salvo!' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </Glass>
    </>
  )
}

// ─── Sincronizar com parceiro (placeholder) ───────────────────────────────────

function SyncSection({ onApplied: _onApplied }: { onApplied: () => void }) {
  const lastSync = localStorage.getItem('sync_last_at')
  const label = lastSync
    ? new Date(lastSync).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <>
      <div className="cfg-section-head" style={{ marginTop: 24 }}>
        <div className="cfg-section-title">Sincronização automática</div>
      </div>
      <Glass>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(192,132,252,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="construction" size={20} style={{ color: '#C084FC' }} />
          </div>
          <div>
            <div className="t-sm" style={{ fontWeight: 500 }}>Em desenvolvimento</div>
            <div className="t-xs t-muted">
              {label ? `Último sync: ${label}` : 'Sync automático via repositório compartilhado chegando em breve.'}
            </div>
          </div>
        </div>
      </Glass>
    </>
  )
}

// ─── Zona de Perigo ────────────────────────────────────────────────────────────

function ZonaPerigoSection() {
  const [confirmando, setConfirmando] = useState(false)
  const [texto, setTexto] = useState('')
  const [clearing, setClearing] = useState(false)
  const PALAVRA = 'LIMPAR TUDO'

  async function handleClear() {
    setClearing(true)
    try {
      await api.delete('/transactions/')
      setConfirmando(false)
      setTexto('')
      toast('Transações apagadas', 'Banco de dados limpo', 'info')
    } catch {
      toast('Erro ao apagar transações', undefined, 'error')
    } finally {
      setClearing(false)
    }
  }

  return (
    <>
      <div className="cfg-section-head">
        <div>
          <div className="cfg-section-title cfg-danger-title"><Icon name="warning" size={18} /> Zona de Perigo</div>
          <div className="t-xs t-muted">Ações irreversíveis — proceda com cuidado</div>
        </div>
      </div>
      <div className="cfg-danger-card">
        <div className="cfg-danger-icon"><Icon name="delete_forever" size={24} /></div>
        <div style={{ flex: 1 }}>
          <div className="cfg-danger-h">Limpar todas as transações e faturas</div>
          <div className="cfg-danger-p">
            Remove permanentemente todos os extratos importados, faturas, categorizações e vínculos.{' '}
            <strong>Pessoas, cartões, categorias e regras serão preservados.</strong>{' '}
            Esta ação não pode ser desfeita.
          </div>
          {!confirmando ? (
            <button className="btn-danger-outline" onClick={() => setConfirmando(true)}>
              <Icon name="delete_forever" size={14} /> Limpar todas as transações
            </button>
          ) : (
            <div className="cfg-danger-confirm">
              <div className="t-xs t-muted">Para confirmar, digite <code>{PALAVRA}</code> no campo abaixo:</div>
              <div className="cfg-input-row">
                <input
                  className="cfg-input cfg-input-danger"
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder={PALAVRA}
                  autoFocus
                />
                <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setConfirmando(false); setTexto('') }}>Cancelar</button>
                <button
                  className="btn-danger"
                  disabled={texto !== PALAVRA || clearing}
                  onClick={handleClear}
                >
                  <Icon name="delete_forever" size={14} /> {clearing ? 'Limpando...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Modais ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(192,132,252,0.1)', borderRadius: 8,
  color: 'var(--text)', font: 'inherit', fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }

function PersonModal({ open, editing, onClose, onSaved }: { open: boolean; editing?: Person; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (open) setName(editing?.name ?? '') }, [open, editing])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/persons/${editing.id}`, { name: name.trim() })
        toast('Pessoa atualizada', name.trim())
      } else {
        await api.post('/persons/', { name: name.trim() })
        toast('Pessoa criada', name.trim())
      }
      onSaved(); onClose()
    } catch {
      toast('Erro ao salvar pessoa', undefined, 'error')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar pessoa' : 'Nova pessoa'}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}</Button>
      </>}>
      <div style={fieldStyle}>
        <label style={labelStyle}>Nome</label>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="ex: Fabio, Fernanda..." style={inputStyle} />
      </div>
    </Modal>
  )
}

function CardModal({ open, editing, persons, onClose, onSaved }: { open: boolean; editing?: Card; persons: Person[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [last4, setLast4] = useState('')
  const [personId, setPersonId] = useState<number | ''>('')
  const [limitValue, setLimitValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setLast4(editing?.last4 ?? '')
      setPersonId(editing?.person_id ?? (persons[0]?.id ?? ''))
      setLimitValue(editing?.limit_value ? String(editing.limit_value) : '')
    }
  }, [open, editing, persons])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = { name: name.trim(), last4: last4.trim() || null, person_id: Number(personId) || null, limit_value: limitValue ? Number(limitValue) : null }
      if (editing) {
        await api.put(`/cards/${editing.id}`, payload)
        toast('Cartão atualizado', name.trim())
      } else {
        await api.post('/cards/', payload)
        toast('Cartão criado', name.trim())
      }
      onSaved(); onClose()
    } catch {
      toast('Erro ao salvar cartão', undefined, 'error')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar cartão' : 'Novo cartão'}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}</Button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Nome do cartão</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="ex: Itaú Visa Infinite" style={inputStyle} />
        </div>
        <div className="modal-row">
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Últimos 4 dígitos</label>
            <input value={last4} onChange={e => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4291" maxLength={4} style={inputStyle} />
          </div>
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Limite (R$)</label>
            <input type="number" value={limitValue} onChange={e => setLimitValue(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Titular</label>
          <select value={personId} onChange={e => setPersonId(Number(e.target.value))} style={{ ...inputStyle, fontFamily: 'inherit' }}>
            <option value="">Sem titular</option>
            {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}

function CategoryModal({ open, editing, parentId, parent, onClose, onSaved }: { open: boolean; editing?: Category; parentId?: number; parent?: Category; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#820AD1')
  const [icon, setIcon] = useState('label')
  const [type, setType] = useState<'fixa' | 'variavel'>('variavel')
  const [limitValue, setLimitValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      // Subcategoria SEMPRE usa cor do pai (atualiza se pai mudar de cor)
      const isSub = !!parentId || !!editing?.parent_id
      setColor(isSub ? (parent?.color ?? '#820AD1') : (editing?.color ?? '#820AD1'))
      setIcon(editing?.icon ?? 'label')
      setType((editing?.type as 'fixa' | 'variavel') ?? (parent?.type as 'fixa' | 'variavel') ?? 'variavel')
      setLimitValue(editing?.limit_value ? String(editing.limit_value) : '')
    }
  }, [open, editing, parent, parentId])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        color,
        icon,
        type,
        limit_value: limitValue ? Number(limitValue) : null,
        parent_id: parentId ?? editing?.parent_id ?? null,
      }
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload)
        toast('Categoria atualizada', name.trim())
      } else {
        await api.post('/categories/', payload)
        toast('Categoria criada', name.trim())
      }
      onSaved(); onClose()
    } catch {
      toast('Erro ao salvar categoria', undefined, 'error')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar categoria' : parentId ? 'Nova subcategoria' : 'Nova categoria'}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()}>{saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}</Button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="modal-row" style={{ alignItems: 'end' }}>
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Nome</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="ex: Mercado, Lazer..." style={inputStyle} />
          </div>
          {!parentId && !editing?.parent_id && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Cor</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: 44, height: 38, padding: 2, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(192,132,252,0.1)', borderRadius: 8, cursor: 'pointer' }} />
            </div>
          )}
        </div>
        {(parentId || editing?.parent_id) && (
          <div className="t-xs t-muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -8 }}>
            <Icon name="palette" size={14} />
            Cor herdada da categoria pai
            <span className="cfg-sub-color-dot" style={{ background: color }} />
          </div>
        )}
        <div style={fieldStyle}>
          <label style={labelStyle}>Ícone</label>
          <IconPicker selectedIcon={icon} selectedColor={color} onSelect={setIcon} />
        </div>
        <div className="modal-row">
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as 'fixa' | 'variavel')} style={{ ...inputStyle, fontFamily: 'inherit' }}>
              <option value="variavel">Variável</option>
              <option value="fixa">Fixa</option>
            </select>
          </div>
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label style={labelStyle}>Limite mensal (R$)</label>
            <input type="number" value={limitValue} onChange={e => setLimitValue(e.target.value)} placeholder="Sem limite" style={inputStyle} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
