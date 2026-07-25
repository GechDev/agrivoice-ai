import { Mic } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

export default function Solution() {
    const t = useTranslations();

    return (
        <section className="relative overflow-hidden bg-zinc-950 py-24 text-zinc-50 sm:py-32">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,_var(--primary)_0%,_transparent_40%)] opacity-[0.12]"
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
                <div>
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('The solution')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
                        {t('Just Ask. In Your Own Language.')}
                    </h2>
                    <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
                        {t(
                            'Speak a question in Amharic, Afaan Oromoo, or English — AgriVoice answers with verified market data from your region.',
                        )}
                    </p>
                </div>

                <div className="relative mx-auto w-full max-w-md">
                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md sm:p-7">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold tracking-wide text-zinc-400">
                                {t('You')}
                            </span>
                            <p className="rounded-3xl rounded-tl-md bg-white/10 px-4 py-3 text-sm leading-relaxed text-zinc-100">
                                {t("What's the price of teff in Adama today?")}
                            </p>
                        </div>

                        <div className="mt-5 flex items-start gap-3">
                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Mic className="size-4" />
                            </span>
                            <div className="space-y-3">
                                <p className="rounded-3xl rounded-tl-md bg-primary/20 px-4 py-3 text-sm leading-relaxed text-zinc-50">
                                    {t(
                                        "Today's average reported price in Adama is 8,200 Birr per quintal. That's 300 Birr lower than Addis Ababa and 250 Birr higher than Bishoftu. Prices have risen about 5% this week.",
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                                    <span className="rounded-full border border-white/15 px-3 py-1">
                                        {t('Real reported data')}
                                    </span>
                                    <span className="rounded-full border border-white/15 px-3 py-1">
                                        {t('Live confidence')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
