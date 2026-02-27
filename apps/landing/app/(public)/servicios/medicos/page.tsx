import type { Metadata } from "next";
import { MedicosHeroSection } from "@/components/sections/medicos/MedicosHeroSection";
import { PainPointsSection } from "@/components/sections/medicos/PainPointsSection";
import { ProductShowcase } from "@/components/sections/medicos/ProductShowcase";
import { ValueProposition } from "@/components/sections/medicos/ValueProposition";
import { MedicosHowItWorks } from "@/components/sections/medicos/MedicosHowItWorks";
import { TrustSection } from "@/components/sections/medicos/TrustSection";
import { MedicosFinalCTA } from "@/components/sections/medicos/MedicosFinalCTA";

export const metadata: Metadata = {
  title: "Para Médicos - Red-Salud | Tu consultorio digital sin límites",
  description: "Plataforma integral para médicos venezolanos. Agenda inteligente, telemedicina HD, recetas digitales con firma electrónica, y más. Comienza 30 días gratis.",
  keywords: "telemedicina venezuela, médicos digitales, consultorio virtual, videoconsultas médicas, agenda médica online, recetas digitales venezuela, SACS verificación",
  openGraph: {
    title: "Para Médicos - Red-Salud | Tu consultorio digital sin límites",
    description: "Transforma tu práctica médica. Agenda inteligente, telemedicina y recetas digitales en una sola plataforma.",
    type: "website",
  },
};

export default function MedicosPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero - Captura atención */}
      <MedicosHeroSection />

      {/* Pain Points - Problemas que resolvemos */}
      <PainPointsSection />

      {/* Product Showcase - Demo interactiva */}
      <ProductShowcase />

      {/* Value Proposition - Por qué Red-Salud */}
      <ValueProposition />

      {/* How It Works - 4 pasos */}
      <MedicosHowItWorks />

      {/* Trust - Seguridad y confianza */}
      <TrustSection />

      {/* Final CTA - Registro con oferta */}
      <MedicosFinalCTA />
    </main>
  );
}
