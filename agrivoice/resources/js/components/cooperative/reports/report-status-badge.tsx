import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
    pending:
        'border-amber-600/30 bg-amber-500/15 text-amber-800 dark:text-amber-300',
    verified:
        'border-emerald-600/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
    disputed:
        'border-orange-600/30 bg-orange-500/15 text-orange-800 dark:text-orange-300',
    rejected: 'border-destructive/40 bg-destructive/10 text-destructive',
};

type ReportStatusBadgeProps = {
    status: string;
    statusLabel: string;
    className?: string;
};

export function ReportStatusBadge({
    status,
    statusLabel,
    className,
}: ReportStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(statusStyles[status] ?? '', className)}
            aria-label={`Status: ${statusLabel}`}
        >
            {statusLabel}
        </Badge>
    );
}
