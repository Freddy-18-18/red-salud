// TODO: Expand with comprehensive medication data
// This is a stub to allow the app to compile.

export const FRECUENCIAS_ESTANDAR = [
  'Cada 4 horas',
  'Cada 6 horas',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 24 horas',
  'Una vez al día',
  'Dos veces al día',
  'Tres veces al día',
  'Cuatro veces al día',
  'Cada 48 horas',
  'Semanal',
  'Según necesidad (PRN)',
  'Antes de cada comida',
  'Después de cada comida',
  'En ayunas',
  'Al acostarse',
] as const;

export const VIAS_ADMINISTRACION = [
  'Oral',
  'Sublingual',
  'Intravenosa (IV)',
  'Intramuscular (IM)',
  'Subcutánea (SC)',
  'Tópica',
  'Oftálmica',
  'Ótica',
  'Nasal',
  'Inhalatoria',
  'Rectal',
  'Vaginal',
  'Transdérmica',
] as const;

export type FrecuenciaEstandar = (typeof FRECUENCIAS_ESTANDAR)[number];
export type ViaAdministracion = (typeof VIAS_ADMINISTRACION)[number];
