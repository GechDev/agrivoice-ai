import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import { PRODUCT_SLICES } from '@/components/landing/constants';
import { AnimateIn } from '@/components/motion/animate-in';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard } from '@/routes';
import { login as portalLogin } from '@/routes/portal';

export default function ProductShowcase() {
    const t = useTranslations();

    return (
        <section
            id="product"
            className="scroll-mt-24 bg-muted/40 py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimateIn className="max-w-2xl">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('The product')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('Three slices, one live market picture')}
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'Built by four teammates end-to-end — each slice owns its React pages and Laravel services, stitched together on shared reports data.',
                        )}
                    </p>
                </AnimateIn>

                <div className="mt-16 grid gap-8 lg:grid-cols-3">
                    {PRODUCT_SLICES.map((slice, index) => (
                        <AnimateIn
                            key={slice.title}
                            as="article"
                            index={index}
                            className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={slice.image}
                                    alt={t(slice.title)}
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    loading="lazy"
                                />
                                <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                                    {t(slice.tag)}
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-foreground">
                                    {t(slice.title)}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(slice.description)}
                                </p>
                            </div>
                        </AnimateIn>
                    ))}
                </div>

                <AnimateIn delay={120} className="mt-12 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-full">
                        <Link href={dashboard()}>
                            {t('Open live dashboard')}
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-full"
                    >
                        <Link href={portalLogin()}>
                            {t('Try agent portal')}
                        </Link>
                    </Button>
                </AnimateIn>
            </div>
        </section>
    );
}
