import { useEffect, useRef, useState } from 'react';
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

const TREND_META: Record<
    PriceSnapshot['trend'],
    { arrow: string; className: string; label: string }
> = {
    up: { arrow: '↑', className: 'text-primary', label: 'Rising' },
    down: { arrow: '↓', className: 'text-destructive', label: 'Falling' },
    stable: { arrow: '→', className: 'text-muted-foreground', label: 'Stable' },
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-ET', {
        maximumFractionDigits: 0,
    }).format(price);
}

function formatUpdated(iso: string | null): string {
    if (!iso) {
        return 'No reports yet';
    }

    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60_000);

    if (mins < 1) {
        return 'Just now';
    }

    if (mins < 60) {
        return `${mins}m ago`;
    }

    const hours = Math.floor(mins / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return date.toLocaleDateString();
}

export function PriceCard({ snapshot }: { snapshot: PriceSnapshot }) {
    const lowConfidence = snapshot.confidence < 40;
    const collecting = snapshot.reportCount === 0;
    const trend = TREND_META[snapshot.trend];
    const [flash, setFlash] = useState(false);
    const prevKey = useRef(
        `${snapshot.price}-${snapshot.confidence}-${snapshot.reportCount}`,
    );

    useEffect(() => {
        const nextKey = `${snapshot.price}-${snapshot.confidence}-${snapshot.reportCount}`;

        if (prevKey.current !== nextKey) {
            prevKey.current = nextKey;
            setFlash(true);
            const id = window.setTimeout(() => setFlash(false), 900);

            return () => window.clearTimeout(id);
        }
    }, [snapshot.price, snapshot.confidence, snapshot.reportCount]);

    return (
        <article
            className={cn(
                'flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-md transition-all duration-500',
                lowConfidence && 'opacity-70',
                flash && 'scale-[1.02] border-primary bg-accent ring-2 ring-primary/40',
            )}
        >
            <header className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {MARKET_LABELS[snapshot.market]}
                    </p>
                    <h2 className="text-lg font-semibold text-card-foreground">
                        {CROP_LABELS[snapshot.crop]}
                    </h2>
                </div>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 text-sm font-semibold',
                        trend.className,
                    )}
                    title={trend.label}
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
                        Collecting data
                    </p>
                ) : (
                    <p className="text-3xl font-bold tracking-tight text-card-foreground tabular-nums">
                        {formatPrice(snapshot.price)}
                        <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                            ETB/quintal
                        </span>
                    </p>
                )}
            </div>

            <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                <div>
                    <dt className="text-muted-foreground">Confidence</dt>
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
                    <dt className="text-muted-foreground">Reports</dt>
                    <dd className="mt-0.5 font-semibold text-card-foreground tabular-nums">
                        {snapshot.reportCount}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="mt-0.5 font-semibold text-card-foreground">
                        {formatUpdated(snapshot.lastUpdated)}
                    </dd>
                </div>
            </dl>

            {lowConfidence && !collecting && (
                <p className="text-xs text-muted-foreground">
                    Low confidence — collecting more reports
                </p>
            )}
        </article>
    );
}
