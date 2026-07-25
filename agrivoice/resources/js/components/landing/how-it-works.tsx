import { useTranslations } from '@/hooks/use-translations';

const steps = [
    {
        number: 1,
        icon: '📱',
        title: 'Open AgriVoice',
        description: 'Launch the app on any basic smartphone — no internet required for core features.',
    },
    {
        number: 2,
        icon: '🎤',
        title: 'Tap the Mic',
        description: 'Press the microphone button and speak your question naturally.',
    },
    {
        number: 3,
        icon: '🌾',
        title: 'Name Your Crop',
        description: 'Say any crop — teff, coffee, maize — and your location.',
    },
    {
        number: 4,
        icon: '⚡',
        title: 'Get Instant Prices',
        description: 'AgriVoice responds with current prices from nearby markets in seconds.',
    },
    {
        number: 5,
        icon: '📈',
        title: 'See the Trends',
        description: 'View how prices have moved over the past week and what direction they are heading.',
    },
    {
        number: 6,
        icon: '📢',
        title: 'Share & Contribute',
        description: 'Report what you sold to help the next farmer — every voice makes the system smarter.',
    },
];

export default function HowItWorks() {
    const t = useTranslations();

    return (
        <section className="bg-muted py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('How It Works')}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'From opening the app to getting your market price — it takes less than 30 seconds.',
                        )}
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="relative rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <span className="absolute right-4 top-4 text-5xl font-bold text-muted/50 select-none">
                                {String(step.number).padStart(2, '0')}
                            </span>
                            <span className="text-3xl">{step.icon}</span>
                            <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                                {t(step.title)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {t(step.description)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
