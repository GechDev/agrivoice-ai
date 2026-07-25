import { Head, setLayoutProps, usePoll } from '@inertiajs/react';
import { MarketMap } from '@/components/market-map';
import { PageSection, StaggerItem } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { PriceCard } from '@/components/price-card';
import { TrendChart } from '@/components/trend-chart';
import { useTranslations } from '@/hooks/use-translations';
import { CROPS } from '@/lib/agrivoice';
import { dashboard } from '@/routes';
import type { MarketMarker, PriceSnapshot } from '@/types';

/**
 * Dashboard page — the projector-facing view for the live demo.
 *
 * Layout:
 *   - Hero header with "Live" indicator
 *   - Grid of PriceCards (7 crops × 3 markets = 21 tiles)
 *   - Bottom section: MarketMap (left 3/5) + TrendChart (right 2/5)
 *
 * Polling: usePoll(2500) refreshes the `snapshots` prop every 2.5s.
 * Only the `snapshots` prop is re-fetched (via `only` option), not
 * the entire page. This keeps the response small and avoids re-
 * rendering the map/markers on every tick.
 *
 * Sort order: markets first (Adama → Addis Ababa → Jimma), then
 * crops within each market (the CROPS array order). This creates
 * a consistent visual rhythm on the dashboard grid.
 */

type DashboardProps = {
    snapshots: PriceSnapshot[];
    markets: MarketMarker[];
};

export default function Dashboard({ snapshots, markets }: DashboardProps) {
    const t = useTranslations();

    // Update the sidebar breadcrumb to highlight "Dashboard"
    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Dashboard'),
                href: dashboard(),
            },
        ],
    });

    // Poll every 2.5s for fresh snapshot data.
    // - `only: ['snapshots']` — only re-fetch this prop, not markets
    // - `mode: 'rest'` — don't fire a new request if the previous one hasn't finished
    // - `keepAlive: true` — keep polling even when the tab is in the background
    //   (useful for conference demo where the projector tab may be inactive)
    usePoll(2500, { only: ['snapshots'] }, { mode: 'rest', keepAlive: true });

    // Sort snapshots by market (Adama → Addis Ababa → Jimma), then by crop.
    // This creates a consistent grid layout where each market's crops
    // appear together visually.
    const ordered = [...snapshots].sort((a, b) => {
        const marketOrder = ['adama', 'addis_ababa', 'jimma'];
        const cropOrder = [...CROPS];
        const marketDiff =
            marketOrder.indexOf(a.market) - marketOrder.indexOf(b.market);

        if (marketDiff !== 0) {
            return marketDiff;
        }

        return cropOrder.indexOf(a.crop) - cropOrder.indexOf(b.crop);
    });

    return (
        <>
            <Head title={t('Dashboard')} />
            <div className="flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        tone="inverse"
                        title={t('Live market prices')}
                        description={t(
                            'Crowd-backed ETB/quintal · updates every 2.5s · teff, coffee, maize, wheat, sesame, pulses & sorghum across Adama, Addis Ababa, and Jimma',
                        )}
                        actions={
                            <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-medium tracking-wide text-background/80">
                                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                                {t('Live')}
                            </span>
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
                        <MarketMap markets={markets} snapshots={snapshots} />
                    </div>
                    <div className="lg:col-span-2">
                        <TrendChart snapshots={ordered} />
                    </div>
                </PageSection>
            </div>
        </>
    );
}
