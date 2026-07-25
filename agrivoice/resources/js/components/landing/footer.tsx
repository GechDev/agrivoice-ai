import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';

const links = [
    { label: 'About', href: '#' },
    { label: 'How It Works', href: '#' },
    { label: 'For Partners', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Report a Price', href: '#' },
];

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="bg-background px-6 pt-16 pb-8 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div>
                        <span className="text-xl font-bold tracking-wide text-primary">
                            {t('AgriVoice')}
                        </span>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Market intelligence, spoken simply, for every Ethiopian farmer.',
                            )}
                        </p>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        {links.map((link) => (
                            <span
                                key={link.label}
                                className="cursor-pointer transition-colors hover:text-foreground"
                            >
                                {t(link.label)}
                            </span>
                        ))}
                    </nav>
                </div>

                <Separator className="my-8" />

                <p className="text-center text-xs text-muted-foreground/60">
                    {t(
                        'Empowering Ethiopian farmers with voice-first market intelligence.',
                    )}
                </p>
            </div>
        </footer>
    );
}
