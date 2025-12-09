import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardSummary {
    total_contributions: number;
    total_expenses: number;
    pool_balance: number;
    active_members_count: number;
    required_amount: number;
}

interface CurrentMonthProgress {
    month: number;
    year: number;
    required_amount: number;
    total_collected: number;
    expected_total: number;
    paid_count: number;
    partial_count: number;
    unpaid_count: number;
}

interface PendingPayment {
    member_id: string;
    full_name: string;
    room_id: string;
    month: number;
    year: number;
    paid_amount: number;
    required_amount: number;
    status: 'unpaid' | 'partial';
}

interface MonthlyPendingData {
    month: number;
    year: number;
    unpaidMembers: PendingPayment[];
    partialMembers: PendingPayment[];
}

export function useDashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [currentMonthProgress, setCurrentMonthProgress] = useState<CurrentMonthProgress | null>(
        null
    );
    const [pendingByMonth, setPendingByMonth] = useState<MonthlyPendingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);

                // Fetch all dashboard data in parallel
                const [summaryResult, progressResult, pendingResult] = await Promise.all([
                    supabase.from('v_dashboard_summary').select('*').single(),
                    supabase.from('v_current_month_progress').select('*').single(),
                    supabase.from('v_pending_payments').select('*'),
                ]);

                if (summaryResult.error) throw summaryResult.error;
                if (progressResult.error) throw progressResult.error;
                if (pendingResult.error) throw pendingResult.error;

                // Set summary data
                setSummary({
                    total_contributions: Number(summaryResult.data.total_contributions),
                    total_expenses: Number(summaryResult.data.total_expenses),
                    pool_balance: Number(summaryResult.data.pool_balance),
                    active_members_count: summaryResult.data.active_members_count,
                    required_amount: Number(summaryResult.data.required_amount),
                });

                // Set current month progress
                setCurrentMonthProgress({
                    month: progressResult.data.month,
                    year: progressResult.data.year,
                    required_amount: Number(progressResult.data.required_amount),
                    total_collected: Number(progressResult.data.total_collected),
                    expected_total: Number(progressResult.data.expected_total),
                    paid_count: progressResult.data.paid_count,
                    partial_count: progressResult.data.partial_count,
                    unpaid_count: progressResult.data.unpaid_count,
                });

                // Group pending payments by month
                const pendingData = pendingResult.data as PendingPayment[];
                const monthMap = new Map<string, MonthlyPendingData>();

                pendingData.forEach(payment => {
                    const key = `${payment.year}-${payment.month}`;
                    if (!monthMap.has(key)) {
                        monthMap.set(key, {
                            month: payment.month,
                            year: payment.year,
                            unpaidMembers: [],
                            partialMembers: [],
                        });
                    }
                    const monthData = monthMap.get(key)!;
                    if (payment.status === 'unpaid') {
                        monthData.unpaidMembers.push(payment);
                    } else {
                        monthData.partialMembers.push(payment);
                    }
                });

                // Convert to array and sort by date (newest first)
                const monthlyData = Array.from(monthMap.values()).sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                });

                setPendingByMonth(monthlyData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return {
        summary,
        currentMonthProgress,
        pendingByMonth,
        loading,
        error,
    };
}
