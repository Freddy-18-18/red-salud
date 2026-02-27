import type { Metadata } from "next";
import { LaboratoriosHero } from "@/components/sections/laboratorios/LaboratoriosHero";
import { LaboratoriosFeatures } from "@/components/sections/laboratorios/LaboratoriosFeatures";
import { LaboratoriosCTA } from "@/components/sections/laboratorios/LaboratoriosCTA";

export const metadata: Metadata = {
  title: "Laboratorios Clínicos - Red-Salud | Tecnología para Diagnóstico",
  description: "Digitaliza la entrega de resultados, gestiona citas para toma de muestras y automatiza el flujo de trabajo de tu laboratorio con Red-Salud.",
  keywords: "laboratorios venezuela, resultados online, sistema para laboratorios, gestión de análisis clínicos, Red-Salud laboratorios",
};

export default function LaboratoriosPage() {
  return (
    <main className="min-h-screen bg-background">
      <LaboratoriosHero />
      <LaboratoriosFeatures />
      <LaboratoriosCTA />
    </main>
  );
}


