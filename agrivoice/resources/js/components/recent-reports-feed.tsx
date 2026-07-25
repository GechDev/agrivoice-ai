import { ReportRow } from '@/components/report-row';
import { useTranslations } from '@/hooks/use-translations';
import type { ReportRowData } from '@/types';

type RecentReportsFeedProps = {
    reports: ReportRowData[];
    canModerate?: boolean;
};

export function RecentReportsFeed({
    reports,
    canModerate = false,
}: RecentReportsFeedProps) {
    const t = useTranslations();

    if (reports.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center shadow-md">
                <p className="text-sm font-medium text-foreground">
                    {t('No reports yet')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('New agent entries will appear here live.')}
                </p>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3" aria-label={t('Recent reports')}>
            {reports.map((report) => (
                <ReportRow
                    key={report.id}
                    report={report}
                    canModerate={canModerate}
                />
            ))}
        </ul>
    );
}
