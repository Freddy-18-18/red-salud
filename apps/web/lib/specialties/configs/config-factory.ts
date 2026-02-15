/**
 * @file config-factory.ts
 * @description Fábrica que genera SpecialtyConfig a partir de SpecialtyIdentity.
 *
 * En lugar de mantener 132 archivos de configuración manuales (~300-400 líneas cada uno),
 * esta fábrica construye un SpecialtyConfig completo para cualquier especialidad
 * usando:
 * 1. Su SpecialtyIdentity (de identity/specialty-identities.ts)
 * 2. Su SpecialtyCategoryMeta (de identity/category-meta.ts)
 * 3. El LayoutTemplate correspondiente a su dashboardLayout
 * 4. Overrides opcionales para especialidades con configuración personalizada
 *
 * Esto permite escalar de 3 a 132 especialidades sin código repetitivo.
 */

import type { SpecialtyConfig, SpecialtyModule } from '../core/types';
import type { SpecialtyIdentity, SpecialtyCategoryMeta, SpecialtyCategoryId } from '@red-salud/types';
import { getLayoutTemplate, materializeLayout } from './layout-templates';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Override parcial de SpecialtyConfig.
 * Permite sobrescribir cualquier campo del config generado.
 */
export interface SpecialtyConfigOverride {
  /** Módulos personalizados — se REEMPLAZAN (no se mezclan) por grupo */
  modules?: Partial<Record<string, SpecialtyModule[]>>;
  /** Widgets personalizados */
  widgets?: SpecialtyConfig['widgets'];
  /** KPIs personalizados */
  prioritizedKpis?: string[];
  /** Definiciones de KPI personalizadas */
  kpiDefinitions?: SpecialtyConfig['kpiDefinitions'];
  /** Settings personalizados */
  settings?: SpecialtyConfig['settings'];
  /** Theme personalizado */
  theme?: SpecialtyConfig['theme'];
  /** Dashboard variant override */
  dashboardVariant?: string;
  /** Dashboard path override */
  dashboardPath?: string;
}

// ============================================================================
// MAPEO SpecialtyCategoryId → SpecialtyCategory (legacy bridge)
// ============================================================================

/**
 * Mapea los 28 SpecialtyCategoryId a los 12 SpecialtyCategory del sistema viejo.
 * Se usa temporalmente hasta la migración completa del API.
 */
const CATEGORY_BRIDGE: Record<SpecialtyCategoryId, string> = {
  general: 'medical',
  cardiovascular: 'medical',
  neurologia: 'medical',
  digestivo: 'medical',
  respiratorio: 'medical',
  renal: 'medical',
  endocrino: 'medical',
  reumatologia: 'medical',
  hematologia: 'medical',
  infectologia: 'medical',
  dermatologia: 'medical',
  mental: 'psychiatric',
  cirugia: 'surgical',
  traumatologia: 'surgical',
  oftalmologia: 'medical',
  orl: 'medical',
  ginecologia: 'obgyn',
  pediatria: 'pediatric',
  plastica: 'surgical',
  vascular: 'surgical',
  intensiva: 'emergency',
  diagnostico: 'diagnostic',
  anestesia: 'surgical',
  patologia: 'diagnostic',
  rehabilitacion: 'allied',
  especializada: 'other',
  odontologia: 'dental',
  otros: 'other',
};

// ============================================================================
// GENERADOR DE PREFIX
// ============================================================================

/**
 * Genera un prefix corto para los module keys de una especialidad.
 * Ej: 'cardiologia' → 'cardio', 'medicina-general' → 'medgen'
 */
