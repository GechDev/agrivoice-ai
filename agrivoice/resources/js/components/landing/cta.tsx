import { Link } from '@inertiajs/react';
import { ChartNoAxesCombined } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard } from '@/routes';

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
                    {t('Ready to sell smarter?')}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
                    {t(
                        'See live market prices with confidence scores across Adama, Addis Ababa, and Jimma — then report what farmers were actually offered.',
                    )}
                </p>
                <Button
                    asChild
                    size="lg"
                    className="mt-10 h-14 rounded-full bg-primary-foreground px-10 text-lg font-semibold text-primary shadow-lg hover:bg-primary-foreground/92"
                >
                    <Link href={dashboard()}>
                        <ChartNoAxesCombined className="size-5" />
                        {t('View live prices')}
                    </Link>
                </Button>
                <p className="mt-6 text-sm text-primary-foreground/65">
                    {t(
                        'Works with teff, coffee, maize, wheat, sesame, pulses, and sorghum. Covers Adama, Addis Ababa, and Jimma.',
                    )}
                </p>
            </AnimateIn>
        </section>
    );
}
