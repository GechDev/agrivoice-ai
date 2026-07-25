import { Head } from '@inertiajs/react';

import BusinessModel from '@/components/landing/business-model';
import CTA from '@/components/landing/cta';
import Demo from '@/components/landing/demo';
import FAQ from '@/components/landing/faq';
import Footer from '@/components/landing/footer';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/how-it-works';
import Problem from '@/components/landing/problem';
import ProductShowcase from '@/components/landing/product-showcase';
import Solution from '@/components/landing/solution';
import StatsBar from '@/components/landing/stats-bar';
import Trust from '@/components/landing/trust';
import Vision from '@/components/landing/vision';
import WhyVoice from '@/components/landing/why-voice';

export default function Welcome() {
    return (
        <>
            <Head title="AgriVoice — Live crop market intelligence" />

            <div className="flex min-h-screen flex-col">
                <Hero />
                <StatsBar />
                <Problem />
                <Solution />
                <ProductShowcase />
                <HowItWorks />
                <Demo />
                <WhyVoice />
                <BusinessModel />
                <Vision />
                <Trust />
                <FAQ />
                <CTA />
                <Footer />
            </div>
        </>
    );
}
