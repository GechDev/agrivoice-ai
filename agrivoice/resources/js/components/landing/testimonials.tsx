import { Quote } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const quotes = [
    {
        text: 'Before AgriVoice I sold teff without knowing Addis prices. Now I ask first, then I decide where to go.',
        name: 'Abebe Tadesse',
        place: 'East Shewa, Oromia',
    },
    {
        text: 'The confidence score matters. When reports are few, I wait. When they are many, I sell with a clearer mind.',
        name: 'Hanna Bekele',
        place: 'Addis Ababa',
    },
    {
        text: 'I report what traders offered me. It takes one sentence, and it helps farmers in Jimma the next morning.',
        name: 'Getachew Alemu',
        place: 'Jimma, Oromia',
    },
];

export default function Testimonials() {
    const t = useTranslations();

    return (
        <section className="av-marketing-shell mt-6 bg-white py-16 sm:mt-8 sm:py-24 dark:bg-transparent">
            <div className="mx-auto max-w-[1208px] px-4 sm:px-6 lg:px-8">
                <AnimateIn className="max-w-2xl">
                    <h2 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.08] font-semibold text-[var(--av-violet)]">
                        {t('What farmers say about us')}
                    </h2>
                    <p className="av-marketing-rule mt-5 text-base leading-relaxed text-black/70 sm:text-lg dark:text-white/70">
                        {t(
                            'Real decisions from people who need prices they can trust.',
                        )}
                    </p>
                </AnimateIn>

                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {quotes.map((quote, index) => (
                        <AnimateIn
                            key={quote.name}
                            index={index}
                            className="flex flex-col rounded-[1.25rem] border border-black/5 bg-[var(--av-sky)]/55 p-6 dark:border-white/10 dark:bg-white/5"
                        >
                            <Quote className="size-7 text-[var(--av-orange)]" />
                            <p className="mt-4 flex-1 text-sm leading-relaxed text-black/80 sm:text-base dark:text-white/80">
                                “{t(quote.text)}”
                            </p>
                            <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/15">
                                <p className="font-semibold text-[var(--av-violet)] dark:text-[var(--av-lime)]">
                                    {quote.name}
                                </p>
                                <p className="text-sm text-black/55 dark:text-white/55">
                                    {t(quote.place)}
                                </p>
                            </div>
                        </AnimateIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
