import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, home, reportPrice } from '@/routes';
import { login as cooperativeLogin } from '@/routes/cooperative';
import { login as portalLogin } from '@/routes/portal';

export default function Hero() {
    const t = useTranslations();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <section className="av-marketing-shell pt-4 sm:pt-5">
            <header className="relative z-20 mx-auto flex w-full max-w-[1208px] items-center justify-between gap-3 px-2 pb-4 sm:px-4">
                <Link href={home()} className="inline-flex items-center">
                    <AppLogo size="md" nameClassName="font-[family-name:var(--font-marketing)] text-lg" />
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    <a
                        href="#services"
                        className="rounded-full px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
                    >
                        {t('Services')}
                    </a>
                    <a
                        href="#markets"
                        className="rounded-full px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
                    >
                        {t('Markets')}
                    </a>
                    <a
                        href="#story"
                        className="rounded-full px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
                    >
                        {t('About')}
                    </a>
                    <Link
                        href={cooperativeLogin()}
                        className="rounded-full px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
                    >
                        {t('Cooperative login')}
                    </Link>
                    <AppearanceToggle />
                    <LanguageSwitcher />
                    <Button
                        asChild
                        className="ml-1 h-10 rounded-full bg-[var(--av-lime)] px-5 font-semibold text-black hover:bg-[color-mix(in_oklab,var(--av-lime)_88%,black)]"
                    >
                        <Link href={dashboard()}>{t('View live prices')}</Link>
                    </Button>
                </nav>

                <div className="flex items-center gap-1 md:hidden">
                    <AppearanceToggle />
                    <LanguageSwitcher />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? t('Close menu') : t('Open menu')}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>
                </div>
            </header>

            {menuOpen ? (
                <div className="relative z-20 mb-3 rounded-2xl bg-white/90 px-3 py-3 shadow-sm backdrop-blur dark:bg-black/40 md:hidden">
                    <div className="flex flex-col gap-1">
                        <a href="#services" className="rounded-xl px-3 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                            {t('Services')}
                        </a>
                        <a href="#markets" className="rounded-xl px-3 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                            {t('Markets')}
                        </a>
                        <a href="#story" className="rounded-xl px-3 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                            {t('About')}
                        </a>
                        <Link href={portalLogin()} className="rounded-xl px-3 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                            {t('Agent portal')}
                        </Link>
                        <Link href={cooperativeLogin()} className="rounded-xl px-3 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                            {t('Cooperative login')}
                        </Link>
                        <Link href={reportPrice()} className="rounded-xl px-3 py-2.5 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                            {t('Report a price')}
                        </Link>
                    </div>
                </div>
            ) : null}

            <div className="relative isolate overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                <img
                    src="/images/landing/hero-field.jpg"
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_color-mix(in_oklab,var(--av-lime)_35%,transparent),_transparent_45%)]" />

                <div className="relative mx-auto flex min-h-[28rem] w-full max-w-[1208px] flex-col justify-end px-5 pb-10 pt-28 sm:min-h-[34rem] sm:px-8 sm:pb-14 lg:min-h-[38rem]">
                    <p className="av-display text-sm font-normal tracking-[0.18em] text-[var(--av-lime)] uppercase sm:text-base">
                        {t('AgriVoice')}
                    </p>
                    <h1 className="mt-3 max-w-3xl text-[clamp(2.4rem,7vw,4.75rem)] leading-[1.02] font-semibold text-white">
                        {t('Your voice guide to')}
                        <br />
                        <span className="text-[var(--av-lime)]">
                            {t('live market prices')}
                        </span>
                    </h1>
                    <p className="av-marketing-rule mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                        {t(
                            'Expert crop prices and market comparisons straight to your phone — in Amharic, Afaan Oromoo, or English.',
                        )}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-[var(--av-lime)] px-8 text-base font-semibold text-black hover:bg-[color-mix(in_oklab,var(--av-lime)_88%,black)]"
                        >
                            <Link href={dashboard()}>{t('View live prices')}</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-12 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
                        >
                            <Link href={reportPrice()}>{t('Report a price')}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
