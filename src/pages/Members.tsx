import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useMembers } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { Users, Phone, Calendar, Droplets, Eye, EyeOff } from 'lucide-react';

export function Members() {
    const [showAll, setShowAll] = useState(false);
    const { members, loading, error } = useMembers(!showAll);

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-4 pb-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4 text-primary" />
                            Members ({members.length})
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAll(!showAll)}
                            className="text-xs"
                        >
                            {showAll ? (
                                <>
                                    <Eye className="mr-1 h-3 w-3" /> Active Only
                                </>
                            ) : (
                                <>
                                    <EyeOff className="mr-1 h-3 w-3" /> Show All
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {members.map(member => (
                            <div
                                key={member.id}
                                className="rounded-lg border bg-card p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{member.full_name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Room {member.room_id}
                                        </p>
                                    </div>
                                    <Badge variant={member.is_active ? 'success' : 'secondary'}>
                                        {member.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {member.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{member.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(member.joined_at)}</span>
                                    </div>
                                </div>

                                {(member.water_bill_id || member.water_bill_registration_name) && (
                                    <div className="border-t border-border pt-3">
                                        {member.water_bill_id && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <Droplets className="h-3 w-3 text-blue-400" />
                                                <span>{member.water_bill_id}</span>
                                            </div>
                                        )}
                                        {member.water_bill_registration_name && (
                                            <p className="text-xs text-muted-foreground">
                                                Registered: {member.water_bill_registration_name}
                                            </p>
                                        )}
                                        {member.water_bill_payers &&
                                            member.water_bill_payers.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {member.water_bill_payers.map((payer, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            @{payer}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
