import { Form, Head, Link } from '@inertiajs/react';
import { Check, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/CooperativeOnboardingController';
import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import InputError from '@/components/input-error';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import { formatCurrency } from '@/lib/agrivoice';
import { home } from '@/routes';
import type { BillingPlan } from '@/types/cooperative-billing';

type CooperativeOnboardingProps = {
    cooperative: {
        name: string;
        region: string;
    };
    plans: BillingPlan[];
};

export default function CooperativeOnboarding({
    cooperative,
    plans,
}: CooperativeOnboardingProps) {
    const t = useTranslations();
    const preferredPlan =
        plans.find((plan) => plan.tier === 'growth') ?? plans[0] ?? null;
    const [selectedPlan, setSelectedPlan] = useState<string>(
        preferredPlan?.tier ?? '',
    );

    return (
        <>
            <Head title={t('Choose your cooperative plan')} />

            <div className="min-h-dvh bg-background">
                <header className="border-b border-border/70 bg-background/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Link href={home()} aria-label={t('AgriVoice')}>
                            <AppLogo size="md" />
                        </Link>
                        <div className="flex items-center gap-1">
                            <AppearanceToggle />
                            <LanguageSwitcher />
                        </div>
                    </div>
                </header>

                <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge
                            variant="secondary"
                            className="mb-4 rounded-full px-3 py-1"
                        >
                            <Sparkles aria-hidden="true" />
                            {t('One last step')}
                        </Badge>
                        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                            {t('Choose your cooperative plan')}
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {t(
                                'Select the member capacity that fits :name. You can change plans later from billing.',
                                { name: cooperative.name },
                            )}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {cooperative.region}
                        </p>
                    </div>

                    <Form
                        {...store.form()}
                        disableWhileProcessing
                        className="flex flex-col gap-7"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="plan_tier"
                                    value={selectedPlan}
                                />

                                <div className="grid gap-5 md:grid-cols-3">
                                    {plans.map((plan) => {
                                        const selected =
                                            selectedPlan === plan.tier;
                                        const recommended =
                                            plan.tier === 'growth';

                                        return (
                                            <button
                                                key={plan.tier}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() =>
                                                    setSelectedPlan(plan.tier)
                                                }
                                                className="text-left focus-visible:outline-none"
                                            >
                                                <Card
                                                    className={`relative h-full transition-all ${
                                                        selected
                                                            ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                                                            : 'hover:border-primary/40 hover:shadow-md'
                                                    }`}
                                                >
                                                    {recommended && (
                                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full">
                                                            {t('Recommended')}
                                                        </Badge>
                                                    )}
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <CardTitle>
                                                                    {t(
                                                                        plan.name,
                                                                    )}
                                                                </CardTitle>
                                                                <CardDescription className="mt-1">
                                                                    {t(
                                                                        'Billed monthly',
                                                                    )}
                                                                </CardDescription>
                                                            </div>
                                                            <span
                                                                className={`flex size-7 items-center justify-center rounded-full border ${
                                                                    selected
                                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                                        : 'border-border'
                                                                }`}
                                                            >
                                                                {selected && (
                                                                    <Check className="size-4" />
                                                                )}
                                                            </span>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="flex flex-col gap-5">
                                                        <div>
                                                            <span className="text-3xl font-semibold">
                                                                {formatCurrency(
                                                                    plan.pricePerMonth,
                                                                )}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {t('/month')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 rounded-xl bg-muted/70 p-3 text-sm">
                                                            <Users
                                                                className="size-4 text-primary"
                                                                aria-hidden="true"
                                                            />
                                                            {t(
                                                                'Up to :count members',
                                                                {
                                                                    count: String(
                                                                        plan.memberLimit,
                                                                    ),
                                                                },
                                                            )}
                                                        </div>
                                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                                            <li className="flex gap-2">
                                                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                                                {t(
                                                                    'Live crop price reporting',
                                                                )}
                                                            </li>
                                                            <li className="flex gap-2">
                                                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                                                {t(
                                                                    'Member and market insights',
                                                                )}
                                                            </li>
                                                            <li className="flex gap-2">
                                                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                                                {t(
                                                                    'Price trends and forecasts',
                                                                )}
                                                            </li>
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            </button>
                                        );
                                    })}
                                </div>

                                <InputError
                                    message={
                                        errors.plan_tier
                                            ? t(errors.plan_tier)
                                            : undefined
                                    }
                                    className="text-center"
                                />

                                <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={
                                            processing || selectedPlan === ''
                                        }
                                    >
                                        {processing && <Spinner />}
                                        {t('Start using AgriVoice')}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        {t(
                                            'This demo activates your selected plan without charging a payment method.',
                                        )}
                                    </p>
                                </div>
                            </>
                        )}
                    </Form>
                </main>
            </div>
        </>
    );
}
