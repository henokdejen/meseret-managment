import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Member } from '@/types'

export function useMembers(activeOnly = true) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true)
        let query = supabase
          .from('members')
          .select('*')
          .order('room_id', { ascending: true })

        if (activeOnly) {
          query = query.eq('is_active', true)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError
        setMembers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch members')
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [activeOnly])

  return { members, loading, error }
}

