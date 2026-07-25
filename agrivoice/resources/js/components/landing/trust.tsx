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
                        {t('Built on trust, not guesswork')}
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'AgriVoice never fabricates a price. Every tile shows real reported data — with confidence %, report count, and agent attribution — so farmers and buyers know exactly how much to trust the number.',
                        )}
                    </p>
                    <dl className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-3">
                        {[
                            { k: '0', label: 'Invented prices' },
                            { k: '100%', label: 'Attributed reports' },
                            { k: 'Live', label: 'Outlier flagging' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-border bg-card px-4 py-5"
                            >
                                <dt className="font-serif text-3xl font-semibold text-primary">
                                    {item.k}
                                </dt>
                                <dd className="mt-1 text-xs font-medium text-muted-foreground">
                                    {t(item.label)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </AnimateIn>
            </div>
        </section>
    );
}
