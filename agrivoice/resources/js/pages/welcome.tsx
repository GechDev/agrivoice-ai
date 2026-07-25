import { Head } from '@inertiajs/react';

import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';
import Hero from '@/components/landing/hero';
import Practical from '@/components/landing/practical';
import Services from '@/components/landing/services';
import Story from '@/components/landing/story';
import Testimonials from '@/components/landing/testimonials';

export default function Welcome() {
    return (
        <>
            <Head title="AgriVoice" />

            <div className="av-marketing min-h-screen overflow-x-hidden antialiased selection:bg-[var(--av-lime)]/40 selection:text-black">
                <Hero />
                <Services />
                <Practical />
                <Story />
                <Testimonials />
                <CTA />
                <Footer />
            </div>
        </>
    );
}
