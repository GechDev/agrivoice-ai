import { ArrowRightLeft, BarChart3, ShieldCheck, Users } from 'lucide-react';

import { LANDING_IMAGES } from '@/components/landing/constants';
import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const pillars = [
    {
        icon: Users,
        title: 'Crowd-reported prices',
        description: 'Agents and farmers submit real sale prices — attributed, timestamped, auditable.',
    },
    {
        icon: BarChart3,
        title: 'Confidence-scored aggregates',
        description: 'Weighted averages with report counts so users know when to trust a tile.',
    },
    {
        icon: ArrowRightLeft,
        title: 'Live comparison & trends',
        description: 'Six tiles across teff and coffee, three cities, refreshed every few seconds.',
    },
    {
        icon: ShieldCheck,
        title: 'Outlier moderation',
        description: 'Flag bad data before it poisons the picture — anti-poisoning built into the loop.',
    },
];

export default function Solution() {
    const t = useTranslations();

    return (
        <section className="relative overflow-hidden bg-foreground py-24 text-background sm:py-32">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,_var(--primary)_0%,_transparent_45%)] opacity-[0.14]"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
                    <AnimateIn delay={80} variant="scale">
                        <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
                            <img
                                src={LANDING_IMAGES.coffee}
                                alt={t('Coffee harvest')}
                                className="aspect-[4/3] w-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 sm:p-8">
                                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                                    <div>
                                        <p className="text-xs text-white/60">
                                            {t('Coffee · Jimma')}
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            16,840 ETB
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground">
                                        {t('87% confidence')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
                                    <div>
                                        <p className="text-xs text-white/60">
                                            {t('Teff · Addis Ababa')}
                                        </p>
                                        <p className="text-2xl font-semibold">
                                            9,400 ETB
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-100">
                                        {t('↑ 4.2% this week')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </AnimateIn>

                    <AnimateIn>
                        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                            {t('The solution')}
                        </p>
                        <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
                            {t('A crowd-data engine — not another static bulletin')}
                        </h2>
                        <p className="mt-6 max-w-lg text-lg leading-relaxed text-background/65">
                            {t(
                                'AgriVoice turns scattered reports into a live, comparable, confidence-scored price picture. Voice is on the roadmap; the demo proves the data loop that becomes the moat.',
                            )}
                        </p>

                        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                            {pillars.map((pillar, index) => {
                                const Icon = pillar.icon;

                                return (
                                    <li
                                        key={pillar.title}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-4 av-enter"
                                        style={
                                            {
                                                '--av-delay': `${index * 70}ms`,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <Icon className="size-5 text-primary" />
                                        <h3 className="mt-3 text-sm font-semibold">
                                            {t(pillar.title)}
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-background/55">
                                            {t(pillar.description)}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </AnimateIn>
                </div>
            </div>
        </section>
    );
}
