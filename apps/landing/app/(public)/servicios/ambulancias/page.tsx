import type { Metadata } from "next";
import { AmbulanciasHero } from "@/components/sections/ambulancias/AmbulanciasHero";
import { AmbulanciasFeatures } from "@/components/sections/ambulancias/AmbulanciasFeatures";
import { AmbulanciasCTA } from "@/components/sections/ambulancias/AmbulanciasCTA";

export const metadata: Metadata = {
  title: "Despacho de Ambulancias - Red-Salud | Emergencias 24/7",
  description: "Optimiza los tiempos de respuesta de tu servicio de ambulancias. Despacho inteligente, GPS en tiempo real y triaje digital de emergencias.",
  keywords: "ambulancia venezuela, despacho emergencias, gps ambulancias, gestión emergencias médicas, Red-Salud ambulancias",
};

export default function AmbulanciasPage() {
  return (
    <main className="min-h-screen bg-background">
      <AmbulanciasHero />
      <AmbulanciasFeatures />
      <AmbulanciasCTA />
    </main>
  );
}
