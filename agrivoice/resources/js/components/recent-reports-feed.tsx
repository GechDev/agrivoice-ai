import { ReportRow } from '@/components/report-row';
import type { ReportRowData } from '@/types';

type RecentReportsFeedProps = {
    reports: ReportRowData[];
};

export function RecentReportsFeed({ reports }: RecentReportsFeedProps) {
    if (reports.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center shadow-md">
                <p className="text-sm font-medium text-foreground">
                    No reports yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    New agent entries will appear here live.
                </p>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3" aria-label="Recent reports">
            {reports.map((report) => (
                <ReportRow key={report.id} report={report} />
            ))}
        </ul>
    );
}
