import { useTranslations } from '@/hooks/use-translations';

const problems = [
    {
        icon: '📉',
        title: 'No visibility into current prices',
        description:
            'Most farmers have no reliable way to know what their crops are worth right now. They rely on word of mouth or wait for a buyer to name a price.',
    },
    {
        icon: '🗺️',
        title: 'No easy way to compare nearby markets',
        description:
            'A fair price in one town might be a loss in another. Without side-by-side market comparisons, farmers accept whatever offer comes first.',
    },
    {
        icon: '📊',
        title: 'No sense of whether prices are rising or falling',
        description:
            'Without price trends, farmers cannot time their sales. They sell when they need cash, not when the market is best — often leaving money on the table.',
    },
    {
        icon: '📵',
        title: 'Market data that is outdated, text-based, and often in the wrong language',
        description:
            'Existing services are hard to navigate, rarely updated, and assume literacy in languages many farmers do not speak fluently.',
    },
];

export default function Problem() {
    const t = useTranslations();

    return (
        <section className="bg-muted py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('Farmers Are Selling Blind')}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Millions of smallholder farmers in Ethiopia go to market without knowing what their crops are worth. The result is a system that favors the buyer — every single time.',
                        )}
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <span className="text-3xl">{problem.icon}</span>
                            <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                                {t(problem.title)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {t(problem.description)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mx-auto mt-12 max-w-2xl text-center">
                    <p className="text-base italic text-muted-foreground">
                        {t(
                            'AgriVoice was built to change this — putting real-time, localized market intelligence directly into the hands of every farmer, in the language they speak.',
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
}
