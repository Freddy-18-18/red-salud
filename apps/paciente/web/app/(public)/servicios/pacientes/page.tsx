import type { Metadata } from "next";
import { PacientesHeroSection } from "@/components/sections/pacientes/PacientesHeroSection";
import { PacientesPainPoints } from "@/components/sections/pacientes/PacientesPainPoints";
import { PacientesProductShowcase } from "@/components/sections/pacientes/PacientesProductShowcase";
import { PacientesHowItWorks } from "@/components/sections/pacientes/PacientesHowItWorks";
import { PacientesTrustSection } from "@/components/sections/pacientes/PacientesTrustSection";
import { PacientesFinalCTA } from "@/components/sections/pacientes/PacientesFinalCTA";

export const metadata: Metadata = {
  title: "Para Pacientes - Red-Salud | Tu salud, simplificada",
  description: "Consultas médicas online, historial digital, recetas electrónicas y videoconsultas con médicos verificados. 100% gratis para pacientes.",
  keywords: "consultas médicas online venezuela, telemedicina gratis, médicos verificados, historial médico digital, videoconsulta, recetas digitales",
  openGraph: {
    title: "Para Pacientes - Red-Salud | Tu salud, simplificada",
    description: "Conecta con médicos verificados, agenda citas y gestiona tu salud desde tu celular. 100% gratis.",
    type: "website",
  },
};

export default function PacientesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero - 100% gratis + beneficios */}
      <PacientesHeroSection />

      {/* Pain Points - Problemas que resolvemos */}
      <PacientesPainPoints />

      {/* Product Showcase - Demo interactiva */}
      <PacientesProductShowcase />

      {/* How It Works - 3 pasos simples */}
      <PacientesHowItWorks />

      {/* Trust - Seguridad y médicos verificados */}
      <PacientesTrustSection />

      {/* Final CTA - Registro gratis */}
      <PacientesFinalCTA />
    </main>
  );
}
