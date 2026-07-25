import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, marketLabel } from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type { PriceSnapshot } from '@/types';

type TrendChartProps = {
    snapshots: PriceSnapshot[];
};

/**
 * Horizontal bar chart showing 7-day price trends for all crop×market pairs.
 *
 * Each row shows:
 * - Crop + market label (left)
 * - Horizontal bar (middle) — length proportional to changePercent
 * - Percentage value (right)
 *
 * The bar design:
 * - Bars grow from the centre line (0%) outward
 * - Positive bars grow right (price went up)
 * - Negative bars grow left (price went down)
 * - Color follows trend: violet (up), red (down), grey (stable)
 * - Minimum bar width is 4% for pairs with data (so a tiny change
 *   is still visible), 0% for pairs with no data
 *
 * The maximum bar width is normalised to the largest absolute
 * changePercent across all snapshots. This ensures the biggest
 * mover always fills the bar, and smaller movers scale proportionally.
 *
 * No external chart library — just CSS widths on div elements.
 * This was a deliberate choice: the starter kit has no chart library,
 * and a full D3/Recharts setup would be overkill for simple bars.
 */
export function TrendChart({ snapshots }: TrendChartProps) {
    const t = useTranslations();
    // Only include snapshots that have trend data (changePercent !== null)
    const withChange = snapshots.filter((s) => s.changePercent !== null);
    // Find the largest absolute change to normalise bar widths
    const maxAbs = Math.max(
        5,
        ...withChange.map((s) => Math.abs(s.changePercent ?? 0)),
    );

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-md">
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
                        // Normalise bar width: largest mover = 100%, others scale
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
                                    {t(cropLabel(snapshot.crop))} ·{' '}
                                    {marketLabel(snapshot.market)}
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
                                            // Anchor positive bars to the left, negative to the right
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
