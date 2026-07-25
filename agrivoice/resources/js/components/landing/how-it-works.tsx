import {
    ClipboardCheck,
    LayoutDashboard,
    ListOrdered,
    LogIn,
    Radio,
} from 'lucide-react';

import { AnimateIn } from '@/components/motion/animate-in';
import { useTranslations } from '@/hooks/use-translations';

const steps = [
    {
        number: '01',
        icon: LogIn,
        title: 'Agent signs in',
        description:
            'Named agents authenticate with a PIN — every price is attributed (“entered by Nati”).',
    },
    {
        number: '02',
        icon: ClipboardCheck,
        title: 'Price is entered',
        description:
            'Crop, market, ETB per quintal, reporter type — validated and stored in seconds.',
    },
    {
        number: '03',
        icon: ListOrdered,
        title: 'Live list updates',
        description:
            'The report appears newest-first on the public feed. Moderators can flag outliers.',
    },
    {
        number: '04',
        icon: LayoutDashboard,
        title: 'Dashboard recalculates',
        description:
            'Confidence %, weighted average, trend arrow, and map marker refresh within seconds.',
    },
    {
        number: '05',
        icon: Radio,
        title: 'Everyone sees the same truth',
        description:
            'Judges, cooperatives, and farmers watch one live picture — polling every 2–3 seconds.',
    },
];

export default function HowItWorks() {
    const t = useTranslations();

    return (
        <section
            id="how-it-works"
            className="scroll-mt-24 bg-background py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AnimateIn className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                        {t('How it works')}
                    </p>
                    <h2 className="mt-4 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl">
                        {t('The demo loop that proves the moat')}
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                        {t(
                            'One agent, one price, one live update — the crowd-data flywheel on stage in under ten seconds.',
                        )}
                    </p>
                </AnimateIn>

                <ol className="relative mt-16 grid gap-8 md:grid-cols-5">
                    <div
                        aria-hidden
                        className="absolute top-12 right-[10%] left-[10%] hidden h-px bg-border md:block"
                    />
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <AnimateIn
                                key={step.number}
                                as="li"
                                index={index}
                                className="relative flex flex-col items-center text-center"
                            >
                                <span className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                                    <Icon className="size-6" strokeWidth={1.75} />
                                </span>
                                <span className="mt-4 font-serif text-2xl font-semibold text-primary/30">
                                    {step.number}
                                </span>
                                <h3 className="mt-2 text-base font-semibold text-foreground">
                                    {t(step.title)}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(step.description)}
                                </p>
                            </AnimateIn>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
