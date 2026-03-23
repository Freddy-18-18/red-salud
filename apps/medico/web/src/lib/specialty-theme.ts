/**
 * @file specialty-theme.ts
 * @description Sistema de temas por especialidad medica.
 *
 * Cada especialidad tiene una paleta de colores, icono y gradiente
 * que se aplica en todo el dashboard para dar una experiencia
 * visualmente personalizada.
 *
 * Los slugs coinciden con los de identity/specialty-identities.ts.
 */

export interface SpecialtyTheme {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly icon: string;
  readonly gradient: string;
  readonly bgLight: string;
}

/**
 * Temas por slug de especialidad.
 * Los slugs aqui mapean 1:1 con los slugs del sistema de identidad.
 */
export const SPECIALTY_THEMES: Record<string, SpecialtyTheme> = {
  // ── Medicina General y Familiar ──
  'medicina-general': {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#93C5FD',
    icon: 'Stethoscope',
    gradient: 'from-blue-500 to-blue-700',
    bgLight: '#EFF6FF',
  },
  'medicina-interna': {
    primary: '#2563EB',
    secondary: '#3B82F6',
    accent: '#93C5FD',
    icon: 'HeartPulse',
    gradient: 'from-blue-600 to-blue-800',
    bgLight: '#EFF6FF',
  },
  'medicina-familiar': {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#BFDBFE',
    icon: 'Users',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: '#EFF6FF',
  },
  geriatria: {
    primary: '#6366F1',
    secondary: '#818CF8',
    accent: '#C7D2FE',
    icon: 'UserCheck',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: '#EEF2FF',
  },

  // ── Cardiologia ──
  cardiologia: {
    primary: '#EF4444',
    secondary: '#F87171',
    accent: '#FCA5A5',
    icon: 'Heart',
    gradient: 'from-red-500 to-rose-700',
    bgLight: '#FEF2F2',
  },
  'electrofisiologia-cardiaca': {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#FCA5A5',
    icon: 'Activity',
    gradient: 'from-red-600 to-red-800',
    bgLight: '#FEF2F2',
  },
  'cirugia-cardiovascular': {
    primary: '#B91C1C',
    secondary: '#DC2626',
    accent: '#FCA5A5',
    icon: 'HeartPulse',
    gradient: 'from-red-700 to-rose-800',
    bgLight: '#FEF2F2',
  },

  // ── Neurologia ──
  neurologia: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#C4B5FD',
    icon: 'Brain',
    gradient: 'from-violet-500 to-purple-700',
    bgLight: '#F5F3FF',
  },
  neurocirugia: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#C4B5FD',
    icon: 'Brain',
    gradient: 'from-purple-600 to-violet-800',
    bgLight: '#F5F3FF',
  },

  // ── Pediatria ──
  pediatria: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#6EE7B7',
    icon: 'Baby',
    gradient: 'from-emerald-500 to-green-700',
    bgLight: '#ECFDF5',
  },
  neonatologia: {
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#FDBA74',
    icon: 'Baby',
    gradient: 'from-orange-500 to-amber-600',
    bgLight: '#FFF7ED',
  },

  // ── Ginecologia y Obstetricia ──
  ginecologia: {
    primary: '#EC4899',
    secondary: '#F472B6',
    accent: '#F9A8D4',
    icon: 'Heart',
    gradient: 'from-pink-500 to-rose-600',
    bgLight: '#FDF2F8',
  },
  obstetricia: {
    primary: '#DB2777',
    secondary: '#EC4899',
    accent: '#F9A8D4',
    icon: 'Baby',
    gradient: 'from-pink-600 to-rose-700',
    bgLight: '#FDF2F8',
  },

  // ── Traumatologia y Ortopedia ──
  traumatologia: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#FCD34D',
    icon: 'Bone',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: '#FFFBEB',
  },

  // ── Oftalmologia ──
  oftalmologia: {
    primary: '#06B6D4',
    secondary: '#22D3EE',
    accent: '#67E8F9',
    icon: 'Eye',
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: '#ECFEFF',
  },

  // ── Dermatologia ──
  dermatologia: {
    primary: '#D946EF',
    secondary: '#E879F9',
    accent: '#F0ABFC',
    icon: 'Fingerprint',
    gradient: 'from-fuchsia-500 to-pink-600',
    bgLight: '#FDF4FF',
  },

  // ── Psiquiatria y Salud Mental ──
  psiquiatria: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#C4B5FD',
    icon: 'BrainCircuit',
    gradient: 'from-purple-600 to-indigo-700',
    bgLight: '#F5F3FF',
  },
  psicologia: {
    primary: '#A855F7',
    secondary: '#C084FC',
    accent: '#D8B4FE',
    icon: 'BrainCircuit',
    gradient: 'from-purple-500 to-violet-600',
    bgLight: '#F5F3FF',
  },

  // ── Cirugia General ──
  'cirugia-general': {
    primary: '#6366F1',
    secondary: '#818CF8',
    accent: '#A5B4FC',
    icon: 'Scissors',
    gradient: 'from-indigo-500 to-indigo-700',
    bgLight: '#EEF2FF',
  },
  'cirugia-plastica': {
    primary: '#E11D48',
    secondary: '#F43F5E',
    accent: '#FDA4AF',
    icon: 'Sparkles',
    gradient: 'from-rose-600 to-pink-700',
    bgLight: '#FFF1F2',
  },

  // ── Gastroenterologia ──
  gastroenterologia: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#FDE68A',
    icon: 'Utensils',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: '#FFFBEB',
  },

  // ── Neumologia ──
  neumologia: {
    primary: '#06B6D4',
    secondary: '#22D3EE',
    accent: '#67E8F9',
    icon: 'Wind',
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: '#ECFEFF',
  },

  // ── Endocrinologia ──
  endocrinologia: {
    primary: '#14B8A6',
    secondary: '#2DD4BF',
    accent: '#5EEAD4',
    icon: 'Pill',
    gradient: 'from-teal-500 to-emerald-600',
    bgLight: '#F0FDFA',
  },

  // ── Nefrologia ──
  nefrologia: {
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    accent: '#7DD3FC',
    icon: 'Droplets',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: '#F0F9FF',
  },

  // ── Urologia ──
  urologia: {
    primary: '#0284C7',
    secondary: '#0EA5E9',
    accent: '#7DD3FC',
    icon: 'Droplets',
    gradient: 'from-sky-600 to-blue-700',
    bgLight: '#F0F9FF',
  },

  // ── Hematologia y Oncologia ──
  hematologia: {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#FCA5A5',
    icon: 'Syringe',
    gradient: 'from-red-600 to-red-800',
    bgLight: '#FEF2F2',
  },
  oncologia: {
    primary: '#BE123C',
    secondary: '#E11D48',
    accent: '#FDA4AF',
    icon: 'Shield',
    gradient: 'from-rose-700 to-red-800',
    bgLight: '#FFF1F2',
  },

  // ── Infectologia ──
  infectologia: {
    primary: '#22C55E',
    secondary: '#4ADE80',
    accent: '#86EFAC',
    icon: 'Shield',
    gradient: 'from-green-500 to-emerald-700',
    bgLight: '#F0FDF4',
  },

  // ── Reumatologia ──
  reumatologia: {
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#FCD34D',
    icon: 'Bone',
    gradient: 'from-amber-600 to-yellow-700',
    bgLight: '#FFF7ED',
  },

  // ── Emergencias ──
  emergencia: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#FDE68A',
    icon: 'Zap',
    gradient: 'from-yellow-500 to-orange-600',
    bgLight: '#FFFBEB',
  },

  // ── Radiologia ──
  radiologia: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    accent: '#A5B4FC',
    icon: 'ScanLine',
    gradient: 'from-indigo-600 to-violet-700',
    bgLight: '#EEF2FF',
  },

  // ── Anestesiologia ──
  anestesiologia: {
    primary: '#475569',
    secondary: '#64748B',
    accent: '#94A3B8',
    icon: 'Gauge',
    gradient: 'from-slate-600 to-slate-800',
    bgLight: '#F8FAFC',
  },

  // ── Patologia ──
  patologia: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#C4B5FD',
    icon: 'Microscope',
    gradient: 'from-violet-600 to-purple-700',
    bgLight: '#F5F3FF',
  },

  // ── Rehabilitacion ──
  fisioterapia: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#6EE7B7',
    icon: 'Dumbbell',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: '#ECFDF5',
  },

  // ── Otorrinolaringologia ──
  otorrinolaringologia: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#6EE7B7',
    icon: 'Ear',
    gradient: 'from-emerald-600 to-green-700',
    bgLight: '#ECFDF5',
  },

  // ── Odontologia ──
  'odontologia-general': {
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    accent: '#7DD3FC',
    icon: 'SmilePlus',
    gradient: 'from-sky-500 to-cyan-600',
    bgLight: '#F0F9FF',
  },
  ortodoncia: {
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    accent: '#7DD3FC',
    icon: 'SmilePlus',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: '#F0F9FF',
  },
  endodoncia: {
    primary: '#0284C7',
    secondary: '#0EA5E9',
    accent: '#7DD3FC',
    icon: 'SmilePlus',
    gradient: 'from-sky-600 to-cyan-700',
    bgLight: '#F0F9FF',
  },
  periodoncia: {
    primary: '#0369A1',
    secondary: '#0284C7',
    accent: '#7DD3FC',
    icon: 'SmilePlus',
    gradient: 'from-sky-700 to-cyan-800',
    bgLight: '#F0F9FF',
  },
  implantologia: {
    primary: '#075985',
    secondary: '#0369A1',
    accent: '#38BDF8',
    icon: 'SmilePlus',
    gradient: 'from-sky-800 to-blue-900',
    bgLight: '#F0F9FF',
  },
  'cirugia-oral': {
    primary: '#0C4A6E',
    secondary: '#075985',
    accent: '#38BDF8',
    icon: 'Scissors',
    gradient: 'from-sky-900 to-blue-900',
    bgLight: '#F0F9FF',
  },

  // ── Genetica ──
  genetica: {
    primary: '#0D9488',
    secondary: '#14B8A6',
    accent: '#5EEAD4',
    icon: 'Dna',
    gradient: 'from-teal-600 to-cyan-700',
    bgLight: '#F0FDFA',
  },

  // ── Medicina del Deporte ──
  'medicina-deportiva': {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#6EE7B7',
    icon: 'Dumbbell',
    gradient: 'from-emerald-600 to-green-700',
    bgLight: '#ECFDF5',
  },

  // ── Nutricion ──
  nutriologia: {
    primary: '#65A30D',
    secondary: '#84CC16',
    accent: '#BEF264',
    icon: 'Apple',
    gradient: 'from-lime-600 to-green-700',
    bgLight: '#F7FEE7',
  },

  // ── Cirugia Vascular ──
  'cirugia-vascular': {
    primary: '#B91C1C',
    secondary: '#DC2626',
    accent: '#FCA5A5',
    icon: 'Activity',
    gradient: 'from-red-700 to-rose-800',
    bgLight: '#FEF2F2',
  },
} as const;

