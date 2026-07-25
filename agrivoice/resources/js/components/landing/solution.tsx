import { Mic } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

export default function Solution() {
    const t = useTranslations();

    return (
        <section className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('Just Ask. In Your Own Language.')}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Farmers simply speak a question in Amharic, Afaan Oromoo, or English — and AgriVoice instantly responds with real, verified market data from their region.',
                        )}
                    </p>
                </div>

                <div className="mx-auto mt-14 max-w-2xl">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    {t('Q')}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="inline-block rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-foreground">
                                    {t(
                                        "What's the price of teff in Adama today?",
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                                <Mic className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="inline-block rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3 text-sm text-foreground">
                                    {t(
                                        "Today's average reported price in Adama is 8,200 Birr per quintal. That's 300 Birr lower than Addis Ababa and 250 Birr higher than Bishoftu. Prices have risen about 5% this week and are expected to keep climbing slightly.",
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-6 border-t border-border pt-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="text-primary">●</span>
                                {t('Powered by real reported data')}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-primary">●</span>
                                {t('Updated daily')}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-primary">●</span>
                                {t('Available in 3 languages')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
