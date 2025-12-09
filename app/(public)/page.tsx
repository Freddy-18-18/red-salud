import { HeroSection } from "@/components/sections/hero-section";
import { SpecialtiesTicker } from "@/components/sections/specialties-ticker";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { FeaturesSection } from "@/components/sections/features-section";
import { ImpactSection } from "@/components/sections/impact-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { FAQSection } from "@/components/sections/faq-section";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { FeaturedDoctors } from "@/components/sections/featured-doctors";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SpecialtiesTicker />
      <HowItWorksSection />
      <FeaturedDoctors />
      <ImpactSection />
      <TechnologySection />
      <FeaturesSection />
      <FAQSection />
      <section className="py-24 bg-gradient-to-br from-muted/50 via-background to-muted/30 dark:from-muted/20 dark:via-background dark:to-muted/10 relative overflow-hidden">
        {/* Fondo dinámico */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Empieza <span className="gradient-text">ahora</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Crea tu cuenta o inicia sesión para agendar tu próxima cita y gestionar tu salud desde un solo lugar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:scale-[1.02] transition-all duration-300">
              <a href={AUTH_ROUTES.REGISTER}>Crear cuenta gratis</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 glass-card border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 hover:scale-[1.02] transition-all duration-300">
              <a href={AUTH_ROUTES.LOGIN}>Iniciar sesión</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
