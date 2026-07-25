import { Link } from '@inertiajs/react';
import { Mic } from 'lucide-react';

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
            <div className="relative mx-auto max-w-3xl text-center">
                <h2 className="font-serif text-4xl leading-tight font-semibold tracking-tight text-primary-foreground sm:text-5xl">
                    {t('Ready to sell smarter?')}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
                    {t(
                        'Ask AgriVoice what teff is selling for in Adama right now. In Amharic. Out loud. Get your answer in seconds.',
                    )}
                </p>
                <Button
                    asChild
                    size="lg"
                    className="mt-10 h-14 rounded-full bg-primary-foreground px-10 text-lg font-semibold text-primary shadow-lg hover:bg-primary-foreground/92"
                >
                    <Link href={dashboard()}>
                        <Mic className="size-5" />
                        {t('Ask AgriVoice a Question')}
                    </Link>
                </Button>
                <p className="mt-6 text-sm text-primary-foreground/65">
                    {t(
                        'Works with teff, coffee, maize, wheat, sesame, pulses, and sorghum. Covers Adama, Addis Ababa, and Jimma.',
                    )}
                </p>
            </div>
        </section>
    );
}
