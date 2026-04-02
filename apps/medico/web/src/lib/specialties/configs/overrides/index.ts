/**
 * @file overrides/index.ts
 * @description Registro central de overrides de configuración por especialidad.
 *
 * Exporta un mapa slug → SpecialtyConfigOverride para que el
 * auto-registry aplique configuraciones personalizadas a las
 * especialidades que las tienen.
 */

import type { SpecialtyConfigOverride } from '../config-factory';
import { odontologiaOverride } from './odontologia';
import { cardiologiaOverride } from './cardiologia';
import { pediatriaOverride } from './pediatria';
import { neurologiaOverride } from './neurologia';
import { traumatologiaOverride } from './traumatologia';
import { oftalmologiaOverride } from './oftalmologia';
import { ginecologiaOverride } from './ginecologia';
import { infectologiaPediatricaOverride } from './infectologia-pediatrica';
import { urologiaOverride } from './urologia';
import { medicinaInternaOverride } from './medicina-interna';

// Re-exports para acceso directo
export { odontologiaOverride } from './odontologia';
export { cardiologiaOverride } from './cardiologia';
export { pediatriaOverride } from './pediatria';
export { neurologiaOverride } from './neurologia';
export { traumatologiaOverride } from './traumatologia';
export { oftalmologiaOverride } from './oftalmologia';
export { ginecologiaOverride } from './ginecologia';
export { infectologiaPediatricaOverride } from './infectologia-pediatrica';
export { urologiaOverride } from './urologia';
export { medicinaInternaOverride } from './medicina-interna';

// Constantes de dominio pediátrico
export {
  PEDIATRIC_AGE_GROUPS,
  GROWTH_CHART_STANDARDS,
  VACCINATION_SCHEDULE,
  DEVELOPMENTAL_MILESTONES,
} from './pediatria';

// Constantes de dominio infectología pediátrica
export {
  COMMON_PEDIATRIC_INFECTIONS,
  ANTIBIOTIC_CATEGORIES,
  ISOLATION_TYPES,
} from './infectologia-pediatrica';

// Constantes de dominio urológico
export {
  IPSS_QUESTIONS,
  GLEASON_GRADE_GROUPS,
  STONE_COMPOSITION_TYPES,
} from './urologia';

// Constantes de dominio medicina interna
export {
  CHRONIC_DISEASE_PANELS,
  CLINICAL_SCORES,
  CRITICAL_CARE_PARAMETERS,
} from './medicina-interna';

/**
 * Mapa de overrides por slug de especialidad.
 *
 * Cuando el auto-registry genera un SpecialtyConfig para una especialidad
 * que tiene un override registrado, aplica el override sobre el config base.
 *
 * Para agregar un override nuevo:
 * 1. Crear archivo en configs/overrides/{slug}.ts
 * 2. Agregar el import y la entrada en este mapa
 */
export const SPECIALTY_OVERRIDES: ReadonlyMap<string, SpecialtyConfigOverride> = new Map([
  // Odontología — 15 módulos personalizados, widgets, KPIs dentales
  ['odontologia', odontologiaOverride],

  // Cardiología — ECG, ecocardiograma, Holter, prueba de esfuerzo
  ['cardiologia', cardiologiaOverride],

  // Pediatría — well-child, vacunación, crecimiento, neurodesarrollo
  ['pediatria', pediatriaOverride],

  // Neurología — EEG, EMG, neuroimagen, epilepsia, cefaleas, cognitivo
  ['neurologia', neurologiaOverride],

  // Traumatología — fracturas, artroscopia, prótesis, columna, rehabilitación
  ['traumatologia', traumatologiaOverride],

  // Oftalmología — refracción, fondo de ojo, tonometría, cirugía refractiva
  ['oftalmologia', oftalmologiaOverride],

  // Ginecología — prenatal, ecografía, colposcopia, fertilidad, cirugía
  ['ginecologia', ginecologiaOverride],

  // Infectología Pediátrica — antibiogramas, cultivos, esquemas antibióticos, aislamiento
  ['infectologia-pediatrica', infectologiaPediatricaOverride],

  // Urología — PSA, cistoscopía, biopsia, litiasis, uroflujometría, IPSS
  ['urologia', urologiaOverride],

  // Medicina Interna + Medicina Crítica — crónicos, hospitalización, UCI, scores clínicos
  ['medicina-interna', medicinaInternaOverride],
]);
