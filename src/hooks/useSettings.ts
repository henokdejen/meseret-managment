import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Setting } from '@/types'

export function useSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('settings')
          .select('*')

        if (fetchError) throw fetchError
        setSettings(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const getMonthlyContribution = (): number => {
    const setting = settings.find(s => s.key === 'monthly_contribution')
    return setting?.value?.amount ?? 1000 // Default to 1000 if not set
  }

  return { settings, loading, error, getMonthlyContribution }
}

