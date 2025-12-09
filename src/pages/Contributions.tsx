import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PeriodSelector } from '@/components/PeriodSelector';
import { PageLoader } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useSettings, usePaymentStatus, useContributions } from '@/hooks';
import {
    formatCurrency,
    formatDateTime,
    getCurrentMonth,
    getCurrentYear,
    getMonthName,
} from '@/lib/utils';
import { HandCoins, Calendar, FileText } from 'lucide-react';

export function Contributions() {
    const [month, setMonth] = useState(getCurrentMonth());
    const [year, setYear] = useState(getCurrentYear());

    const { getMonthlyContribution, loading: settingsLoading } = useSettings();
    const requiredAmount = getMonthlyContribution();

    const {
        paymentStatuses,
        loading: statusLoading,
        error: statusError,
    } = usePaymentStatus({ month, year, requiredAmount });

    const {
        contributions,
        totalContributions,
        loading: contribLoading,
        error: contribError,
    } = useContributions({ month, year });

    const isLoading = settingsLoading || statusLoading || contribLoading;
    const error = statusError || contribError;

    if (isLoading) return <PageLoader />;
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

            {/* Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HandCoins className="h-5 w-5 text-primary" />
                            <span className="font-medium">Total Collected</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {formatCurrency(totalContributions)}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {getMonthName(month)} {year}
                    </p>
                </CardContent>
            </Card>

            {/* Member Status Table */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Member Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {paymentStatuses.map(({ member, paidAmount, status }) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{member.full_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Room {member.room_id}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {formatCurrency(paidAmount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            of {formatCurrency(requiredAmount)}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            status === 'paid'
                                                ? 'success'
                                                : status === 'partial'
                                                ? 'warning'
                                                : 'destructive'
                                        }
                                    >
                                        {status === 'paid'
                                            ? 'Paid'
                                            : status === 'partial'
                                            ? 'Partial'
                                            : 'Unpaid'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Contribution Log */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Contribution Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {contributions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No contributions for this period
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {contributions.map(contribution => (
                                <div
                                    key={contribution.id}
                                    className="rounded-lg border bg-card p-3 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {contribution.member?.full_name || 'Unknown'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {formatDateTime(contribution.paid_at)}
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-primary">
                                            +{formatCurrency(Number(contribution.amount))}
                                        </span>
                                    </div>
                                    {contribution.notes && (
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground border-t border-border pt-2">
                                            <FileText className="h-3 w-3 mt-0.5" />
                                            <span>{contribution.notes}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
