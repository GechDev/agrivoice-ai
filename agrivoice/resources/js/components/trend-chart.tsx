import type { PriceSnapshot } from '@/types';
import { cn } from '@/lib/utils';

const CROP_LABELS: Record<PriceSnapshot['crop'], string> = {
    teff: 'Teff',
    coffee: 'Coffee',
};

const MARKET_LABELS: Record<PriceSnapshot['market'], string> = {
    adama: 'Adama',
    addis_ababa: 'Addis Ababa',
    jimma: 'Jimma',
};

type TrendChartProps = {
    snapshots: PriceSnapshot[];
};

/**
 * Lightweight SVG trend bars — no second chart library (starter has none).
 * Bars encode changePercent; color follows trend direction.
 */
export function TrendChart({ snapshots }: TrendChartProps) {
    const withChange = snapshots.filter((s) => s.changePercent !== null);
    const maxAbs = Math.max(
        5,
        ...withChange.map((s) => Math.abs(s.changePercent ?? 0)),
    );

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wide text-card-foreground uppercase">
                7-day trend
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
                Last week vs previous week
            </p>

            {withChange.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Not enough history for trends yet.
                </p>
            ) : (
                <ul className="space-y-3">
                    {snapshots.map((snapshot) => {
                        const change = snapshot.changePercent ?? 0;
                        const width = Math.min(
                            100,
                            (Math.abs(change) / maxAbs) * 100,
                        );
                        const positive = change >= 0;

                        return (
                            <li
                                key={`${snapshot.crop}-${snapshot.market}`}
                                className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-3 text-sm"
                            >
                                <span className="truncate text-muted-foreground">
                                    {CROP_LABELS[snapshot.crop]} ·{' '}
                                    {MARKET_LABELS[snapshot.market]}
                                </span>
                                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={cn(
                                            'absolute top-0 h-full rounded-full transition-all duration-500',
                                            snapshot.trend === 'up' &&
                                                'bg-primary',
                                            snapshot.trend === 'down' &&
                                                'bg-destructive',
                                            snapshot.trend === 'stable' &&
                                                'bg-muted-foreground/50',
                                            positive ? 'left-1/2' : 'right-1/2',
                                        )}
                                        style={{
                                            width: `${Math.max(width, snapshot.reportCount === 0 ? 0 : 4)}%`,
                                        }}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        'text-right font-medium tabular-nums',
                                        snapshot.trend === 'up' &&
                                            'text-primary',
                                        snapshot.trend === 'down' &&
                                            'text-destructive',
                                        snapshot.trend === 'stable' &&
                                            'text-muted-foreground',
                                    )}
                                >
                                    {snapshot.changePercent === null
                                        ? '—'
                                        : `${change > 0 ? '+' : ''}${change}%`}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
