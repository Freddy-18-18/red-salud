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

// Re-exports para acceso directo
export { odontologiaOverride } from './odontologia';
export { cardiologiaOverride } from './cardiologia';
export { pediatriaOverride } from './pediatria';
export { neurologiaOverride } from './neurologia';
export { traumatologiaOverride } from './traumatologia';
export { oftalmologiaOverride } from './oftalmologia';
export { ginecologiaOverride } from './ginecologia';

// Constantes de dominio pediátrico
export {
  PEDIATRIC_AGE_GROUPS,
  GROWTH_CHART_STANDARDS,
  VACCINATION_SCHEDULE,
  DEVELOPMENTAL_MILESTONES,
} from './pediatria';

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
]);
