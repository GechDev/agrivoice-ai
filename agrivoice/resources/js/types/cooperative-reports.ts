export type ReportStatusValue =
    'pending' | 'verified' | 'disputed' | 'rejected';

export type ReportFilterOption = {
    value: string;
    label: string;
};

export type ReportAuditActor = {
    id: number;
    name: string;
};

export type ReportAuditEntry = {
    id: number;
    oldStatus: string;
    newStatus: string;
    oldStatusLabel: string;
    newStatusLabel: string;
    reason: string | null;
    changedAt: string;
    changedBy: ReportAuditActor | null;
};

export type ReportReporter = {
    id: number;
    name: string;
    phoneNumber: string;
};

export type CooperativeReportRow = {
    id: number;
    crop: string;
    cropLabel: string;
    market: string;
    marketLabel: string;
    price: number;
    reporter: ReportReporter;
    reportedAt: string;
    status: ReportStatusValue | string;
    statusLabel: string;
    auditTrail: ReportAuditEntry[];
};

export type CooperativeReportFilters = {
    crop: string | null;
    market: string | null;
    status: string | null;
    from: string | null;
    to: string | null;
};

export type PaginatedCooperativeReports = {
    data: CooperativeReportRow[];
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
