import { CloudSun, Landmark, Wheat } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const cards = [
    {
        icon: Wheat,
        title: 'Staple crops first',
        description:
            'Practical coverage for teff, coffee, maize, wheat, sesame, pulses, and sorghum — the crops that move Ethiopian livelihoods.',
    },
    {
        icon: Landmark,
        title: 'Priority markets',
        description:
            'Start with Adama, Addis Ababa, and Jimma. Compare offers before you travel, so a fair price in one town does not become a loss in another.',
    },
    {
        icon: CloudSun,
        title: 'Confidence with every answer',
        description:
            'AgriVoice never invents a number. Every price comes with report counts and confidence so you know how reliable the signal is.',
    },
];

export default function Practical() {
    const t = useTranslations();

    return (
        <section
            id="markets"
            className="av-marketing-shell av-marketing-band-right mt-6 scroll-mt-24 bg-[var(--av-teal)] py-16 text-white sm:mt-8 sm:py-24"
        >
            <div className="mx-auto max-w-[1208px] px-4 sm:px-6 lg:px-8">
                <AnimateIn className="max-w-3xl">
                    <h2 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.08] font-semibold">
                        {t('Practical market information you can act on')}
                    </h2>
                    <p className="mt-5 max-w-2xl border-l-8 border-[var(--av-lime)] pl-4 text-base leading-relaxed text-white/85 sm:text-lg">
                        {t(
                            'Curated crop prices, nearby market comparisons, and honest confidence scores — ready when you need to decide.',
                        )}
                    </p>
                </AnimateIn>

                <div className="mt-14 grid gap-5 md:grid-cols-3">
                    {cards.map((card, index) => {
                        const Icon = card.icon;

                        return (
                            <AnimateIn
                                key={card.title}
                                index={index}
                                className="rounded-[1.25rem] bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/15 sm:p-7"
                            >
                                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[var(--av-lime)] text-black">
                                    <Icon className="size-5" strokeWidth={1.75} />
                                </span>
                                <h3 className="mt-5 text-xl font-semibold">
                                    {t(card.title)}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                                    {t(card.description)}
                                </p>
                            </AnimateIn>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
