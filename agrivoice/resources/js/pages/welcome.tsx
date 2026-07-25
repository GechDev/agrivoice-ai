import { Head } from '@inertiajs/react';

import Hero from '@/components/landing/hero';
import Problem from '@/components/landing/problem';
import Solution from '@/components/landing/solution';
import HowItWorks from '@/components/landing/how-it-works';
import WhyVoice from '@/components/landing/why-voice';
import Demo from '@/components/landing/demo';
import Vision from '@/components/landing/vision';
import Trust from '@/components/landing/trust';
import FAQ from '@/components/landing/faq';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function Welcome() {
    return (
        <>
            <Head title="AgriVoice" />

            <div className="flex min-h-screen flex-col">
                <Hero />
                <Problem />
                <Solution />
                <HowItWorks />
                <WhyVoice />
                <Demo />
                <Vision />
                <Trust />
                <FAQ />
                <CTA />
                <Footer />
            </div>
        </>
    );
}
