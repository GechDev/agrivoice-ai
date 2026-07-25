import { ShieldCheck } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

export default function Trust() {
    const t = useTranslations();

    return (
        <section className="bg-muted px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-[--radius] border border-primary/20 bg-background p-8 shadow-[0_0_30px_0px_hsl(142_71%_45%_/_0.12)] lg:p-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="size-8 text-primary" />
                        </div>

                        <h2 className="mb-4 text-3xl font-bold tracking-wide lg:text-4xl">
                            {t('Built On Trust, Not Guesswork')}
                        </h2>

                        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                            {t(
                                'Every price, prediction, and recommendation from AgriVoice starts with real data submitted by farmers and verified by the community. We layer on transparent forecasting so you always know the difference between what we know, what we expect, and what we are still learning. No black boxes, no hidden fees — just honest information you can act on.',
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
