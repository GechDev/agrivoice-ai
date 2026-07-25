import { Deferred, Head, router, setLayoutProps } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    FileCheck2,
    MessageCircleQuestion,
    Minus,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { PageSection, StaggerItem } from '@/components/motion/page-section';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/hooks/use-translations';
import { formatCurrency } from '@/lib/agrivoice';
import { dashboard } from '@/routes/cooperative';

/**
 * Cooperative overview — shadcn Cards/Badges + Recharts LineChart.
 * Chart series are Inertia props from CooperativeDashboardController.
 * Recharts is npm-bundled (no CDN / no public chart API).
 */

type CooperativeSummary = {
    id: number;
    name: string;
    region: string;
    defaultCrops: string[];
};

type PriceSummary = {
    crop: string;
    cropLabel: string;
    market: string;
    marketLabel: string;
    averagePrice: number;
    changePercent: number | null;
    confidence: number;
    reportCount: number;
};

type ActivityMetric = {
    value: number;
    changePercent: number | null;
};

type MemberActivity = {
    totalMembers: ActivityMetric;
    activeMembers: ActivityMetric;
    totalQueries: ActivityMetric;
    totalReports: ActivityMetric;
};

type TrendPoint = {
    date: string;
    actual: number | null;
    forecast: number | null;
};

type CropTrend = {
    crop: string;
    cropLabel: string;
    points: TrendPoint[];
};

type DashboardProps = {
    cooperative: CooperativeSummary;
    prices: PriceSummary[];
    memberActivity: MemberActivity;
    trends?: CropTrend[];
};

const activityCards = [
    {
        key: 'totalMembers',
        label: 'Total members',
        description: 'Current cooperative roster',
        icon: Users,
    },
    {
        key: 'activeMembers',
        label: 'Active this week',
        description: 'Submitted a report or query',
        icon: Activity,
    },
    {
        key: 'totalQueries',
        label: 'Queries this week',
        description: 'Market questions in 7 days',
        icon: MessageCircleQuestion,
    },
    {
        key: 'totalReports',
        label: 'Reports this week',
        description: 'Prices submitted in 7 days',
        icon: FileCheck2,
    },
] as const;

function Delta({ value }: { value: number | null }) {
    const t = useTranslations();

    if (value === null) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="size-3" aria-hidden="true" />
                {t('No prior data')}
            </span>
        );
    }

    const isPositive = value >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <span
            className={
                isPositive
                    ? 'inline-flex items-center gap-1 text-xs font-medium text-primary'
                    : 'inline-flex items-center gap-1 text-xs font-medium text-destructive'
            }
        >
            <Icon className="size-3" aria-hidden="true" />
            {t(':count% vs previous week', {
                count: String(Math.abs(value).toFixed(1)),
            })}
        </span>
    );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
    const t = useTranslations();
    const className =
        confidence > 80
            ? 'border-primary/30 bg-primary/15 text-primary'
            : confidence >= 50
              ? 'border-amber-600/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
              : 'border-destructive/30 bg-destructive/10 text-destructive';

    return (
        <Badge variant="outline" className={className}>
            {t(':count% confidence', { count: String(confidence) })}
        </Badge>
    );
}

function TrendSkeleton() {
    const t = useTranslations();

    return (
        <Card aria-label={t('Loading crop trends')}>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-72 max-w-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-72 w-full rounded-xl" />
            </CardContent>
        </Card>
    );
}

