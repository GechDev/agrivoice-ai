export type MemberStatus = 'active' | 'invited' | 'removed';

export type MemberRow = {
    id: number;
    name: string;
    phoneNumber: string;
    status: MemberStatus | string;
    joinedAt: string | null;
    lastActivityAt: string | null;
    queriesCount: number;
    reportsCount: number;
};

export type MemberRecentQuery = {
    id: number;
    market: string | null;
    crop: string | null;
    text: string;
    channel: string;
    date: string;
};

export type MemberRecentReport = {
    id: number;
    market: string;
    crop: string;
    price: number;
    status: string;
    date: string;
};

export type SelectedMember = MemberRow & {
    recentQueries: MemberRecentQuery[];
    recentReports: MemberRecentReport[];
    totalReports: number;
    disputedOrRejectedRate: number;
    frequentDisputes: boolean;
};

export type MemberFilters = {
    search: string | null;
    status: string | null;
};

export type StatusOption = {
    value: string;
    label: string;
};

export type PaginatedMembers = {
    data: MemberRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

export type BulkInviteSummary = {
    invited: number;
    skipped_duplicates: number;
    invalid_format: number;
};

export type SharedFlash = {
    success?: string | null;
    error?: string | null;
    bulkInviteSummary?: BulkInviteSummary | null;
};
