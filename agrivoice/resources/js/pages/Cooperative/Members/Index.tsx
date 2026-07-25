import { Head, router, setLayoutProps } from '@inertiajs/react';
import { Upload, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    index,
    show,
} from '@/actions/App/Http/Controllers/CooperativeMemberController';
import { BulkInviteDialog } from '@/components/cooperative/bulk-invite-dialog';
import { InviteMemberDialog } from '@/components/cooperative/invite-member-dialog';
import { MemberDetailSheet } from '@/components/cooperative/member-detail-sheet';
import { MembersFilters } from '@/components/cooperative/members-filters';
import { MembersPagination } from '@/components/cooperative/members-pagination';
import { MembersTable } from '@/components/cooperative/members-table';
import { RemoveMemberDialog } from '@/components/cooperative/remove-member-dialog';
import { Button } from '@/components/ui/button';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type {
    MemberFilters,
    MemberRow,
    PaginatedMembers,
    SelectedMember,
    StatusOption,
} from '@/types/cooperative-members';

type MembersIndexProps = {
    members: PaginatedMembers;
    filters: MemberFilters;
    statusOptions: StatusOption[];
    selectedMember: SelectedMember | null;
};

function filterQuery(search: string, status: string): Record<string, string> {
    const query: Record<string, string> = {};

    if (search.trim() !== '') {
        query.search = search.trim();
    }

    if (status !== '') {
        query.status = status;
    }

    return query;
}

export default function MembersIndex({
    members,
    filters,
    statusOptions,
    selectedMember,
}: MembersIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [filtering, setFiltering] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<MemberRow | null>(
        null,
    );
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Cooperative dashboard',
                href: cooperativeDashboard(),
            },
            {
                title: 'Members',
                href: index(),
            },
        ],
    });

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
    }, [filters.search, filters.status]);

    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, []);

    const navigateWithFilters = (
        nextSearch: string,
        nextStatus: string,
        page?: number,
    ): void => {
        setFiltering(true);

        router.get(
            index.url({
                query: {
                    ...filterQuery(nextSearch, nextStatus),
                    ...(page && page > 1 ? { page: String(page) } : {}),
                },
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onFinish: () => setFiltering(false),
            },
        );
    };

    const handleSearchChange = (value: string): void => {
        setSearch(value);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            navigateWithFilters(value, status);
        }, 300);
    };

    const handleStatusChange = (value: string): void => {
        setStatus(value);
        navigateWithFilters(search, value);
    };

    const openMember = (member: MemberRow): void => {
        router.get(
            show.url(member.id, {
                query: filterQuery(search, status),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['selectedMember'],
            },
        );
    };

    const closeMember = (): void => {
        router.get(
            index.url({
                query: filterQuery(search, status),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['selectedMember'],
            },
        );
    };

    return (
        <>
            <Head title="Cooperative members" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Members
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Invite farmers, review activity, and manage your
                            cooperative roster.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBulkOpen(true)}
                            aria-label="Bulk invite members from CSV"
                        >
                            <Upload aria-hidden="true" />
                            Bulk CSV
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setInviteOpen(true)}
                            aria-label="Invite a member"
                        >
                            <UserPlus aria-hidden="true" />
                            Invite member
                        </Button>
                    </div>
                </header>

                <MembersFilters
                    search={search}
                    status={status}
                    statusOptions={statusOptions}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                />

                <MembersTable
                    members={members.data}
                    loading={filtering}
                    onView={openMember}
                    onRemove={setMemberToRemove}
                />

                <MembersPagination
                    members={members}
                    onPrevious={() =>
                        navigateWithFilters(
                            search,
                            status,
                            Math.max(1, members.current_page - 1),
                        )
                    }
                    onNext={() =>
                        navigateWithFilters(
                            search,
                            status,
                            members.current_page + 1,
                        )
                    }
                />
            </div>

            <InviteMemberDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
            />
            <BulkInviteDialog open={bulkOpen} onOpenChange={setBulkOpen} />
            <RemoveMemberDialog
                member={memberToRemove}
                open={memberToRemove !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setMemberToRemove(null);
                    }
                }}
            />
            <MemberDetailSheet
                member={selectedMember}
                open={selectedMember !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeMember();
                    }
                }}
            />
        </>
    );
}
