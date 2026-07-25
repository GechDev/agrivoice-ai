import { Coffee, Flag, Leaf, Sprout, Wheat } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/use-translations';
import {
    cropLabel,
    formatObservedOn,
    formatPrice,
    formatTimeAgo,
    marketLabel,
    reporterTypeLabel,
} from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type { Crop, ReportRowData } from '@/types';

const HIGHLIGHT_WINDOW_MS = 2500;

const CROP_ICONS = {
    teff: Wheat,
    coffee: Coffee,
    maize: Leaf,
    wheat: Wheat,
    sesame: Sprout,
    pulses: Sprout,
    sorghum: Leaf,
} as const;

function wasJustCreated(createdAt: string | null): boolean {
    if (createdAt === null) {
        return false;
    }

    return Date.now() - new Date(createdAt).getTime() < HIGHLIGHT_WINDOW_MS;
}

type ReportRowProps = {
    report: ReportRowData;
    action?: ReactNode;
};

export default function ReportRow({ report, action }: ReportRowProps) {
    const t = useTranslations();
    const [isHighlighted, setIsHighlighted] = useState(() =>
        wasJustCreated(report.createdAt),
    );

    useEffect(() => {
        if (!isHighlighted) {
            return;
        }

        const timer = window.setTimeout(
            () => setIsHighlighted(false),
            HIGHLIGHT_WINDOW_MS,
        );

        return () => window.clearTimeout(timer);
    }, [isHighlighted]);

    const CropIcon = CROP_ICONS[report.crop as Crop] ?? Wheat;

    return (
        <li
            className={cn(
                'rounded-2xl border p-3.5 transition-colors duration-700 ease-out',
                isHighlighted
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border bg-card',
                report.isFlagged && 'opacity-65',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <CropIcon className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {t(cropLabel(report.crop))}
                            <span className="text-muted-foreground"> · </span>
                            {t(marketLabel(report.market))}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <Badge
                                variant={
                                    report.source === 'official'
                                        ? 'secondary'
                                        : 'outline'
                                }
                                className="rounded-full"
                            >
                                {t(reporterTypeLabel(report.source))}
                            </Badge>
                            <span className="truncate">{report.agentName}</span>
                            <span aria-hidden>·</span>
                            <span>
                                {formatObservedOn(report.reportedAt, t)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-start gap-2">
                    <div className="text-right">
                        <p
                            className={cn(
                                'text-sm font-semibold tabular-nums',
                                report.isFlagged && 'line-through',
                            )}
                        >
                            {formatPrice(report.price)}
                        </p>
                        <p className="text-[0.6875rem] text-muted-foreground">
                            {t('ETB/q')} · {formatTimeAgo(report.createdAt, t)}
                        </p>
                    </div>

                    {action}
                </div>
            </div>

            {report.isFlagged && (
                <p className="mt-2.5 flex items-center gap-1.5 border-t border-dashed pt-2.5 text-xs font-medium text-destructive">
                    <Flag className="size-3" />
                    {t(
                        'Flagged as an outlier — excluded from the market picture',
                    )}
                </p>
            )}
        </li>
    );
}
