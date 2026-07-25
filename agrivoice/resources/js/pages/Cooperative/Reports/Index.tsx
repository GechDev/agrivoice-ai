import { Head, router, setLayoutProps } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    exportMethod,
    index,
} from '@/actions/App/Http/Controllers/CooperativeReportController';
import { ReportsFilters } from '@/components/cooperative/reports/reports-filters';
import { ReportsPagination } from '@/components/cooperative/reports/reports-pagination';
import { ReportsTable } from '@/components/cooperative/reports/reports-table';
import {
    type StatusActionTarget,
    UpdateReportStatusDialog,
} from '@/components/cooperative/reports/update-report-status-dialog';
import { PageSection } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type {
    CooperativeReportFilters,
    CooperativeReportRow,
    PaginatedCooperativeReports,
    ReportFilterOption,
} from '@/types/cooperative-reports';

type ReportsIndexProps = {
    reports: PaginatedCooperativeReports;
    filters: CooperativeReportFilters;
    cropOptions: ReportFilterOption[];
    marketOptions: ReportFilterOption[];
    statusOptions: ReportFilterOption[];
};

function filterQuery(
    crop: string,
    market: string,
    status: string,
    from: string,
    to: string,
): Record<string, string> {
    const query: Record<string, string> = {};

    if (crop !== '') {
        query.crop = crop;
    }

    if (market !== '') {
        query.market = market;
    }

    if (status !== '') {
        query.status = status;
    }

    if (from !== '') {
        query.from = from;
    }

    if (to !== '') {
        query.to = to;
    }

    return query;
}

export default function ReportsIndex({
    reports,
    filters,
    cropOptions,
    marketOptions,
    statusOptions,
}: ReportsIndexProps) {
    const t = useTranslations();
    const [crop, setCrop] = useState(filters.crop ?? '');
    const [market, setMarket] = useState(filters.market ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [filtering, setFiltering] = useState(false);
    const [statusReport, setStatusReport] =
        useState<CooperativeReportRow | null>(null);
    const [statusTarget, setStatusTarget] = useState<StatusActionTarget | null>(
        null,
    );

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Cooperative dashboard'),
                href: cooperativeDashboard(),
            },
            {
                title: t('Reports'),
                href: index(),
            },
        ],
    });

    useEffect(() => {
        setCrop(filters.crop ?? '');
        setMarket(filters.market ?? '');
        setStatus(filters.status ?? '');
        setFrom(filters.from ?? '');
        setTo(filters.to ?? '');
    }, [
        filters.crop,
        filters.market,
        filters.status,
        filters.from,
        filters.to,
    ]);

    const activeQuery = filterQuery(crop, market, status, from, to);

    const navigateWithFilters = (
        nextCrop: string,
        nextMarket: string,
        nextStatus: string,
        nextFrom: string,
        nextTo: string,
        page?: number,
    ): void => {
        setFiltering(true);

        router.get(
            index.url({
                query: {
                    ...filterQuery(
                        nextCrop,
                        nextMarket,
                        nextStatus,
                        nextFrom,
                        nextTo,
                    ),
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

    const openStatusDialog = (
        report: CooperativeReportRow,
        target: StatusActionTarget,
    ): void => {
        setStatusReport(report);
        setStatusTarget(target);
    };

    const closeStatusDialog = (open: boolean): void => {
        if (!open) {
            setStatusReport(null);
            setStatusTarget(null);
        }
    };

    return (
        <>
            <Head title={t('Cooperative reports')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        title={t('Reports')}
                        description={t(
                            'Review member price reports, verify quality, and export filtered results.',
                        )}
                        actions={
                            <Button variant="outline" asChild>
                                <a
                                    href={exportMethod.url({
                                        query: activeQuery,
                                    })}
                                    aria-label={t(
                                        'Export filtered reports as CSV',
                                    )}
                                >
                                    <Download aria-hidden="true" />
                                    {t('Export CSV')}
                                </a>
                            </Button>
                        }
                    />
                </PageSection>

                <PageSection delay={1}>
                    <ReportsFilters
                        crop={crop}
                        market={market}
                        status={status}
                        from={from}
                        to={to}
                        cropOptions={cropOptions}
                        marketOptions={marketOptions}
                        statusOptions={statusOptions}
                        onCropChange={(value) => {
                            setCrop(value);
                            navigateWithFilters(value, market, status, from, to);
                        }}
                        onMarketChange={(value) => {
                            setMarket(value);
                            navigateWithFilters(crop, value, status, from, to);
                        }}
                        onStatusChange={(value) => {
                            setStatus(value);
                            navigateWithFilters(crop, market, value, from, to);
                        }}
                        onFromChange={(value) => {
                            setFrom(value);
                            navigateWithFilters(crop, market, status, value, to);
                        }}
                        onToChange={(value) => {
                            setTo(value);
                            navigateWithFilters(crop, market, status, from, value);
                        }}
                        onReset={() => {
                            setCrop('');
                            setMarket('');
                            setStatus('');
                            setFrom('');
                            setTo('');
                            navigateWithFilters('', '', '', '', '');
                        }}
                    />
                </PageSection>

                <PageSection delay={2}>
                    <ReportsTable
                        reports={reports.data}
                        loading={filtering}
                        onDispute={(report) => openStatusDialog(report, 'disputed')}
                        onReject={(report) => openStatusDialog(report, 'rejected')}
                    />
                </PageSection>

                <PageSection delay={3}>
                    <ReportsPagination
                        reports={reports}
                        onPrevious={() =>
                            navigateWithFilters(
                                crop,
                                market,
                                status,
                                from,
                                to,
                                Math.max(1, reports.current_page - 1),
                            )
                        }
                        onNext={() =>
                            navigateWithFilters(
                                crop,
                                market,
                                status,
                                from,
                                to,
                                reports.current_page + 1,
                            )
                        }
                    />
                </PageSection>
            </div>

            <UpdateReportStatusDialog
                report={statusReport}
                targetStatus={statusTarget}
                open={statusReport !== null && statusTarget !== null}
                onOpenChange={closeStatusDialog}
            />
        </>
    );
}
