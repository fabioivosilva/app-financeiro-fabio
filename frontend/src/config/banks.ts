export interface BankConfig {
  id: string
  label: string
  icon: string
  formatos: string[]
  extensions: string[]
  keywords: string[]
  available?: boolean
}

export const BANKS_STORAGE_KEY = 'cfg_bancos_ativos'

export const BANCOS_DISPONIVEIS: BankConfig[] = [
  { id: 'itau', label: 'Itaú', icon: '/banks/itau.svg', formatos: ['Fatura Excel', 'Fatura PDF', 'Extrato OFX'], extensions: ['.xls', '.xlsx', '.pdf', '.ofx'], keywords: ['itau', 'itaú'], available: true },
  { id: 'c6', label: 'C6 Bank', icon: '/banks/c6.svg', formatos: ['Fatura CSV'], extensions: ['.csv'], keywords: ['c6'], available: true },
  { id: 'nubank', label: 'Nubank', icon: '/banks/nubank.svg', formatos: ['Fatura CSV'], extensions: ['.csv'], keywords: ['nubank', 'nu_'], available: true },
  { id: 'inter', label: 'Banco Inter', icon: '/banks/inter.svg', formatos: ['Extrato CSV'], extensions: ['.csv'], keywords: ['inter'], available: true },
  { id: 'bradesco', label: 'Bradesco', icon: '/banks/bradesco.svg', formatos: ['Extrato OFX'], extensions: ['.ofx'], keywords: ['bradesco'], available: false },
  { id: 'santander', label: 'Santander', icon: '/banks/santander.svg', formatos: ['Extrato OFX'], extensions: ['.ofx'], keywords: ['santander'], available: false },
  { id: 'mercado_pago', label: 'Mercado Pago', icon: '/banks/mercadopago.svg', formatos: ['Extrato CSV'], extensions: ['.csv'], keywords: ['mercado_pago', 'mercadopago', 'mercado pago'], available: false },
]

export function loadBancosAtivos() {
  try {
    const raw = localStorage.getItem(BANKS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : ['itau']
  } catch {
    return ['itau']
  }
}

export function bancosVisiveis(ids: string[]) {
  return BANCOS_DISPONIVEIS.filter(banco => ids.includes(banco.id))
}

export function detectBankForFile(filename: string, activeIds: string[] = []) {
  const lower = filename.toLowerCase()
  
  // 1. Tenta por keyword (mais específico)
  const byKeyword = BANCOS_DISPONIVEIS.find(banco =>
    banco.keywords.some(keyword => lower.includes(keyword))
  )
  if (byKeyword) return byKeyword

  // 2. Tenta por extensão
  const ext = lower.match(/\.[^.]+$/)?.[0]
  if (!ext) return undefined

  const possible = BANCOS_DISPONIVEIS.filter(banco => banco.extensions.includes(ext))
  
  if (possible.length === 1) return possible[0]
  
  // 3. Se houver ambiguidade (ex: .ofx), checa se apenas um dos possíveis está ativo
  if (activeIds.length > 0) {
    const possibleActive = possible.filter(banco => activeIds.includes(banco.id))
    if (possibleActive.length === 1) return possibleActive[0]
  }

  return undefined
}
