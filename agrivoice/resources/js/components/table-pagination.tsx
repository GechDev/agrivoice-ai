import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

type TablePaginationProps = {
    from: number | null;
    to: number | null;
    total: number;
    currentPage: number;
    lastPage: number;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
};

/**
 * Shared pagination chrome for cooperative tables and billing history.
 */
export function TablePagination({
    from,
    to,
    total,
    currentPage,
    lastPage,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
}: TablePaginationProps) {
    const t = useTranslations();

    if (total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {t('Showing :from–:to of :total', {
                    from: String(from ?? 0),
                    to: String(to ?? 0),
                    total: String(total),
                })}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevious}
                    onClick={onPrevious}
                    aria-label={t('Previous page')}
                >
                    {t('Previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                    {t('Page :current of :last', {
                        current: String(currentPage),
                        last: String(lastPage),
                    })}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    onClick={onNext}
                    aria-label={t('Next page')}
                >
                    {t('Next')}
                </Button>
            </div>
        </div>
    );
}
