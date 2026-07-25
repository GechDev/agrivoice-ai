import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

export default function Story() {
    const t = useTranslations();

    return (
        <section
            id="story"
            className="av-marketing-shell av-marketing-band mt-6 scroll-mt-24 bg-[var(--av-orange-soft)] py-16 sm:mt-8 sm:py-24"
        >
            <div className="mx-auto grid max-w-[1208px] gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
                <AnimateIn>
                    <h2 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.08] font-semibold text-[var(--av-violet)]">
                        {t('Who we are and why we do this')}
                    </h2>
                    <p className="av-marketing-rule mt-5 text-base leading-relaxed text-black/75 sm:text-lg dark:text-white/75">
                        {t(
                            'Learn about the people, values, and story behind AgriVoice.',
                        )}
                    </p>
                    <div className="mt-8 space-y-5 text-sm leading-relaxed text-black/75 sm:text-base dark:text-white/75">
                        <p>
                            {t(
                                'Every harvest season, Ethiopian farmers face the same hard question: what is my crop worth today, and where should I sell it? Too often the answer depends on rumour, a long walk to market, or a trader who knows more than the farmer.',
                            )}
                        </p>
                        <p>
                            {t(
                                'AgriVoice started from that gap. We built a voice-first market intelligence service so farmers can ask for prices in their own language, hear an honest answer grounded in real reports, and contribute what they were offered — making the next farmer better informed.',
                            )}
                        </p>
                        <p>
                            {t(
                                'We want a future where accurate, timely market information is as close as a spoken sentence — helping farmers raise incomes and negotiate with confidence.',
                            )}
                        </p>
                    </div>
                </AnimateIn>

                <AnimateIn delay={80} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[1.25rem] bg-white p-6 shadow-sm dark:bg-white/10">
                        <p className="text-sm font-semibold tracking-[0.14em] text-[var(--av-orange)] uppercase">
                            {t('Our mission')}
                        </p>
                        <p className="mt-3 text-base leading-relaxed text-black/80 dark:text-white/80">
                            {t(
                                'Close the information gap between farmers and markets with voice, local languages, and verified prices.',
                            )}
                        </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[var(--av-violet)] p-6 text-white">
                        <p className="text-sm font-semibold tracking-[0.14em] text-[var(--av-lime)] uppercase">
                            {t('Our values')}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/85">
                            <li>{t('Honest data — never invented prices')}</li>
                            <li>{t('Voice-first for real farm life')}</li>
                            <li>{t('Built with Ethiopian languages and markets')}</li>
                            <li>{t('Community reports that lift everyone')}</li>
                        </ul>
                    </div>
                    <div className="overflow-hidden rounded-[1.25rem] sm:col-span-2 lg:col-span-1">
                        <img
                            src="/images/landing/voice.jpg"
                            alt=""
                            className="aspect-[16/10] w-full object-cover"
                        />
                    </div>
                </AnimateIn>
            </div>
        </section>
    );
}
