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
        q: 'What crops and markets does the demo cover?',
        a: 'Teff and coffee across Adama, Addis Ababa, and Jimma — six live dashboard tiles, ETB per quintal.',
    },
    {
        q: 'Where do prices come from?',
        a: 'Real reports submitted by named agents and participants. AgriVoice aggregates them — it never invents or estimates a price.',
    },
    {
        q: 'What is the “money shot” demo?',
        a: 'An agent enters a price in the portal, it appears on the live list, and the dashboard tile updates in front of the audience — usually within seconds.',
    },
    {
        q: 'How does confidence scoring work?',
        a: 'Recent reports weigh more. Official sources get a higher weight than crowd reports. The tile shows both a confidence % and how many reports back it.',
    },
    {
        q: 'Can bad data poison the dashboard?',
        a: 'Moderators can flag outliers. Flagged reports are excluded from every aggregate — you can demo this live on stage.',
    },
    {
        q: 'Is voice still part of AgriVoice?',
        a: 'Voice is on the roadmap but parked for the hackathon demo. Amharic STT is risky on stage; the crowd-data loop is what proves the business.',
    },
    {
        q: 'Who pays in the business model?',
        a: 'Farmers use it free. Cooperatives, traders, NGOs, and input suppliers pay for dashboards, APIs, and reporting — the organizations that already buy market visibility.',
    },
    {
        q: 'How do agents log in?',
        a: 'Light PIN auth — no full user accounts. Every entry shows who collected it (“entered by Gezachew”).',
    },
];

export default function FAQ() {
    const t = useTranslations();

    return (
        <section id="faq" className="bg-muted/40 px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <AnimateIn>
                    <h2 className="mb-12 text-center font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                        {t('Frequently asked questions')}
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
