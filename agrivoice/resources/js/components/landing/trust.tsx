import { ShieldCheck } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

export default function Trust() {
    const t = useTranslations();

    return (
        <section className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <AnimateIn variant="scale">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShieldCheck className="size-7" strokeWidth={1.75} />
                    </span>
                    <h2 className="mt-8 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('Built On Trust, Not Guesswork')}
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'AgriVoice never fabricates a price. Every answer comes from real reported market data — with a confidence score and report count — so farmers always know how reliable the information is.',
                        )}
                    </p>
                </AnimateIn>
            </div>
        </section>
    );
}
