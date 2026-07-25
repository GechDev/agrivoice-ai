import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { dashboard, home, reportPrice } from '@/routes';
import { login as cooperativeLogin } from '@/routes/cooperative';
import { login as portalLogin } from '@/routes/portal';

type LandingNavProps = {
    /** Transparent over hero imagery; solid once scrolled */
    variant?: 'overlay' | 'solid';
};

export default function LandingNav({ variant = 'overlay' }: LandingNavProps) {
    const t = useTranslations();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 48);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const solid = variant === 'solid' || scrolled;

    const navLinks = [
        { label: 'Live prices', href: dashboard() },
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Product', href: '#product' },
        { label: 'Business', href: '#business' },
    ];

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                solid
                    ? 'border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md'
                    : 'bg-transparent',
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href={home()} className="inline-flex items-center">
                    <AppLogo size="md" />
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t(link.label)}
                        </a>
                    ))}
                    <Link
                        href={portalLogin()}
                        className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t('Agent portal')}
                    </Link>
                </nav>

                <div className="flex items-center gap-1 sm:gap-2">
                    <AppearanceToggle />
                    <LanguageSwitcher />
                    <Button
                        asChild
                        size="sm"
                        className="hidden rounded-full sm:inline-flex"
                    >
                        <Link href={dashboard()}>{t('View live prices')}</Link>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full lg:hidden"
                        aria-expanded={menuOpen}
                        aria-label={
                            menuOpen ? t('Close menu') : t('Open menu')
                        }
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </Button>
                </div>
            </div>

            {menuOpen ? (
                <div className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                                onClick={() => setMenuOpen(false)}
                            >
                                {t(link.label)}
                            </a>
                        ))}
                        <Link
                            href={portalLogin()}
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                        >
                            {t('Agent portal')}
                        </Link>
                        <Link
                            href={cooperativeLogin()}
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                        >
                            {t('Cooperative login')}
                        </Link>
                        <Link
                            href={reportPrice()}
                            className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                        >
                            {t('Report a price')}
                        </Link>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