function generatePrefix(slug: string): string {
  // Tabla de prefixes conocidos para mantener retrocompatibilidad
  const KNOWN_PREFIXES: Record<string, string> = {
    // === Especialidades con configs existentes ===
    'odontologia-general': 'dental',
    'ortodoncia': 'dental-ortho',
    'cirugia-oral': 'dental-oral',
    'periodoncia': 'dental-perio',
    'odontopediatria': 'dental-pedi',
    'endodoncia': 'dental-endo',
    'protesis-dental': 'dental-prosth',
    'patologia-oral': 'dental-path',
    'radiologia-oral': 'dental-rad',
    'implantologia': 'dental-implant',
    'cardiologia': 'cardio',
    'pediatria': 'pedi',
    // === Prefixes cortos ===
    'medicina-general': 'medgen',
    'medicina-familiar': 'medfam',
    'geriatria': 'geri',
    'medicina-interna': 'medint',
    'cirugia-cardiovascular': 'circardio',
    'electrofisiologia': 'electro',
    'cardiologia-intervencionista': 'cardiointerv',
    'cardiologia-pediatrica': 'cardiopedi',
    'insuficiencia-cardiaca': 'cardioic',
    'neurologia': 'neuro',
    'neurocirugia': 'neurocir',
    'neurofisiologia': 'neurofisio',
    'neurologia-pediatrica': 'neuropedi',
    'neuropsicologia': 'neuropsi',
    'gastroenterologia': 'gastro',
    'hepatologia': 'hepato',
    'coloproctologia': 'coloprocto',
    'endoscopia': 'endosc',
    'cirugia-digestiva': 'cirdigest',
    'neumologia': 'neumo',
    'cirugia-toracica': 'cirtorax',
    'medicina-sueno': 'sueno',
    'neumologia-pediatrica': 'neumopedi',
    'nefrologia': 'nefro',
    'urologia': 'uro',
    'andrologia': 'andro',
    'urologia-pediatrica': 'uropedi',
    'nefrologia-pediatrica': 'nefropedi',
    'endocrinologia': 'endocrino',
    'diabetologia': 'diab',
    'nutriologia': 'nutri',
    'endocrinologia-pediatrica': 'endopedi',
    'reumatologia': 'reuma',
    'reumatologia-pediatrica': 'reumapedi',
    'hematologia': 'hemato',
    'oncologia': 'onco',
    'oncologia-radioterapica': 'radio',
    'mastologia': 'masto',
    'hematologia-pediatrica': 'hematopedi',
    'infectologia': 'infecto',
    'inmunologia': 'inmuno',
    'alergologia': 'alergo',
    'infectologia-pediatrica': 'infectopedi',
    'vacunologia': 'vacuno',
    'dermatologia': 'dermato',
    'dermato-oncologia': 'dermonco',
    'dermatopatologia': 'dermpath',
    'dermatologia-pediatrica': 'dermopedi',
    'psiquiatria': 'psiq',
    'psicologia-clinica': 'psicol',
    'psiquiatria-infantil': 'psiqinf',
    'sexologia': 'sexo',
    'adicciones': 'adicc',
    'cirugia-general': 'cirgen',
    'cirugia-bariatrica': 'cirbari',
    'cirugia-laparoscopica': 'cirlaparo',
    'cirugia-oncologica': 'cionco',
    'cirugia-pediatrica': 'cirpedi',
    'traumatologia': 'trauma',
    'artroscopia': 'artro',
    'cirugia-columna': 'cirespina',
    'ortopedia-pediatrica': 'ortopedi',
    'medicina-deporte': 'deportiva',
    'cirugia-mano': 'cirmano',
    'oftalmologia': 'oftalmo',
    'retina-vitreo': 'retina',
    'glaucoma': 'glauco',
    'cirugia-refractiva': 'refract',
    'oftalmologia-pediatrica': 'oftalpedi',
    'oculoplastia': 'oculoplast',
    'otorrinolaringologia': 'orl',
    'audiologia': 'audio',
    'foniatria': 'fonia',
    'cirugia-cabeza-cuello': 'circabeza',
    'orl-pediatrica': 'orlpedi',
    'ginecologia': 'gine',
    'obstetricia': 'obst',
    'medicina-reproductiva': 'reprod',
    'medicina-materno-fetal': 'matfetal',
    'ginecologia-oncologica': 'ginonco',
    'neonatologia': 'neo',
    'uci-pediatrica': 'ucipedi',
    'medicina-adolescente': 'adol',
    'cirugia-plastica': 'cirplast',
    'cirugia-estetica': 'cirestet',
    'quemados': 'quemados',
    'cirugia-vascular': 'cirvascular',
    'angiologia': 'angio',
    'flebologia': 'flebo',
    'medicina-critica': 'uci',
    'emergencia': 'emerg',
    'medicina-paliativa': 'paliat',
    'dolor': 'dolor',
    'radiologia': 'radiol',
    'medicina-nuclear': 'nuclear',
    'intervencionismo': 'interv',
    'ecografia': 'eco',
    'anestesiologia': 'anest',
    'anestesiologia-pediatrica': 'anestpedi',
    'anestesiologia-cardiovascular': 'anestcardio',
    'patologia': 'pato',
    'patologia-clinica': 'patoclin',
    'citopatologia': 'cito',
    'medicina-fisica-rehabilitacion': 'rehab',
    'fisioterapia': 'fisio',
    'terapia-ocupacional': 'terapocup',
    'quiropractica': 'quiro',
    'genetica': 'genet',
    'farmacologia-clinica': 'farmaco',
    'toxicologia': 'toxi',
    'medicina-laboral': 'laboral',
    'medicina-legal-forense': 'forense',
    'medicina-preventiva': 'prevent',
    'medicina-tropical': 'tropical',
    'epidemiologia': 'epidemio',
    'psicologia': 'psicol2',
    'podologia': 'podo',
    'psicopedagogia': 'psicoped',
    'optometria': 'optom',
    'acupuntura': 'acupu',
    'homeopatia': 'homeo',
  };

  if (KNOWN_PREFIXES[slug]) {
    return KNOWN_PREFIXES[slug];
  }

  // Fallback: tomar primeras 3-6 letras sin guiones
  const parts = slug.split('-');
  if (parts.length === 1) {
    return slug.slice(0, 6);
  }
  // Multi-word: tomar primeras 3 letras de cada parte
  return parts.map((p) => p.slice(0, 3)).join('').slice(0, 8);
}

