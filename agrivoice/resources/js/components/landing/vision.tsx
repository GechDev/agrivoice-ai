import { useTranslations } from '@/hooks/use-translations';

const roadmap = [
    { emoji: '📱', text: 'WhatsApp & Telegram integration' },
    { emoji: '💬', text: 'SMS support for farmers without smartphones' },
    { emoji: '🗣️', text: 'More Ethiopian languages, including Afaan Oromo' },
    { emoji: '🧭', text: 'Sell now vs. wait recommendations' },
    { emoji: '🌡️', text: 'Live price heat maps across regions' },
    { emoji: '🛒', text: 'A direct farmer-to-buyer marketplace' },
];

export default function Vision() {
    const t = useTranslations();

    return (
        <section className="bg-background px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <h2 className="mb-6 text-center text-3xl font-bold tracking-wide lg:text-4xl">
                    {t('Our Vision')}
                </h2>

                <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-muted-foreground">
                    {t(
                        'AgriVoice envisions a future where every farmer in Ethiopia has equal access to the market information they need to thrive. By removing language, literacy, and connectivity barriers, we are building a more transparent and profitable agricultural economy for everyone.',
                    )}
                </p>

                <h3 className="mb-8 mt-16 text-center text-2xl font-semibold tracking-wide">
                    {t("What's next:")}
                </h3>

                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                    {roadmap.map((item) => (
                        <div
                            key={item.text}
                            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                                {item.emoji}
                            </span>
                            <span className="text-sm leading-snug text-foreground">
                                {t(item.text)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
