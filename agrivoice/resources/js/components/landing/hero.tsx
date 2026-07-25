import { Link } from '@inertiajs/react';
import { ArrowRight, Mic } from 'lucide-react';

import { AppearanceToggle } from '@/components/appearance-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, home, login } from '@/routes';

export default function Hero() {
    const t = useTranslations();

    return (
        <section className="relative isolate min-h-[100svh] overflow-hidden bg-background text-foreground">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_85%_20%,_var(--primary)_0%,_transparent_45%)] opacity-[0.07] dark:opacity-[0.12]"
            />
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.55\'/%3E%3C/svg%3E")',
                }}
            />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 flex w-full items-center justify-center md:w-[58%] md:justify-end md:pr-[8%]"
            >
                <div className="relative flex size-[min(78vw,28rem)] items-center justify-center animate-agrivoice-drift md:size-[min(42vw,30rem)]">
                    <span className="absolute inset-[8%] rounded-full border border-foreground/10 animate-agrivoice-wave dark:border-white/15" />
                    <span className="absolute inset-[8%] rounded-full border border-foreground/8 animate-agrivoice-wave [animation-delay:1s] dark:border-white/10" />
                    <span className="absolute inset-[8%] rounded-full border border-foreground/8 animate-agrivoice-wave [animation-delay:2s] dark:border-white/10" />
                    <span className="absolute inset-[22%] rounded-full bg-primary/20 blur-2xl animate-agrivoice-breathe" />
                    <span className="relative flex size-28 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_50px_color-mix(in_oklch,var(--primary)_35%,transparent)] sm:size-32">
                        <Mic className="size-12 sm:size-14" strokeWidth={1.5} />
                    </span>
                </div>
            </div>

            <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                <Link
                    href={home()}
                    className="text-lg font-semibold tracking-tight text-primary"
                >
                    {t('AgriVoice')}
                </Link>
                <nav className="flex items-center gap-1 sm:gap-2">
                    <Link
                        href={login()}
                        className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
                    >
                        {t('Log in')}
                    </Link>
                    <AppearanceToggle />
                    <LanguageSwitcher />
                </nav>
            </header>

            <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col justify-center px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <div className="max-w-xl animate-agrivoice-rise md:max-w-2xl">
                    <p className="font-serif text-[clamp(3.25rem,9vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.03em] text-foreground">
                        {t('AgriVoice')}
                    </p>
                    <h1 className="mt-6 max-w-lg font-serif text-[clamp(1.6rem,3.4vw,2.35rem)] leading-snug font-medium text-foreground/90">
                        {t('Know Your Price. Sell With Confidence.')}
                    </h1>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {t(
                            'AgriVoice gives Ethiopian farmers real-time market prices in their own language — just by speaking.',
                        )}
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full px-8 text-base font-semibold"
                        >
                            <Link href={dashboard()}>
                                {t('Try AgriVoice Now')}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-12 rounded-full px-6 text-base font-medium"
                        >
                            <a href="#how-it-works">{t('Watch How It Works')}</a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
