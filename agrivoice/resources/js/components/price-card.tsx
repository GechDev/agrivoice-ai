import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, formatPrice, marketLabel } from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type { PriceSnapshot } from '@/types';

/**
 * Visual metadata for each trend direction.
 *
 * - Up: violet arrow + percentage (price is rising)
 * - Down: red arrow + percentage (price is falling)
 * - Stable: grey dash + no percentage (within ±2% noise)
 */
const TREND_META: Record<
    PriceSnapshot['trend'],
    { arrow: string; className: string; label: string }
> = {
    up: { arrow: '↑', className: 'text-primary', label: 'Rising' },
    down: { arrow: '↓', className: 'text-destructive', label: 'Falling' },
    stable: { arrow: '→', className: 'text-muted-foreground', label: 'Stable' },
};

/**
 * Format the "last updated" timestamp as a human-readable relative time.
 *
 * - null → "No reports yet"
 * - < 1 min → "Just now"
 * - < 60 min → "12m ago"
 * - < 24h → "3h ago"
 * - ≥ 24h → date string
 */
function formatUpdated(
    iso: string | null,
    t: (key: string, replacements?: Record<string, string>) => string,
): string {
    if (!iso) {
        return t('No reports yet');
    }

    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60_000);

    if (mins < 1) {
        return t('Just now');
    }

    if (mins < 60) {
        return t(':count m ago', { count: String(mins) });
    }

    const hours = Math.floor(mins / 60);

    if (hours < 24) {
        return t(':count h ago', { count: String(hours) });
    }

    return date.toLocaleDateString();
}

/**
 * Price tile for one crop×market pair on the dashboard.
 *
 * Displays:
 * - Market name + crop name (header)
 * - Trend arrow + percentage (top right)
 * - Weighted average price in ETB/quintal (large, bold)
 * - Footer: confidence %, report count, last updated time
 *
 * Flash animation: When the price, confidence, or report count changes
 * (i.e. a new poll arrives with updated data), the card briefly scales
 * up and highlights with a primary border. This visual feedback tells
 * the audience "this number just changed" without requiring them to
 * read the timestamp.
 *
 * Low confidence: Cards with confidence < 40% are rendered at 75% opacity
 * and show a "Low confidence — collecting more reports" hint.
 */
export function PriceCard({ snapshot }: { snapshot: PriceSnapshot }) {
    const t = useTranslations();
    const lowConfidence = snapshot.confidence < 40;
    const collecting = snapshot.reportCount === 0;
    const trend = TREND_META[snapshot.trend];
    const [flash, setFlash] = useState(false);
    // Track the previous composite key to detect when data changes
    const prevKey = useRef(
        `${snapshot.price}-${snapshot.confidence}-${snapshot.reportCount}`,
    );

    useEffect(() => {
        const nextKey = `${snapshot.price}-${snapshot.confidence}-${snapshot.reportCount}`;

        if (prevKey.current !== nextKey) {
            prevKey.current = nextKey;
            setFlash(true);
            // Flash duration: 900ms (long enough to be noticed, short enough
            // to not feel sluggish on rapid poll updates)
            const id = window.setTimeout(() => setFlash(false), 900);

            return () => window.clearTimeout(id);
        }
    }, [snapshot.price, snapshot.confidence, snapshot.reportCount]);

    return (
        <article
            className={cn(
                'av-hover-lift flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-sm transition-all duration-500 hover:border-primary/25',
                lowConfidence && 'opacity-75',
                flash &&
                    'scale-[1.015] border-primary bg-accent ring-2 ring-primary/30',
            )}
        >
            <header className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {t(marketLabel(snapshot.market))}
                    </p>
                    <h2 className="text-lg font-semibold text-card-foreground">
                        {t(cropLabel(snapshot.crop))}
                    </h2>
                </div>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 text-sm font-semibold',
                        trend.className,
                    )}
                    title={t(trend.label)}
                >
                    <span aria-hidden>{trend.arrow}</span>
                    {snapshot.changePercent !== null && (
                        <span className="tabular-nums">
                            {snapshot.changePercent > 0 ? '+' : ''}
                            {snapshot.changePercent}%
                        </span>
                    )}
                </span>
            </header>

            <div>
                {collecting ? (
                    <p className="text-2xl font-semibold text-muted-foreground">
                        {t('Collecting data')}
                    </p>
                ) : (
                    <p className="text-3xl font-bold tracking-tight text-card-foreground tabular-nums">
                        {formatPrice(snapshot.price)}
                        <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                            {t('ETB/quintal')}
                        </span>
                    </p>
                )}
            </div>

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                <div>
                    <dt className="text-muted-foreground">{t('Confidence')}</dt>
                    <dd
                        className={cn(
                            'mt-0.5 font-semibold tabular-nums',
                            lowConfidence
                                ? 'text-muted-foreground'
                                : 'text-card-foreground',
                        )}
                    >
                        {snapshot.confidence}%
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">{t('Reports')}</dt>
                    <dd className="mt-0.5 font-semibold text-card-foreground tabular-nums">
                        {snapshot.reportCount}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">{t('Updated')}</dt>
                    <dd className="mt-0.5 font-semibold text-card-foreground">
                        {formatUpdated(snapshot.lastUpdated, t)}
                    </dd>
                </div>
            </dl>

            {lowConfidence && !collecting && (
                <p className="text-xs text-muted-foreground">
                    {t('Low confidence — collecting more reports')}
                </p>
            )}
        </article>
    );
}
