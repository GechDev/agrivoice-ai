import { Head, router, setLayoutProps } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpDown,
    ArrowUpRight,
    ChartNoAxesCombined,
} from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { index } from '@/actions/App/Http/Controllers/PriceController';
import { PageSection } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import {
    CROPS,
    cropLabel,
    formatPrice,
    formatTimeAgo,
    marketLabel,
} from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type {
    Crop,
    MarketSlug,
    PriceExplorerFilters,
    PriceHistoryPoint,
    PriceSnapshot,
    Trend,
} from '@/types';

type PricesProps = {
    rows: PriceSnapshot[];
    markets: Array<{ slug: MarketSlug; name: string }>;
    filters: PriceExplorerFilters;
    selected: { crop: Crop; market: MarketSlug } | null;
    history: PriceHistoryPoint[];
};

const dateFormatter = new Intl.DateTimeFormat('en-ET', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-ET', {
    month: 'short',
    year: '2-digit',
});

function cleanQuery(filters: PriceExplorerFilters): Record<string, string> {
    return Object.fromEntries(
        Object.entries(filters)
            .filter(([, value]) => value !== null && value !== '')
            .map(([key, value]) => [key, String(value)]),
    );
}

function TrendBadge({ trend, change }: { trend: Trend; change: number | null }) {
    const t = useTranslations();
    const Icon =
        trend === 'up'
            ? ArrowUpRight
            : trend === 'down'
              ? ArrowDownRight
              : ArrowRight;

    return (
        <Badge
            variant="outline"
            className={cn(
                trend === 'up' &&
                    'border-primary/30 bg-primary/10 text-primary',
                trend === 'down' &&
                    'border-destructive/30 bg-destructive/10 text-destructive',
                trend === 'stable' &&
                    'border-border bg-muted text-muted-foreground',
            )}
        >
            <Icon aria-hidden="true" />
            {t(trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable')}
            {change !== null
                ? ` ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
                : ''}
        </Badge>
    );
}

export default function Prices({
    rows,
    markets,
    filters,
    selected,
    history,
}: PricesProps) {
    const t = useTranslations();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Prices'),
                href: index(),
            },
        ],
    });

    const updateFilters = (changes: Partial<PriceExplorerFilters>): void => {
        const nextFilters = { ...filters, ...changes };

        router.get(index.url(), cleanQuery(nextFilters), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const sortBy = (sort: PriceExplorerFilters['sort']): void => {
        updateFilters({
            sort,
            direction:
                filters.sort === sort && filters.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        });
    };

    const sortButton = (
        label: string,
        sort: PriceExplorerFilters['sort'],
    ) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-medium tracking-wide uppercase"
            onClick={() => sortBy(sort)}
        >
            {label}
            <ArrowUpDown aria-hidden="true" className="size-3.5" />
        </Button>
    );

    return (
        <>
            <Head title={t('Prices')} />

            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        title={t('Price explorer')}
                        description={t(
                            'Browse current crop prices across markets, compare confidence, and inspect reported price history.',
                        )}
                    />
                </PageSection>

                <PageSection delay={1}>
                    <Card>
                        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
                            <div className="space-y-2">
                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {t('Crop')}
                                </span>
                                <Select
                                    value={filters.crop ?? 'all'}
                                    onValueChange={(value) =>
                                        updateFilters({
                                            crop:
                                                value === 'all'
                                                    ? null
                                                    : (value as Crop),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('All crops')}
                                        </SelectItem>
                                        {CROPS.map((crop) => (
                                            <SelectItem key={crop} value={crop}>
                                                {t(cropLabel(crop))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {t('Market')}
                                </span>
                                <Select
                                    value={filters.market ?? 'all'}
                                    onValueChange={(value) =>
                                        updateFilters({
                                            market:
                                                value === 'all'
                                                    ? null
                                                    : (value as MarketSlug),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('All markets')}
                                        </SelectItem>
                                        {markets.map((market) => (
                                            <SelectItem
                                                key={market.slug}
                                                value={market.slug}
                                            >
                                                {t(market.name)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {t('Trend')}
                                </span>
                                <Select
                                    value={filters.trend ?? 'all'}
                                    onValueChange={(value) =>
                                        updateFilters({
                                            trend:
                                                value === 'all'
                                                    ? null
                                                    : (value as Trend),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('All trends')}
                                        </SelectItem>
                                        <SelectItem value="up">
                                            {t('Up')}
                                        </SelectItem>
                                        <SelectItem value="down">
                                            {t('Down')}
                                        </SelectItem>
                                        <SelectItem value="stable">
                                            {t('Stable')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </PageSection>

                <PageSection delay={2}>
                    <Card className="overflow-hidden py-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3">
                                            {sortButton(t('Crop'), 'crop')}
                                        </th>
                                        <th className="px-5 py-3">
                                            {sortButton(t('Market'), 'market')}
                                        </th>
                                        <th className="px-5 py-3">
                                            {sortButton(
                                                t('Current price'),
                                                'price',
                                            )}
                                        </th>
                                        <th className="px-5 py-3">
                                            {sortButton(
                                                t('% change'),
                                                'change',
                                            )}
                                        </th>
                                        <th className="px-5 py-3">
                                            {sortButton(
                                                t('Confidence'),
                                                'confidence',
                                            )}
                                        </th>
                                        <th className="px-5 py-3">
                                            {sortButton(
                                                t('Last updated'),
                                                'updated',
                                            )}
                                        </th>
                                        <th className="px-5 py-3">
                                            {t('Trend')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rows.map((row) => {
                                        const isSelected =
                                            selected?.crop === row.crop &&
                                            selected.market === row.market;

                                        return (
                                            <tr
                                                key={`${row.crop}-${row.market}`}
                                                className={cn(
                                                    'transition-colors hover:bg-muted/40',
                                                    isSelected &&
                                                        'bg-primary/5',
                                                )}
                                            >
                                                <th className="px-5 py-4 font-semibold">
                                                    {t(cropLabel(row.crop))}
                                                </th>
                                                <td className="px-5 py-4">
                                                    {t(
                                                        marketLabel(row.market),
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 font-semibold tabular-nums">
                                                    {row.reportCount === 0
                                                        ? t('No data')
                                                        : `${formatPrice(row.price)} ${t('ETB/q')}`}
                                                </td>
                                                <td className="px-5 py-4 tabular-nums">
                                                    {row.changePercent === null
                                                        ? '—'
                                                        : `${row.changePercent > 0 ? '+' : ''}${row.changePercent.toFixed(1)}%`}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-28 items-center gap-2">
                                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-primary"
                                                                style={{
                                                                    width: `${row.confidence}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="w-9 text-right tabular-nums">
                                                            {row.confidence}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {row.lastUpdated === null
                                                        ? t('No reports')
                                                        : formatTimeAgo(
                                                              row.lastUpdated,
                                                              t,
                                                          )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            isSelected
                                                                ? 'secondary'
                                                                : 'ghost'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            updateFilters({
                                                                chart_crop:
                                                                    row.crop,
                                                                chart_market:
                                                                    row.market,
                                                            })
                                                        }
                                                        aria-label={t(
                                                            'View trend for :crop in :market',
                                                            {
                                                                crop: t(
                                                                    cropLabel(
                                                                        row.crop,
                                                                    ),
                                                                ),
                                                                market: t(
                                                                    marketLabel(
                                                                        row.market,
                                                                    ),
                                                                ),
                                                            },
                                                        )}
                                                    >
                                                        <TrendBadge
                                                            trend={row.trend}
                                                            change={
                                                                row.changePercent
                                                            }
                                                        />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {rows.length === 0 && (
                            <div className="px-6 py-14 text-center text-sm text-muted-foreground">
                                {t(
                                    'No price data matches the selected filters.',
                                )}
                            </div>
                        )}
                    </Card>
                </PageSection>

                <PageSection delay={3}>
                    <Card>
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>{t('Price trend history')}</CardTitle>
                                {selected && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t(cropLabel(selected.crop))} ·{' '}
                                        {t(marketLabel(selected.market))}
                                    </p>
                                )}
                            </div>
                            <span className="rounded-xl bg-primary/10 p-2 text-primary">
                                <ChartNoAxesCombined className="size-5" />
                            </span>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                                    {t(
                                        'No verified price history is available for this crop and market.',
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="h-[360px] w-full"
                                    aria-label={t('Price trend chart')}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={history}
                                            margin={{
                                                top: 8,
                                                right: 12,
                                                bottom: 8,
                                                left: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                stroke="var(--border)"
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(date: string) =>
                                                    shortDateFormatter.format(
                                                        new Date(date),
                                                    )
                                                }
                                                minTickGap={36}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={12}
                                            />
                                            <YAxis
                                                orientation="right"
                                                tickFormatter={(price: number) =>
                                                    formatPrice(price)
                                                }
                                                tickLine={false}
                                                axisLine={false}
                                                width={72}
                                                fontSize={12}
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip
                                                labelFormatter={(date) =>
                                                    dateFormatter.format(
                                                        new Date(String(date)),
                                                    )
                                                }
                                                formatter={(price) => [
                                                    `${formatPrice(Number(price))} ${t('ETB/q')}`,
                                                    t('Price'),
                                                ]}
                                                contentStyle={{
                                                    borderRadius:
                                                        'var(--radius)',
                                                    borderColor:
                                                        'var(--border)',
                                                    background:
                                                        'var(--popover)',
                                                    color: 'var(--popover-foreground)',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="price"
                                                stroke="var(--primary)"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </PageSection>
            </div>
        </>
    );
}
