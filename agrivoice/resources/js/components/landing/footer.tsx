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
        <footer className="av-marketing-shell mt-6 mb-4 overflow-hidden rounded-[1.5rem] bg-[var(--av-violet)] px-4 py-14 text-white sm:mb-6 sm:rounded-[2rem] sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1208px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
                <div>
                    <Link href={home()} className="inline-flex items-center">
                        <AppLogo
                            size="lg"
                            onDark
                            nameClassName="font-[family-name:var(--font-marketing)] text-2xl"
                        />
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                        {t(
                            'Made for Ethiopian farmers — so better information becomes better livelihoods.',
                        )}
                    </p>
                </div>

                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
                    {links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="transition-colors hover:text-[var(--av-lime)]"
                        >
                            {t(link.label)}
                        </Link>
                    ))}
                </nav>
            </div>

            <p className="mx-auto mt-12 max-w-[1208px] text-xs text-white/40">
                {t('Real-time market intelligence, one voice message away.')}
            </p>
        </footer>
    );
}
