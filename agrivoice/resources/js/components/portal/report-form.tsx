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

/**
 * Lucide icons for each crop type.
 *
 * Used in the crop ChoiceGroup to give each option a visual identifier.
 * Maps are used instead of conditional rendering for O(1) lookup.
 */
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

/**
 * Multi-step price entry form for the data-entry portal.
 *
 * Form flow:
 * 1. Pick a crop (ChoiceGroup with icons)
 * 2. Pick a market (Select dropdown) + observation date
 * 3. Enter the price (large ETB input with unit labels)
 * 4. Pick reporter type (ChoiceGroup with descriptions)
 * 5. Submit (button or Ctrl+Enter)
 *
 * After successful submission:
 * - Price input is cleared (crop + market preserved for batch entry)
 * - Price input is auto-focused for the next entry
 * - Toast notification confirms the save with details
 *
 * Keyboard shortcut: Ctrl+Enter (or Cmd+Enter on Mac) submits the form
 * from anywhere — agents don't need to reach for the mouse.
 *
 * The form POSTs to /reports (ReportController::store), which redirects
 * back to /portal (ReportController::create) with updated props.
 */
export default function ReportForm({ markets }: ReportFormProps) {
    const t = useTranslations();
    const priceInputRef = useRef<HTMLInputElement>(null);

    // Build crop choices with icons for the ChoiceGroup component
    const cropChoices: readonly Choice<Crop>[] = useMemo(
        () =>
            CROPS.map((crop) => ({
                value: crop,
                label: t(cropLabel(crop)),
                icon: CROP_ICONS[crop],
            })),
        [t],
    );

    // Build reporter type choices with descriptions
    const reporterTypeChoices: readonly Choice<ReporterType>[] = useMemo(
        () =>
            REPORTER_TYPES.map((reporterType) => ({
                value: reporterType,
                label: reporterTypeLabel(reporterType),
                description: reporterTypeDescription(reporterType),
            })),
        [],
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
            // preserveState keeps the crop/market selections intact
            // so the agent doesn't have to re-pick them after each save
            preserveState: true,
            onSuccess: () => {
                const savedPrice = parsePriceInput(data.price);

                // Clear only the price field — keep crop/market/date/type
                reset('price');
                clearErrors();
                // Auto-focus the price input for rapid batch entry
                priceInputRef.current?.focus();

                toast.success('Price saved', {
                    description: `${formatPrice(savedPrice)} ETB/quintal · ${t(cropLabel(data.crop))} in ${marketLabel(data.market)}`,
                });
            },
            onError: () => priceInputRef.current?.focus(),
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        submit();
    };

    // Ctrl+Enter / Cmd+Enter keyboard shortcut for fast submission
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
            {/* Crop picker — tappable icon cards */}
            <div className="space-y-3">
                <Label>Crop</Label>
                <ChoiceGroup
                    name="crop"
                    legend="Crop"
                    value={data.crop}
                    choices={cropChoices}
                    onChange={(crop) => setData('crop', crop)}
                    className="sm:grid-cols-2 lg:grid-cols-3"
                />
                <InputError message={errors.crop} />
            </div>

            {/* Market + date — side by side on desktop */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="market">Market</Label>
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
                            <SelectValue placeholder="Choose a market" />
                        </SelectTrigger>
                        <SelectContent align="start">
                            {markets.map((market) => (
                                <SelectItem
                                    key={market.slug}
                                    value={market.slug}
                                >
                                    <span className="font-medium">
                                        {market.name}
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
                    <Label htmlFor="reported_at">Observed on</Label>
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

            {/* Price input — large, prominent, with ETB/unit labels */}
            <div className="space-y-3">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                    <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                    >
                        ETB
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
                        per quintal
                    </span>
                </div>
                <InputError message={errors.price} />
            </div>

            {/* Reporter type — official vs crowd, with descriptions */}
            <div className="space-y-3">
                <Label>Where the price came from</Label>
                <ChoiceGroup
                    name="reporter_type"
                    legend="Where the price came from"
                    value={data.reporter_type}
                    choices={reporterTypeChoices}
                    onChange={(reporterType) =>
                        setData('reporter_type', reporterType)
                    }
                />
                <InputError message={errors.reporter_type} />
            </div>

            {/* Submit button + keyboard shortcut hint */}
            <div className="flex flex-col-reverse items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground">
                    Filed under your name.{' '}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem]">
                        Ctrl
                    </kbd>
                    {' + '}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem]">
                        Enter
                    </kbd>{' '}
                    saves.
                </p>

                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="w-full sm:w-auto"
                >
                    {processing ? <Spinner /> : null}
                    Save price
                </Button>
            </div>
        </form>
    );
}