// ============================================================================
// FÁBRICA PRINCIPAL
// ============================================================================

/**
 * Construye un SpecialtyConfig completo a partir de una SpecialtyIdentity.
 *
 * @param identity     - Identidad de la especialidad (de specialty-identities.ts)
 * @param categoryMeta - Metadata de la categoría (de category-meta.ts)
 * @param override     - Override parcial para personalizar el config generado
 * @returns SpecialtyConfig completo listo para registrar
 *
 * @example
 * ```ts
 * const identity = IDENTITY_BY_SLUG.get('cardiologia')!;
 * const meta = CATEGORY_META.cardiovascular;
 * const config = buildSpecialtyConfig(identity, meta);
 * ```
 */
export function buildSpecialtyConfig(
  identity: SpecialtyIdentity,
  categoryMeta: SpecialtyCategoryMeta,
  override?: SpecialtyConfigOverride
): SpecialtyConfig {
  const prefix = generatePrefix(identity.slug);
  const basePath = `/dashboard/medico/${identity.slug}`;
  const layoutTemplate = getLayoutTemplate(categoryMeta.dashboardLayout);

  // Materializar módulos desde el template
  const baseModules = materializeLayout(layoutTemplate, prefix, basePath);

  // Aplicar override de módulos si existe
  const finalModules = override?.modules
    ? mergeModules(baseModules, override.modules)
    : baseModules;

  // Construir KPI definitions por defecto basados en los KPIs priorizados
  const defaultKpiDefs = buildDefaultKpiDefinitions(identity.prioritizedKpis);

  // Construir settings por defecto
  const defaultSettings = buildDefaultSettings(identity, categoryMeta);

  // Construir config
  const config: SpecialtyConfig = {
    // Identificación
    id: identity.slug,
    name: identity.name,
    slug: identity.slug,
    category: CATEGORY_BRIDGE[identity.categoryId] as SpecialtyConfig['category'],

    // Detección
    keywords: identity.keywords,
    sacsCodes: identity.sacsCodes,
    snomedCodes: identity.snomedCodes,

    // Dashboard
    dashboardVariant: override?.dashboardVariant ?? identity.slug,
    dashboardPath: override?.dashboardPath ?? basePath,

    // Módulos
    modules: finalModules as SpecialtyConfig['modules'],

    // Widgets
    widgets: override?.widgets ?? [],

    // KPIs
    prioritizedKpis: override?.prioritizedKpis ?? identity.prioritizedKpis,
    kpiDefinitions: override?.kpiDefinitions ?? defaultKpiDefs,

    // Settings — merge override on top of defaults so defaultDuration etc. are preserved
    settings: override?.settings
      ? { ...defaultSettings, ...override.settings }
      : defaultSettings,

    // Visual
    theme: override?.theme ?? {
      primaryColor: identity.color,
      accentColor: categoryMeta.color !== identity.color ? categoryMeta.color : darkenColor(identity.color),
      icon: identity.icon,
    },
  };

  return config;
}

// ============================================================================
// HELPERS INTERNOS
// ============================================================================

/**
 * Mezcla módulos base con overrides.
 * Los grupos del override REEMPLAZAN completamente los del base.
 * Los grupos no sobrescritos se mantienen.
 */
