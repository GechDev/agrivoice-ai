import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';
import type { ReportFilterOption } from '@/types/cooperative-reports';

type ReportsFiltersProps = {
    crop: string;
    market: string;
    status: string;
    from: string;
    to: string;
    cropOptions: ReportFilterOption[];
    marketOptions: ReportFilterOption[];
    statusOptions: ReportFilterOption[];
    onCropChange: (value: string) => void;
    onMarketChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onReset: () => void;
};

export function ReportsFilters({
    crop,
    market,
    status,
    from,
    to,
    cropOptions,
    marketOptions,
    statusOptions,
    onCropChange,
    onMarketChange,
    onStatusChange,
    onFromChange,
    onToChange,
    onReset,
}: ReportsFiltersProps) {
    const t = useTranslations();
    const hasActiveFilters =
        crop !== '' ||
        market !== '' ||
        status !== '' ||
        from !== '' ||
        to !== '';

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="reports-crop">{t('Crop')}</Label>
                    <Select
                        value={crop || 'all'}
                        onValueChange={(value) =>
                            onCropChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger
                            id="reports-crop"
                            className="w-full"
                            aria-label={t('Filter by crop')}
                        >
                            <SelectValue placeholder={t('All crops')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All crops')}</SelectItem>
                            {cropOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="reports-market">{t('Market')}</Label>
                    <Select
                        value={market || 'all'}
                        onValueChange={(value) =>
                            onMarketChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger
                            id="reports-market"
                            className="w-full"
                            aria-label={t('Filter by market')}
                        >
                            <SelectValue placeholder={t('All markets')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('All markets')}
                            </SelectItem>
                            {marketOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="reports-status">{t('Status')}</Label>
                    <Select
                        value={status || 'all'}
                        onValueChange={(value) =>
                            onStatusChange(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger
                            id="reports-status"
                            className="w-full"
                            aria-label={t('Filter by status')}
                        >
                            <SelectValue placeholder={t('All statuses')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('All statuses')}
                            </SelectItem>
                            {statusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {t(option.label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="reports-from">{t('From date')}</Label>
                    <Input
                        id="reports-from"
                        type="date"
                        value={from}
                        onChange={(event) => onFromChange(event.target.value)}
                        aria-label={t('Filter from date')}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="reports-to">{t('To date')}</Label>
                    <Input
                        id="reports-to"
                        type="date"
                        value={to}
                        onChange={(event) => onToChange(event.target.value)}
                        aria-label={t('Filter to date')}
                    />
                </div>

                <div className="flex flex-col justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onReset}
                        disabled={!hasActiveFilters}
                        aria-label={t('Reset report filters')}
                        className="w-full"
                    >
                        {t('Reset filters')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
