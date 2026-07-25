import { Link } from '@inertiajs/react';
import { ArrowRight, ChartNoAxesCombined } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, reportPrice } from '@/routes';
import { login as portalLogin } from '@/routes/portal';

export default function CTA() {
    const t = useTranslations();

    return (
        <section className="relative overflow-hidden bg-primary px-6 py-24 lg:px-8">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_oklch(1_0_0/0.16),_transparent_45%)]"
            />
            <AnimateIn
                variant="scale"
                className="relative mx-auto max-w-3xl text-center"
            >
                <h2 className="font-serif text-4xl leading-tight font-semibold tracking-tight text-primary-foreground sm:text-5xl">
                    {t('Ready to see the loop live?')}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
                    {t(
                        'Open the dashboard, enter a price as an agent, and watch confidence, trends, and the map update — the crowd-data moat in one screen.',
                    )}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                        className="h-14 rounded-full bg-primary-foreground px-10 text-lg font-semibold text-primary shadow-lg hover:bg-primary-foreground/92"
                    >
                        <Link href={dashboard()}>
                            <ChartNoAxesCombined className="size-5" />
                            {t('View live dashboard')}
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="h-14 rounded-full border-primary-foreground/30 bg-transparent px-8 text-lg font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                        <Link href={portalLogin()}>
                            {t('Agent portal')}
                            <ArrowRight className="size-5" />
                        </Link>
                    </Button>
                </div>
                <p className="mt-6 text-sm text-primary-foreground/65">
                    <Link
                        href={reportPrice()}
                        className="underline underline-offset-4 hover:text-primary-foreground"
                    >
                        {t('Or report a price as a guest')}
                    </Link>
                </p>
            </AnimateIn>
        </section>
    );
}
