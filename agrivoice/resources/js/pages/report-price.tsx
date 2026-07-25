import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Coffee, Wheat } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { CROPS, cropLabel, marketLabel, todayAsInputValue } from '@/lib/agrivoice';
import type { Crop, Market as MarketType, MarketOption } from '@/types';

const CROP_ICONS = {
    teff: Wheat,
    coffee: Coffee,
} as const;

type ReportPriceProps = {
    markets: MarketOption[];
};

export default function ReportPrice({ markets }: ReportPriceProps) {
    const [showDialog, setShowDialog] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        crop: 'teff' as Crop,
        market: (markets[0]?.slug ?? 'adama') as MarketType,
        price: '',
        reported_at: todayAsInputValue(),
    });

    const submit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        post('/report-price', {
            onSuccess: () => {
                setShowDialog(true);
            },
        });
    };

    const closeDialog = (): void => {
        setShowDialog(false);
        reset();
    };

    return (
        <>
            <Head title="Report a price" />

            <div className="min-h-dvh bg-muted/30">
                <header className="border-b border-border/70 bg-background/85 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
                        <a
                            href="/"
                            className="text-lg font-bold tracking-[-0.01em] text-primary"
                        >
                            AgriVoice
                        </a>
                        <span
                            aria-hidden
                            className="mx-3 h-4 w-px bg-border"
                        />
                        <span className="text-sm font-medium text-muted-foreground">
                            Report a price
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
                    <div className="mb-8 max-w-xl">
                        <h1 className="text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
                            Report a price
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Heard a price at the market? Enter it below and our
                            team will verify it before adding it to the live
                            dashboard.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-7">
                        <div className="space-y-3">
                            <Label>Crop</Label>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {CROPS.map((crop) => {
                                    const Icon = CROP_ICONS[crop];
                                    const isSelected = data.crop === crop;

                                    return (
                                        <button
                                            key={crop}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() =>
                                                setData('crop', crop)
                                            }
                                            className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40'
                                            }`}
                                        >
                                            <span
                                                className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                <Icon className="size-5" />
                                            </span>
                                            <span className="font-medium">
                                                {cropLabel(crop)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.crop} />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="public-market">Market</Label>
                                <Select
                                    value={data.market}
                                    onValueChange={(market) =>
                                        setData('market', market as MarketType)
                                    }
                                >
                                    <SelectTrigger
                                        id="public-market"
                                        className="h-11 w-full rounded-2xl"
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
                                <Label htmlFor="public-reported_at">
                                    Observed on
                                </Label>
                                <Input
                                    id="public-reported_at"
                                    type="date"
                                    value={data.reported_at}
                                    max={todayAsInputValue()}
                                    onChange={(event) =>
                                        setData(
                                            'reported_at',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 rounded-2xl"
                                />
                                <InputError message={errors.reported_at} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="public-price">Price</Label>
                            <div className="relative">
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                                >
                                    ETB
                                </span>
                                <Input
                                    id="public-price"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder="0"
                                    value={data.price}
                                    onChange={(event) =>
                                        setData('price', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.price)}
                                    autoFocus
                                    className="h-16 w-full rounded-2xl pl-16 pr-32 text-2xl font-semibold tabular-nums"
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

                        <div className="border-t pt-6">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {processing ? <Spinner /> : null}
                                Submit for review
                            </Button>
                        </div>
                    </form>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center">
                        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle2 className="size-6 text-primary" />
                        </span>
                        <DialogTitle className="mt-4 text-xl">
                            Report submitted
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                            Your price report has been received and is pending
                            verification. A moderator will review it before it
                            appears on the live dashboard.
                        </DialogDescription>
                    </DialogHeader>

                    <Alert variant="default" className="text-left">
                        <AlertTitle className="text-sm font-semibold">
                            What happens next?
                        </AlertTitle>
                        <AlertDescription className="mt-1 text-xs leading-relaxed">
                            Our team checks each crowd-sourced report for
                            accuracy. Once verified, it will contribute to the
                            market snapshot for that crop and location.
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button onClick={closeDialog}>
                            Submit another
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
