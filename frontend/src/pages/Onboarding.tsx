import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { api } from '../api/client'
import { BANCOS_DISPONIVEIS, BANKS_STORAGE_KEY } from '../config/banks'

interface Props {
  onDone: () => void
}

const STEPS = ['Boas-vindas', 'Ciclo', 'Bancos']

export function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const [nome, setNome] = useState('')
  const [ciclo, setCiclo] = useState(27)
  const [bancos, setBancos] = useState<string[]>(['itau'])
  const [saving, setSaving] = useState(false)

  function toggleBanco(id: string) {
    setBancos(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
  }

  async function finish() {
    setSaving(true)
    try {
      await api.post('/perfil/', { nome: nome.trim() || 'Usuário', ciclo_inicio: ciclo, bancos })
      localStorage.setItem('cycleDayStart', String(ciclo))
      localStorage.setItem(BANKS_STORAGE_KEY, JSON.stringify(bancos))
      window.dispatchEvent(new StorageEvent('storage', { key: 'cycleDayStart', newValue: String(ciclo) }))
      onDone()
    } finally { setSaving(false) }
  }

  const canNext = step === 0 ? true : step === 1 ? ciclo >= 1 && ciclo <= 31 : bancos.length > 0

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Progress */}
        <div className="onboarding-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`onboarding-step${i <= step ? ' onboarding-step-on' : ''}`}>
              <div className="onboarding-step-dot">{i < step ? <Icon name="check" size={12} /> : i + 1}</div>
              <span className="t-xs">{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Boas-vindas */}
        {step === 0 && (
          <div className="onboarding-body">
            <div className="onboarding-icon">
              <Icon name="savings" size={40} />
            </div>
            <h2 className="onboarding-title">Bem-vindo ao App Financeiro</h2>
            <p className="t-sm t-muted" style={{ textAlign: 'center', maxWidth: 360 }}>
              Vamos configurar seu perfil em 3 passos rápidos para personalizar a experiência.
            </p>
            <div className="cfg-field" style={{ width: '100%', maxWidth: 320 }}>
              <label className="cfg-label">Como quer ser chamado?</label>
              <input
                autoFocus
                className="cfg-input"
                placeholder="Ex: Fabio"
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep(1)}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Ciclo */}
        {step === 1 && (
          <div className="onboarding-body">
            <div className="onboarding-icon" style={{ background: '#820AD120' }}>
              <Icon name="event_repeat" size={40} />
            </div>
            <h2 className="onboarding-title">Ciclo financeiro</h2>
            <p className="t-sm t-muted" style={{ textAlign: 'center', maxWidth: 360 }}>
              Seu ciclo vai do dia <strong>{ciclo}</strong> de cada mês até o dia{' '}
              <strong>{ciclo === 1 ? 31 : ciclo - 1}</strong> do mês seguinte.
            </p>
            <div className="cfg-field" style={{ alignItems: 'center' }}>
              <label className="cfg-label">Dia de início do ciclo</label>
              <input
                type="number"
                min={1}
                max={31}
                className="cfg-input cfg-input-num"
                style={{ width: 100, textAlign: 'center', fontSize: 28, fontWeight: 700 }}
                value={ciclo}
                onChange={e => setCiclo(Math.min(31, Math.max(1, Number(e.target.value))))}
              />
              <span className="t-xs t-muted">Padrão: dia 27 (vencimento comum de salário)</span>
            </div>
          </div>
        )}

        {/* Step 2 — Bancos */}
        {step === 2 && (
          <div className="onboarding-body">
            <div className="onboarding-icon" style={{ background: '#22C55E20' }}>
              <Icon name="account_balance" size={40} />
            </div>
            <h2 className="onboarding-title">Quais bancos você usa?</h2>
            <p className="t-sm t-muted" style={{ textAlign: 'center', maxWidth: 360 }}>
              Só os formatos destes bancos aparecerão na importação.
            </p>
            <div className="cfg-bancos-grid" style={{ width: '100%' }}>
              {BANCOS_DISPONIVEIS.filter(b => b.available !== false).map(banco => {
                const ativo = bancos.includes(banco.id)
                return (
                  <button
                    key={banco.id}
                    type="button"
                    onClick={() => toggleBanco(banco.id)}
                    className={`cfg-banco-card${ativo ? ' cfg-banco-card-on' : ''}`}
                  >
                    <div className="cfg-banco-top">
                      <span className="cfg-banco-logo">
                        <img src={banco.icon} alt="" aria-hidden="true" />
                      </span>
                      <span className={`cfg-banco-check${ativo ? ' cfg-banco-check-on' : ''}`}>
                        <Icon name={ativo ? 'check_circle' : 'radio_button_unchecked'} size={20} />
                      </span>
                    </div>
                    <p className="cfg-banco-nome">{banco.label}</p>
                    <div className="cfg-banco-formatos">
                      {banco.formatos.map(f => <span key={f} className="cfg-banco-fmt">{f}</span>)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="onboarding-foot">
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
              <Icon name="arrow_back" size={16} /> Voltar
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext}>
              Próximo <Icon name="arrow_forward" size={16} />
            </button>
          ) : (
            <button className="btn-primary" onClick={finish} disabled={!canNext || saving}>
              {saving ? 'Salvando...' : 'Começar'} <Icon name="check" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
