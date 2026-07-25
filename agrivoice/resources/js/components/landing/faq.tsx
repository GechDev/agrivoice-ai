import { ChevronDown } from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTranslations } from '@/hooks/use-translations';

const faqItems = [
    {
        q: 'What crops does AgriVoice support right now?',
        a: "We're launching with Teff and Coffee — two of Ethiopia's most important crops — with plans to expand to Maize, Wheat, and Haricot Beans within the first year.",
    },
    {
        q: 'Which markets are covered?',
        a: "Adama, Addis Ababa, and Jimma at launch. We're adding more regions as our reporter network grows.",
    },
    {
        q: 'What languages can I use?',
        a: 'Amharic is fully supported today. Afaan Oromo and English are on our roadmap.',
    },
    {
        q: 'Do I need a smartphone or app to use AgriVoice?',
        a: 'For the hackathon MVP, yes — a smartphone with voice input is enough, no app download or account required. WhatsApp, Telegram, and SMS support are planned so farmers without smartphones can use AgriVoice too.',
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
        a: 'Yes. Just tell AgriVoice what you sold, for how much, and where — for example, "I sold teff today for 8,300 Birr in Adama." Your report helps make the system more accurate for every farmer.',
    },
    {
        q: 'Is AgriVoice free to use?',
        a: 'Yes, during the hackathon MVP and pilot phase, AgriVoice is free for farmers to use.',
    },
    {
        q: 'Who is AgriVoice built for?',
        a: 'Smallholder farmers, traders, and anyone who needs fast, trustworthy, spoken market information — no reading or typing required.',
    },
];

export default function FAQ() {
    const t = useTranslations();

    return (
        <section className="bg-muted/40 px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <h2 className="mb-12 text-center font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                    {t('Frequently Asked Questions')}
                </h2>

                <div className="divide-y divide-border overflow-hidden rounded-[1.5rem] border border-border bg-card">
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
                </div>
            </div>
        </section>
    );
}
