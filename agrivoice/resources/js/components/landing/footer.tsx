import { Link } from '@inertiajs/react';

import AppLogo from '@/components/app-logo';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, home, reportPrice } from '@/routes';
import { login as cooperativeLogin } from '@/routes/cooperative';
import { login as portalLogin } from '@/routes/portal';

export default function Footer() {
    const t = useTranslations();

    const links = [
        { label: 'Live dashboard', href: dashboard() },
        { label: 'Report a price', href: reportPrice() },
        { label: 'Agent portal', href: portalLogin() },
        { label: 'Cooperative login', href: cooperativeLogin() },
    ];

    const anchors = [
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Product', href: '#product' },
        { label: 'Business model', href: '#business' },
        { label: 'FAQ', href: '#faq' },
    ];

    return (
        <footer className="border-t border-border bg-foreground px-6 pt-16 pb-10 text-background lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <div>
                    <Link href={home()} className="inline-flex items-center">
                        <AppLogo
                            size="lg"
                            onDark
                            nameClassName="font-serif text-3xl"
                        />
                    </Link>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/60">
                        {t(
                            'Real-time, confidence-scored crop prices for Ethiopian farmers — powered by crowd-reported data, not guesswork.',
                        )}
                    </p>
                </div>

                <nav>
                    <p className="text-xs font-semibold tracking-wide text-background/40 uppercase">
                        {t('Product')}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-background/55">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="transition-colors hover:text-background"
                                >
                                    {t(link.label)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <nav>
                    <p className="text-xs font-semibold tracking-wide text-background/40 uppercase">
                        {t('Learn more')}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-background/55">
                        {anchors.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="transition-colors hover:text-background"
                                >
                                    {t(link.label)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <p className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-8 text-xs text-background/35">
                {t(
                    'AgriVoice · Teff & coffee · Adama, Addis Ababa, Jimma · ETB per quintal',
                )}
            </p>
        </footer>
    );
}
