import { ChevronDown } from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTranslations } from '@/hooks/use-translations';

const faqItems = [
    {
        q: 'What crops does AgriVoice support right now?',
        a: 'We support teff, coffee, maize, wheat, sesame, pulses, and sorghum — among Ethiopia\'s most important crops — across Adama, Addis Ababa, and Jimma.',
    },
    {
        q: 'Which markets are covered?',
        a: "Adama, Addis Ababa, and Jimma at launch. We're adding more regions as our reporter network grows.",
    },
    {
        q: 'What languages can I use?',
        a: 'Amharic, Afaan Oromoo, and English are supported in the web app today. More spoken-language coverage is on our roadmap.',
    },
    {
        q: 'Do I need a smartphone or app to use AgriVoice?',
        a: 'For the hackathon MVP, yes — a smartphone browser is enough, no app download required. WhatsApp, Telegram, and SMS support are planned so farmers without smartphones can use AgriVoice too.',
    },
    {
        q: 'Where do the prices come from?',
        a: 'Prices come from real reports submitted by farmers, traders, and market participants. AgriVoice never invents or estimates a price — it only ever repeats and summarizes real reported data.',
    },
    {
        q: 'How accurate is the information?',
        a: "Every price comes with a confidence score and a count of how many reports it's based on, so you always know how reliable an answer is before you act on it.",
    },
    {
        q: 'How does the price prediction work?',
        a: "We use simple, transparent forecasting (like moving averages and recent trend analysis) to estimate whether prices are likely to rise, fall, or hold steady over the coming days. It's a short-term guide, not a guarantee.",
    },
    {
        q: 'Can I contribute price data myself?',
        a: 'Yes. Use Report a price to enter what you sold, for how much, and where. Your report helps make the system more accurate for every farmer.',
    },
    {
        q: 'Is AgriVoice free to use?',
        a: 'Yes, during the hackathon MVP and pilot phase, AgriVoice is free for farmers to use.',
    },
    {
        q: 'Who is AgriVoice built for?',
        a: 'Smallholder farmers, traders, and anyone who needs fast, trustworthy market information — starting with web and voice-first experiences.',
    },
];

export default function FAQ() {
    const t = useTranslations();

    return (
        <section className="bg-muted/40 px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <AnimateIn>
                    <h2 className="mb-12 text-center font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                        {t('Frequently Asked Questions')}
                    </h2>
                </AnimateIn>

                <AnimateIn
                    delay={80}
                    className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card"
                >
                    {faqItems.map((item) => (
                        <Collapsible key={item.q} className="group">
                            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/30 sm:text-base">
                                <span>{t(item.q)}</span>
                                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                                    {t(item.a)}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </AnimateIn>
            </div>
        </section>
    );
}
