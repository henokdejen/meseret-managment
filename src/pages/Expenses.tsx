import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PeriodSelector } from '@/components/PeriodSelector';
import { PageLoader } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useExpenses } from '@/hooks';
import {
    formatCurrency,
    formatDate,
    getCurrentMonth,
    getCurrentYear,
    getMonthName,
} from '@/lib/utils';
import { Receipt, Droplets, Zap, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

const expenseTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'water', label: 'Water' },
    { value: 'electric_shared', label: 'Electricity' },
    { value: 'guard_salary', label: 'Guard Salary' },
    { value: 'janitor_salary', label: 'Janitor Salary' },
    { value: 'other', label: 'Other' },
];

const typeIcons: Record<string, typeof Receipt> = {
    water: Droplets,
    electric_shared: Zap,
    guard_salary: ShieldCheck,
    janitor_salary: Sparkles,
    other: HelpCircle,
};

const typeColors: Record<string, string> = {
    water: 'text-blue-600',
    electric_shared: 'text-amber-600',
    guard_salary: 'text-purple-600',
    janitor_salary: 'text-emerald-600',
    other: 'text-muted-foreground',
};

export function Expenses() {
    const [month, setMonth] = useState(getCurrentMonth());
    const [year, setYear] = useState(getCurrentYear());
    const [type, setType] = useState('all');

    const { expenses, totalExpenses, expensesByType, loading, error } = useExpenses({
        month,
        year,
        type,
    });

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-4 pb-4">
            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <PeriodSelector
                        month={month}
                        year={year}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {expenseTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-destructive" />
                            <span className="font-medium">Total Expenses</span>
                        </div>
                        <span className="text-2xl font-bold text-destructive">
                            -{formatCurrency(totalExpenses)}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {getMonthName(month)} {year}
                    </p>
                </CardContent>
            </Card>

            {/* Breakdown by Type */}
            {type === 'all' && Object.keys(expensesByType).length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Breakdown by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(expensesByType).map(([expType, amount]) => {
                                const Icon = typeIcons[expType] || Receipt;
                                const color = typeColors[expType] || 'text-muted-foreground';
                                return (
                                    <div
                                        key={expType}
                                        className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${color}`} />
                                            <span className="capitalize">
                                                {expType.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="font-medium">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Expense List */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Expense Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {expenses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No expenses for this period
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map(expense => {
                                const Icon = typeIcons[expense.type] || Receipt;
                                const color = typeColors[expense.type] || 'text-muted-foreground';
                                return (
                                    <div key={expense.id} className="rounded-lg border bg-card p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`p-2 rounded-lg bg-secondary ${color}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium capitalize">
                                                        {expense.type.replace('_', ' ')}
                                                    </p>
                                                    {expense.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {expense.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {expense.date
                                                            ? formatDate(expense.date)
                                                            : expense.month && expense.year
                                                            ? `${getMonthName(expense.month)} ${
                                                                  expense.year
                                                              }`
                                                            : formatDate(expense.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="destructive" className="text-sm">
                                                -{formatCurrency(Number(expense.amount))}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
