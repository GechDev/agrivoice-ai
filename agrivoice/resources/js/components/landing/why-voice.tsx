import { useTranslations } from '@/hooks/use-translations';

const features = [
    {
        icon: '🗣️',
        title: 'Voice-First',
        description:
            'Built for farmers, not smartphone experts — no reading or typing required.',
    },
    {
        icon: '🌾',
        title: 'Hyper-Relevant',
        description:
            'Real prices for real crops in real nearby markets.',
    },
    {
        icon: '📡',
        title: 'Community-Powered',
        description:
            'Every farmer who reports a price makes the system smarter for everyone.',
    },
    {
        icon: '🎯',
        title: 'Honest by Design',
        description:
            'AgriVoice never invents numbers — every answer is grounded in real reported data.',
    },
    {
        icon: '🌍',
        title: 'Built for Ethiopia',
        description:
            'Local languages, local markets, local crops — starting with Teff and Coffee in Adama, Addis Ababa, and Jimma.',
    },
];

export default function WhyVoice() {
    const t = useTranslations();

    return (
        <section className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('Why AgriVoice')}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'AgriVoice reimagines market intelligence from the ground up — designed for the way farmers actually live and work.',
                        )}
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                <span className="text-xl">{feature.icon}</span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                                {t(feature.title)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {t(feature.description)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
