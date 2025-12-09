import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types';

interface UseExpensesOptions {
    month?: number;
    year?: number;
    type?: string;
}

export function useExpenses(options: UseExpensesOptions = {}) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { month, year, type } = options;

    useEffect(() => {
        async function fetchExpenses() {
            try {
                setLoading(true);
                let query = supabase
                    .from('expenses')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (month !== undefined) {
                    query = query.eq('month', month);
                }
                if (year !== undefined) {
                    query = query.eq('year', year);
                }
                if (type && type !== 'all') {
                    query = query.eq('type', type);
                }

                const { data, error: fetchError } = await query;

                if (fetchError) throw fetchError;
                setExpenses(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
            } finally {
                setLoading(false);
            }
        }

        fetchExpenses();
    }, [month, year, type]);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Group expenses by type
    const expensesByType = expenses.reduce((acc, expense) => {
        const t = expense.type;
        if (!acc[t]) acc[t] = 0;
        acc[t] += Number(expense.amount);
        return acc;
    }, {} as Record<string, number>);

    return { expenses, loading, error, totalExpenses, expensesByType };
}

// Hook to get all expenses (for calculating pool balance)
export function useAllExpenses() {
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('expenses')
                    .select('amount');

                if (fetchError) throw fetchError;
                const sum = (data || []).reduce((acc, e) => acc + Number(e.amount), 0);
                setTotal(sum);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
            } finally {
                setLoading(false);
            }
        }

        fetchTotal();
    }, []);

    return { total, loading, error };
}
