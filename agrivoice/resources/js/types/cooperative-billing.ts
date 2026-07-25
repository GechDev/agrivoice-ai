export type BillingSubscription = {
    id: number;
    planTier: string;
    planName: string;
    pendingPlanTier: string | null;
    pendingPlanName: string | null;
    pricePerMonth: number;
    status: string;
    statusLabel: string;
    renewalDate: string;
    memberLimit: number;
    memberCount: number;
    paymentMethod: {
        type: string | null;
        lastFour: string | null;
    };
};

export type BillingPlan = {
    tier: string;
    name: string;
    pricePerMonth: number;
    memberLimit: number;
};

export type BillingInvoice = {
    id: number;
    amount: number;
    status: 'paid' | 'due' | 'overdue';
    statusLabel: string;
    issuedAt: string;
    downloadAvailable: boolean;
};

export type PaginatedBillingInvoices = {
    data: BillingInvoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
