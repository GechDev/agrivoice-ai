import { Link } from '@inertiajs/react';
import { ArrowRight, Play, TrendingUp } from 'lucide-react';

import { LANDING_IMAGES, LANDING_VIDEOS } from '@/components/landing/constants';
import LandingNav from '@/components/landing/nav';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, reportPrice } from '@/routes';

export default function Hero() {
    const t = useTranslations();

    return (
        <section className="relative isolate min-h-[100svh] overflow-hidden bg-foreground text-background">
            <img
                src={LANDING_IMAGES.hero}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover"
                fetchPriority="high"
            />
            <video
                aria-hidden
                autoPlay
                loop
                muted
                playsInline
                poster={LANDING_IMAGES.hero}
                className="absolute inset-0 size-full object-cover opacity-40 mix-blend-overlay"
            >
                <source src={LANDING_VIDEOS.hero} type="video/mp4" />
            </video>
            <div
                aria-hidden
                className="landing-hero-gradient absolute inset-0"
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_30%,_oklch(0.72_0.13_145/0.25),_transparent_55%)]"
            />

            <LandingNav variant="overlay" />

            <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-4 pt-28 pb-20 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pt-24">
                <div className="max-w-2xl animate-agrivoice-rise">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 uppercase backdrop-blur-sm">
                        <TrendingUp className="size-3.5 text-primary" />
                        {t('Real-time crop market intelligence')}
                    </p>
                    <h1 className="mt-6 font-serif text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.05] font-semibold tracking-[-0.02em]">
                        {t('Turn market gossip into a live price picture farmers can trust.')}
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/72">
                        {t(
                            'AgriVoice aggregates crowd-reported teff and coffee prices across Adama, Addis Ababa, and Jimma — with confidence scores, trends, and agent attribution. The moat is the data loop, not the AI.',
                        )}
                    </p>
                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full px-8 text-base font-semibold"
                        >
                            <Link href={dashboard()}>
                                {t('View live dashboard')}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-12 rounded-full border-white/25 bg-white/5 px-6 text-base font-medium text-white hover:bg-white/10 hover:text-white"
                        >
                            <a href="#demo">
                                <Play className="size-4" />
                                {t('Watch the loop')}
                            </a>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="lg"
                            className="h-12 rounded-full px-6 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            <Link href={reportPrice()}>
                                {t('Report a price')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative mt-14 hidden lg:mt-0 lg:block">
                    <div className="landing-glass relative overflow-hidden rounded-3xl p-6 shadow-2xl">
                        <img
                            src={LANDING_IMAGES.market}
                            alt={t('Ethiopian grain market')}
                            className="aspect-[4/3] w-full rounded-2xl object-cover"
                        />
                        <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-background/95 p-4 text-foreground shadow-xl backdrop-blur-md">
                            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                                {t('The money shot')}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {t(
                                    'An agent enters a price → it hits the live list → the dashboard tile updates in front of everyone.',
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="absolute -top-4 -right-4 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg">
                        {t('ETB / quintal')}
                    </div>
                </div>
            </div>
        </section>
    );
}
