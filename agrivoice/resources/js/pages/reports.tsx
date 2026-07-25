import { Head, setLayoutProps, usePoll } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/ReportController';
import { PageSection } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { RecentReportsFeed } from '@/components/recent-reports-feed';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import { CROPS, cropLabel } from '@/lib/agrivoice';
import type { Crop, MarketSlug, ReportRowData } from '@/types';

/**
 * Live report list — newest agent entries with filtering and flagging.
 *
 * This page serves two purposes:
 * 1. PUBLIC FEED: Shows the 50 most recent reports with agent attribution.
 *    Anyone can view this — no authentication required.
 *
 * 2. MODERATION: Each report row has a flag button (via ReportRow's
 *    action slot) that quarantines outliers. Flagged reports disappear
 *    from the dashboard aggregates.
 *
 * Polling: usePoll(2500) refreshes the `reports` prop every 2.5s.
 * New entries from the portal appear within seconds.
 *
 * Filtering: Client-side filtering by crop, market, and flagged status.
 * The backend always returns the full 50-report set; the filters narrow
 * it in the browser without a round-trip.
 */

type ReportsPageProps = {
    reports: ReportRowData[];
    canModerate?: boolean;
};

type CropFilter = 'all' | Crop;
type MarketFilter = 'all' | MarketSlug;

export default function Reports({
    reports,
    canModerate = false,
}: ReportsPageProps) {
    const t = useTranslations();
    const [crop, setCrop] = useState<CropFilter>('all');
    const [market, setMarket] = useState<MarketFilter>('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Live list'),
                href: reportsIndex(),
            },
        ],
    });

    // Poll every 2.5s — only re-fetch the reports prop.
    // The filter state (crop, market, flaggedOnly) is local React state
    // and survives the poll without resetting.
    usePoll(2500, { only: ['reports'] }, { mode: 'rest', keepAlive: true });

    // Client-side filter: narrow the full report list by crop, market,
    // and flagged status. useMemo avoids re-filtering on every render
    // when only unrelated state changes.
    const filtered = useMemo(() => {
        return reports.filter((report) => {
            if (crop !== 'all' && report.crop !== crop) {
                return false;
            }

            if (market !== 'all' && report.market !== market) {
                return false;
            }

            if (flaggedOnly && !report.isFlagged) {
                return false;
            }

            return true;
        });
    }, [reports, crop, market, flaggedOnly]);

    return (
        <>
            <Head title={t('Live list')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        title={t('Live data list')}
                        description={t(
                            'Newest agent entries · flag outliers to correct the dashboard · updates every 2.5s',
                        )}
                    />
                </PageSection>

                <PageSection delay={1}>
                    <section
                        aria-label={t('Filters')}
                        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-md"
                    >
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="filter-crop">{t('Crop')}</Label>
                            <Select
                                value={crop}
                                onValueChange={(value) =>
                                    setCrop(value as CropFilter)
                                }
                            >
                                <SelectTrigger
                                    id="filter-crop"
                                    className="w-[140px]"
                                >
                                    <SelectValue placeholder={t('Crop')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('All crops')}
                                    </SelectItem>
                                    {CROPS.map((cropOption) => (
                                        <SelectItem
                                            key={cropOption}
                                            value={cropOption}
                                        >
                                            {t(cropLabel(cropOption))}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="filter-market">{t('Market')}</Label>
                            <Select
                                value={market}
                                onValueChange={(value) =>
                                    setMarket(value as MarketFilter)
                                }
                            >
                                <SelectTrigger
                                    id="filter-market"
                                    className="w-[160px]"
                                >
                                    <SelectValue placeholder={t('Market')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('All markets')}
                                    </SelectItem>
                                    <SelectItem value="adama">
                                        {t('Adama')}
                                    </SelectItem>
                                    <SelectItem value="addis_ababa">
                                        {t('Addis Ababa')}
                                    </SelectItem>
                                    <SelectItem value="jimma">
                                        {t('Jimma')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="button"
                            variant={flaggedOnly ? 'default' : 'outline'}
                            onClick={() => setFlaggedOnly((v) => !v)}
                        >
                            {flaggedOnly
                                ? t('Flagged only')
                                : t('Show flagged only')}
                        </Button>

                        <p className="ml-auto text-sm text-muted-foreground">
                            {t('Showing')}{' '}
                            <span className="font-semibold text-foreground">
                                {filtered.length}
                            </span>{' '}
                            {t('of')} {reports.length}
                        </p>
                    </section>
                </PageSection>

                <PageSection delay={2}>
                    <RecentReportsFeed
                    reports={filtered}
                    canModerate={canModerate}
                />
                </PageSection>
            </div>
        </>
    );
}
