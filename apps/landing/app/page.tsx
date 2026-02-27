import { HeroSection } from "@/components/sections/hero-section";
import { SpecialtiesTicker } from "@/components/sections/specialties-ticker";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { ImpactSection } from "@/components/sections/impact-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SpecialtiesTicker />
      <HowItWorksSection />
      <ImpactSection />
      <TechnologySection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
