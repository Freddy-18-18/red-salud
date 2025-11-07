import { HeroSection } from "@/components/sections/hero-section";
import { InfiniteSpecialtiesScroll } from "@/components/sections/infinite-specialties-scroll";
import { FeaturesSection } from "@/components/sections/features-section";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Landing Page Principal
 * 
 * Esta página muestra el contenido principal del sitio.
 * Incluye Hero, especialidades y características.
 */
export default function RootPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <InfiniteSpecialtiesScroll />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  );
}
