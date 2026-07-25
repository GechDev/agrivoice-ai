import { router } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { flag } from '@/actions/App/Http/Controllers/ReportController';
import { useTranslations } from '@/hooks/use-translations';
import { cropLabel, marketLabel } from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type { ReportRowData } from '@/types';

function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-ET', {
        maximumFractionDigits: 0,
    }).format(price);
}

function formatWhen(iso: string): string {
    const date = new Date(iso);
    const mins = Math.floor((Date.now() - date.getTime()) / 60_000);

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

    return date.toLocaleString();
}

type ReportRowProps = {
    report: ReportRowData;
};

export function ReportRow({ report }: ReportRowProps) {
    const t = useTranslations();
    const [flash, setFlash] = useState(false);
    const [flagging, setFlagging] = useState(false);
    const seen = useRef(false);

    useEffect(() => {
        if (seen.current) {
            return;
        }

        seen.current = true;
        const ageMs = Date.now() - new Date(report.createdAt ?? report.reportedAt).getTime();

        if (ageMs < 8_000) {
            setFlash(true);
            const id = window.setTimeout(() => setFlash(false), 1600);

            return () => window.clearTimeout(id);
        }
    }, [report.createdAt, report.reportedAt]);

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
                'grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-md transition-all duration-500 sm:grid-cols-[7rem_9rem_7rem_6rem_1fr_auto_auto]',
                report.isFlagged && 'opacity-55',
                flash && 'border-primary bg-accent ring-2 ring-primary/30',
            )}
        >
            <div className="font-semibold text-card-foreground">
                <span className={cn(report.isFlagged && 'line-through')}>
                    {t(cropLabel(report.crop))}
                </span>
            </div>
            <div className="text-sm text-muted-foreground">
                {marketLabel(report.market)}
            </div>
            <div
                className={cn(
                    'font-semibold tabular-nums text-card-foreground',
                    report.isFlagged && 'line-through',
                )}
            >
                {formatPrice(report.price)}{' '}
                <span className="text-xs font-medium text-muted-foreground">
                    ETB/q
                </span>
            </div>
            <div className="text-sm text-muted-foreground">
                {formatWhen(report.reportedAt)}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant={report.source === 'official' ? 'default' : 'secondary'}>
                    {report.source}
                </Badge>
                <span className="text-muted-foreground">
                    by <span className="font-medium text-foreground">{report.agentName}</span>
                </span>
            </div>
            <div>
                {report.isFlagged ? (
                    <Badge variant="destructive">Flagged</Badge>
                ) : (
                    <span className="sr-only sm:not-sr-only sm:text-xs sm:text-transparent">
                        —
                    </span>
                )}
            </div>
            <div className="justify-self-end">
                <Button
                    type="button"
                    size="sm"
                    variant={report.isFlagged ? 'secondary' : 'outline'}
                    disabled={report.isFlagged || flagging}
                    onClick={onFlag}
                    aria-label={
                        report.isFlagged
                            ? 'Already flagged'
                            : `Flag outlier report ${report.id}`
                    }
                >
                    <Flag className="size-3.5" />
                    {report.isFlagged ? 'Flagged' : 'Flag'}
                </Button>
            </div>
        </li>
    );
}