function mergeModules(
  base: Record<string, SpecialtyModule[]>,
  overrides: Partial<Record<string, SpecialtyModule[]>>
): Record<string, SpecialtyModule[]> {
  const result = { ...base };
  for (const [group, modules] of Object.entries(overrides)) {
    if (modules && modules.length > 0) {
      result[group] = modules;
    }
  }
  return result;
}

/**
 * Genera definiciones de KPI genéricas basadas en los keys priorizados.
 */
function buildDefaultKpiDefinitions(
  kpiKeys: string[]
): Record<string, { label: string; format: 'percentage' | 'currency' | 'number' | 'duration'; goal?: number; direction: 'higher_is_better' | 'lower_is_better' }> {
  const defs: Record<string, { label: string; format: 'percentage' | 'currency' | 'number' | 'duration'; goal?: number; direction: 'higher_is_better' | 'lower_is_better' }> = {};

  for (const key of kpiKeys) {
    defs[key] = {
      label: kpiKeyToLabel(key),
      format: guessKpiFormat(key),
      direction: guessKpiDirection(key),
    };
  }

  return defs;
}

/**
 * Genera settings por defecto usando datos de la identity.
 */
function buildDefaultSettings(
  identity: SpecialtyIdentity,
  categoryMeta: SpecialtyCategoryMeta
): SpecialtyConfig['settings'] {
  return {
    appointmentTypes: identity.defaultAppointmentTypes.map(
      (t) => t.toLowerCase().replace(/\s+/g, '_').replace(/[áéíóú]/g, (c) => {
        const map: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
        return map[c] ?? c;
      })
    ),
    defaultDuration: identity.defaultAppointmentDuration,
    allowOverlap: false,
    requiresClinicalTemplates: true,
    usesTreatmentPlans: categoryMeta.dashboardLayout === 'surgical' || categoryMeta.dashboardLayout === 'dental',
    requiresInsuranceVerification: true,
    supportsImagingIntegration: ['surgical', 'dental', 'diagnostic-imaging'].includes(categoryMeta.dashboardLayout),
    supportsTelemedicine: identity.supportsTelemedicine,
  };
}

/**
 * Convierte un KPI key tipo 'pacientes-atendidos' a label 'Pacientes Atendidos'
 */
function kpiKeyToLabel(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Adivina el formato de un KPI por su nombre
 */
function guessKpiFormat(key: string): 'percentage' | 'currency' | 'number' | 'duration' {
  if (key.includes('tasa') || key.includes('rate') || key.includes('porcentaje') || key.includes('coverage') || key.includes('compliance') || key.includes('satisfaccion')) {
    return 'percentage';
  }
  if (key.includes('tiempo') || key.includes('time') || key.includes('duracion') || key.includes('turnaround')) {
    return 'duration';
  }
  if (key.includes('ingreso') || key.includes('revenue') || key.includes('produccion') || key.includes('cost')) {
    return 'currency';
  }
  return 'number';
}

/**
 * Adivina la dirección de un KPI por su nombre
 */
function guessKpiDirection(key: string): 'higher_is_better' | 'lower_is_better' {
  const lowerIsBetter = ['no_show', 'inasistencia', 'complication', 'error', 'rechazo', 'mortalidad', 'infection', 'wait', 'delay', 'caidas'];
  return lowerIsBetter.some((term) => key.includes(term)) ? 'lower_is_better' : 'higher_is_better';
}

/**
 * Oscurece un color hex un poco — para accent fallback
 */
function darkenColor(hex: string): string {
  const darkMap: Record<string, string> = {
    '#3B82F6': '#1D4ED8', '#EF4444': '#B91C1C', '#8B5CF6': '#6D28D9',
    '#F59E0B': '#D97706', '#06B6D4': '#0E7490', '#0EA5E9': '#0369A1',
    '#14B8A6': '#0F766E', '#D97706': '#B45309', '#DC2626': '#991B1B',
    '#22C55E': '#15803D', '#EC4899': '#BE185D', '#7C3AED': '#5B21B6',
    '#6366F1': '#4338CA', '#0891B2': '#0E7490', '#2563EB': '#1E40AF',
    '#059669': '#047857', '#DB2777': '#9D174D', '#F97316': '#C2410C',
    '#E11D48': '#9F1239', '#B91C1C': '#7F1D1D', '#4F46E5': '#3730A3',
    '#475569': '#334155', '#10B981': '#047857', '#0D9488': '#115E59',
    '#6B7280': '#4B5563',
  };
  return darkMap[hex] ?? '#374151';
}
