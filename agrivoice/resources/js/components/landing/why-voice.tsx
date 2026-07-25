import {
    Database,
    Globe2,
    HandCoins,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const features = [
    {
        icon: Database,
        title: 'Data moat',
        description:
            'Every reported price makes the next aggregate smarter — a flywheel competitors cannot copy overnight.',
    },
    {
        icon: HandCoins,
        title: 'Hyper-relevant',
        description:
            'Teff and coffee, Adama, Addis Ababa, Jimma — ETB per quintal, everywhere.',
    },
    {
        icon: TrendingUp,
        title: 'Live & comparable',
        description:
            'Confidence scores, trends, and side-by-side tiles — built for the projector and the field.',
    },
    {
        icon: ShieldCheck,
        title: 'Honest by design',
        description:
            'Never fabricated prices. Flag outliers. Show report counts so users judge reliability.',
    },
    {
        icon: Globe2,
        title: 'Built for Ethiopia',
        description:
            'Amharic, Afaan Oromoo, and English — local markets, local crops, local agents.',
    },
];

export default function WhyVoice() {
    const t = useTranslations();

    return (
        <section className="bg-muted/60 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimateIn className="max-w-2xl">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('Why AgriVoice')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('Market intelligence that compounds')}
                    </h2>
                    <p className="mt-5 text-lg text-muted-foreground">
                        {t(
                            'Voice access is on the roadmap. Today we prove the engine investors care about: attributable crowd data at scale.',
                        )}
                    </p>
                </AnimateIn>

                <div className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <AnimateIn
                                key={feature.title}
                                as="article"
                                index={index}
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
                            </AnimateIn>
                        );
                    })}
                    <AnimateIn
                        as="article"
                        index={features.length}
                        className="flex items-end bg-primary p-8 text-primary-foreground sm:col-span-2 lg:col-span-1"
                    >
                        <div>
                            <p className="font-serif text-3xl leading-tight font-semibold">
                                {t('Report. Aggregate. Decide.')}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                                {t(
                                    'The loop that turns Ethiopian market gossip into actionable intelligence.',
                                )}
                            </p>
                        </div>
                    </AnimateIn>
                </div>
            </div>
        </section>
    );
}
