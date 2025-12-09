import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Member, Contribution, MemberPaymentStatus } from '@/types'

interface UsePaymentStatusOptions {
  month: number
  year: number
  requiredAmount: number
}

export function usePaymentStatus(options: UsePaymentStatusOptions) {
  const [members, setMembers] = useState<Member[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { month, year, requiredAmount } = options

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [membersResult, contributionsResult] = await Promise.all([
          supabase
            .from('members')
            .select('*')
            .eq('is_active', true)
            .order('room_id', { ascending: true }),
          supabase
            .from('contributions')
            .select('*')
            .eq('month', month)
            .eq('year', year),
        ])

        if (membersResult.error) throw membersResult.error
        if (contributionsResult.error) throw contributionsResult.error

        setMembers(membersResult.data || [])
        setContributions(contributionsResult.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payment status')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month, year])

  const paymentStatuses = useMemo((): MemberPaymentStatus[] => {
    return members.map(member => {
      const memberContributions = contributions.filter(c => c.member_id === member.id)
      const paidAmount = memberContributions.reduce((sum, c) => sum + Number(c.amount), 0)

      let status: 'paid' | 'partial' | 'unpaid'
      if (paidAmount >= requiredAmount) {
        status = 'paid'
      } else if (paidAmount > 0) {
        status = 'partial'
      } else {
        status = 'unpaid'
      }

      return {
        member,
        requiredAmount,
        paidAmount,
        status,
      }
    })
  }, [members, contributions, requiredAmount])

  const unpaidMembers = paymentStatuses.filter(s => s.status === 'unpaid')
  const partialMembers = paymentStatuses.filter(s => s.status === 'partial')
  const paidMembers = paymentStatuses.filter(s => s.status === 'paid')

  const totalCollected = paymentStatuses.reduce((sum, s) => sum + s.paidAmount, 0)
  const expectedTotal = members.length * requiredAmount

  return {
    paymentStatuses,
    unpaidMembers,
    partialMembers,
    paidMembers,
    totalCollected,
    expectedTotal,
    activeCount: members.length,
    loading,
    error,
  }
}

