import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Transaction, Category, Person, Rule } from '../api/types'

interface Filters {
  month: number
  year: number
  status?: string
  category_id?: number
  person_id?: number
}

interface UseTransacoesResult {
  transactions: Transaction[]
  categories: Category[]
  persons: Person[]
  rules: Rule[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTransacoes(filters: Filters): UseTransacoesResult {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      month: String(filters.month),
      year: String(filters.year),
    })
    if (filters.status) params.set('status', filters.status)
    if (filters.category_id) params.set('category_id', String(filters.category_id))
    if (filters.person_id) params.set('person_id', String(filters.person_id))

    Promise.all([
      api.get<Transaction[]>(`/transactions/?${params}`),
      api.get<Category[]>('/categories/'),
      api.get<Person[]>('/persons/'),
      api.get<Rule[]>('/rules/'),
    ])
      .then(([txs, cats, people, rls]) => {
        if (cancelled) return
        setTransactions(txs)
        setCategories(cats)
        setPersons(people)
        setRules(rls)
      })
      .catch(e => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [filters.month, filters.year, filters.status, filters.category_id, filters.person_id, tick])

  return { transactions, categories, persons, rules, loading, error, refetch: () => setTick(t => t + 1) }
}

export function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const groups: Record<string, Transaction[]> = {}
  for (const tx of transactions) {
    const key = tx.date
    if (!groups[key]) groups[key] = []
    groups[key].push(tx)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

export function isTransactionPending(tx: Transaction): boolean {
  return tx.status === 'pendente' || !tx.category_id
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(value))
}
