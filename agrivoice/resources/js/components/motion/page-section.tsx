import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageSectionProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    /** Stagger slot for page-load entrance (0 = immediate) */
    delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    variant?: 'up' | 'fade' | 'scale' | 'slide';
};

/**
 * Page-mount entrance wrapper for app shells (farmer + cooperative).
 *
 * Prefer this over scroll-reveal on dashboard-style pages where the
 * whole viewport should settle in a calm cascade on first paint.
 */
export function PageSection({
    children,
    className,
    delay = 0,
    variant = 'up',
    ...props
}: PageSectionProps) {
    const enterClass =
        variant === 'fade'
            ? 'av-enter-fade'
            : variant === 'scale'
              ? 'av-enter-scale'
              : variant === 'slide'
                ? 'av-enter-slide'
                : 'av-enter';

    return (
        <div
            className={cn(
                enterClass,
                delay > 0 && `av-delay-${delay}`,
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

type StaggerItemProps = {
    children: ReactNode;
    className?: string;
    index: number;
    /** Base delay before the first item */
    baseDelay?: number;
};

/**
 * Staggered child for grids (price tiles, activity cards, plan cards).
 * Caps visual delay so long lists don't feel sluggish.
 */
export function StaggerItem({
    children,
    className,
    index,
    baseDelay = 80,
}: StaggerItemProps) {
    const capped = Math.min(index, 11);
    const style = {
        '--av-delay': `${baseDelay + capped * 45}ms`,
    } as CSSProperties;

    return (
        <div className={cn('av-enter', className)} style={style}>
            {children}
        </div>
    );
}
