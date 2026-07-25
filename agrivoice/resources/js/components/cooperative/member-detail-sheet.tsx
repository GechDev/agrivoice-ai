import { AlertTriangle } from 'lucide-react';
import { MemberStatusBadge } from '@/components/cooperative/member-status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { SelectedMember } from '@/types/cooperative-members';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const priceFormatter = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
});

function formatDate(value: string): string {
    return dateFormatter.format(new Date(value));
}

type MemberDetailSheetProps = {
    member: SelectedMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function MemberDetailSheet({
    member,
    open,
    onOpenChange,
}: MemberDetailSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-md"
            >
                {member ? (
                    <>
                        <SheetHeader className="border-b pb-4">
                            <SheetTitle>{member.name}</SheetTitle>
                            <SheetDescription>
                                {member.phoneNumber}
                            </SheetDescription>
                            <div className="pt-1">
                                <MemberStatusBadge status={member.status} />
                            </div>
                        </SheetHeader>

                        <div className="flex flex-col gap-6 p-4">
                            <section
                                aria-labelledby="member-stats-heading"
                                className="grid grid-cols-2 gap-3"
                            >
                                <h2
                                    id="member-stats-heading"
                                    className="col-span-2 text-sm font-semibold"
                                >
                                    Activity
                                </h2>
                                <div className="rounded-xl border bg-card p-3 shadow-sm">
                                    <p className="text-xs text-muted-foreground">
                                        Queries
                                    </p>
                                    <p className="text-xl font-semibold tabular-nums">
                                        {member.queriesCount}
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-card p-3 shadow-sm">
                                    <p className="text-xs text-muted-foreground">
                                        Reports
                                    </p>
                                    <p className="text-xl font-semibold tabular-nums">
                                        {member.totalReports}
                                    </p>
                                </div>
                                <div className="col-span-2 rounded-xl border bg-card p-3 shadow-sm">
                                    <p className="text-xs text-muted-foreground">
                                        Disputed / rejected rate
                                    </p>
                                    <p className="text-xl font-semibold tabular-nums">
                                        {member.disputedOrRejectedRate}%
                                    </p>
                                </div>
                            </section>

                            {member.frequentDisputes ? (
                                <Alert
                                    variant="destructive"
                                    className="border-destructive/40 bg-destructive/10 text-destructive"
                                >
                                    <AlertTriangle aria-hidden="true" />
                                    <AlertTitle>
                                        Frequent disputes detected
                                    </AlertTitle>
                                    <AlertDescription>
                                        This member has a high share of disputed
                                        or rejected reports. Review recent
                                        submissions carefully.
                                    </AlertDescription>
                                </Alert>
                            ) : null}

                            <section aria-labelledby="recent-queries-heading">
                                <h2
                                    id="recent-queries-heading"
                                    className="mb-3 text-sm font-semibold"
                                >
                                    Recent queries
                                </h2>
                                {member.recentQueries.length === 0 ? (
                                    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                        No queries yet.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {member.recentQueries.map((query) => (
                                            <li
                                                key={query.id}
                                                className="rounded-xl border bg-card p-3 shadow-sm"
                                            >
                                                <p className="text-sm font-medium">
                                                    {query.text}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                    {query.market ? (
                                                        <span>
                                                            {query.market}
                                                        </span>
                                                    ) : null}
                                                    {query.crop ? (
                                                        <Badge variant="outline">
                                                            {query.crop}
                                                        </Badge>
                                                    ) : null}
                                                    <Badge variant="outline">
                                                        {query.channel}
                                                    </Badge>
                                                    <time dateTime={query.date}>
                                                        {formatDate(query.date)}
                                                    </time>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <section aria-labelledby="recent-reports-heading">
                                <h2
                                    id="recent-reports-heading"
                                    className="mb-3 text-sm font-semibold"
                                >
                                    Recent reports
                                </h2>
                                {member.recentReports.length === 0 ? (
                                    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                        No reports yet.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {member.recentReports.map((report) => (
                                            <li
                                                key={report.id}
                                                className="rounded-xl border bg-card p-3 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {report.crop}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {report.market}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold tabular-nums">
                                                        {priceFormatter.format(
                                                            report.price,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline">
                                                        {report.status}
                                                    </Badge>
                                                    <time
                                                        dateTime={report.date}
                                                    >
                                                        {formatDate(
                                                            report.date,
                                                        )}
                                                    </time>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>
                    </>
                ) : (
                    <SheetHeader>
                        <SheetTitle>Member details</SheetTitle>
                        <SheetDescription>
                            Select a member to view their activity.
                        </SheetDescription>
                    </SheetHeader>
                )}
            </SheetContent>
        </Sheet>
    );
}
