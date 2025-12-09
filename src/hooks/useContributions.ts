import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contribution } from '@/types';

interface UseContributionsOptions {
    month?: number;
    year?: number;
    memberId?: string;
}

export function useContributions(options: UseContributionsOptions = {}) {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { month, year, memberId } = options;

    useEffect(() => {
        async function fetchContributions() {
            try {
                setLoading(true);
                let query = supabase
                    .from('contributions')
                    .select(
                        `
            *,
            member:members(*)
          `
                    )
                    .order('paid_at', { ascending: false });

                if (month !== undefined) {
                    query = query.eq('month', month);
                }
                if (year !== undefined) {
                    query = query.eq('year', year);
                }
                if (memberId) {
                    query = query.eq('member_id', memberId);
                }

                const { data, error: fetchError } = await query;

                if (fetchError) throw fetchError;
                setContributions(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch contributions');
            } finally {
                setLoading(false);
            }
        }

        fetchContributions();
    }, [month, year, memberId]);

    const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

    return { contributions, loading, error, totalContributions };
}

// Hook to get all contributions (for calculating pool balance)
export function useAllContributions() {
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTotal() {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('contributions')
                    .select('amount');

                if (fetchError) throw fetchError;
                const sum = (data || []).reduce((acc, c) => acc + Number(c.amount), 0);
                setTotal(sum);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch contributions');
            } finally {
                setLoading(false);
            }
        }

        fetchTotal();
    }, []);

    return { total, loading, error };
}
