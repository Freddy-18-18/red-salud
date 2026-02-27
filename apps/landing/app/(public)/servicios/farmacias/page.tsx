import type { Metadata } from "next";
import { FarmaciasHero } from "@/components/sections/farmacias/FarmaciasHero";
import { FarmaciasFeatures } from "@/components/sections/farmacias/FarmaciasFeatures";
import { FarmaciasCTA } from "@/components/sections/farmacias/FarmaciasCTA";

export const metadata: Metadata = {
  title: "Gestión de Farmacias - Red-Salud | Farmacia Digital",
  description: "Moderniza tu farmacia con recetas digitales, gestión de inventario inteligente y servicios de entrega a domicilio. Únete a la mayor red de salud de Venezuela.",
  keywords: "farmacia venezuela, recetas digitales, delivery medicamentos, gestión farmacéutica, Red-Salud farmacias",
};

export default function FarmaciasPage() {
  return (
    <main className="min-h-screen bg-background">
      <FarmaciasHero />
      <FarmaciasFeatures />
      <FarmaciasCTA />
    </main>
  );
}


