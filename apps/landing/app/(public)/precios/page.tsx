/**
 * @file page.tsx
 * @description Página de precios de Red-Salud
 * Incluye hero, tarjetas de planes, tabla comparativa, organizaciones, FAQ y CTA
 */

"use client";

import { useState } from "react";
import {
  PricingHero,
  PricingCards,
  ComparisonTable,
  OrganizationsSection,
  PricingFAQ,
  PricingCTA,
} from "./components";

/**
 * Página principal de precios
 */
export default function PreciosPage() {
  /** Estado del toggle: true = anual, false = mensual */
  const [isAnnual, setIsAnnual] = useState(true);

  /** Índice del FAQ abierto */
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero con título y toggle de precios */}
      <PricingHero isAnnual={isAnnual} onToggle={setIsAnnual} />

      {/* Tarjetas de planes */}
      <PricingCards isAnnual={isAnnual} />

      {/* Tabla comparativa de features */}
      <ComparisonTable />

      {/* Sección de organizaciones/Enterprise */}
      <OrganizationsSection />

      {/* Preguntas frecuentes */}
      <PricingFAQ openFAQ={openFAQ} onToggle={setOpenFAQ} />

      {/* Call to action final */}
      <PricingCTA />
    </div>
  );
}
