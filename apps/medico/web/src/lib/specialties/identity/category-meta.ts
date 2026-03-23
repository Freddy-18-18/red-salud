/**
 * @file category-meta.ts
 * @description Metadatos visuales para las 26 categorías de especialidades.
 *
 * Cada categoría define su identidad visual (color, gradiente, icono)
 * y el tipo de layout de dashboard que utilizan sus especialidades.
 */

import type { SpecialtyCategoryId, SpecialtyCategoryMeta } from '@red-salud/types';

// ============================================================================
// DEFINICIONES DE CATEGORÍAS
// ============================================================================

export const CATEGORY_META: Record<SpecialtyCategoryId, SpecialtyCategoryMeta> = {
  // ── Medicina General y Familiar ──────────────────────────────────────
  general: {
    id: 'general',
    label: 'Medicina General y Familiar',
    description: 'Atención primaria, medicina interna, geriatría y medicina familiar',
    icon: 'Stethoscope',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    gradient: 'from-blue-500 to-blue-700',
    order: 1,
    specialtyCount: 4,
    dashboardLayout: 'clinical-standard',
  },

  // ── Cardiología y Sistema Cardiovascular ──────────────────────────────
  cardiovascular: {
    id: 'cardiovascular',
    label: 'Cardiología y Sistema Cardiovascular',
    description: 'Cardiología, cirugía cardiovascular, electrofisiología y hemodinamia',
    icon: 'Heart',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    gradient: 'from-red-500 to-rose-700',
    order: 2,
    specialtyCount: 6,
    dashboardLayout: 'clinical-standard',
  },

  // ── Neurología y Sistema Nervioso ─────────────────────────────────────
  neurologia: {
    id: 'neurologia',
    label: 'Neurología y Sistema Nervioso',
    description: 'Neurología, neurocirugía, neurofisiología y neuropsicología',
    icon: 'Brain',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    gradient: 'from-violet-500 to-purple-700',
    order: 3,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Sistema Digestivo ────────────────────────────────────────────────
  digestivo: {
    id: 'digestivo',
    label: 'Sistema Digestivo',
    description: 'Gastroenterología, hepatología, coloproctología y endoscopia',
    icon: 'Utensils',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    gradient: 'from-amber-500 to-orange-600',
    order: 4,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Sistema Respiratorio ─────────────────────────────────────────────
  respiratorio: {
    id: 'respiratorio',
    label: 'Sistema Respiratorio',
    description: 'Neumología, cirugía torácica y medicina del sueño',
    icon: 'Wind',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    gradient: 'from-cyan-500 to-teal-600',
    order: 5,
    specialtyCount: 4,
    dashboardLayout: 'clinical-standard',
  },

  // ── Sistema Renal y Urológico ────────────────────────────────────────
  renal: {
    id: 'renal',
    label: 'Sistema Renal y Urológico',
    description: 'Nefrología, urología y andrología',
    icon: 'Droplets',
    color: '#0EA5E9',
    bgColor: '#F0F9FF',
    gradient: 'from-sky-500 to-blue-600',
    order: 6,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Endocrinología y Metabolismo ─────────────────────────────────────
  endocrino: {
    id: 'endocrino',
    label: 'Endocrinología y Metabolismo',
    description: 'Endocrinología, diabetología y nutriología',
    icon: 'Pill',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    gradient: 'from-teal-500 to-emerald-600',
    order: 7,
    specialtyCount: 4,
    dashboardLayout: 'clinical-standard',
  },

  // ── Reumatología y Sistema Musculoesquelético ────────────────────────
  reumatologia: {
    id: 'reumatologia',
    label: 'Reumatología y Sistema Musculoesquelético',
    description: 'Reumatología adulta y pediátrica',
    icon: 'Bone',
    color: '#D97706',
    bgColor: '#FFF7ED',
    gradient: 'from-amber-600 to-yellow-700',
    order: 8,
    specialtyCount: 2,
    dashboardLayout: 'clinical-standard',
  },

  // ── Hematología y Oncología ──────────────────────────────────────────
  hematologia: {
    id: 'hematologia',
    label: 'Hematología y Oncología',
    description: 'Hematología, oncología médica y radioterápica, mastología',
    icon: 'Syringe',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    gradient: 'from-red-600 to-red-800',
    order: 9,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Infectología e Inmunología ───────────────────────────────────────
  infectologia: {
    id: 'infectologia',
    label: 'Infectología e Inmunología',
    description: 'Infectología, inmunología y alergología',
    icon: 'Shield',
    color: '#22C55E',
    bgColor: '#F0FDF4',
    gradient: 'from-green-500 to-emerald-700',
    order: 10,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Dermatología ─────────────────────────────────────────────────────
  dermatologia: {
    id: 'dermatologia',
    label: 'Dermatología',
    description: 'Dermatología general, dermato-oncología y dermatopatología',
    icon: 'Fingerprint',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    gradient: 'from-pink-500 to-rose-600',
    order: 11,
    specialtyCount: 4,
    dashboardLayout: 'clinical-standard',
  },

  // ── Psiquiatría y Salud Mental ───────────────────────────────────────
  mental: {
    id: 'mental',
    label: 'Psiquiatría y Salud Mental',
    description: 'Psiquiatría, psicología clínica, sexología y adicciones',
    icon: 'BrainCircuit',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    gradient: 'from-purple-600 to-indigo-700',
    order: 12,
    specialtyCount: 5,
    dashboardLayout: 'mental-health',
  },

  // ── Cirugía General y Subespecialidades ──────────────────────────────
  cirugia: {
    id: 'cirugia',
    label: 'Cirugía General y Subespecialidades',
    description: 'Cirugía general, bariátrica, laparoscópica, oncológica y pediátrica',
    icon: 'Scissors',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    gradient: 'from-indigo-500 to-indigo-700',
    order: 13,
    specialtyCount: 5,
    dashboardLayout: 'surgical',
  },

  // ── Traumatología y Ortopedia ────────────────────────────────────────
  traumatologia: {
    id: 'traumatologia',
    label: 'Traumatología y Ortopedia',
    description: 'Traumatología, artroscopia, cirugía de columna, medicina del deporte',
    icon: 'Bone',
    color: '#0891B2',
    bgColor: '#ECFEFF',
    gradient: 'from-cyan-600 to-teal-700',
    order: 14,
    specialtyCount: 6,
    dashboardLayout: 'surgical',
  },

  // ── Oftalmología ─────────────────────────────────────────────────────
  oftalmologia: {
    id: 'oftalmologia',
    label: 'Oftalmología',
    description: 'Oftalmología, retina y vítreo, glaucoma, cirugía refractiva',
    icon: 'Eye',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    gradient: 'from-blue-600 to-indigo-600',
    order: 15,
    specialtyCount: 6,
    dashboardLayout: 'clinical-standard',
  },

  // ── Otorrinolaringología ─────────────────────────────────────────────
  orl: {
    id: 'orl',
    label: 'Otorrinolaringología',
    description: 'ORL, audiología, foniatría y cirugía de cabeza y cuello',
    icon: 'Ear',
    color: '#059669',
    bgColor: '#ECFDF5',
    gradient: 'from-emerald-600 to-green-700',
    order: 16,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Ginecología y Obstetricia ────────────────────────────────────────
  ginecologia: {
    id: 'ginecologia',
    label: 'Ginecología y Obstetricia',
    description: 'Ginecología, obstetricia, medicina reproductiva y materno-fetal',
    icon: 'Baby',
    color: '#DB2777',
    bgColor: '#FDF2F8',
    gradient: 'from-pink-600 to-rose-700',
    order: 17,
    specialtyCount: 5,
    dashboardLayout: 'clinical-standard',
  },

  // ── Pediatría y Neonatología ─────────────────────────────────────────
  pediatria: {
    id: 'pediatria',
    label: 'Pediatría y Neonatología',
    description: 'Pediatría, neonatología, UCI pediátrica y medicina del adolescente',
    icon: 'Baby',
    color: '#F97316',
    bgColor: '#FFF7ED',
    gradient: 'from-orange-500 to-amber-600',
    order: 18,
    specialtyCount: 4,
    dashboardLayout: 'pediatric',
  },

  // ── Cirugía Plástica y Reconstructiva ────────────────────────────────
  plastica: {
    id: 'plastica',
    label: 'Cirugía Plástica y Reconstructiva',
    description: 'Cirugía plástica, estética y quemados',
    icon: 'Sparkles',
    color: '#E11D48',
    bgColor: '#FFF1F2',
    gradient: 'from-rose-600 to-pink-700',
    order: 19,
    specialtyCount: 3,
    dashboardLayout: 'surgical',
  },

  // ── Cirugía Vascular ─────────────────────────────────────────────────
  vascular: {
    id: 'vascular',
    label: 'Cirugía Vascular',
    description: 'Cirugía vascular y endovascular, angiología y flebología',
    icon: 'Activity',
    color: '#B91C1C',
    bgColor: '#FEF2F2',
    gradient: 'from-red-700 to-rose-800',
    order: 20,
    specialtyCount: 3,
    dashboardLayout: 'surgical',
  },

  // ── Medicina Intensiva y Emergencias ─────────────────────────────────
  intensiva: {
    id: 'intensiva',
    label: 'Medicina Intensiva y Emergencias',
    description: 'UCI, emergencias, medicina paliativa y del dolor',
    icon: 'Zap',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    gradient: 'from-yellow-500 to-orange-600',
    order: 21,
    specialtyCount: 4,
    dashboardLayout: 'emergency-critical',
  },

  // ── Diagnóstico por Imágenes ─────────────────────────────────────────
  diagnostico: {
    id: 'diagnostico',
    label: 'Diagnóstico por Imágenes',
    description: 'Radiología, medicina nuclear, intervencionismo y ecografía',
    icon: 'ScanLine',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    gradient: 'from-indigo-600 to-violet-700',
    order: 22,
    specialtyCount: 4,
    dashboardLayout: 'diagnostic-imaging',
  },

  // ── Anestesiología ───────────────────────────────────────────────────
  anestesia: {
    id: 'anestesia',
    label: 'Anestesiología',
    description: 'Anestesiología general, pediátrica y cardiovascular',
    icon: 'Gauge',
    color: '#475569',
    bgColor: '#F8FAFC',
    gradient: 'from-slate-500 to-slate-700',
    order: 23,
    specialtyCount: 3,
    dashboardLayout: 'surgical',
  },

  // ── Patología y Laboratorio ──────────────────────────────────────────
  patologia: {
    id: 'patologia',
    label: 'Patología y Laboratorio',
    description: 'Patología, patología clínica y citopatología',
    icon: 'Microscope',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    gradient: 'from-violet-600 to-purple-700',
    order: 24,
    specialtyCount: 3,
    dashboardLayout: 'laboratory',
  },

  // ── Medicina Física y Rehabilitación ─────────────────────────────────
  rehabilitacion: {
    id: 'rehabilitacion',
    label: 'Medicina Física y Rehabilitación',
    description: 'Rehabilitación, fisioterapia, terapia ocupacional y quiropráctica',
    icon: 'Dumbbell',
    color: '#10B981',
    bgColor: '#ECFDF5',
    gradient: 'from-emerald-500 to-teal-600',
    order: 25,
    specialtyCount: 4,
    dashboardLayout: 'rehabilitation',
  },

  // ── Genética y Medicina Especializada ────────────────────────────────
  especializada: {
    id: 'especializada',
    label: 'Genética y Medicina Especializada',
    description: 'Genética, farmacología, toxicología, medicina laboral, forense, preventiva',
    icon: 'Dna',
    color: '#0D9488',
    bgColor: '#F0FDFA',
    gradient: 'from-teal-600 to-cyan-700',
    order: 26,
    specialtyCount: 8,
    dashboardLayout: 'clinical-standard',
  },

  // ── Odontología y Subespecialidades ──────────────────────────────────
  odontologia: {
    id: 'odontologia',
    label: 'Odontología y Subespecialidades',
    description: 'Odontología general, ortodoncia, endodoncia, periodoncia, implantología, cirugía oral',
    icon: 'SmilePlus',
    color: '#0EA5E9',
    bgColor: '#F0F9FF',
    gradient: 'from-sky-500 to-cyan-600',
    order: 27,
    specialtyCount: 9,
    dashboardLayout: 'dental',
  },

  // ── Otras Especialidades ─────────────────────────────────────────────
  otros: {
    id: 'otros',
    label: 'Otras Especialidades',
    description: 'Psicología, podología, psicopedagogía, acupuntura, homeopatía',
    icon: 'MoreHorizontal',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    gradient: 'from-gray-500 to-gray-600',
    order: 28,
    specialtyCount: 6,
    dashboardLayout: 'clinical-standard',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtener metadata de una categoría
 */
export function getCategoryMeta(id: SpecialtyCategoryId): SpecialtyCategoryMeta {
  return CATEGORY_META[id];
}

/**
 * Obtener todas las categorías ordenadas
 */
export function getAllCategoriesSorted(): SpecialtyCategoryMeta[] {
  return Object.values(CATEGORY_META).sort((a, b) => a.order - b.order);
}

/**
 * Obtener categorías agrupadas por tipo de layout
 */
export function getCategoriesByLayout(
  layout: SpecialtyCategoryMeta['dashboardLayout']
): SpecialtyCategoryMeta[] {
  return Object.values(CATEGORY_META).filter((c) => c.dashboardLayout === layout);
}
