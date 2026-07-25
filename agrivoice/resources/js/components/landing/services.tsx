import { Link } from '@inertiajs/react';
import { ArrowRight, Mic, MapPinned, Megaphone } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, reportPrice } from '@/routes';
import { login as portalLogin } from '@/routes/portal';

const services = [
    {
        icon: Mic,
        title: 'Ask for a price by voice',
        description:
            'Speak a question in Amharic, Afaan Oromoo, or English. AgriVoice finds the crop, market, and latest verified reports for you.',
        href: dashboard(),
        cta: 'Try live prices',
        image: '/images/landing/voice.jpg',
    },
    {
        icon: MapPinned,
        title: 'Compare nearby markets',
        description:
            'See what teff, maize, wheat, coffee, sesame, pulses, and sorghum are fetching in Adama, Addis Ababa, and Jimma — side by side.',
        href: dashboard(),
        cta: 'Open the market map',
        image: '/images/landing/market.jpg',
    },
    {
        icon: Megaphone,
        title: 'Report what you were offered',
        description:
            'Share a real sale price in one sentence. Every report strengthens the community signal for farmers like you.',
        href: reportPrice(),
        cta: 'Report a price',
        image: '/images/landing/crops.jpg',
    },
];

export default function Services() {
    const t = useTranslations();

    return (
        <section
            id="services"
            className="av-marketing-shell av-marketing-band mt-6 scroll-mt-24 bg-[var(--av-orange-wash)] py-16 sm:mt-8 sm:py-24"
        >
            <div className="mx-auto max-w-[1208px] px-4 sm:px-6 lg:px-8">
                <AnimateIn className="max-w-3xl">
                    <h2 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.08] font-semibold text-[var(--av-violet)]">
                        {t('AgriVoice market services')}
                    </h2>
                    <p className="av-marketing-rule mt-5 max-w-2xl text-base leading-relaxed text-black/75 sm:text-lg dark:text-white/75">
                        {t(
                            'Live crop prices, market comparisons, and community reports — built so Ethiopian farmers can sell with clearer information.',
                        )}
                    </p>
                </AnimateIn>

                <div className="mt-14 space-y-16 lg:space-y-24">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        const reverse = index % 2 === 1;

                        return (
                            <AnimateIn
                                key={service.title}
                                index={index}
                                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${reverse ? 'lg:[&>figure]:order-2' : ''}`}
                            >
                                <figure className="overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src={service.image}
                                        alt=""
                                        className="aspect-[4/3] w-full object-cover"
                                    />
                                </figure>
                                <div className={reverse ? 'lg:pr-6' : 'lg:pl-2'}>
                                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--av-violet)] text-white">
                                        <Icon className="size-5" strokeWidth={1.75} />
                                    </span>
                                    <h3 className="mt-5 text-2xl font-semibold text-[var(--av-violet)] sm:text-3xl">
                                        {t(service.title)}
                                    </h3>
                                    <p className="mt-4 max-w-md text-base leading-relaxed text-black/70 dark:text-white/70">
                                        {t(service.description)}
                                    </p>
                                    <Link
                                        href={service.href}
                                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--av-orange)] transition-colors hover:text-[var(--av-violet)]"
                                    >
                                        {t(service.cta)}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </AnimateIn>
                        );
                    })}
                </div>

                <AnimateIn className="mt-14 flex flex-wrap gap-3">
                    <Link
                        href={portalLogin()}
                        className="rounded-full bg-[var(--av-violet)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        {t('Agent portal')}
                    </Link>
                    <a
                        href="#markets"
                        className="rounded-full border border-[var(--av-violet)]/30 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--av-violet)] transition-colors hover:bg-white"
                    >
                        {t('Discover our farming services')}
                    </a>
                </AnimateIn>
            </div>
        </section>
    );
}
