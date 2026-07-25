import { Button } from '@/components/ui/button';
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
    if (members.total === 0) {
        return null;
    }

    const from = members.from ?? 0;
    const to = members.to ?? 0;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {from}–{to}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {members.total}
                </span>
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!members.prev_page_url}
                    onClick={onPrevious}
                    aria-label="Previous page"
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {members.current_page} of {members.last_page}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!members.next_page_url}
                    onClick={onNext}
                    aria-label="Next page"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
