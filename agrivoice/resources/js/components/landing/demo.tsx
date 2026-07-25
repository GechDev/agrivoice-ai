import { Check, Pause, Play } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

import { AnimateIn } from '@/components/motion/animate-in';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

const highlights = [
    'Ask a question in Amharic',
    'Watch AgriVoice fetch live prices',
    'Hear a spoken, natural-language answer',
    'See the market map light up',
    'Watch a new crowdsourced report appear in real time',
];

const demoSteps = [
    {
        speaker: 'You',
        text: "What's the price of teff in Adama today?",
    },
    {
        speaker: 'AgriVoice',
        text: "Today's average reported price in Adama is 8,200 Birr per quintal. That's 300 Birr lower than Addis Ababa.",
    },
    {
        speaker: 'AgriVoice',
        text: 'Confidence is high from 12 verified reports this week. Prices have risen about 5%.',
    },
];

export default function Demo() {
    const t = useTranslations();
    const [playing, setPlaying] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!playing) {
            return;
        }

        if (step >= demoSteps.length) {
            const reset = window.setTimeout(() => {
                setPlaying(false);
                setStep(0);
            }, 1600);

            return () => window.clearTimeout(reset);
        }

        const timer = window.setTimeout(() => {
            setStep((current) => current + 1);
        }, 2200);

        return () => window.clearTimeout(timer);
    }, [playing, step]);

    const visibleSteps = demoSteps.slice(0, Math.min(step, demoSteps.length));

    return (
        <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
                    <AnimateIn className="relative overflow-hidden rounded-2xl bg-foreground shadow-xl">
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--primary)_0%,_transparent_50%)] opacity-20"
                        />
                        <div className="relative flex min-h-[18rem] flex-col justify-between gap-5 px-6 py-8 sm:min-h-[22rem] sm:px-8">
                            <div className="space-y-3">
                                {visibleSteps.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
                                        <Button
                                            type="button"
                                            size="lg"
                                            className="size-20 rounded-full bg-background text-foreground shadow-lg hover:bg-background/90"
                                            aria-label={t('Play demo')}
                                            onClick={() => {
                                                setStep(1);
                                                setPlaying(true);
                                            }}
                                        >
                                            <Play className="ml-1 size-8 fill-current" />
                                        </Button>
                                        <div>
                                            <p className="text-sm font-medium tracking-wide text-background/70">
                                                {t('See It In Action')}
                                            </p>
                                            <p className="mt-1 text-xs text-background/45">
                                                {t('Simulated demo — no live audio')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    visibleSteps.map((item, index) => (
                                        <div
                                            key={`${item.speaker}-${index}`}
                                            className={cn(
                                                'max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed av-enter',
                                                item.speaker === 'You'
                                                    ? 'ml-auto bg-background/15 text-background'
                                                    : 'bg-primary/25 text-background',
                                            )}
                                        >
                                            <p className="mb-1 text-[11px] font-semibold tracking-wide text-background/55 uppercase">
                                                {t(item.speaker)}
                                            </p>
                                            <p>{t(item.text)}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {visibleSteps.length > 0 ? (
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs text-background/45">
                                        {t('Simulated demo — no live audio')}
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        className="rounded-full"
                                        onClick={() => {
                                            if (playing) {
                                                setPlaying(false);
                                            } else {
                                                setPlaying(true);
                                                if (step === 0) {
                                                    setStep(1);
                                                }
                                            }
                                        }}
                                    >
                                        {playing ? (
                                            <>
                                                <Pause className="size-3.5" />
                                                {t('Pause')}
                                            </>
                                        ) : (
                                            <>
                                                <Play className="size-3.5" />
                                                {t('Play demo')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </AnimateIn>

                    <AnimateIn delay={80}>
                        <h2 className="font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                            {t('A conversation that moves markets')}
                        </h2>
                        <ul className="mt-10 space-y-4">
                            {highlights.map((item, index) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                                    style={
                                        {
                                            '--av-delay': `${index * 60}ms`,
                                        } as CSSProperties
                                    }
                                >
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Check
                                            className="size-3.5"
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                    {t(item)}
                                </li>
                            ))}
                        </ul>
                    </AnimateIn>
                </div>
            </div>
        </section>
    );
}
