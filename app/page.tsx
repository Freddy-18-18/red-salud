import { HeroSection } from "@/components/sections/hero-section";
import { InfiniteSpecialtiesScroll } from "@/components/sections/infinite-specialties-scroll";
import { FeaturesSection } from "@/components/sections/features-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <InfiniteSpecialtiesScroll />
      <FeaturesSection />
    </>
  );
}
