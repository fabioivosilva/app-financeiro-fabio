import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import type { Category, Person, Rule, Transaction } from '../api/types'

export interface Provision {
  id: number
  description: string
  amount: number
  day: number
  type: 'mensal' | 'parcela'
  category_id?: number
  active: boolean
  installment_current?: number
  installment_total?: number
}

export function useProvisoes() {
  const [provisions, setProvisions] = useState<Provision[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c, pe, r, tx] = await Promise.all([
        api.get<Provision[]>('/provisions/'),
        api.get<Category[]>('/categories/'),
        api.get<Person[]>('/persons/'),
        api.get<Rule[]>('/rules/'),
        api.get<Transaction[]>('/transactions/'),
      ])
      setProvisions(p || [])
      setCategories(c || [])
      setPersons(pe || [])
      setRules(r || [])
      setTransactions(tx || [])
    } catch {
      setError('Erro ao carregar provisões')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { provisions, categories, persons, rules, transactions, loading, error, refetch: load }
}
