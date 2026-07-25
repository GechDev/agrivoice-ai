import {
    Megaphone,
    Mic,
    Smartphone,
    TrendingUp,
    Wheat,
    Zap,
} from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const steps = [
    {
        number: '01',
        icon: Smartphone,
        title: 'Speak Your Question',
        description: 'Ask about any crop, in any supported market, in your own language.',
    },
    {
        number: '02',
        icon: Mic,
        title: 'AI Understands Your Intent',
        description: "AgriVoice identifies the crop, the location, and what you're really asking.",
    },
    {
        number: '03',
        icon: Wheat,
        title: 'Real-Time Market Lookup',
        description:
            'We pull the latest reported prices, confidence scores, and nearby market comparisons.',
    },
    {
        number: '04',
        icon: Zap,
        title: 'Smart Trend Prediction',
        description:
            'A short-term forecast tells you if prices are likely to rise, fall, or hold steady.',
    },
    {
        number: '05',
        icon: TrendingUp,
        title: 'Natural Voice Response',
        description:
            'AgriVoice speaks the answer back — clearly, simply, and honestly.',
    },
    {
        number: '06',
        icon: Megaphone,
        title: 'Give Back to the Community',
        description:
            'Report your own sale price with a sentence, and help make the data better for every farmer.',
    },
];

export default function HowItWorks() {
    const t = useTranslations();

    return (
        <section
            id="how-it-works"
            className="scroll-mt-20 bg-background py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimateIn className="max-w-2xl">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('How It Works')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('From question to price in seconds')}
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Six simple steps. No forms. No guesswork. Just voice and verified market data.',
                        )}
                    </p>
                </AnimateIn>

                <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <AnimateIn
                                key={step.number}
                                as="li"
                                index={index}
                                className="relative"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                                        <Icon
                                            className="size-5"
                                            strokeWidth={1.75}
                                        />
                                    </span>
                                    <span className="font-serif text-3xl font-semibold text-primary/25">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-foreground">
                                    {t(step.title)}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    {t(step.description)}
                                </p>
                            </AnimateIn>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
