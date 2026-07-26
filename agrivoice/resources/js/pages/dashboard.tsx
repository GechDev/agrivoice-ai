import { Head, router, setLayoutProps, usePoll } from '@inertiajs/react';
import { MapPin } from 'lucide-react';

import { MarketMap } from '@/components/market-map';
import { PageSection, StaggerItem } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { PriceCard } from '@/components/price-card';
import { TrendChart } from '@/components/trend-chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import { DASHBOARD_CROPS, marketLabel } from '@/lib/agrivoice';
import { dashboard } from '@/routes';
import type { MarketMarker, MarketSlug, PriceSnapshot, SubmissionLocation } from '@/types';

/**
 * Dashboard page — live crop prices for one market at a time.
 *
 * Layout:
 *   - Hero header with required location switcher + "Live" indicator
 *   - Grid of PriceCards (first six crops × selected market)
 *   - Bottom section: MarketMap (left 3/5) + TrendChart (right 2/5)
 *
 * Polling: usePoll(2500) refreshes `snapshots` (+ filters) every 2.5s
 * against the current URL, so `?market=adama` survives poll ticks.
 */

type DashboardProps = {
    snapshots: PriceSnapshot[];
    markets: MarketMarker[];
    submissionLocations: SubmissionLocation[];
    filters: {
        market: MarketSlug;
    };
};

export default function Dashboard({
    snapshots,
    markets,
    submissionLocations,
    filters,
}: DashboardProps) {
    const t = useTranslations();
    const selectedMarket = filters.market;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Dashboard'),
                href: dashboard.url({ query: { market: selectedMarket } }),
            },
        ],
    });

    usePoll(
        2500,
        { only: ['snapshots', 'filters', 'submissionLocations'] },
        { mode: 'rest', keepAlive: true },
    );

    const ordered = [...snapshots]
        .filter(
            (snapshot) =>
                snapshot.market === selectedMarket &&
                DASHBOARD_CROPS.includes(snapshot.crop),
        )
        .sort(
            (a, b) =>
                DASHBOARD_CROPS.indexOf(a.crop) -
                DASHBOARD_CROPS.indexOf(b.crop),
        );

    const switchMarket = (value: string): void => {
        router.get(
            dashboard.url({ query: { market: value as MarketSlug } }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['snapshots', 'filters', 'submissionLocations'],
            },
        );
    };

    return (
        <>
            <Head title={t('Dashboard')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        tone="inverse"
                        title={t('Live market prices')}
                        description={t(
                            'Crowd-backed ETB/quintal · updates every 2.5s · showing :location',
                            { location: t(marketLabel(selectedMarket)) },
                        )}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2 rounded-full bg-background/10 px-2 py-1">
                                    <MapPin className="ms-1 size-3.5 text-background/70" />
                                    <Select
                                        value={selectedMarket}
                                        onValueChange={switchMarket}
                                    >
                                        <SelectTrigger
                                            aria-label={t('Location')}
                                            className="h-8 w-[168px] border-0 bg-transparent text-background shadow-none focus-visible:ring-background/30 [&>svg]:text-background/70"
                                        >
                                            <SelectValue
                                                placeholder={t('Location')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {markets.map((market) => (
                                                <SelectItem
                                                    key={market.slug}
                                                    value={market.slug}
                                                >
                                                    {t(marketLabel(market.slug))}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-medium tracking-wide text-background/80">
                                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                                    {t('Live')}
                                </span>
                            </div>
                        }
                    />
                </PageSection>

                <section
                    aria-label={t('Price snapshots')}
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    {ordered.map((snapshot, index) => (
                        <StaggerItem
                            key={`${snapshot.crop}-${snapshot.market}`}
                            index={index}
                        >
                            <PriceCard snapshot={snapshot} />
                        </StaggerItem>
                    ))}
                </section>

                <PageSection delay={3} className="grid gap-4 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <MarketMap
                            markets={markets}
                            snapshots={snapshots}
                            submissionLocations={submissionLocations}
                            selectedMarket={selectedMarket}
                            onSelectMarket={switchMarket}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <TrendChart
                            snapshots={ordered}
                            hideMarketLabel
                        />
                    </div>
                </PageSection>
            </div>
        </>
    );
}
