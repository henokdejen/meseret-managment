import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Transaction, Contribution, Expense, Member } from '@/types'

interface UseTransactionsOptions {
  month?: number
  year?: number
  type?: 'all' | 'deposits' | 'expenses'
  memberId?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { month, year, type = 'all', memberId } = options

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true)

        let contributions: (Contribution & { member: Member })[] = []
        let expenses: Expense[] = []

        // Fetch contributions if needed
        if (type === 'all' || type === 'deposits') {
          let contribQuery = supabase
            .from('contributions')
            .select(`*, member:members(*)`)
            .order('paid_at', { ascending: false })

          if (month !== undefined) contribQuery = contribQuery.eq('month', month)
          if (year !== undefined) contribQuery = contribQuery.eq('year', year)
          if (memberId) contribQuery = contribQuery.eq('member_id', memberId)

          const { data, error: contribError } = await contribQuery
          if (contribError) throw contribError
          contributions = (data || []) as (Contribution & { member: Member })[]
        }

        // Fetch expenses if needed
        if (type === 'all' || type === 'expenses') {
          let expenseQuery = supabase
            .from('expenses')
            .select('*')
            .order('created_at', { ascending: false })

          if (month !== undefined) expenseQuery = expenseQuery.eq('month', month)
          if (year !== undefined) expenseQuery = expenseQuery.eq('year', year)

          const { data, error: expenseError } = await expenseQuery
          if (expenseError) throw expenseError
          expenses = (data || []) as Expense[]
        }

        // Transform to unified Transaction type
        const contribTransactions: Transaction[] = contributions.map(c => ({
          id: c.id,
          kind: 'deposit',
          direction: 'in',
          memberId: c.member_id,
          memberName: c.member?.full_name || null,
          amount: Number(c.amount),
          createdAt: c.paid_at,
          month: c.month,
          year: c.year,
          description: c.notes,
        }))

        const expenseTransactions: Transaction[] = expenses.map(e => ({
          id: e.id,
          kind: 'withdraw',
          direction: 'out',
          memberId: null,
          memberName: null,
          amount: Number(e.amount),
          createdAt: e.created_at,
          month: e.month,
          year: e.year,
          description: e.description || e.type,
        }))

        // Merge and sort by date (newest first)
        const merged = [...contribTransactions, ...expenseTransactions]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setTransactions(merged)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [month, year, type, memberId])

  return { transactions, loading, error }
}
