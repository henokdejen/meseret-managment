import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Member, Contribution } from '@/types'

interface MonthYear {
  month: number
  year: number
}

interface UnpaidMemberInfo {
  member: Member
  paidAmount: number
  status: 'unpaid' | 'partial'
}

interface MonthlyUnpaidData {
  month: number
  year: number
  unpaidMembers: UnpaidMemberInfo[]
  partialMembers: UnpaidMemberInfo[]
}

export function useAllMonthsPaymentStatus(requiredAmount: number) {
  const [members, setMembers] = useState<Member[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            .order('year', { ascending: false })
            .order('month', { ascending: false }),
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
  }, [])

  const monthlyUnpaidData = useMemo((): MonthlyUnpaidData[] => {
    // Get unique months/years from contributions
    const monthYearSet = new Set<string>()
    contributions.forEach(c => {
      monthYearSet.add(`${c.year}-${c.month}`)
    })

    // Sort months in descending order (newest first)
    const monthYears: MonthYear[] = Array.from(monthYearSet)
      .map(s => {
        const [year, month] = s.split('-').map(Number)
        return { year, month }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

    // For each month, calculate unpaid/partial members
    return monthYears.map(({ month, year }) => {
      const monthContributions = contributions.filter(
        c => c.month === month && c.year === year
      )

      const unpaidMembers: UnpaidMemberInfo[] = []
      const partialMembers: UnpaidMemberInfo[] = []

      members.forEach(member => {
        const memberContribs = monthContributions.filter(c => c.member_id === member.id)
        const paidAmount = memberContribs.reduce((sum, c) => sum + Number(c.amount), 0)

        if (paidAmount >= requiredAmount) {
          // Fully paid, skip
          return
        } else if (paidAmount > 0) {
          partialMembers.push({ member, paidAmount, status: 'partial' })
        } else {
          unpaidMembers.push({ member, paidAmount: 0, status: 'unpaid' })
        }
      })

      return { month, year, unpaidMembers, partialMembers }
    })
  }, [members, contributions, requiredAmount])

  // Filter to only include months that have unpaid or partial members
  const monthsWithPending = monthlyUnpaidData.filter(
    m => m.unpaidMembers.length > 0 || m.partialMembers.length > 0
  )

  return {
    monthlyUnpaidData: monthsWithPending,
    loading,
    error,
  }
}

