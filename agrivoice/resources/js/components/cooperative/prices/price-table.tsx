import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    CircleHelp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    CooperativePriceRow,
    PriceTrend,
} from '@/types/cooperative-prices';

const priceFormatter = new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-ET', {
    dateStyle: 'medium',
});

function formatPrice(price: number | null): string {
    return price === null ? 'No data' : priceFormatter.format(price);
}

function formatPercentage(percentage: number | null): string {
    if (percentage === null) {
        return 'N/A';
    }

    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
}

function formatDate(date: string | null): string {
    return date === null ? 'No reports' : dateFormatter.format(new Date(date));
}

const trendDetails: Record<
    PriceTrend,
    {
        label: string;
        icon: typeof ArrowUpRight;
        className: string;
    }
> = {
    up: {
        label: 'Up',
        icon: ArrowUpRight,
        className: 'border-primary/30 bg-primary/10 text-primary',
    },
    down: {
        label: 'Down',
        icon: ArrowDownRight,
        className: 'border-destructive/30 bg-destructive/10 text-destructive',
    },
    stable: {
        label: 'Stable',
        icon: ArrowRight,
        className: 'border-border bg-muted text-muted-foreground',
    },
    unavailable: {
        label: 'No prior data',
        icon: CircleHelp,
        className: 'border-border bg-muted text-muted-foreground',
    },
};

function TrendBadge({ row }: { row: CooperativePriceRow }) {
    const detail = trendDetails[row.trend];
    const Icon = detail.icon;
    const percentage =
        row.trendPercentage === null
            ? ''
            : ` ${Math.abs(row.trendPercentage).toFixed(1)}%`;

    return (
        <Badge variant="outline" className={detail.className}>
            <Icon aria-hidden="true" />
            {detail.label}
            {percentage}
        </Badge>
    );
}

function RegionalAverage({ row }: { row: CooperativePriceRow }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-medium">
                {formatPrice(row.regionalAverage)}
            </span>
            {row.regionalAverage !== null && (
                <span className="text-xs text-muted-foreground">
                    {row.regionalMarketCount}{' '}
                    {row.regionalMarketCount === 1 ? 'market' : 'markets'}{' '}
                    reporting
                </span>
            )}
        </div>
    );
}

export function PriceTable({ rows }: { rows: CooperativePriceRow[] }) {
    if (rows.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="font-medium">
                        No tracked crops or regional markets
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add tracked crops or a matching regional market in
                        settings to create this summary.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="hidden overflow-hidden py-0 md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/60 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            <tr>
                                <th scope="col" className="px-5 py-4">
                                    Crop
                                </th>
                                <th scope="col" className="px-5 py-4">
                                    Market
                                </th>
                                <th scope="col" className="px-5 py-4">
                                    Cooperative price
                                </th>
                                <th scope="col" className="px-5 py-4">
                                    Regional average
                                </th>
                                <th scope="col" className="px-5 py-4">
                                    Vs regional
                                </th>
                                <th scope="col" className="px-5 py-4">
                                    Weekly trend
                                </th>
                                <th scope="col" className="px-5 py-4">
                                    As of
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rows.map((row) => (
                                <tr
                                    key={`${row.crop}-${row.market}`}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <th
                                        scope="row"
                                        className="px-5 py-4 font-semibold"
                                    >
                                        {row.cropLabel}
                                    </th>
                                    <td className="px-5 py-4">{row.market}</td>
                                    <td className="px-5 py-4 font-semibold">
                                        {formatPrice(row.currentPrice)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <RegionalAverage row={row} />
                                    </td>
                                    <td className="px-5 py-4">
                                        {formatPercentage(
                                            row.comparisonPercentage,
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <TrendBadge row={row} />
                                    </td>
                                    <td className="px-5 py-4 text-muted-foreground">
                                        {formatDate(row.asOf)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid gap-4 md:hidden">
                {rows.map((row) => (
                    <Card key={`${row.crop}-${row.market}`} className="gap-4">
                        <CardHeader className="flex-row items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <CardTitle>{row.cropLabel}</CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {row.market}
                                </span>
                            </div>
                            <TrendBadge row={row} />
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">
                                        Cooperative
                                    </dt>
                                    <dd className="font-semibold">
                                        {formatPrice(row.currentPrice)}
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">
                                        Regional avg
                                    </dt>
                                    <dd>
                                        <RegionalAverage row={row} />
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">
                                        Vs regional
                                    </dt>
                                    <dd>
                                        {formatPercentage(
                                            row.comparisonPercentage,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">
                                        As of
                                    </dt>
                                    <dd>{formatDate(row.asOf)}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
