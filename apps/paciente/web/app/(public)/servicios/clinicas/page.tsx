import type { Metadata } from "next";
import { ClinicasHero } from "@/components/sections/clinicas/ClinicasHero";
import { ClinicasFeatures } from "@/components/sections/clinicas/ClinicasFeatures";
import { ClinicasHowItWorks } from "@/components/sections/clinicas/ClinicasHowItWorks";
import { ClinicasCTA } from "@/components/sections/clinicas/ClinicasCTA";

export const metadata: Metadata = {
  title: "Clínicas y Centros Médicos - Red-Salud | Gestión Hospitalaria 360°",
  description: "Sistema integral de gestión para clínicas venezolanas. Optimización de personal, multi-sucursal, reportes avanzados y telemedicina institucional.",
  keywords: "gestión de clínicas venezuela, sistema hospitalario, software médico empresarial, administración de centros médicos, Red-Salud clínicas",
};

export default function ClinicasPage() {
  return (
    <main className="min-h-screen bg-background">
      <ClinicasHero />
      <ClinicasFeatures />
      <ClinicasHowItWorks />
      <ClinicasCTA />
    </main>
  );
}



