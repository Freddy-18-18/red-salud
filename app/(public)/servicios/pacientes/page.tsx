import type { Metadata } from "next";
import { PacientesHero } from "@/components/sections/pacientes-hero";
import { StatsSection } from "@/components/sections/stats-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FAQSection } from "@/components/sections/faq-section";
import { FinalCTASection } from "@/components/sections/final-cta-section";

export const metadata: Metadata = {
  title: "Servicios para Pacientes | Red Salud",
  description:
    "Consultas médicas en línea, historial médico digital y atención personalizada 24/7. Conecta con médicos certificados desde casa. ¡100% Gratis!",
  keywords: [
    "telemedicina",
    "videoconsultas",
    "médicos en línea",
    "consulta médica virtual",
    "historial médico digital",
    "salud en casa",
    "Venezuela",
  ],
  authors: [{ name: "Red Salud" }],
  creator: "Red Salud",
  publisher: "Red Salud",
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://redsalud.com/servicios/pacientes",
    title: "Servicios para Pacientes | Red Salud",
    description:
      "Consultas médicas en línea, historial médico digital y atención personalizada 24/7",
    siteName: "Red Salud",
    images: [
      {
        url: "https://redsalud.com/og-pacientes.jpg",
        width: 1200,
        height: 630,
        alt: "Red Salud - Servicios para Pacientes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios para Pacientes | Red Salud",
    description:
      "Consultas médicas en línea, historial médico digital y atención personalizada 24/7",
    images: ["https://redsalud.com/og-pacientes.jpg"],
  },
};

export default function PacientesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <PacientesHero />

      {/* Stats Section with Real Data */}
      <StatsSection />

      {/* Features Grid */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <FinalCTASection />
    </main>
  );
}

