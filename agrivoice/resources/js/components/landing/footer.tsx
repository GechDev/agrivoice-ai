import { Link } from '@inertiajs/react';

import { useTranslations } from '@/hooks/use-translations';
import { home } from '@/routes';

const links = [
    { label: 'About', href: '#' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Partners', href: '#' },
    { label: 'Contact', href: '#' },
];

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="border-t border-border bg-zinc-950 px-6 pt-16 pb-10 text-zinc-50 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
                <div>
                    <Link
                        href={home()}
                        className="font-serif text-3xl font-semibold tracking-tight text-primary"
                    >
                        {t('AgriVoice')}
                    </Link>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
                        {t(
                            'Made for Ethiopian farmers, by people who believe better information means better livelihoods.',
                        )}
                    </p>
                </div>

                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="transition-colors hover:text-zinc-100"
                        >
                            {t(link.label)}
                        </a>
                    ))}
                </nav>
            </div>

            <p className="mx-auto mt-12 max-w-7xl text-xs text-zinc-600">
                {t('Real-time market intelligence, one voice message away.')}
            </p>
        </footer>
    );
}
