import { TablePagination } from '@/components/table-pagination';
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
    return (
        <TablePagination
            from={reports.from}
            to={reports.to}
            total={reports.total}
            currentPage={reports.current_page}
            lastPage={reports.last_page}
            hasPrevious={Boolean(reports.prev_page_url)}
            hasNext={Boolean(reports.next_page_url)}
            onPrevious={onPrevious}
            onNext={onNext}
        />
    );
}
