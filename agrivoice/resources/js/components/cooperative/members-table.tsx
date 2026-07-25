import { Eye, UserMinus } from 'lucide-react';
import { MemberStatusBadge } from '@/components/cooperative/member-status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { MemberRow } from '@/types/cooperative-members';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
});

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(new Date(value));
}

type MembersTableProps = {
    members: MemberRow[];
    loading?: boolean;
    onView: (member: MemberRow) => void;
    onRemove: (member: MemberRow) => void;
};

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b">
                    <td className="px-4 py-3">
                        <Skeleton className="mb-2 h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-8 w-20" />
                    </td>
                </tr>
            ))}
        </>
    );
}

export function MembersTable({
    members,
    loading = false,
    onView,
    onRemove,
}: MembersTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="border-b bg-muted/40">
                    <tr>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Member
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Status
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Joined
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Last activity
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Queries
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            Reports
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                            <span className="sr-only">Actions</span>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <SkeletonRows />
                    ) : members.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-16 text-center text-muted-foreground"
                            >
                                <p className="font-medium text-foreground">
                                    No members found
                                </p>
                                <p className="mt-1 text-sm">
                                    Invite members or adjust your search and
                                    status filters.
                                </p>
                            </td>
                        </tr>
                    ) : (
                        members.map((member) => {
                            const isRemoved = member.status === 'removed';

                            return (
                                <tr
                                    key={member.id}
                                    className="border-b last:border-0 hover:bg-muted/30"
                                >
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => onView(member)}
                                            className="rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        >
                                            <span className="font-medium text-foreground">
                                                {member.name}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                {member.phoneNumber}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <MemberStatusBadge
                                            status={member.status}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {formatDate(member.joinedAt)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {formatDate(member.lastActivityAt)}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                        {member.queriesCount}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                        {member.reportsCount}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onView(member)}
                                                aria-label={`View details for ${member.name}`}
                                            >
                                                <Eye aria-hidden="true" />
                                                View
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={isRemoved}
                                                onClick={() => onRemove(member)}
                                                aria-label={
                                                    isRemoved
                                                        ? `${member.name} is already removed`
                                                        : `Remove ${member.name}`
                                                }
                                            >
                                                <UserMinus aria-hidden="true" />
                                                Remove
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
