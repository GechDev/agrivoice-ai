import { router } from '@inertiajs/react';
import { ChevronDown, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateStatus } from '@/actions/App/Http/Controllers/CooperativeReportController';
import { ReportAuditTrail } from '@/components/cooperative/reports/report-audit-trail';
import { ReportStatusBadge } from '@/components/cooperative/reports/report-status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
    CooperativeReportRow,
    PaginatedCooperativeReports,
} from '@/types/cooperative-reports';

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

function formatPrice(price: number): string {
    return priceFormatter.format(price);
}

type ReportsTableProps = {
    reports: CooperativeReportRow[];
    loading?: boolean;
    onDispute: (report: CooperativeReportRow) => void;
    onReject: (report: CooperativeReportRow) => void;
};

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b">
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="mb-2 h-4 w-32" />
                        <Skeleton className="h-3 w-28" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-8 w-40" />
                    </td>
                </tr>
            ))}
        </>
    );
}

type ReportRowProps = {
    report: CooperativeReportRow;
    onDispute: (report: CooperativeReportRow) => void;
    onReject: (report: CooperativeReportRow) => void;
};

function ReportRow({ report, onDispute, onReject }: ReportRowProps) {
    const [trailOpen, setTrailOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const isVerified = report.status === 'verified';

    const verifyReport = (): void => {
        if (isVerified || verifying) {
            return;
        }

        const reportId = report.id;

        setVerifying(true);

        router
            .optimistic<{ reports: PaginatedCooperativeReports }>((props) => {
                const reports = props.reports;

                if (!reports) {
                    return;
                }

                return {
                    reports: {
                        ...reports,
                        data: reports.data.map((row) =>
                            row.id === reportId
                                ? {
                                      ...row,
                                      status: 'verified',
                                      statusLabel: 'Verified',
                                  }
                                : row,
                        ),
                    },
                };
            })
            .patch(
                updateStatus.url(reportId),
                { status: 'verified' },
                {
                    preserveScroll: true,
                    onFinish: () => setVerifying(false),
                    onError: (errors) => {
                        if (!errors.status && !errors.reason) {
                            toast.error(
                                'Could not verify this report. Please try again.',
                            );
                        } else if (errors.status) {
                            toast.error(errors.status);
                        }
                    },
                },
            );
    };

    return (
        <>
            <tr className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">
                    {report.cropLabel}
                </td>
                <td className="px-4 py-3 text-foreground">
                    {report.marketLabel}
                </td>
                <td className="px-4 py-3 text-foreground tabular-nums">
                    {formatPrice(report.price)}
                </td>
                <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                        {report.reporter.name || 'Unknown'}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                        {report.reporter.phoneNumber || '—'}
                    </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(report.reportedAt)}
                </td>
                <td className="px-4 py-3">
                    <ReportStatusBadge
                        status={report.status}
                        statusLabel={report.statusLabel}
                    />
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isVerified || verifying}
                            onClick={verifyReport}
                            aria-label={
                                isVerified
                                    ? `${report.cropLabel} report is already verified`
                                    : `Verify ${report.cropLabel} report from ${report.reporter.name || 'reporter'}`
                            }
                        >
                            <ShieldCheck aria-hidden="true" />
                            Verify
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={report.status === 'disputed'}
                            onClick={() => onDispute(report)}
                            aria-label={`Dispute ${report.cropLabel} report from ${report.reporter.name || 'reporter'}`}
                        >
                            <ShieldAlert aria-hidden="true" />
                            Dispute
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={report.status === 'rejected'}
                            onClick={() => onReject(report)}
                            aria-label={`Reject ${report.cropLabel} report from ${report.reporter.name || 'reporter'}`}
                        >
                            <ShieldX aria-hidden="true" />
                            Reject
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-expanded={trailOpen}
                            aria-controls={`report-audit-trail-${report.id}`}
                            onClick={() => setTrailOpen((open) => !open)}
                            aria-label={
                                trailOpen
                                    ? `Hide audit trail for ${report.cropLabel} report`
                                    : `Show audit trail for ${report.cropLabel} report`
                            }
                        >
                            <ChevronDown
                                aria-hidden="true"
                                className={cn(
                                    'transition-transform',
                                    trailOpen && 'rotate-180',
                                )}
                            />
                            Audit
                        </Button>
                    </div>
                </td>
            </tr>
            <tr className={cn(trailOpen && 'border-b')}>
                <td colSpan={7} className="p-0">
                    <ReportAuditTrail
                        reportId={report.id}
                        open={trailOpen}
                        onOpenChange={setTrailOpen}
                        entries={report.auditTrail}
                    />
                </td>
            </tr>
        </>
    );
}

export function ReportsTable({
    reports,
    loading = false,
    onDispute,
    onReject,
}: ReportsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[52rem] text-left text-sm md:min-w-full">
                <thead className="border-b bg-muted/40">
                    <tr>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Crop
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Market
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Price (ETB)
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Reporter
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Submitted
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Status
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <SkeletonRows />
                    ) : reports.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-16 text-center text-muted-foreground"
                            >
                                <p className="font-medium text-foreground">
                                    No reports found
                                </p>
                                <p className="mt-1 text-sm">
                                    Try adjusting crop, market, status, or date
                                    filters.
                                </p>
                            </td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                            <ReportRow
                                key={report.id}
                                report={report}
                                onDispute={onDispute}
                                onReject={onReject}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
