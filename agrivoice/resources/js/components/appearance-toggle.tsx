import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

type AppearanceToggleProps = {
    className?: string;
};

/**
 * Quick light/dark switch for headers and the landing nav.
 * Cycles light → dark → light (system still available in settings).
 */
export function AppearanceToggle({ className }: AppearanceToggleProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const t = useTranslations();
    const isDark = resolvedAppearance === 'dark';

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('relative rounded-full', className)}
            aria-label={isDark ? t('Switch to light mode') : t('Switch to dark mode')}
            title={isDark ? t('Light') : t('Dark')}
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
        >
            <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">
                {isDark ? t('Switch to light mode') : t('Switch to dark mode')}
            </span>
        </Button>
    );
}
