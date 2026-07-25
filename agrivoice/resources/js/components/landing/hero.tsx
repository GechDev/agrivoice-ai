import { Link } from '@inertiajs/react';
import { Mic } from 'lucide-react';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { home, login, register } from '@/routes';

export default function Hero() {
    const t = useTranslations();

    return (
        <section className="relative overflow-hidden bg-background">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href={home()} className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-primary">
                        {t('AgriVoice')}
                    </span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link
                        href={login()}
                        className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-block"
                    >
                        {t('Log in')}
                    </Link>
                    <Link
                        href={register()}
                        className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-block"
                    >
                        {t('Register')}
                    </Link>
                    <LanguageSwitcher />
                </nav>
            </header>

            <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge
                        variant="secondary"
                        className="mb-6 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide"
                    >
                        {t('Voice-Powered Market Intelligence')}
                    </Badge>

                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        {t('Know Your Price. Sell With Confidence.')}
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'AgriVoice gives Ethiopian farmers real-time market prices in their own language — just by speaking. No smartphone skills needed.',
                        )}
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="rounded-full px-8 text-base font-semibold">
                            {t('Try AgriVoice Now')}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full px-8 text-base font-semibold"
                        >
                            {t('Watch How It Works')}
                        </Button>
                    </div>
                </div>

                <div className="mt-20 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background dark:from-primary/20 dark:via-primary/10">
                    <div className="flex flex-col items-center gap-6 px-6 py-16 text-center sm:px-12 lg:px-16">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                            <Mic className="h-10 w-10 text-primary" />
                        </div>
                        <p className="max-w-lg text-sm italic text-muted-foreground">
                            {t('"What\'s the price of teff in Adama today?"')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Badge
                                variant="outline"
                                className="rounded-full border-primary/30 text-xs"
                            >
                                {t('Amharic')}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="rounded-full border-primary/30 text-xs"
                            >
                                {t('Afaan Oromoo')}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="rounded-full border-primary/30 text-xs"
                            >
                                {t('English')}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
