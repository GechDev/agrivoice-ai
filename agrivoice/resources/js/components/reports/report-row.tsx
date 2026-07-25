import { Coffee, Flag, Wheat } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
    cropLabel,
    formatObservedOn,
    formatPrice,
    formatTimeAgo,
    marketLabel,
    reporterTypeLabel,
} from '@/lib/agrivoice';
import { cn } from '@/lib/utils';
import type { ReportRowData } from '@/types';

/** How long a newly arrived row stays highlighted. */
const HIGHLIGHT_DURATION_MS = 1800;

type ReportRowProps = {
    report: ReportRowData;
    /** Highlights the row briefly, so arriving data is visible from the back of a room. */
    isNew?: boolean;
    /** Slot for a moderation control, such as the flag button on the live feed. */
    action?: ReactNode;
};

export default function ReportRow({ report, isNew = false, action }: ReportRowProps) {
    const [isHighlighted, setIsHighlighted] = useState(isNew);

    useEffect(() => {
        if (!isNew) {
            return;
        }

        setIsHighlighted(true);
        const timer = window.setTimeout(
            () => setIsHighlighted(false),
            HIGHLIGHT_DURATION_MS,
        );

        return () => window.clearTimeout(timer);
    }, [isNew]);

    const CropIcon = report.crop === 'coffee' ? Coffee : Wheat;

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
                            {cropLabel(report.crop)}
                            <span className="text-muted-foreground"> · </span>
                            {marketLabel(report.market)}
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
                                {reporterTypeLabel(report.source)}
                            </Badge>
                            <span className="truncate">{report.agentName}</span>
                            <span aria-hidden>·</span>
                            <span>{formatObservedOn(report.reportedAt)}</span>
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
                            ETB/qt · {formatTimeAgo(report.createdAt)}
                        </p>
                    </div>

                    {action}
                </div>
            </div>

            {report.isFlagged && (
                <p className="mt-2.5 flex items-center gap-1.5 border-t border-dashed pt-2.5 text-xs font-medium text-destructive">
                    <Flag className="size-3" />
                    Flagged as an outlier — excluded from the market picture
                </p>
            )}
        </li>
    );
}
