import { EyeOff, Languages, MapPinned, TrendingDown } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const problems = [
    {
        icon: EyeOff,
        title: 'No visibility into current prices',
        description:
            'Most farmers have no reliable way to know what their crops are worth right now.',
    },
    {
        icon: MapPinned,
        title: 'No easy way to compare nearby markets',
        description:
            'A fair price in one town might be a loss in another — and there is no side-by-side view.',
    },
    {
        icon: TrendingDown,
        title: 'No sense of whether prices are rising or falling',
        description:
            'Without trends, farmers sell when they need cash, not when the market is best.',
    },
    {
        icon: Languages,
        title: 'Market data in the wrong format and language',
        description:
            'Existing tools are text-heavy, rarely updated, and hard to use in the languages farmers speak.',
    },
];

export default function Problem() {
    const t = useTranslations();

    return (
        <section className="relative overflow-hidden bg-background py-24 sm:py-32">
            <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
                <AnimateIn className="max-w-md">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('The problem')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('Farmers Are Selling Blind')}
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Every day, farmers across Ethiopia decide where and when to sell without the information they need.',
                        )}
                    </p>
                </AnimateIn>

                <ul className="divide-y divide-border border-y border-border">
                    {problems.map((problem, index) => {
                        const Icon = problem.icon;

                        return (
                            <AnimateIn
                                key={problem.title}
                                as="li"
                                index={index}
                                className="flex gap-5 py-7 first:pt-0 last:pb-0 sm:gap-6 sm:py-8"
                            >
                                <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Icon
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {t(problem.title)}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {t(problem.description)}
                                    </p>
                                </div>
                            </AnimateIn>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
