import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { PainPoints } from '@/components/landing/pain-points';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Stats } from '@/components/landing/stats';
import { Pricing } from '@/components/landing/pricing';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <FeaturesGrid />
        <HowItWorks />
        <Stats />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
