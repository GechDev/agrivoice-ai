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
        a: "We support teff, coffee, maize, wheat, sesame, pulses, and sorghum — among Ethiopia's most important crops — across Adama, Addis Ababa, and Jimma.",
    },
    {
        q: 'Which markets are covered?',
        a: 'Adama, Addis Ababa, and Jimma at launch. We are actively onboarding partners to expand coverage across all major Ethiopian market towns.',
    },
    {
        q: 'What languages can I use?',
        a: 'Amharic is fully supported today. English is available for the interface. Afaan Oromo and additional regional languages are on our near-term roadmap.',
    },
    {
        q: 'Do I need a smartphone or app to download?',
        a: 'For the hackathon MVP, yes — AgriVoice is a voice-enabled web app accessible from any modern smartphone browser. No app store or download required. SMS and USSD channels are coming soon for feature phone users.',
    },
    {
        q: 'Where do the prices come from?',
        a: 'Prices come from real reports submitted by farmers, verified by community moderators, and supplemented with public market data where available.',
    },
    {
        q: 'How accurate is the information?',
        a: 'Every price comes with a confidence score based on recency, report volume, and verification status so you can make informed decisions.',
    },
    {
        q: 'How does the price prediction work?',
        a: 'We use simple, transparent forecasting based on historical patterns and current market trends. Every prediction clearly shows its confidence level and the data it is based on.',
    },
    {
        q: 'Can I contribute price data myself?',
        a: 'Yes. Just tell AgriVoice what you sold or observed, and your report helps the entire community. Contributors earn reputation scores that lend weight to their future submissions.',
    },
    {
        q: 'Is AgriVoice free to use?',
        a: 'Yes, during the hackathon MVP and pilot phase. We are exploring sustainable models to keep core market information free for smallholder farmers long-term.',
    },
    {
        q: 'Who is AgriVoice built for?',
        a: "Smallholder farmers, traders, and anyone involved in Ethiopia's agricultural supply chain who needs timely, trustworthy market information to make better decisions.",
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
