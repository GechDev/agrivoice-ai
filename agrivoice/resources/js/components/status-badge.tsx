import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<StatusTone, string> = {
    neutral: 'bg-muted text-muted-foreground ring-border/60',
    info: 'bg-primary/10 text-primary ring-primary/20',
    success: 'bg-primary/15 text-primary ring-primary/25',
    warning:
        'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400',
    danger: 'bg-destructive/10 text-destructive ring-destructive/20',
};

export function statusToneClass(tone: StatusTone): string {
    return TONE_CLASSES[tone];
}

type StatusBadgeProps = {
    tone?: StatusTone;
    children: React.ReactNode;
    className?: string;
} & Omit<ComponentProps<'span'>, 'children' | 'className'>;

export function StatusBadge({
    tone = 'neutral',
    children,
    className,
    ...props
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                statusToneClass(tone),
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
