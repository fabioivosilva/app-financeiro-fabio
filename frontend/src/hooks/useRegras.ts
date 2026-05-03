import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Category, Person } from '../api/types'

export interface Rule {
  id: number
  keyword: string
  category_id?: number
  person_id?: number
  origin?: string
  goal_id?: number
}

interface UseRegrasResult {
  rules: Rule[]
  categories: Category[]
  persons: Person[]
  loading: boolean
  error: string | null
  refetch: () => void
  deleteRule: (id: number) => Promise<void>
}

export function useRegras(): UseRegrasResult {
  const [rules, setRules] = useState<Rule[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get<Rule[]>('/rules/'),
      api.get<Category[]>('/categories/'),
      api.get<Person[]>('/persons/'),
    ])
      .then(([r, c, p]) => {
        if (cancelled) return
        setRules(r)
        setCategories(c)
        setPersons(p)
        setError(null)
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  async function deleteRule(id: number) {
    await api.delete(`/rules/${id}`)
    setTick(t => t + 1)
  }

  return { rules, categories, persons, loading, error, refetch: () => setTick(t => t + 1), deleteRule }
}
