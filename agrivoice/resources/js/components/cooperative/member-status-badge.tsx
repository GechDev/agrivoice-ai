import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
    active: 'border-emerald-600/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
    invited:
        'border-amber-600/30 bg-amber-500/15 text-amber-800 dark:text-amber-300',
    removed: 'border-muted-foreground/30 bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
    active: 'Active',
    invited: 'Invited',
    removed: 'Removed',
};

type MemberStatusBadgeProps = {
    status: string;
    className?: string;
};

export function MemberStatusBadge({
    status,
    className,
}: MemberStatusBadgeProps) {
    const label = statusLabels[status] ?? status;

    return (
        <Badge
            variant="outline"
            className={cn(statusStyles[status] ?? '', className)}
            aria-label={`Status: ${label}`}
        >
            {label}
        </Badge>
    );
}
