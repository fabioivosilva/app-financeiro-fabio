export interface Category {
  id: number
  name: string
  color?: string
  icon?: string
  limit?: number
  limit_value?: number
  type?: 'fixa' | 'variavel' | 'receita' | 'interna'
  provision_behavior?: 'none' | 'recurring_income' | 'fixed_expense' | 'installment'
  parent_id?: number | null
  exclude_totals?: boolean
}

export interface Person {
  id: number
  name: string
}

export interface Card {
  id: number
  name: string
  last4?: string
  person_id: number
  limit_value?: number
}

export interface Transaction {
  id: number
  date: string
  description: string
  amount: number
  category_id?: number
  category?: Category
  person_id?: number
  person?: Person
  card_id?: number
  origin: 'Débito' | 'Crédito' | 'PIX' | 'Aporte Manual'
  status: 'confirmado' | 'pendente' | 'revisar' | 'provisao'
  installment_current?: number
  installment_total?: number
  goal_id?: number
}

export interface Goal {
  id: number
  name: string
  target: number
  current: number
  deadline?: string
  category_id?: number
  keyword?: string
  icon?: string
}

export interface Rule {
  id: number
  keyword: string
  category_id?: number
  person_id?: number
  origin?: string
  goal_id?: number
}

export interface Settings {
  cycle_start_day: number
  default_import_folder?: string
}

export interface MonthSummary {
  month: string
  income: number
  expense: number
  balance: number
}
