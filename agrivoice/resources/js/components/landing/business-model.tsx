import { Building2, Globe2, LineChart, Sprout } from 'lucide-react';

import { LANDING_IMAGES, REVENUE_STREAMS } from '@/components/landing/constants';
import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const icons = [Building2, LineChart, Globe2, Sprout];

export default function BusinessModel() {
    const t = useTranslations();

    return (
        <section
            id="business"
            className="scroll-mt-24 bg-background py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
                    <AnimateIn>
                        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                            {t('Business model')}
                        </p>
                        <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                            {t('Free for farmers. Valuable for everyone upstream.')}
                        </h2>
                        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                            {t(
                                'The hackathon demo proves the data loop. The business scales by selling intelligence to the organizations that already pay for market visibility — cooperatives, traders, NGOs, and input suppliers.',
                            )}
                        </p>
                        <div className="relative mt-10 overflow-hidden rounded-3xl shadow-xl ring-1 ring-border">
                            <img
                                src={LANDING_IMAGES.cooperative}
                                alt={t('Cooperative planning')}
                                className="aspect-video w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </AnimateIn>

                    <ul className="grid gap-4 sm:grid-cols-2">
                        {REVENUE_STREAMS.map((stream, index) => {
                            const Icon = icons[index] ?? Building2;

                            return (
                                <AnimateIn
                                    key={stream.title}
                                    as="li"
                                    index={index}
                                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/20"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </span>
                                    <h3 className="mt-4 text-base font-semibold text-foreground">
                                        {t(stream.title)}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {t(stream.description)}
                                    </p>
                                </AnimateIn>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
