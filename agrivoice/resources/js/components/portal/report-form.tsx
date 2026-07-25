import { useForm } from '@inertiajs/react';
import { Coffee, Leaf, Sprout, Wheat } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import ChoiceGroup, { type Choice } from '@/components/portal/choice-group';
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
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import {
    CROPS,
    REPORTER_TYPES,
    cropLabel,
    formatPrice,
    marketLabel,
    parsePriceInput,
    reporterTypeDescription,
    reporterTypeLabel,
    todayAsInputValue,
} from '@/lib/agrivoice';
import type { Crop, Market, MarketOption, ReporterType } from '@/types';

const CROP_ICONS = {
    teff: Wheat,
    coffee: Coffee,
    maize: Leaf,
    wheat: Wheat,
    sesame: Sprout,
    pulses: Sprout,
    sorghum: Leaf,
} as const;

type ReportFormProps = {
    markets: MarketOption[];
};

export default function ReportForm({ markets }: ReportFormProps) {
    const t = useTranslations();
    const priceInputRef = useRef<HTMLInputElement>(null);

    const cropChoices: readonly Choice<Crop>[] = useMemo(
        () =>
            CROPS.map((crop) => ({
                value: crop,
                label: t(cropLabel(crop)),
                icon: CROP_ICONS[crop],
            })),
        [t],
    );

    const reporterTypeChoices: readonly Choice<ReporterType>[] = useMemo(
        () =>
            REPORTER_TYPES.map((reporterType) => ({
                value: reporterType,
                label: t(reporterTypeLabel(reporterType)),
                description: t(reporterTypeDescription(reporterType)),
            })),
        [t],
    );

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            crop: 'teff' as Crop,
            market: (markets[0]?.slug ?? 'adama') as Market,
            price: '',
            reported_at: todayAsInputValue(),
            reporter_type: 'crowd' as ReporterType,
        });

    const submit = (): void => {
        post('/reports', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                const savedPrice = parsePriceInput(data.price);

                reset('price');
                clearErrors();
                priceInputRef.current?.focus();

                toast.success(t('Price saved'), {
                    description: t(
                        ':price ETB/quintal · :crop in :market',
                        {
                            price: formatPrice(savedPrice),
                            crop: t(cropLabel(data.crop)),
                            market: t(marketLabel(data.market)),
                        },
                    ),
                });
            },
            onError: () => priceInputRef.current?.focus(),
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        submit();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            submit();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="space-y-7"
        >
            <div className="space-y-3">
                <Label>{t('Crop')}</Label>
                <ChoiceGroup
                    name="crop"
                    legend={t('Crop')}
                    value={data.crop}
                    choices={cropChoices}
                    onChange={(crop) => setData('crop', crop)}
                    className="sm:grid-cols-2 lg:grid-cols-3"
                />
                <InputError message={errors.crop} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="market">{t('Market')}</Label>
                    <Select
                        value={data.market}
                        onValueChange={(market) =>
                            setData('market', market as Market)
                        }
                    >
                        <SelectTrigger
                            id="market"
                            className="h-11! w-full rounded-2xl"
                        >
                            <SelectValue placeholder={t('Choose a market')} />
                        </SelectTrigger>
                        <SelectContent align="start">
                            {markets.map((market) => (
                                <SelectItem
                                    key={market.slug}
                                    value={market.slug}
                                >
                                    <span className="font-medium">
                                        {t(marketLabel(market.slug))}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {market.region}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.market} />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="reported_at">{t('Observed on')}</Label>
                    <Input
                        id="reported_at"
                        type="date"
                        value={data.reported_at}
                        max={todayAsInputValue()}
                        onChange={(event) =>
                            setData('reported_at', event.target.value)
                        }
                        className="h-11 rounded-2xl"
                    />
                    <InputError message={errors.reported_at} />
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="price">{t('Price')}</Label>
                <div className="relative">
                    <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                    >
                        {t('ETB')}
                    </span>
                    <Input
                        ref={priceInputRef}
                        id="price"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0"
                        value={data.price}
                        onChange={(event) =>
                            setData('price', event.target.value)
                        }
                        aria-invalid={Boolean(errors.price)}
                        autoFocus
                        className="h-16 rounded-2xl pr-32 pl-16 text-2xl font-semibold tabular-nums md:text-2xl"
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-sm text-muted-foreground"
                    >
                        {t('per quintal')}
                    </span>
                </div>
                <InputError message={errors.price} />
            </div>

            <div className="space-y-3">
                <Label>{t('Where the price came from')}</Label>
                <ChoiceGroup
                    name="reporter_type"
                    legend={t('Where the price came from')}
                    value={data.reporter_type}
                    choices={reporterTypeChoices}
                    onChange={(reporterType) =>
                        setData('reporter_type', reporterType)
                    }
                />
                <InputError message={errors.reporter_type} />
            </div>

            <div className="flex flex-col-reverse items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">
                    {t('Filed under your name.')}{' '}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem]">
                        Ctrl
                    </kbd>
                    {' + '}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem]">
                        Enter
                    </kbd>{' '}
                    {t('saves.')}
                </p>

                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full sm:w-auto"
                >
                    {processing ? <Spinner /> : null}
                    {t('Save price')}
                </Button>
            </div>
        </form>
    );
}
