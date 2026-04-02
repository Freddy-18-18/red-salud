// ============================================
// PRICING DATA — Subscription tiers (app médico)
// Esta app es SOLO para médicos y sus consultorios.
// La app clínica tiene su propio pricing en apps/clinica/
// ============================================

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  monthlyPrice: number;
  description: string;
  features: PricingFeature[];
  highlighted: boolean;
  ctaText: string;
  badge?: string;
}

export const ANNUAL_DISCOUNT = 0.3; // 30% descuento anual

export function getAnnualMonthlyPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT));
}

export function getAnnualTotalPrice(monthlyPrice: number): number {
  return getAnnualMonthlyPrice(monthlyPrice) * 12;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Básico',
    monthlyPrice: 0,
    description: 'Para comenzar a digitalizar tu consultorio sin compromiso.',
    features: [
      { text: 'Agenda básica (hasta 20 citas/semana)', included: true },
      { text: 'Consultas con notas SOAP', included: true },
      { text: 'Recetas electrónicas (hasta 50/mes)', included: true },
      { text: 'Historia clínica básica', included: true },
      { text: 'Verificación SACS', included: true },
      { text: 'Soporte por correo', included: true },
      { text: 'Citas ilimitadas', included: false },
      { text: 'IA Diagnóstica', included: false },
      { text: 'Integración Google Calendar', included: false },
      { text: 'Telemedicina', included: false },
    ],
    highlighted: false,
    ctaText: 'Comenzar Gratis',
  },
  {
    name: 'Profesional',
    monthlyPrice: 40,
    description: 'Todo lo que necesitás para una práctica médica moderna y eficiente.',
    features: [
      { text: 'Citas ilimitadas', included: true },
      { text: 'Consultas con notas SOAP', included: true },
      { text: 'Recetas ilimitadas con firma digital', included: true },
      { text: 'Historia clínica completa', included: true },
      { text: 'IA Diagnóstica (ICD-11 + Gemini)', included: true },
      { text: 'Integración Google Calendar', included: true },
      { text: 'Telemedicina (videoconsultas)', included: true },
      { text: 'Estadísticas y KPIs por especialidad', included: true },
      { text: 'Módulos especializados completos', included: true },
      { text: 'Verificación SACS', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
    highlighted: true,
    ctaText: 'Elegir Profesional',
    badge: 'Recomendado',
  },
];
