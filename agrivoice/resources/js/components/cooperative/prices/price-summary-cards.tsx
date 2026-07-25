import { CalendarDays, ChartNoAxesCombined, Sprout, Store } from 'lucide-react';
import { StaggerItem } from '@/components/motion/page-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import type { CooperativePriceSummary } from '@/types/cooperative-prices';

type PriceSummaryCardsProps = {
    summary: CooperativePriceSummary;
};

export function PriceSummaryCards({ summary }: PriceSummaryCardsProps) {
    const t = useTranslations();
    const crops = new Set(summary.rows.map((row) => row.crop)).size;
    const availablePrices = summary.rows.filter(
        (row) => row.currentPrice !== null,
    ).length;

    const items = [
        {
            label: t('Tracked crops'),
            value: crops.toLocaleString(),
            detail: t('Configured for this cooperative'),
            icon: Sprout,
        },
        {
            label: t('Eligible markets'),
            value: summary.regionalMarketsCount.toLocaleString(),
            detail: t('Exact region match: :region', {
                region: summary.cooperative.region,
            }),
            icon: Store,
        },
        {
            label: t('Current prices'),
            value: availablePrices.toLocaleString(),
            detail: t('Crop-market pairs with cooperative data'),
            icon: ChartNoAxesCombined,
        },
        {
            label: t('Price period'),
            value: t(summary.period.label),
            detail: t(':from to :to', {
                from: summary.period.from,
                to: summary.period.to,
            }),
            icon: CalendarDays,
        },
    ];

    return (
        <section
            aria-label={t('Price summary')}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {items.map((item, index) => {
                const Icon = item.icon;

                return (
                    <StaggerItem key={item.label} index={index}>
                        <Card className="av-hover-lift gap-4">
                            <CardHeader className="flex-row items-center justify-between gap-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {item.label}
                                </CardTitle>
                                <div className="rounded-xl border bg-muted/60 p-2 text-primary shadow-sm">
                                    <Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
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
                    </StaggerItem>
                );
            })}
        </section>
    );
}
