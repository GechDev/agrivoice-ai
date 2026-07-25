import AppLogoIcon from '@/components/app-logo-icon';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

type AppLogoProps = {
    /** Show the product name next to the mark. Default true. */
    showName?: boolean;
    /** Larger lockup for auth / marketing surfaces. */
    size?: 'sm' | 'md' | 'lg';
    /** Softer ring for dark bands (footer, brand panels). */
    onDark?: boolean;
    className?: string;
    nameClassName?: string;
};

const SIZE = {
    sm: { mark: 'size-8', name: 'text-sm' },
    md: { mark: 'size-10', name: 'text-base' },
    lg: { mark: 'size-14', name: 'text-xl' },
} as const;

/**
 * Brand lockup used after sign-in (sidebar/header) and on auth screens.
 * Always displays AgriVoice — never inherits APP_NAME from Laravel config.
 */
export default function AppLogo({
    showName = true,
    size = 'sm',
    onDark = false,
    className,
    nameClassName,
}: AppLogoProps) {
    const t = useTranslations();
    const sizes = SIZE[size];

    return (
        <span
            className={cn(
                'inline-flex min-w-0 items-center gap-2.5',
                className,
            )}
        >
            <AppLogoIcon
                className={cn(
                    'rounded-full shadow-sm ring-1',
                    onDark ? 'ring-white/25' : 'ring-border/60',
                    sizes.mark,
                )}
            />
            {showName ? (
                <span
                    className={cn(
                        'truncate font-semibold tracking-tight',
                        onDark ? 'text-background' : 'text-sidebar-foreground',
                        sizes.name,
                        nameClassName,
                    )}
                >
                    {t('AgriVoice')}
                </span>
            ) : null}
        </span>
    );
}