/**
 * Tema por defecto para especialidades sin tema definido.
 */
export const DEFAULT_THEME: SpecialtyTheme = {
  primary: '#3B82F6',
  secondary: '#60A5FA',
  accent: '#93C5FD',
  icon: 'Stethoscope',
  gradient: 'from-blue-500 to-blue-700',
  bgLight: '#EFF6FF',
};

/**
 * Obtener el tema para una especialidad por su slug.
 * Si no existe un tema personalizado, devuelve el tema por defecto.
 */
export function getSpecialtyTheme(slug: string | null | undefined): SpecialtyTheme {
  if (!slug) return DEFAULT_THEME;

  const normalized = slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  return SPECIALTY_THEMES[normalized] ?? DEFAULT_THEME;
}

/**
 * Genera variables CSS custom para aplicar un tema en un contenedor.
 */
export function getThemeCSSVars(theme: SpecialtyTheme): Record<string, string> {
  return {
    '--specialty-primary': theme.primary,
    '--specialty-secondary': theme.secondary,
    '--specialty-accent': theme.accent,
    '--specialty-bg': theme.bgLight,
  };
}

/**
 * Obtener todos los slugs que tienen temas definidos.
 */
export function getThemedSlugs(): string[] {
  return Object.keys(SPECIALTY_THEMES);
}
