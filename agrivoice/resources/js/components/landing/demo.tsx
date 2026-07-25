import { Play } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

export default function Demo() {
    const t = useTranslations();

    return (
        <section className="bg-muted px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <h2 className="mb-4 text-center text-3xl font-bold tracking-wide lg:text-4xl">
                    {t('See It In Action')}
                </h2>

                <div className="mx-auto mt-10 max-w-4xl">
                    <div className="relative aspect-video overflow-hidden rounded-[--radius] bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 shadow-[0_0_30px_0px_hsl(0_0%_77%_/_0.45)]">
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex size-20 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-105">
                                <Play className="ml-1 size-10 fill-green-700 text-green-700" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <div className="flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
                            <span className="text-sm font-medium text-white/80">
                                {t('Demo Preview')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                        t('Ask a question in Amharic'),
                        t('Watch AgriVoice fetch live prices'),
                        t('Hear a spoken, natural-language answer'),
                        t('See the market map light up'),
                        t('Watch a new crowdsourced report appear in real time'),
                    ].map((feature) => (
                        <div
                            key={feature}
                            className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-4 shadow-sm"
                        >
                            <span className="flex size-2 shrink-0 rounded-full bg-primary" />
                            <span className="text-sm leading-snug text-foreground">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
