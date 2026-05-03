import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Goal } from '../api/types'

export function useMetas() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Goal[]>('/goals/').then(data => {
      setGoals(data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return { goals, loading }
}
