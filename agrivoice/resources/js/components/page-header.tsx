import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
    /** Dark band for farmer live dashboard hero. */
    tone?: 'default' | 'inverse';
};

/**
 * Shared page header for farmer and cooperative app surfaces.
 */
export function PageHeader({
    title,
    description,
    actions,
    className,
    tone = 'default',
}: PageHeaderProps) {
    const inverse = tone === 'inverse';

    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                inverse &&
                    'rounded-2xl bg-foreground px-5 py-6 text-background sm:px-7 sm:py-8',
                className,
            )}
        >
            <div className="min-w-0 space-y-1.5">
                <h1
                    className={cn(
                        'font-serif text-2xl font-semibold tracking-tight sm:text-3xl',
                        inverse ? 'text-background' : 'text-foreground',
                    )}
                >
                    {title}
                </h1>
                {description ? (
                    <p
                        className={cn(
                            'max-w-2xl text-sm leading-relaxed sm:text-base',
                            inverse
                                ? 'text-background/70'
                                : 'text-muted-foreground',
                        )}
                    >
                        {description}
                    </p>
                ) : null}
            </div>
            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
