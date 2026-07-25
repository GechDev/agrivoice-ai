import { Button } from '@/components/ui/button';
import type { PaginatedCooperativeReports } from '@/types/cooperative-reports';

type ReportsPaginationProps = {
    reports: PaginatedCooperativeReports;
    onPrevious: () => void;
    onNext: () => void;
};

export function ReportsPagination({
    reports,
    onPrevious,
    onNext,
}: ReportsPaginationProps) {
    if (reports.total === 0) {
        return null;
    }

    const from = reports.from ?? 0;
    const to = reports.to ?? 0;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {from}–{to}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {reports.total}
                </span>
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!reports.prev_page_url}
                    onClick={onPrevious}
                    aria-label="Previous page"
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {reports.current_page} of {reports.last_page}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!reports.next_page_url}
                    onClick={onNext}
                    aria-label="Next page"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
