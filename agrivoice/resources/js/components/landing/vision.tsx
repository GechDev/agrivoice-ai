import {
    Languages,
    Map,
    MessageCircle,
    MessagesSquare,
    Mic,
    ShoppingBag,
} from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const roadmap = [
    { icon: Mic, text: 'Voice queries in Amharic & Afaan Oromoo (parked for demo)' },
    { icon: MessagesSquare, text: 'WhatsApp & Telegram price bots' },
    { icon: MessageCircle, text: 'SMS for farmers without smartphones' },
    { icon: Map, text: 'Regional heat maps & sell-now vs wait guidance' },
    { icon: ShoppingBag, text: 'Buyer bids folded into market picture' },
    { icon: Languages, text: 'More crops and markets as the reporter network grows' },
];

export default function Vision() {
    const t = useTranslations();

    return (
        <section className="bg-muted/50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimateIn className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('Our vision')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t("Ethiopia's real-time agricultural market intelligence layer")}
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Start with teff and coffee in three cities. Compound the crowd-data moat until every farmer — however they connect — can ask “what’s my price?” and get an honest answer.',
                        )}
                    </p>
                </AnimateIn>

                <ul className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2">
                    {roadmap.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <AnimateIn
                                key={item.text}
                                as="li"
                                index={index}
                                className="flex items-center gap-4 rounded-2xl bg-card/80 px-5 py-4 ring-1 ring-border/80"
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon
                                        className="size-5"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <span className="text-sm font-medium text-foreground sm:text-base">
                                    {t(item.text)}
                                </span>
                            </AnimateIn>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
