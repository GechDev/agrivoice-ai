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
import { dashboard } from '@/routes/cooperative';

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

const priceFormatter = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
});

function Delta({ value }: { value: number | null }) {
    if (value === null) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="size-3" aria-hidden="true" />
                No prior data
            </span>
        );
    }

    const isPositive = value >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <span
            className={
                isPositive
                    ? 'inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                    : 'inline-flex items-center gap-1 text-xs font-medium text-destructive'
            }
        >
            <Icon className="size-3" aria-hidden="true" />
            {Math.abs(value).toFixed(1)}% vs previous week
        </span>
    );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
    const className =
        confidence > 80
            ? 'border-emerald-600/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
            : confidence >= 50
              ? 'border-amber-600/30 bg-amber-500/15 text-amber-800 dark:text-amber-300'
              : 'border-destructive/30 bg-destructive/10 text-destructive';

    return (
        <Badge variant="outline" className={className}>
            {confidence}% confidence
        </Badge>
    );
}

function TrendSkeleton() {
    return (
        <Card aria-label="Loading crop trends">
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
                    <CardTitle>Crop price trends</CardTitle>
                    <CardDescription>
                        Add default crops in cooperative settings to start
                        tracking trends.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>Crop price trends</CardTitle>
                    <CardDescription>
                        Cooperative reports with the latest forecast overlay.
                    </CardDescription>
                </div>
                <div
                    className="inline-flex w-fit rounded-lg border bg-muted p-1"
                    aria-label="Chart history range"
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
                            {days} days
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                {trends.length > 1 && (
                    <div
                        role="tablist"
                        aria-label="Select crop"
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
                                {trend.cropLabel}
                            </button>
                        ))}
                    </div>
                )}

                {points.length === 0 ? (
                    <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed bg-muted/40 p-8 text-center">
                        <div>
                            <p className="font-medium">No trend data yet</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Reports and forecasts for this crop will appear
                                here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <span className="h-0.5 w-6 bg-chart-1" />
                                Reported average
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="w-6 border-t-2 border-dashed border-chart-3" />
                                Forecast
                            </span>
                        </div>
                        <div
                            className="h-72 w-full"
                            aria-label="Price trend chart"
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
                                            priceFormatter.format(
                                                Number(
                                                    Array.isArray(value)
                                                        ? value[0]
                                                        : (value ?? 0),
                                                ),
                                            ),
                                            name === 'actual'
                                                ? 'Reported average'
                                                : 'Forecast',
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
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Cooperative dashboard',
                href: dashboard(),
            },
        ],
    });

    return (
        <>
            <Head title={`${cooperative.name} dashboard`} />
            <div className="flex flex-1 flex-col gap-8 overflow-x-hidden p-4 md:p-6">
                <header className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-primary">
                        {cooperative.region}
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        {cooperative.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Member activity and market intelligence at a glance.
                    </p>
                </header>

                <section aria-labelledby="member-activity-heading">
                    <div className="mb-4">
                        <h2
                            id="member-activity-heading"
                            className="text-lg font-semibold"
                        >
                            Member activity
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Trailing seven days compared with the prior period.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {activityCards.map((item) => {
                            const metric = memberActivity[item.key];
                            const Icon = item.icon;

                            return (
                                <Card key={item.key} className="gap-4">
                                    <CardHeader className="flex-row items-start justify-between gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <CardDescription>
                                                {item.label}
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
                                        <Delta value={metric.changePercent} />
                                        <p className="text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section aria-labelledby="price-overview-heading">
                    <div className="mb-4">
                        <h2
                            id="price-overview-heading"
                            className="text-lg font-semibold"
                        >
                            Aggregated price overview
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Verified member reports from this calendar week.
                        </p>
                    </div>

                    {prices.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex min-h-40 items-center justify-center text-center">
                                <div>
                                    <p className="font-medium">
                                        No price reports yet this week
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        New verified member reports will appear
                                        here.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {prices.map((price) => (
                                <Card
                                    key={`${price.crop}-${price.market}`}
                                    className="gap-4"
                                >
                                    <CardHeader className="gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <CardTitle>
                                                    {price.cropLabel}
                                                </CardTitle>
                                                <CardDescription>
                                                    {price.marketLabel}
                                                </CardDescription>
                                            </div>
                                            <ConfidenceBadge
                                                confidence={price.confidence}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        <p className="text-2xl font-bold tracking-tight">
                                            {priceFormatter.format(
                                                price.averagePrice,
                                            )}
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                / quintal
                                            </span>
                                        </p>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Delta
                                                value={price.changePercent}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {price.reportCount}{' '}
                                                {price.reportCount === 1
                                                    ? 'report'
                                                    : 'reports'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                <section aria-label="Crop price trends">
                    <Deferred
                        data="trends"
                        fallback={<TrendSkeleton />}
                        rescue={
                            <Card>
                                <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                                    <div>
                                        <p className="font-medium">
                                            Trend data could not be loaded
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Your other dashboard data is still
                                            available.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.reload({ only: ['trends'] })
                                        }
                                    >
                                        Try again
                                    </Button>
                                </CardContent>
                            </Card>
                        }
                    >
                        <TrendPanel trends={trends ?? []} />
                    </Deferred>
                </section>
            </div>
        </>
    );
}
