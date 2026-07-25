/**
 * Agent sign-in page — the entry point for crowd-sourced price collection.
 *
 * This is a standalone page (bypasses the main app shell) with a split layout:
 * the left BrandPanel is a dark hero that explains the crowd-data loop, and the
 * right side holds the sign-in form.
 *
 * Auth flow:
 * 1. Server sends `agentNames` — the list of seeded Agent names for the picker.
 * 2. Agent taps their name (or types it if the list is empty).
 * 3. Agent enters a 4-digit PIN via the OTP input.
 * 4. POST /portal/login → AgentAuthController::store validates name+PIN,
 *    stores the Agent ID in the session, and redirects to /portal.
 * 5. On error, the PIN is cleared so the agent can retry without manual deletion.
 *
 * The 4-digit PIN is intentionally weak — this is a demo/hackathon showcase, not
 * a production auth system. The vague error message ("Invalid credentials") avoids
 * leaking whether the name or PIN was wrong.
 */
import { Head, useForm } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

import { AppearanceToggle } from '@/components/appearance-toggle';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useInitials } from '@/hooks/use-initials';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

/** Number of digits in the agent PIN — matches the backend validation. */
const PIN_LENGTH = 4;

/**
 * Onboarding steps displayed in the BrandPanel's vertical timeline.
 * Explains the crowd-data loop to first-time agents: collect → aggregate → display.
 * Each step maps to a real system component (ReportEntryService → SnapshotService → dashboard).
 */
const LOOP_STEPS = [
    {
        title: 'An agent records a real sale',
        body: 'Trained collectors sit with farmers and traders at the market and enter the price actually offered.',
    },
    {
        title: 'It joins the market picture',
        body: 'Each report is weighed by how recent it is and who gave it, then compared against the rest.',
    },
    {
        title: 'Confidence moves in the open',
        body: 'The dashboard shows how much evidence sits behind every number, and updates as it arrives.',
    },
] as const;

type LoginProps = {
    agentNames: string[];
};

export default function PortalLogin({ agentNames }: LoginProps) {
    const t = useTranslations();
    const getInitials = useInitials();
    const pinContainerRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: agentNames[0] ?? '',
        pin: '',
    });

    /** Submit credentials to POST /portal/login. On failure, clear the PIN
     *  so the agent doesn't have to manually delete a wrong entry. */
    const submit = (): void => {
        post('/portal/login', { onError: () => setData('pin', '') });
    };

    /** Select an agent from the picker grid, clear any prior errors,
     *  and auto-focus the PIN input for quick entry. */
    const selectAgent = (name: string): void => {
        setData('name', name);
        clearErrors();

        pinContainerRef.current?.querySelector('input')?.focus();
    };

    return (
        <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
            <Head title={t('Agent sign-in')} />

            <BrandPanel />

            <div className="relative flex items-center justify-center px-6 py-12 sm:px-10">
                <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
                    <AppearanceToggle />
                    <LanguageSwitcher />
                </div>
                <div className="w-full max-w-sm">
                    <div className="lg:hidden">
                        <AppLogo size="md" />
                    </div>

                    <div className="mt-6 lg:mt-0">
                        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
                            {t('Agent sign-in')}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {t(
                                'Every price you enter is filed under your name. Pick who you are and enter your PIN.',
                            )}
                        </p>
                    </div>

                    <form
                        className="mt-8 space-y-7"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        <div className="space-y-3">
                            <Label>{t('Agent')}</Label>

                            {agentNames.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {agentNames.map((name) => {
                                        const isSelected = data.name === name;

                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() =>
                                                    selectAgent(name)
                                                }
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-colors',
                                                    'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                                    isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {getInitials(name)}
                                                </span>
                                                <span className="truncate text-sm font-medium">
                                                    {name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder={t('Your agent name')}
                                    autoComplete="off"
                                    autoFocus
                                />
                            )}

                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-3" ref={pinContainerRef}>
                            <Label htmlFor="pin">{t('PIN')}</Label>

                            <InputOTP
                                id="pin"
                                maxLength={PIN_LENGTH}
                                value={data.pin}
                                onChange={(value) => setData('pin', value)}
                                pattern={REGEXP_ONLY_DIGITS}
                                disabled={processing}
                                autoFocus={agentNames.length > 0}
                                containerClassName="justify-start"
                            >
                                <InputOTPGroup className="gap-2.5">
                                    {Array.from(
                                        { length: PIN_LENGTH },
                                        (_, index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="size-13 rounded-2xl border text-lg font-semibold first:rounded-l-2xl last:rounded-r-2xl"
                                            />
                                        ),
                                    )}
                                </InputOTPGroup>
                            </InputOTP>

                            <InputError message={errors.pin} />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={
                                processing || data.pin.length < PIN_LENGTH
                            }
                        >
                            {processing ? <Spinner /> : null}
                            {t('Start entering prices')}
                            {processing ? null : <ArrowRight />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

/**
 * Dark hero panel shown on the left side of the login page (desktop only).
 * Explains the AgriVoice value proposition and walks the agent through the
 * crowd-data loop. Includes the logo, tagline, onboarding timeline, and a
 * summary of tracked crops and markets.
 */
function BrandPanel() {
    const t = useTranslations();

    return (
        <div className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_var(--primary)_0%,_transparent_45%)] opacity-20"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage:
                        'radial-gradient(currentColor 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }}
            />

            <div className="relative">
                <div className="flex items-center gap-3">
                    <AppLogoIcon className="size-12 rounded-full ring-1 ring-white/25" />
                    <div>
                        <p className="text-lg font-semibold tracking-tight">
                            {t('AgriVoice')}
                        </p>
                        <p className="text-xs font-semibold tracking-widest text-background/55 uppercase">
                            {t('AgriVoice field network')}
                        </p>
                    </div>
                </div>
                <h1 className="mt-8 max-w-md font-serif text-4xl leading-[1.1] font-semibold tracking-[-0.02em] xl:text-[2.75rem]">
                    {t('Every price has a name behind it.')}
                </h1>
                <p className="mt-5 max-w-md leading-relaxed text-background/60">
                    {t(
                        'Market gossip is anonymous and stale. A reported sale is signed, timed and comparable — that is the difference this portal exists to create.',
                    )}
                </p>
            </div>

            <ol className="relative mt-14 space-y-7">
                {LOOP_STEPS.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-semibold">
                                {index + 1}
                            </span>
                            {index < LOOP_STEPS.length - 1 && (
                                <span
                                    aria-hidden
                                    className="mt-2 w-px flex-1 bg-white/25"
                                />
                            )}
                        </div>
                        <div className="pb-1">
                            <p className="font-semibold">{t(step.title)}</p>
                            <p className="mt-1 max-w-sm text-sm leading-relaxed text-background/60">
                                {t(step.body)}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className="relative mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-sm">
                <span className="text-background/45">{t('Tracking')}</span>
                <span className="font-medium">
                    {[
                        'Teff',
                        'Coffee',
                        'Maize',
                        'Wheat',
                        'Sesame',
                        'Pulses',
                        'Sorghum',
                    ]
                        .map((crop) => t(crop))
                        .join(' · ')}
                </span>
                <span aria-hidden className="h-4 w-px bg-white/20" />
                <span className="font-medium">
                    {[t('Adama'), t('Addis Ababa'), t('Jimma')].join(' · ')}
                </span>
                <span aria-hidden className="h-4 w-px bg-white/20" />
                <span className="font-medium">{t('ETB per quintal')}</span>
            </div>
        </div>
    );
}
