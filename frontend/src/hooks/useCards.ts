import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Card, Person } from '../api/types'

interface UseCardsResult {
  cards: Card[]
  persons: Person[]
  loading: boolean
  updateCard: (id: number, personId: number) => Promise<void>
  refetch: () => void
}

export function useCards(): UseCardsResult {
  const [cards, setCards] = useState<Card[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api.get<Card[]>('/cards/'),
      api.get<Person[]>('/persons/'),
    ])
      .then(([c, p]) => { if (!cancelled) { setCards(c); setPersons(p) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tick])

  async function updateCard(id: number, personId: number) {
    const card = cards.find(c => c.id === id)
    if (!card) return
    await api.put(`/cards/${id}`, { ...card, person_id: personId })
    setTick(t => t + 1)
  }

  return { cards, persons, loading, updateCard, refetch: () => setTick(t => t + 1) }
}
