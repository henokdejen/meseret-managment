import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageLoader } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useDashboard } from '@/hooks';
import { formatCurrency, getMonthName } from '@/lib/utils';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Users,
    AlertTriangle,
    CheckCircle2,
    Clock,
} from 'lucide-react';

export function Dashboard() {
    const { summary, currentMonthProgress, pendingByMonth, loading, error } = useDashboard();

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} />;
    if (!summary || !currentMonthProgress) return <ErrorMessage message="No data available" />;

    const collectionPercentage =
        currentMonthProgress.expected_total > 0
            ? Math.min(
                  (currentMonthProgress.total_collected / currentMonthProgress.expected_total) *
                      100,
                  100
              )
            : 0;

    return (
        <div className="space-y-4 pb-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-medium">Current Balance</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-700">
                            {formatCurrency(summary.pool_balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">All-time</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">Active Members</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-blue-700">
                            {summary.active_members_count}
                        </p>
                        <p className="text-xs text-muted-foreground">Contributing</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-primary">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">All-time Collection</span>
                        </div>
                        <p className="mt-2 text-xl font-bold">
                            +{formatCurrency(summary.total_contributions)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total contributions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-xs font-medium">All-time Expenses</span>
                        </div>
                        <p className="mt-2 text-xl font-bold">
                            -{formatCurrency(summary.total_expenses)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total spent</p>
                    </CardContent>
                </Card>
            </div>

            {/* Collection Progress - Current Month */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Collection Progress – {getMonthName(currentMonthProgress.month)}{' '}
                        {currentMonthProgress.year}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="mb-2 flex justify-between text-sm">
                            <span>
                                Collected {formatCurrency(currentMonthProgress.total_collected)} of{' '}
                                {formatCurrency(currentMonthProgress.expected_total)}
                            </span>
                            <span className="font-medium">{collectionPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={collectionPercentage} className="h-3" />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            {currentMonthProgress.paid_count} paid
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-amber-500" />
                            {currentMonthProgress.partial_count} partial
                        </span>
                        <span className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {currentMonthProgress.unpaid_count} unpaid
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Unpaid Members by Month */}
            {pendingByMonth.map(({ month, year, unpaidMembers, partialMembers }) => (
                <Card key={`${year}-${month}`} className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            {getMonthName(month)} {year} – Pending (
                            {unpaidMembers.length + partialMembers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Unpaid members */}
                            {unpaidMembers.map(member => (
                                <div
                                    key={member.member_id}
                                    className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                                >
                                    <div>
                                        <p className="font-medium">{member.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Room {member.room_id}
                                        </p>
                                    </div>
                                    <Badge variant="destructive">
                                        0 / {formatCurrency(member.required_amount)}
                                    </Badge>
                                </div>
                            ))}

                            {/* Partial members */}
                            {partialMembers.map(member => (
                                <div
                                    key={member.member_id}
                                    className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                                >
                                    <div>
                                        <p className="font-medium">{member.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Room {member.room_id}
                                        </p>
                                    </div>
                                    <Badge variant="warning">
                                        {formatCurrency(member.paid_amount)} /{' '}
                                        {formatCurrency(member.required_amount)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Show success message if no pending payments */}
            {pendingByMonth.length === 0 && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-6 text-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <p className="text-lg font-medium text-emerald-700">All Caught Up!</p>
                        <p className="text-sm text-muted-foreground">
                            Everyone has paid their contributions.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
