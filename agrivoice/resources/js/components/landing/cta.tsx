import { useTranslations } from '@/hooks/use-translations';

export default function CTA() {
    const t = useTranslations();

    return (
        <section className="bg-primary px-6 py-24 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-wide text-primary-foreground lg:text-4xl">
                    {t('Ready to sell smarter?')}
                </h2>

                <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                    {t(
                        'Ask AgriVoice what Teff is selling for in Adama right now. In Amharic. Out loud. Get your answer in seconds.',
                    )}
                </p>

                <button
                    type="button"
                    className="inline-flex items-center gap-3 rounded-full bg-primary-foreground px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-transform hover:scale-105"
                >
                    <svg
                        className="size-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 18.75a6 6 0 0 0 6-6v-1m-6 7a6 6 0 0 1-6-6v-1m6 7v3m-3 0h6M5.25 8.25a6.75 6.75 0 0 1 13.5 0v1.5a6.75 6.75 0 0 1-13.5 0v-1.5Z"
                        />
                    </svg>
                    {t('Ask AgriVoice a Question')}
                </button>

                <p className="mt-6 text-sm text-primary-foreground/60">
                    {t(
                        'Works with Teff and Coffee. Covers Adama, Addis Ababa, and Jimma.',
                    )}
                </p>
            </div>
        </section>
    );
}