function TrendPanel({ trends }: { trends: CropTrend[] }) {
    const t = useTranslations();
    const [selectedCrop, setSelectedCrop] = useState(trends.at(0)?.crop ?? '');
    const [range, setRange] = useState<30 | 90>(30);
    const selectedTrend =
        trends.find((trend) => trend.crop === selectedCrop) ?? trends.at(0);

    const points = useMemo(() => {
        if (!selectedTrend) {
            return [];
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - range);

        return selectedTrend.points.filter((point) => {
            const pointDate = new Date(`${point.date}T00:00:00`);

            return pointDate >= cutoff;
        });
    }, [range, selectedTrend]);

    if (trends.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('Crop price trends')}</CardTitle>
                    <CardDescription>
                        {t(
                            'Add default crops in cooperative settings to start tracking trends.',
                        )}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>{t('Crop price trends')}</CardTitle>
                    <CardDescription>
                        {t(
                            'Cooperative reports with the latest forecast overlay.',
                        )}
                    </CardDescription>
                </div>
                <div
                    className="inline-flex w-fit rounded-lg border bg-muted p-1"
                    aria-label={t('Chart history range')}
                >
                    {([30, 90] as const).map((days) => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => setRange(days)}
                            aria-pressed={range === days}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:shadow-sm"
                            data-active={range === days}
                        >
                            {t(':count days', { count: String(days) })}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                {trends.length > 1 && (
                    <div
                        role="tablist"
                        aria-label={t('Select crop')}
                        className="flex flex-wrap gap-2"
                    >
                        {trends.map((trend) => (
                            <button
                                key={trend.crop}
                                type="button"
                                role="tab"
                                aria-selected={
                                    selectedTrend?.crop === trend.crop
                                }
                                onClick={() => setSelectedCrop(trend.crop)}
                                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-selected:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground"
                            >
                                {t(trend.cropLabel)}
                            </button>
                        ))}
                    </div>
                )}

                {points.length === 0 ? (
                    <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed bg-muted/40 p-8 text-center">
                        <div>
                            <p className="font-medium">{t('No trend data yet')}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'Reports and forecasts for this crop will appear here.',
                                )}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <span className="h-0.5 w-6 bg-chart-1" />
                                {t('Reported average')}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="w-6 border-t-2 border-dashed border-chart-3" />
                                {t('Forecast')}
                            </span>
                        </div>
                        <div
                            className="h-72 w-full"
                            aria-label={t('Price trend chart')}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={points}
                                    margin={{
                                        top: 8,
                                        right: 12,
                                        bottom: 0,
                                        left: 4,
                                    }}
                                    accessibilityLayer
                                >
                                    <CartesianGrid
                                        stroke="var(--border)"
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date: string) =>
                                            new Intl.DateTimeFormat('en', {
                                                month: 'short',
                                                day: 'numeric',
                                            }).format(
                                                new Date(`${date}T00:00:00`),
                                            )
                                        }
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={28}
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        tickFormatter={(value: number) =>
                                            `${Math.round(value / 1000)}k`
                                        }
                                        tickLine={false}
                                        axisLine={false}
                                        width={42}
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            formatCurrency(
                                                Number(
                                                    Array.isArray(value)
                                                        ? value[0]
                                                        : (value ?? 0),
                                                ),
                                            ),
                                            name === 'actual'
                                                ? t('Reported average')
                                                : t('Forecast'),
                                        ]}
                                        labelFormatter={(date) =>
                                            new Intl.DateTimeFormat('en', {
                                                dateStyle: 'medium',
                                            }).format(
                                                new Date(
                                                    `${String(date)}T00:00:00`,
                                                ),
                                            )
                                        }
                                        contentStyle={{
                                            background: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--card-foreground)',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="var(--chart-1)"
                                        strokeWidth={3}
                                        dot={false}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="var(--chart-3)"
                                        strokeWidth={3}
                                        strokeDasharray="7 5"
                                        dot={false}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    cooperative,
    prices,
    memberActivity,
    trends,
}: DashboardProps) {
    const t = useTranslations();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('Cooperative dashboard'),
                href: dashboard(),
            },
        ],
    });

    return (
        <>
            <Head
                title={t(':name dashboard', { name: cooperative.name })}
            />
            <div className="flex flex-1 flex-col gap-8 overflow-x-hidden p-4 md:p-6">
                <PageSection>
                    <PageHeader
                        title={cooperative.name}
                        description={t(
                            'Member activity and market intelligence at a glance.',
                        )}
                        actions={
                            <p className="text-sm font-medium text-primary">
                                {cooperative.region}
                            </p>
                        }
                    />
                </PageSection>

                <section aria-labelledby="member-activity-heading">
                    <PageSection delay={1} className="mb-4">
                        <h2
                            id="member-activity-heading"
                            className="text-lg font-semibold"
                        >
                            {t('Member activity')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Trailing seven days compared with the prior period.',
                            )}
                        </p>
                    </PageSection>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {activityCards.map((item, index) => {
                            const metric = memberActivity[item.key];
                            const Icon = item.icon;

                            return (
                                <StaggerItem key={item.key} index={index}>
                                    <Card className="av-hover-lift gap-4">
                                        <CardHeader className="flex-row items-start justify-between gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <CardDescription>
                                                    {t(item.label)}
                                                </CardDescription>
                                                <CardTitle className="text-3xl">
                                                    {metric.value.toLocaleString()}
                                                </CardTitle>
                                            </div>
                                            <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                                <Icon
                                                    className="size-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-2">
                                            <Delta
                                                value={metric.changePercent}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t(item.description)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            );
                        })}
                    </div>
                </section>

                <section aria-labelledby="price-overview-heading">
                    <PageSection delay={2} className="mb-4">
                        <h2
                            id="price-overview-heading"
                            className="text-lg font-semibold"
                        >
                            {t('Aggregated price overview')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Verified member reports from this calendar week.',
                            )}
                        </p>
                    </PageSection>

                    {prices.length === 0 ? (
                        <PageSection delay={3}>
                            <Card className="border-dashed">
                                <CardContent className="flex min-h-40 items-center justify-center text-center">
                                    <div>
                                        <p className="font-medium">
                                            {t(
                                                'No price reports yet this week',
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t(
                                                'New verified member reports will appear here.',
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </PageSection>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {prices.map((price, index) => (
                                <StaggerItem
                                    key={`${price.crop}-${price.market}`}
                                    index={index}
                                    baseDelay={160}
                                >
                                    <Card className="av-hover-lift gap-4">
                                        <CardHeader className="gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <CardTitle>
                                                        {t(price.cropLabel)}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {t(price.marketLabel)}
                                                    </CardDescription>
                                                </div>
                                                <ConfidenceBadge
                                                    confidence={
                                                        price.confidence
                                                    }
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-3">
                                            <p className="text-2xl font-bold tracking-tight">
                                                {formatCurrency(
                                                    price.averagePrice,
                                                )}
                                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                    {t('/ quintal')}
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <Delta
                                                    value={price.changePercent}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {price.reportCount}{' '}
                                                    {price.reportCount === 1
                                                        ? t('report')
                                                        : t('reports')}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </div>
                    )}
                </section>

                <PageSection delay={4} aria-label={t('Crop price trends')}>
                    <Deferred
                        data="trends"
                        fallback={<TrendSkeleton />}
                        rescue={
                            <Card>
                                <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                                    <div>
                                        <p className="font-medium">
                                            {t(
                                                'Trend data could not be loaded',
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t(
                                                'Your other dashboard data is still available.',
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.reload({ only: ['trends'] })
                                        }
                                    >
                                        {t('Try again')}
                                    </Button>
                                </CardContent>
                            </Card>
                        }
                    >
                        <TrendPanel trends={trends ?? []} />
                    </Deferred>
                </PageSection>
            </div>
        </>
    );
}
