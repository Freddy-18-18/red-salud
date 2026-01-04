"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Heart,
  Shield,
  Zap,
  Target,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Users,
  BrainCircuit,
  Rocket,
  MessageCircle,
  Mail,
  ArrowDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { AUTH_ROUTES } from "@/lib/constants";

// Import the DNA visual component and manifesto section
import {
  DNAHelixVisual,
  ManifestoVariantB,
  ArchitectVariantC,
  VisionVariantD,
  CapacidadesVariantD,
  ContactoVariantB,
  BannerVariantD
} from "@/components/nosotros";

// Typography Constants
const TYPOGRAPHY = {
  h1: "text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]",
  h2: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6",
  h3: "text-xl font-semibold mb-3",
  lead: "text-xl md:text-2xl text-muted-foreground font-light leading-relaxed",
  body: "text-base md:text-lg text-muted-foreground leading-relaxed",
  quote: "text-2xl md:text-3xl font-medium italic leading-relaxed text-foreground/90",
};

// Design System Constants
const GRID = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
  section: "py-24 md:py-32 relative overflow-hidden",
};

export default function NosotrosPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* 1. Hero Section: La Revelación (with DNA Visual) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-0 bg-background">
        {/* Abstract Background - Enhanced */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.08),rgba(255,255,255,0))]" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px] opacity-30" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08] z-0" />
        </div>

        <div className={`${GRID.container} relative z-10 w-full`}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT COLUMN: Narrative Text */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center lg:text-left pt-20 lg:pt-0 order-2 lg:order-1"
            >
              <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start mb-6">
                <Badge variant="outline" className="px-4 py-1.5 text-sm uppercase tracking-widest border-primary/20 bg-primary/5 backdrop-blur-sm">
                  Nuestra Razón de Ser
                </Badge>
              </motion.div>

              <motion.h1 variants={fadeInUp} className={`${TYPOGRAPHY.h1} mb-6`}>
                Del caos nació <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400">
                  nuestro propósito
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className={`${TYPOGRAPHY.lead} text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0`}>
                No somos una corporación distante. Somos la respuesta a la vulnerabilidad, nacida de vivir en carne propia lo que significa buscar salud en Venezuela.
                <br className="hidden md:block" />
                <span className="text-foreground font-medium mt-2 block">Transformamos la frustración en tecnología humana.</span>
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="h-14 px-8 rounded-full shadow-lg shadow-primary/20 text-lg group">
                  <a href="#manifiesto">
                    Conoce la Historia
                    <ArrowDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-14 px-8 rounded-full text-lg hover:bg-primary/5">
                  <a href={AUTH_ROUTES.REGISTER}>
                    Unirme a la red
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: DNA Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[550px] md:h-[650px] lg:h-[700px] flex items-center justify-center order-1 lg:order-2"
            >
              <DNAHelixVisual />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. El Manifiesto: El Origen (Storytelling) - Variante B: Split Screen */}
      <ManifestoVariantB />

      {/* 3. El Arquitecto: Perfil Honesto - Variante C: Minimalist Card */}
      <ArchitectVariantC />

      {/* 4. La Visión 2030 - Variante D: Manifiesto Minimalista */}
      <VisionVariantD />

      {/* 5. Capacidades y Transparencia - Variante D: Statement Minimalista */}
      <CapacidadesVariantD />

      {/* 6. Contacto y Soporte - Variante B: Centered CTA */}
      <ContactoVariantB />

      {/* 7. Banner Final - Variante D: Statement Minimalista */}
      <BannerVariantD />

    </div>
  );
}
