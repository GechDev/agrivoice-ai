import { Head, setLayoutProps } from '@inertiajs/react';
import { Download, Info } from 'lucide-react';
import {
    download,
    index,
} from '@/actions/App/Http/Controllers/CooperativePriceController';
import { PriceSummaryCards } from '@/components/cooperative/prices/price-summary-cards';
import { PriceTable } from '@/components/cooperative/prices/price-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard as cooperativeDashboard } from '@/routes/cooperative';
import type { CooperativePriceSummary } from '@/types/cooperative-prices';

export default function PricesIndex({
    summary,
}: {
    summary: CooperativePriceSummary;
}) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Cooperative dashboard',
                href: cooperativeDashboard(),
            },
            {
                title: 'Prices',
                href: index(),
            },
        ],
    });

    return (
        <>
            <Head title="Cooperative prices" />
            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Crop prices
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Compare {summary.cooperative.name} member prices
                            with the {summary.cooperative.region} regional
                            benchmark.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <a
                            href={download.url()}
                            aria-label="Download weekly crop price summary as PDF"
                        >
                            <Download aria-hidden="true" />
                            Download PDF
                        </a>
                    </Button>
                </header>

                <PriceSummaryCards summary={summary} />

                <Card className="gap-3 border-primary/20 bg-primary/5 shadow-sm">
                    <CardHeader className="flex-row items-start gap-3">
                        <div className="rounded-xl border border-primary/20 bg-background p-2 text-primary">
                            <Info className="size-4" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-sm">
                                How the benchmark is calculated
                            </CardTitle>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {summary.definition} The cooperative price uses
                                only this cooperative&apos;s verified, unflagged
                                member reports. Weekly trend compares the
                                current period with the previous seven days;
                                movement below 1% is labeled stable.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        {summary.regionalMarketsCount}{' '}
                        {summary.regionalMarketsCount === 1
                            ? 'market is'
                            : 'markets are'}{' '}
                        eligible by exact region match. Each row reports how
                        many contributed to that crop&apos;s benchmark.
                    </CardContent>
                </Card>

                <section className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold">
                            Tracked crop prices by market
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            All amounts are seven-day averages in Ethiopian birr
                            (ETB).
                        </p>
                    </div>
                    <PriceTable rows={summary.rows} />
                </section>
            </div>
        </>
    );
}
