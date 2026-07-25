import { BUSINESS_STATS } from '@/components/landing/constants';
import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

export default function StatsBar() {
    const t = useTranslations();

    return (
        <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {BUSINESS_STATS.map((stat, index) => (
                    <AnimateIn
                        key={stat.label}
                        index={index}
                        className="landing-stat-glow rounded-2xl border border-border bg-card px-6 py-5 shadow-md"
                    >
                        <p className="font-serif text-4xl font-semibold tracking-tight text-primary">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                            {t(stat.label)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {t(stat.detail)}
                        </p>
                    </AnimateIn>
                ))}
            </div>
        </section>
    );
}
