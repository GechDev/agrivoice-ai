import { CalendarDays, ChartNoAxesCombined, Sprout, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CooperativePriceSummary } from '@/types/cooperative-prices';

type PriceSummaryCardsProps = {
    summary: CooperativePriceSummary;
};

export function PriceSummaryCards({ summary }: PriceSummaryCardsProps) {
    const crops = new Set(summary.rows.map((row) => row.crop)).size;
    const availablePrices = summary.rows.filter(
        (row) => row.currentPrice !== null,
    ).length;

    const items = [
        {
            label: 'Tracked crops',
            value: crops.toLocaleString(),
            detail: 'Configured for this cooperative',
            icon: Sprout,
        },
        {
            label: 'Eligible markets',
            value: summary.regionalMarketsCount.toLocaleString(),
            detail: `Exact region match: ${summary.cooperative.region}`,
            icon: Store,
        },
        {
            label: 'Current prices',
            value: availablePrices.toLocaleString(),
            detail: 'Crop-market pairs with cooperative data',
            icon: ChartNoAxesCombined,
        },
        {
            label: 'Price period',
            value: summary.period.label,
            detail: `${summary.period.from} to ${summary.period.to}`,
            icon: CalendarDays,
        },
    ];

    return (
        <section
            aria-label="Price summary"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Card key={item.label} className="gap-4">
                        <CardHeader className="flex-row items-center justify-between gap-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {item.label}
                            </CardTitle>
                            <div className="rounded-xl border bg-muted/60 p-2 text-primary shadow-sm">
                                <Icon className="size-4" aria-hidden="true" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-1">
                            <span className="text-2xl font-bold">
                                {item.value}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {item.detail}
                            </span>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}
