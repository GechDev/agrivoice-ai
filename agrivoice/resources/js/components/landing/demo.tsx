import { Check, Play } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

const highlights = [
    'Ask a question in Amharic',
    'Watch AgriVoice fetch live prices',
    'Hear a spoken, natural-language answer',
    'See the market map light up',
    'Watch a new crowdsourced report appear in real time',
];

export default function Demo() {
    const t = useTranslations();

    return (
        <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
                    <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 shadow-xl">
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--primary)_0%,_transparent_50%)] opacity-20"
                        />
                        <div className="relative flex aspect-[16/10] flex-col items-center justify-center gap-5 px-6">
                            <button
                                type="button"
                                className="group flex size-20 items-center justify-center rounded-full bg-zinc-50 text-zinc-950 shadow-lg transition-transform hover:scale-105"
                                aria-label={t('Play demo')}
                            >
                                <Play className="ml-1 size-8 fill-current" />
                            </button>
                            <p className="text-sm font-medium tracking-wide text-zinc-400">
                                {t('See It In Action')}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                            {t('A conversation that moves markets')}
                        </h2>
                        <ul className="mt-10 space-y-4">
                            {highlights.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                                >
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Check className="size-3.5" strokeWidth={2.5} />
                                    </span>
                                    {t(item)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
