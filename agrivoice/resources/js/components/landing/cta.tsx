import { Link } from '@inertiajs/react';

import { AnimateIn } from '@/components/motion/animate-in';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, reportPrice } from '@/routes';

export default function CTA() {
    const t = useTranslations();

    return (
        <section className="av-marketing-shell av-marketing-band mt-6 overflow-hidden bg-[var(--av-mint)] py-16 sm:mt-8 sm:py-24">
            <div className="relative mx-auto max-w-[1208px] px-4 text-center sm:px-6 lg:px-8">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-10 right-0 size-56 rounded-full bg-[var(--av-lime)]/35 blur-3xl"
                />
                <AnimateIn variant="scale" className="relative mx-auto max-w-3xl">
                    <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] font-semibold text-[var(--av-violet)]">
                        {t('Ready to farm and sell with better information?')}
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-black/75 sm:text-lg">
                        {t(
                            'Check live prices across Adama, Addis Ababa, and Jimma — or report what farmers were actually offered today.',
                        )}
                    </p>
                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-[var(--av-violet)] px-8 text-base font-semibold text-white hover:bg-[color-mix(in_oklab,var(--av-violet)_88%,black)]"
                        >
                            <Link href={dashboard()}>{t('View live prices')}</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-[var(--av-lime)] px-8 text-base font-semibold text-black hover:bg-[color-mix(in_oklab,var(--av-lime)_88%,black)]"
                        >
                            <Link href={reportPrice()}>{t('Report a price')}</Link>
                        </Button>
                    </div>
                </AnimateIn>
            </div>
        </section>
    );
}
