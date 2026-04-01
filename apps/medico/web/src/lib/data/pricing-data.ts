// ============================================
// PRICING DATA — Subscription tiers
// ============================================

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  badge?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Básico',
    price: 'Gratis',
    period: '',
    description: 'Para médicos que quieren empezar a digitalizar su consultorio.',
    features: [
      '1 médico',
      'Agenda básica (hasta 20 citas/semana)',
      'Consultas con notas SOAP',
      'Recetas electrónicas (hasta 50/mes)',
      'Historia clínica básica',
      'Verificación SACS',
      'Soporte por correo',
    ],
    highlighted: false,
    ctaText: 'Comenzar Gratis',
  },
  {
    name: 'Profesional',
    price: '$29',
    period: '/mes',
    description: 'Todo lo que necesitás para una práctica médica moderna y eficiente.',
    features: [
      'Todo lo del plan Básico',
      'Citas ilimitadas',
      'Recetas ilimitadas con firma digital',
      'IA Diagnóstica (ICD-11 + Gemini)',
      'Integración Google Calendar',
      'Telemedicina (videoconsultas)',
      'Estadísticas y KPIs por especialidad',
      'Módulos especializados completos',
      'Soporte prioritario',
    ],
    highlighted: true,
    ctaText: 'Elegir Profesional',
    badge: 'Más popular',
  },
  {
    name: 'Clínica',
    price: '$79',
    period: '/mes',
    description: 'Para clínicas y consultorios con múltiples profesionales.',
    features: [
      'Todo lo del plan Profesional',
      'Hasta 10 médicos',
      'Panel administrativo',
      'Gestión multi-sede',
      'Reportes consolidados',
      'Acceso API',
      'Roles y permisos personalizados',
      'Facturación centralizada',
      'Soporte dedicado 24/7',
      'Onboarding personalizado',
    ],
    highlighted: false,
    ctaText: 'Contactar Ventas',
  },
];
