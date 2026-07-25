import {
    Globe2,
    HandCoins,
    Mic2,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

const features = [
    {
        icon: Mic2,
        title: 'Voice-First',
        description:
            'Built for farmers, not smartphone experts — no reading or typing required',
    },
    {
        icon: HandCoins,
        title: 'Hyper-Relevant',
        description: 'Real prices for real crops in real nearby markets',
    },
    {
        icon: Sparkles,
        title: 'Community-Powered',
        description:
            'Every farmer who reports a price makes the system smarter for everyone',
    },
    {
        icon: ShieldCheck,
        title: 'Honest by Design',
        description:
            'AgriVoice never invents numbers — every answer is grounded in real reported data',
    },
    {
        icon: Globe2,
        title: 'Built for Ethiopia',
        description:
            'Local languages, local markets, local crops — teff, coffee, maize, wheat, sesame, pulses, and sorghum.',
    },
];

export default function WhyVoice() {
    const t = useTranslations();

    return (
        <section className="bg-muted/60 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('Why AgriVoice')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('Designed for the way farmers actually work')}
                    </h2>
                </div>

                <div className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                key={feature.title}
                                className="bg-card p-8 transition-colors hover:bg-accent/40"
                            >
                                <Icon
                                    className="size-6 text-primary"
                                    strokeWidth={1.75}
                                />
                                <h3 className="mt-5 text-lg font-semibold text-foreground">
                                    {t(feature.title)}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(feature.description)}
                                </p>
                            </article>
                        );
                    })}
                    <article className="flex items-end bg-primary p-8 text-primary-foreground sm:col-span-2 lg:col-span-1">
                        <div>
                            <p className="font-serif text-3xl leading-tight font-semibold">
                                {t('Speak. Hear. Decide.')}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                                {t(
                                    'Market intelligence that fits in a spoken sentence.',
                                )}
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
