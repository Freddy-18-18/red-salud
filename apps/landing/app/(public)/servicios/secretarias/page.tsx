import type { Metadata } from "next";
import { SecretariasHero } from "@/components/sections/secretarias/SecretariasHero";
import { SecretariasFeatures } from "@/components/sections/secretarias/SecretariasFeatures";
import { SecretariasCTA } from "@/components/sections/secretarias/SecretariasCTA";

export const metadata: Metadata = {
  title: "Gestión de Consultorios - Red-Salud | Asistente Médico Digital",
  description: "Optimiza la gestión de tu consulta médica. Agendas inteligentes, triage digital y comunicación automatizada para secretarias y asistentes médicos.",
  keywords: "secretaria médica, asistente médico, gestión de consultorio, agenda médica venezuela, Red-Salud secretarias",
};

export default function SecretariasPage() {
  return (
    <main className="min-h-screen bg-background">
      <SecretariasHero />
      <SecretariasFeatures />
      <SecretariasCTA />
    </main>
  );
}
