import type { Metadata } from "next";
import { SegurosHero } from "@/components/sections/seguros/SegurosHero";
import { SegurosFeatures } from "@/components/sections/seguros/SegurosFeatures";
import { SegurosCTA } from "@/components/sections/seguros/SegurosCTA";

export const metadata: Metadata = {
  title: "Gestión para Aseguradoras - Red-Salud | Siniestralidad Inteligente",
  description: "Transforma tu relación con clínicas y pacientes. Autorizaciones en tiempo real, control de costos y liquidación digital de siniestros para compañías de seguros.",
  keywords: "seguro salud venezuela, carta aval digital, gestión siniestros, red clínicas venezuela, Red-Salud seguros",
};

export default function SegurosPage() {
  return (
    <main className="min-h-screen bg-background">
      <SegurosHero />
      <SegurosFeatures />
      <SegurosCTA />
    </main>
  );
}


