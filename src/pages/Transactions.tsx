import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PeriodSelector } from '@/components/PeriodSelector';
import { PageLoader } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useTransactions } from '@/hooks';
import {
    formatCurrency,
    formatDateTime,
    getCurrentMonth,
    getCurrentYear,
    getMonthName,
} from '@/lib/utils';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type TransactionFilter = 'all' | 'deposits' | 'expenses';

export function Transactions() {
    const [month, setMonth] = useState(getCurrentMonth());
    const [year, setYear] = useState(getCurrentYear());
    const [filter, setFilter] = useState<TransactionFilter>('all');

    // Always fetch all transactions for the month
    const { transactions, loading, error } = useTransactions({
        month,
        year,
        type: 'all',
    });

    // Calculate summary from all transactions (unaffected by filter)
    const totalIn = transactions
        .filter(t => t.direction === 'in')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalOut = transactions
        .filter(t => t.direction === 'out')
        .reduce((sum, t) => sum + t.amount, 0);

    // Filter transactions for display only
    const filteredTransactions = useMemo(() => {
        if (filter === 'all') return transactions;
        if (filter === 'deposits') return transactions.filter(t => t.direction === 'in');
        return transactions.filter(t => t.direction === 'out');
    }, [transactions, filter]);

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-4 pb-4">
            {/* Period Selector */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Select Period</CardTitle>
                </CardHeader>
                <CardContent>
                    <PeriodSelector
                        month={month}
                        year={year}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                </CardContent>
            </Card>

            {/* Summary - Always shows full month totals */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <ArrowDownLeft className="h-4 w-4" />
                            <span className="text-xs font-medium">Money In</span>
                        </div>
                        <p className="mt-2 text-xl font-bold text-emerald-700">
                            +{formatCurrency(totalIn)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="text-xs font-medium">Money Out</span>
                        </div>
                        <p className="mt-2 text-xl font-bold text-red-700">
                            -{formatCurrency(totalOut)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List with Filter */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                        Ledger – {getMonthName(month)} {year}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filter Tabs */}
                    <Tabs value={filter} onValueChange={v => setFilter(v as TransactionFilter)}>
                        <TabsList className="w-full">
                            <TabsTrigger value="all" className="flex-1">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="deposits" className="flex-1">
                                Deposits
                            </TabsTrigger>
                            <TabsTrigger value="expenses" className="flex-1">
                                Expenses
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Transaction List */}
                    {filteredTransactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No transactions for this period
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map(transaction => (
                                <div key={transaction.id} className="rounded-lg border bg-card p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    transaction.direction === 'in'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-red-100 text-red-600'
                                                }`}
                                            >
                                                {transaction.direction === 'in' ? (
                                                    <ArrowDownLeft className="h-4 w-4" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {transaction.kind === 'deposit'
                                                        ? `Deposit from ${
                                                              transaction.memberName || 'Unknown'
                                                          }`
                                                        : `Expense: ${
                                                              transaction.description || 'Unknown'
                                                          }`}
                                                </p>
                                                {transaction.kind === 'deposit' &&
                                                    transaction.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {transaction.description}
                                                        </p>
                                                    )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDateTime(transaction.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className={`font-bold ${
                                                    transaction.direction === 'in'
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {transaction.direction === 'in' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                            <Badge
                                                variant={
                                                    transaction.direction === 'in'
                                                        ? 'success'
                                                        : 'destructive'
                                                }
                                                className="text-xs"
                                            >
                                                {transaction.direction === 'in' ? 'IN' : 'OUT'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
