import { Head, useForm } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';

import { AppearanceToggle } from '@/components/appearance-toggle';
import InputError from '@/components/input-error';
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
import { cn } from '@/lib/utils';

/** Number of digits in the agent PIN. */
const PIN_LENGTH = 4;

/**
 * Animated onboarding steps shown on the brand panel.
 *
 * These explain the data flow to the audience during the demo:
 *   Agent enters price → data joins the picture → confidence updates
 *
 * The vertical stepper with numbered circles creates a visual narrative
 * that reinforces the "crowd data → trustworthy prices" story.
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
];

type LoginProps = {
    /** Seeded agent names — rendered as tappable cards, not a text input. */
    agentNames: string[];
};

export default function PortalLogin({ agentNames }: LoginProps) {
    const getInitials = useInitials();
    const pinContainerRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: agentNames[0] ?? '',
        pin: '',
    });

    const submit = (): void => {
        post('/portal/login', { onError: () => setData('pin', '') });
    };

    /**
     * Select an agent by name and auto-focus the PIN input.
     *
     * Tapping a name card is the first half of authentication.
     * The PIN is the second half. Auto-focusing the PIN input
     * keeps the flow smooth — the agent doesn't have to tap
     * the input field manually.
     */
    const selectAgent = (name: string): void => {
        setData('name', name);
        clearErrors();

        pinContainerRef.current?.querySelector('input')?.focus();
    };

    return (
        <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
            <Head title="Agent sign-in" />

            <BrandPanel />

            <div className="relative flex items-center justify-center px-6 py-12 sm:px-10">
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <AppearanceToggle />
                </div>
                <div className="w-full max-w-sm">
                    <p className="text-lg font-bold tracking-[-0.01em] text-primary lg:hidden">
                        AgriVoice
                    </p>

                    <div className="mt-6 lg:mt-0">
                        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
                            Agent sign-in
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Every price you enter is filed under your name. Pick
                            who you are and enter your PIN.
                        </p>
                    </div>

                    <form
                        className="mt-8 space-y-7"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        {/* Agent name picker — tappable cards instead of text input */}
                        <div className="space-y-3">
                            <Label>Agent</Label>

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
                                // Fallback: text input if no seeded agents exist
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Your agent name"
                                    autoComplete="off"
                                    autoFocus
                                />
                            )}

                            <InputError message={errors.name} />
                        </div>

                        {/* PIN input — 4-digit OTP-style input with auto-submit */}
                        <div className="space-y-3" ref={pinContainerRef}>
                            <Label htmlFor="pin">PIN</Label>

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
                            Start entering prices
                            {processing ? null : <ArrowRight />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

/**
 * Left-side brand panel with onboarding narrative.
 *
 * Hidden on mobile (the form takes full width). On desktop, it shows
 * the AgriVoice branding, a 3-step data flow explanation, and the
 * list of tracked crops/markets. This panel sets the context for the
 * audience before the agent signs in.
 */
function BrandPanel() {
    return (
        <div className="relative hidden overflow-hidden bg-zinc-950 p-10 text-zinc-50 lg:flex lg:flex-col lg:justify-between xl:p-14">
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
                <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                    AgriVoice field network
                </p>
                <h1 className="mt-5 max-w-md font-serif text-4xl leading-[1.1] font-semibold tracking-[-0.02em] xl:text-[2.75rem]">
                    Every price has a name behind it.
                </h1>
                <p className="mt-5 max-w-md leading-relaxed text-zinc-400">
                    Market gossip is anonymous and stale. A reported sale is
                    signed, timed and comparable — that is the difference this
                    portal exists to create.
                </p>
            </div>

            {/* 3-step data flow narrative */}
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
                            <p className="font-semibold">{step.title}</p>
                            <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-400">
                                {step.body}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            {/* Crop/market/unit footer */}
            <div className="relative mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-sm">
                <span className="text-zinc-500">Tracking</span>
                <span className="font-medium">
                    Teff · Coffee · Maize · Wheat · Sesame · Pulses · Sorghum
                </span>
                <span aria-hidden className="h-4 w-px bg-white/20" />
                <span className="font-medium">Adama · Addis Ababa · Jimma</span>
                <span aria-hidden className="h-4 w-px bg-white/20" />
                <span className="font-medium">ETB per quintal</span>
            </div>
        </div>
    );
}
