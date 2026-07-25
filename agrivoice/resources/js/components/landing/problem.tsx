import { EyeOff, Languages, MapPinned, TrendingDown } from 'lucide-react';

import { LANDING_IMAGES } from '@/components/landing/constants';
import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const problems = [
    {
        icon: EyeOff,
        title: 'No visibility into current prices',
        description:
            'Most farmers sell on hearsay — a neighbor’s guess from last week, not today’s market.',
    },
    {
        icon: MapPinned,
        title: 'No easy way to compare nearby markets',
        description:
            'Teff might pay 9,400 ETB in Addis and 8,600 in Adama. Without side-by-side data, farmers leave money on the table.',
    },
    {
        icon: TrendingDown,
        title: 'No sense of whether prices are rising or falling',
        description:
            'Without trends, farmers sell when they need cash — not when the market rewards patience.',
    },
    {
        icon: Languages,
        title: 'Market data in the wrong format and language',
        description:
            'ECX bulletins and NGO sheets are text-heavy, stale, and rarely in the languages farmers speak daily.',
    },
];

export default function Problem() {
    const t = useTranslations();

    return (
        <section className="relative overflow-hidden bg-background py-24 sm:py-32">
            <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:px-8">
                <AnimateIn className="relative">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('The problem')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('Ethiopia’s farmers are selling blind')}
                    </h2>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Information asymmetry is a business problem — traders with data win, smallholders without it accept whatever is offered at the gate.',
                        )}
                    </p>
                    <div className="relative mt-10 overflow-hidden rounded-3xl shadow-xl ring-1 ring-border">
                        <img
                            src={LANDING_IMAGES.farmer}
                            alt={t('Farmer in field')}
                            className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
                            loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/90 to-transparent p-6 pt-16">
                            <p className="text-sm font-medium text-background">
                                {t(
                                    '80%+ of Ethiopia’s farmers are smallholders — yet market intelligence remains fragmented and outdated.',
                                )}
                            </p>
                        </div>
                    </div>
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
