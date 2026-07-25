import { Link } from '@inertiajs/react';

import AppLogo from '@/components/app-logo';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, home, reportPrice } from '@/routes';
import { login as cooperativeLogin } from '@/routes/cooperative';
import { login as portalLogin } from '@/routes/portal';

export default function Footer() {
    const t = useTranslations();

    const links = [
        { label: 'Live prices', href: dashboard() },
        { label: 'Report a price', href: reportPrice() },
        { label: 'Agent portal', href: portalLogin() },
        { label: 'Cooperative login', href: cooperativeLogin() },
    ];

    return (
        <footer className="border-t border-border bg-foreground px-6 pt-16 pb-10 text-background lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
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
                            'Made for Ethiopian farmers, by people who believe better information means better livelihoods.',
                        )}
                    </p>
                </div>

                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-background/50">
                    {links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="transition-colors hover:text-background"
                        >
                            {t(link.label)}
                        </Link>
                    ))}
                </nav>
            </div>

            <p className="mx-auto mt-12 max-w-7xl text-xs text-background/35">
                {t('Real-time market intelligence, one voice message away.')}
            </p>
        </footer>
    );
}
