/**
 * Report row component for the live list (Moderator/Nati's slice).
 *
 * Displays a single price report in a tabular row with: crop, market, price
 * (ETB/quintal), relative timestamp, reporter type badge, agent name, and
 * a flag button for outlier moderation.
 *
 * Flash animation: If the report was created within the last 8 seconds, the
 * row briefly highlights with a primary-colored ring to draw attention to
 * newly-arrived data during polling.
 *
 * Flag behavior: Uses Wayfinder-generated `flag.url(report.id)` for type-safe
 * route resolution. The POST is made via `router.post` (Inertia) with
 * `preserveScroll: true` so the page doesn't jump. The button is disabled
 * once flagged (idempotent) and while the request is in flight.
 *
 * This component is distinct from `components/reports/report-row.tsx`, which
 * is the card-style row used in the portal's "My recent entries" sidebar.
 * This version uses a flat tabular layout optimized for the dense live list.
 *
 * @see components/reports/report-row.tsx — card-style variant for portal
 */
import { router } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { flag } from '@/actions/App/Http/Controllers/ReportController';
import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, formatPrice, marketLabel } from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type { ReportRowData } from '@/types';

type ReportRowProps = {
    report: ReportRowData;
    canModerate?: boolean;
};

export function ReportRow({ report, canModerate = false }: ReportRowProps) {
    const t = useTranslations();
    const [flash, setFlash] = useState(false);
    const [flagging, setFlagging] = useState(false);
    const seen = useRef(false);

    /**
     * Flash highlight for newly-arrived reports.
     * On first render, check if the report is <8 seconds old. If so, apply
     * a primary ring animation for 1.6 seconds. The `seen` ref prevents the
     * flash from re-triggering on re-renders (e.g., when polling updates props).
     */
    useEffect(() => {
        if (seen.current) {
            return;
        }

        seen.current = true;
        const ageMs =
            Date.now() -
            new Date(report.createdAt ?? report.reportedAt).getTime();

        if (ageMs < 8_000) {
            setFlash(true);
            const id = window.setTimeout(() => setFlash(false), 1600);

            return () => window.clearTimeout(id);
        }
    }, [report.createdAt, report.reportedAt]);

    /**
     * Format a timestamp as a human-readable relative string.
     * Returns "Just now" for <1 min, "X m ago" for minutes, "X h ago" for
     * hours, and falls back to `toLocaleString()` for older reports (>24h).
     * This is a local implementation (not using the shared `formatTimeAgo`
     * from lib/agrivoice) to allow the translatable `:count` interpolation
     * pattern used by the i18n system.
     */
    function formatWhen(iso: string): string {
        const date = new Date(iso);
        const mins = Math.floor((Date.now() - date.getTime()) / 60_000);

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

        return date.toLocaleString();
    }

    /**
     * Flag this report as an outlier. Uses the Wayfinder-generated `flag` route
     * helper for type-safe URL resolution. The request is an Inertia POST with
     * `preserveScroll: true` to avoid page jumps during the update.
     *
     * Guarded by both `isFlagged` (server state) and `flagging` (local state)
     * to prevent duplicate requests. Once flagged, the button becomes disabled
     * and shows "Flagged" — this is idempotent on the server side too.
     */
    function onFlag() {
        if (report.isFlagged || flagging) {
            return;
        }

        setFlagging(true);
        router.post(
            flag.url(report.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setFlagging(false),
            },
        );
    }

    return (
        <li
            className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-md transition-all duration-500',
                report.isFlagged && 'opacity-55',
                flash && 'border-primary bg-accent ring-2 ring-primary/30',
            )}
        >
            <div className="grid min-w-0 flex-1 grid-cols-2 items-center gap-x-3 gap-y-2 sm:grid-cols-[6.5rem_8.5rem_7rem_5.5rem_minmax(0,1fr)_5.5rem]">
                <div className="font-semibold text-card-foreground">
                    <span className={cn(report.isFlagged && 'line-through')}>
                        {t(cropLabel(report.crop))}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {t(marketLabel(report.market))}
                </div>
                <div
                    className={cn(
                        'font-semibold text-card-foreground tabular-nums',
                        report.isFlagged && 'line-through',
                    )}
                >
                    {formatPrice(report.price)}{' '}
                    <span className="text-xs font-medium text-muted-foreground">
                        {t('ETB/q')}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {formatWhen(report.reportedAt)}
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-2 text-sm sm:col-span-1">
                    <Badge
                        variant={
                            report.source === 'official'
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {t(
                            report.source === 'official'
                                ? 'Official'
                                : report.source === 'crowd'
                                  ? 'Crowd'
                                  : report.source,
                        )}
                    </Badge>
                    <span className="text-muted-foreground">
                        {t('by')}{' '}
                        <span className="font-medium text-foreground">
                            {report.agentName}
                        </span>
                    </span>
                </div>
                <div className="hidden sm:flex sm:justify-end">
                    {report.isFlagged ? (
                        <Badge variant="destructive">{t('Flagged')}</Badge>
                    ) : null}
                </div>
            </div>

            {canModerate ? (
                <div className="w-[6.75rem] shrink-0 self-center">
                    <Button
                        type="button"
                        size="sm"
                        variant={report.isFlagged ? 'secondary' : 'outline'}
                        disabled={report.isFlagged || flagging}
                        onClick={onFlag}
                        className="w-full justify-center"
                        aria-label={
                            report.isFlagged
                                ? t('Already flagged')
                                : t('Flag outlier')
                        }
                    >
                        <Flag className="size-3.5" />
                        {report.isFlagged ? t('Flagged') : t('Flag')}
                    </Button>
                </div>
            ) : null}
        </li>
    );
}
