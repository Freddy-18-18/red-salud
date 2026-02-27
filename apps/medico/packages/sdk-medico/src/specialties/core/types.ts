// ============================================
// SPECIALTY EXPERIENCE SYSTEM - Core Types
// Re-exported from @red-salud/types
// ============================================

export type {
  SpecialtyConfig,
  SpecialtyContext,
  SpecialtyDetectionResult,
  SpecialtyId,
} from "@red-salud/types";

export * from "@red-salud/types";

/**
 * Maps legacy English IDs to canonical Spanish slugs.
 * Used by the registry and detector for backwards compatibility.
 */
export const LEGACY_ID_MAP: Record<string, string> = {
  // Old English IDs → new Spanish slugs
  'dental': 'odontologia-general',
  'dental-orthodontics': 'ortodoncia',
  'dental-oral-surgery': 'cirugia-oral',
  'dental-periodontics': 'periodoncia',
  'dental-pediatric': 'odontopediatria',
  'dental-endodontics': 'endodoncia',
  'dental-prosthodontics': 'protesis-dental',
  'dental-pathology': 'patologia-oral',
  'dental-radiology': 'radiologia-oral',
  'dental-implantology': 'implantologia',
  'cardiology': 'cardiologia',
  'dermatology': 'dermatologia',
  'endocrinology': 'endocrinologia',
  'gastroenterology': 'gastroenterologia',
  'hematology': 'hematologia',
  'infectious-disease': 'infectologia',
  'nephrology': 'nefrologia',
  'neurology': 'neurologia',
  'oncology': 'oncologia',
  'pulmonology': 'neumologia',
  'rheumatology': 'reumatologia',
  'general-surgery': 'cirugia-general',
  'cardiac-surgery': 'cirugia-cardiovascular',
  'neurosurgery': 'neurocirugia',
  'orthopedics': 'traumatologia',
  'plastic-surgery': 'cirugia-plastica',
  'vascular-surgery': 'cirugia-vascular',
  'pediatric-surgery': 'cirugia-pediatrica',
  'family-medicine': 'medicina-familiar',
  'internal-medicine': 'medicina-interna',
  'pediatrics': 'pediatria',
  'obstetrics-gynecology': 'ginecologia',
  'psychiatry': 'psiquiatria',
  'radiology': 'radiologia',
  'pathology': 'patologia',
  'anesthesiology': 'anestesiologia',
  'emergency-medicine': 'emergencia',
  'critical-care': 'medicina-critica',
  'physical-therapy': 'fisioterapia',
  'occupational-therapy': 'terapia-occupacional',
  'nutrition': 'nutriologia',
  'psychology': 'psicologia',
  'default': 'medicina-general',
};

/**
 * Map of specialty configs
 */
export type SpecialtyRegistry = Map<SpecialtyId, SpecialtyConfig>;
