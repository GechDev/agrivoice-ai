import { Check, Play } from 'lucide-react';
import { useState } from 'react';

import { LANDING_VIDEOS } from '@/components/landing/constants';
import { AnimateIn } from '@/components/motion/animate-in';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

const highlights = [
    'Agent enters a farmer’s teff price in Adama',
    'Live list shows attribution instantly',
    'Dashboard tile updates confidence & trend',
    'Map marker reflects the new report',
    'Moderator can flag an outlier live on stage',
];

export default function Demo() {
    const t = useTranslations();
    const [videoPlaying, setVideoPlaying] = useState(false);

    return (
        <section id="demo" className="scroll-mt-24 bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                    <AnimateIn className="relative overflow-hidden rounded-3xl bg-foreground shadow-2xl ring-1 ring-border">
                        <div className="relative aspect-video w-full">
                            {videoPlaying ? (
                                <iframe
                                    title={t('AgriVoice demo context')}
                                    src={`${LANDING_VIDEOS.demoEmbed}&autoplay=1`}
                                    className="absolute inset-0 size-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <>
                                    <img
                                        src="https://images.unsplash.com/photo-1574943329822-797105873a98?auto=format&fit=crop&w=1600&q=80"
                                        alt=""
                                        aria-hidden
                                        className="absolute inset-0 size-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-foreground/20" />
                                    <div className="relative flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
                                        <Button
                                            type="button"
                                            size="lg"
                                            className="size-20 rounded-full bg-background text-foreground shadow-xl hover:bg-background/90"
                                            aria-label={t('Play video')}
                                            onClick={() => setVideoPlaying(true)}
                                        >
                                            <Play className="ml-1 size-8 fill-current" />
                                        </Button>
                                        <div>
                                            <p className="text-lg font-semibold text-background">
                                                {t('See the market context')}
                                            </p>
                                            <p className="mt-1 text-sm text-background/55">
                                                {t(
                                                    'Ethiopian agriculture — why live price intelligence matters',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </AnimateIn>

                    <AnimateIn delay={80}>
                        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                            {t('Live demo script')}
                        </p>
                        <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                            {t('The ten-second story judges remember')}
                        </h2>
                        <ul className="mt-10 space-y-4">
                            {highlights.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                                >
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                        <Check
                                            className="size-3.5"
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                    {t(item)}
                                </li>
                            ))}
                        </ul>
                    </AnimateIn>
                </div>
            </div>
        </section>
    );
}
