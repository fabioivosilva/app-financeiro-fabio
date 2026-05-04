import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import type { Category } from '../api/types'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        api.get<Provision[]>('/provisions/'),
        api.get<Category[]>('/categories/'),
      ])
      setProvisions(p || [])
      setCategories(c || [])
    } catch (e) {
      setError('Erro ao carregar provisões')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { provisions, categories, loading, error, refetch: load }
}
