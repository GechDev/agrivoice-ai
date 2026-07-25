import {
    Languages,
    MessageCircle,
    MessagesSquare,
    Navigation,
    ShoppingBag,
    Thermometer,
} from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const roadmap = [
    { icon: MessagesSquare, text: 'WhatsApp & Telegram integration' },
    { icon: MessageCircle, text: 'SMS support for farmers without smartphones' },
    { icon: Languages, text: 'More Ethiopian languages, including Afaan Oromo' },
    { icon: Navigation, text: 'Sell now vs. wait recommendations' },
    { icon: Thermometer, text: 'Live price heat maps across regions' },
    { icon: ShoppingBag, text: 'A direct farmer-to-buyer marketplace' },
];

export default function Vision() {
    const t = useTranslations();

    return (
        <section className="bg-muted/50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimateIn className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('Our Vision')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t(
                            'Closing the information gap, one conversation at a time',
                        )}
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            "To become Ethiopia's real-time agricultural market intelligence platform — closing the information gap between farmers and traders.",
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
