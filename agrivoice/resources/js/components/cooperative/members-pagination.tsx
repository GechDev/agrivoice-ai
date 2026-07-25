import { TablePagination } from '@/components/table-pagination';
import type { PaginatedMembers } from '@/types/cooperative-members';

type MembersPaginationProps = {
    members: PaginatedMembers;
    onPrevious: () => void;
    onNext: () => void;
};

export function MembersPagination({
    members,
    onPrevious,
    onNext,
}: MembersPaginationProps) {
    return (
        <TablePagination
            from={members.from}
            to={members.to}
            total={members.total}
            currentPage={members.current_page}
            lastPage={members.last_page}
            hasPrevious={Boolean(members.prev_page_url)}
            hasNext={Boolean(members.next_page_url)}
            onPrevious={onPrevious}
            onNext={onNext}
        />
    );
}
