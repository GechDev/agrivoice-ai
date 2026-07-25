import { Head } from '@inertiajs/react';
import { Inbox } from 'lucide-react';

import ReportForm from '@/components/portal/report-form';
import ReportRow from '@/components/reports/report-row';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PortalLayout from '@/layouts/portal-layout';
import { formatTimeAgo } from '@/lib/agrivoice';
import type { AgentSummary, MarketOption, ReportRowData } from '@/types';

type EntryProps = {
    agent: AgentSummary;
    markets: MarketOption[];
    recentReports: ReportRowData[];
    entriesToday: number;
};

export default function Entry({
    agent,
    markets,
    recentReports,
    entriesToday,
}: EntryProps) {
    const lastEntry = recentReports[0];

    return (
        <PortalLayout agent={agent}>
            <Head title="Record a price" />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                        Record a price
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        One report per sale you collected. Each one you save
                        joins the live market picture with your name on it.
                    </p>
                </div>

                <dl className="flex shrink-0 items-center divide-x divide-border overflow-hidden rounded-2xl border bg-card">
                    <Stat
                        label="Your entries today"
                        value={String(entriesToday)}
                    />
                    <Stat
                        label="Last entry"
                        value={
                            lastEntry ? formatTimeAgo(lastEntry.createdAt) : '—'
                        }
                    />
                </dl>
            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Price the farmer was offered
                        </CardTitle>
                        <CardDescription>
                            Enter it in ETB per quintal, exactly as reported.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportForm markets={markets} />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl lg:sticky lg:top-24">
                    <CardHeader>
                        <CardTitle className="text-base">
                            My recent entries
                        </CardTitle>
                        <CardDescription>
                            What you have filed, newest first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentReports.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
                                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <Inbox className="size-5" />
                                </span>
                                <p className="text-sm font-medium">
                                    Nothing filed yet
                                </p>
                                <p className="max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
                                    Save your first price and it will appear
                                    here, and on the live dashboard.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2.5">
                                {recentReports.map((report) => (
                                    <ReportRow
                                        key={report.id}
                                        report={report}
                                    />
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PortalLayout>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-5 py-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {value}
            </dd>
        </div>
    );
}
