import { Head, setLayoutProps, usePoll } from '@inertiajs/react';
import { MarketMap } from '@/components/market-map';
import { PriceCard } from '@/components/price-card';
import { TrendChart } from '@/components/trend-chart';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard } from '@/routes';
import type { MarketMarker, PriceSnapshot } from '@/types';

type DashboardProps = {
    snapshots: PriceSnapshot[];
    markets: MarketMarker[];
};

export default function Dashboard({ snapshots, markets }: DashboardProps) {
    const t = useTranslations();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Dashboard'),
                href: dashboard(),
            },
        ],
    });

    // Inertia v3 poll helper (from Boost search-docs): auto-cleanup on unmount,
    // throttles in background tabs, and rest mode avoids overlapping requests
    // on flaky conference wifi.
    usePoll(
        2500,
        { only: ['snapshots'] },
        { mode: 'rest', keepAlive: true },
    );

    const ordered = [...snapshots].sort((a, b) => {
        const marketOrder = ['adama', 'addis_ababa', 'jimma'];
        const cropOrder = ['teff', 'coffee'];
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
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Live market prices
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Crowd-backed ETB/quintal · updates every 2.5s · teff
                        &amp; coffee across Adama, Addis Ababa, and Jimma
                    </p>
                </header>

                <section
                    aria-label="Price snapshots"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    {ordered.map((snapshot) => (
                        <PriceCard
                            key={`${snapshot.crop}-${snapshot.market}`}
                            snapshot={snapshot}
                        />
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <MarketMap markets={markets} snapshots={snapshots} />
                    </div>
                    <div className="lg:col-span-2">
                        <TrendChart snapshots={ordered} />
                    </div>
                </section>
            </div>
        </>
    );
}
