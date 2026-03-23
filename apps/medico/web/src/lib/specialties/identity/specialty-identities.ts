/**
 * @file specialty-identities.ts
 * @description Identidades completas de las 132 especialidades médicas.
 *
 * Cada especialidad tiene su slug canónico, masterId del master-list,
 * identidad visual, keywords de detección, y configuración de dashboard.
 *
 * Organizadas por categoría para facilitar mantenimiento.
 */

import type { SpecialtyIdentity } from '@red-salud/types';

// ============================================================================
// HELPER para crear identidades con defaults
// ============================================================================

function identity(
  partial: Omit<SpecialtyIdentity, 'bgColor' | 'gradient'> &
    Partial<Pick<SpecialtyIdentity, 'bgColor' | 'gradient'>>
): SpecialtyIdentity {
  return {
    bgColor: partial.bgColor ?? lightenColor(partial.color),
    gradient: partial.gradient ?? `from-[${partial.color}] to-[${darkenColor(partial.color)}]`,
    ...partial,
  };
}

function lightenColor(hex: string): string {
  // Simple lightening — append 15 to create a muted version
  const colorMap: Record<string, string> = {
    '#3B82F6': '#EFF6FF', '#EF4444': '#FEF2F2', '#8B5CF6': '#F5F3FF',
    '#F59E0B': '#FFFBEB', '#06B6D4': '#ECFEFF', '#0EA5E9': '#F0F9FF',
    '#14B8A6': '#F0FDFA', '#D97706': '#FFF7ED', '#DC2626': '#FEF2F2',
    '#22C55E': '#F0FDF4', '#EC4899': '#FDF2F8', '#7C3AED': '#F5F3FF',
    '#6366F1': '#EEF2FF', '#0891B2': '#ECFEFF', '#2563EB': '#EFF6FF',
    '#059669': '#ECFDF5', '#DB2777': '#FDF2F8', '#F97316': '#FFF7ED',
    '#E11D48': '#FFF1F2', '#B91C1C': '#FEF2F2', '#4F46E5': '#EEF2FF',
    '#475569': '#F8FAFC', '#10B981': '#ECFDF5', '#0D9488': '#F0FDFA',
    '#6B7280': '#F9FAFB',
  };
  return colorMap[hex] ?? '#F9FAFB';
}

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

// ============================================================================
// GENERAL (4)
// ============================================================================

const GENERAL: SpecialtyIdentity[] = [
  identity({
    slug: 'medicina-general',
    masterId: 'gen-1',
    name: 'Medicina General',
    shortName: 'Med. General',
    description: 'Atención médica integral y de primer contacto para todas las edades',
    categoryId: 'general',
    icon: 'Stethoscope',
    color: '#3B82F6',
    keywords: ['medicina general', 'medico general', 'medico de cabecera', 'general practitioner'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'mensajeria', 'telemedicina', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'satisfaccion', 'tiempo-consulta'],
    defaultAppointmentTypes: ['Consulta General', 'Control', 'Emergencia'],
    defaultAppointmentDuration: 20,
    supportsTelemedicine: true,
    requiresVerification: false,
    isSubSpecialty: false,
  }),
  identity({
    slug: 'medicina-familiar',
    masterId: 'gen-2',
    name: 'Medicina Familiar',
    shortName: 'Med. Familiar',
    description: 'Atención continua e integral del individuo y la familia',
    categoryId: 'general',
    icon: 'Users',
    color: '#3B82F6',
    keywords: ['medicina familiar', 'family medicine', 'medico familiar'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'mensajeria', 'telemedicina', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'satisfaccion', 'adherencia-tratamiento'],
    defaultAppointmentTypes: ['Consulta Familiar', 'Control', 'Visita Domiciliaria'],
    defaultAppointmentDuration: 25,
    supportsTelemedicine: true,
    requiresVerification: false,
    isSubSpecialty: false,
  }),
  identity({
    slug: 'geriatria',
    masterId: 'gen-3',
    name: 'Geriatría',
    shortName: 'Geriatría',
    description: 'Atención especializada en adultos mayores y envejecimiento',
    categoryId: 'general',
    icon: 'HeartHandshake',
    color: '#3B82F6',
    keywords: ['geriatria', 'geriatrics', 'adulto mayor', 'tercera edad'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'caidas-prevenidas', 'polifarmacia'],
    defaultAppointmentTypes: ['Consulta Geriátrica', 'Evaluación Funcional', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'medicina-general',
  }),
  identity({
    slug: 'medicina-interna',
    masterId: 'gen-4',
    name: 'Medicina Interna',
    shortName: 'Med. Interna',
    description: 'Diagnóstico y tratamiento no quirúrgico de enfermedades en adultos',
    categoryId: 'general',
    icon: 'Activity',
    color: '#3B82F6',
    keywords: ['medicina interna', 'internal medicine', 'internista'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'mensajeria', 'telemedicina', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'diagnosticos-acertados', 'tiempo-diagnostico'],
    defaultAppointmentTypes: ['Consulta Interna', 'Interconsulta', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: false,
  }),
];

// ============================================================================
// CARDIOVASCULAR (6)
// ============================================================================

const CARDIOVASCULAR: SpecialtyIdentity[] = [
  identity({
    slug: 'cardiologia',
    masterId: 'car-1',
    name: 'Cardiología',
    shortName: 'Cardio.',
    description: 'Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio',
    categoryId: 'cardiovascular',
    icon: 'Heart',
    color: '#EF4444',
    keywords: ['cardiologia', 'cardiology', 'cardiologo', 'corazon'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'telemedicina', 'estadisticas', 'ecg-viewer', 'alertas-criticas'],
    prioritizedKpis: ['pacientes-atendidos', 'ecg-realizados', 'eventos-cardiacos'],
    defaultAppointmentTypes: ['Consulta Cardiológica', 'Electrocardiograma', 'Ecocardiograma', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: false,
    childSlugs: ['cardiologia-intervencionista', 'electrofisiologia-cardiaca', 'hemodinamia', 'cardiologia-pediatrica', 'cirugia-cardiovascular'],
  }),
  identity({
    slug: 'cardiologia-intervencionista',
    masterId: 'car-2',
    name: 'Cardiología Intervencionista',
    shortName: 'Cardio. Interv.',
    description: 'Procedimientos invasivos cardíacos: cateterismo, stents, angioplastia',
    categoryId: 'cardiovascular',
    icon: 'HeartPulse',
    color: '#EF4444',
    keywords: ['cardiologia intervencionista', 'interventional cardiology', 'cateterismo', 'stent'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'estadisticas', 'ecg-viewer', 'alertas-criticas'],
    prioritizedKpis: ['procedimientos-realizados', 'tasa-exito', 'complicaciones'],
    defaultAppointmentTypes: ['Consulta Pre-procedimiento', 'Cateterismo', 'Control Post-procedimiento'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: false,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'cardiologia',
  }),
  identity({
    slug: 'electrofisiologia-cardiaca',
    masterId: 'car-3',
    name: 'Electrofisiología Cardíaca',
    shortName: 'Electrofisio.',
    description: 'Estudio y tratamiento de arritmias cardíacas',
    categoryId: 'cardiovascular',
    icon: 'Zap',
    color: '#EF4444',
    keywords: ['electrofisiologia', 'electrophysiology', 'arritmia', 'marcapasos', 'desfibrilador'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'ecg-viewer', 'alertas-criticas', 'estadisticas'],
    prioritizedKpis: ['estudios-electrofisiologicos', 'implantes-dispositivos', 'ablaciones'],
    defaultAppointmentTypes: ['Estudio Electrofisiológico', 'Control Dispositivo', 'Consulta'],
    defaultAppointmentDuration: 45,
    supportsTelemedicine: false,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'cardiologia',
  }),
  identity({
    slug: 'hemodinamia',
    masterId: 'car-4',
    name: 'Hemodinamia',
    shortName: 'Hemodin.',
    description: 'Diagnóstico y terapéutica vascular mediante cateterismo',
    categoryId: 'cardiovascular',
    icon: 'GitBranch',
    color: '#EF4444',
    keywords: ['hemodinamia', 'hemodynamics', 'cateterismo diagnostico'],
    defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'],
    prioritizedKpis: ['procedimientos-realizados', 'tasa-exito'],
    defaultAppointmentTypes: ['Cateterismo Diagnóstico', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: false,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'cardiologia',
  }),
  identity({
    slug: 'cardiologia-pediatrica',
    masterId: 'car-5',
    name: 'Cardiología Pediátrica',
    shortName: 'Cardio. Ped.',
    description: 'Enfermedades cardíacas en niños y recién nacidos',
    categoryId: 'cardiovascular',
    icon: 'Heart',
    color: '#EF4444',
    keywords: ['cardiologia pediatrica', 'pediatric cardiology', 'cardiopatia congenita'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'ecg-viewer', 'curvas-crecimiento', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'cardiopatias-diagnosticadas'],
    defaultAppointmentTypes: ['Consulta Cardio Pediátrica', 'Ecocardiograma Pediátrico', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'cardiologia',
  }),
  identity({
    slug: 'cirugia-cardiovascular',
    masterId: 'car-6',
    name: 'Cirugía Cardiovascular',
    shortName: 'Cir. Cardiov.',
    description: 'Cirugía del corazón y grandes vasos',
    categoryId: 'cardiovascular',
    icon: 'Scissors',
    color: '#EF4444',
    keywords: ['cirugia cardiovascular', 'cardiac surgery', 'cirugia cardiaca', 'bypass'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'alertas-criticas', 'estadisticas'],
    prioritizedKpis: ['cirugias-realizadas', 'mortalidad-quirurgica', 'tiempo-quirurgico'],
    defaultAppointmentTypes: ['Consulta Pre-quirúrgica', 'Control Post-quirúrgico'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: false,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'cardiologia',
  }),
];

// ============================================================================
// NEUROLOGÍA (5)
// ============================================================================

const NEUROLOGIA: SpecialtyIdentity[] = [
  identity({
    slug: 'neurologia',
    masterId: 'neu-1',
    name: 'Neurología',
    shortName: 'Neuro.',
    description: 'Diagnóstico y tratamiento de enfermedades del sistema nervioso',
    categoryId: 'neurologia',
    icon: 'Brain',
    color: '#8B5CF6',
    keywords: ['neurologia', 'neurology', 'neurologo', 'cerebro', 'nervioso'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'telemedicina', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'estudios-neurofisiologicos', 'interconsultas'],
    defaultAppointmentTypes: ['Consulta Neurológica', 'Electroencefalograma', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: false,
    childSlugs: ['neurocirugia', 'neurologia-pediatrica', 'neurofisiologia-clinica', 'neuropsicologia'],
  }),
  identity({
    slug: 'neurocirugia',
    masterId: 'neu-2',
    name: 'Neurocirugía',
    shortName: 'Neurocir.',
    description: 'Tratamiento quirúrgico de enfermedades del sistema nervioso',
    categoryId: 'neurologia',
    icon: 'Brain',
    color: '#8B5CF6',
    keywords: ['neurocirugia', 'neurosurgery', 'neurocirujano'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'],
    prioritizedKpis: ['cirugias-realizadas', 'tasa-exito', 'complicaciones'],
    defaultAppointmentTypes: ['Consulta Neuroquirúrgica', 'Control Post-operatorio'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: false,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'neurologia',
  }),
  identity({
    slug: 'neurologia-pediatrica',
    masterId: 'neu-3',
    name: 'Neurología Pediátrica',
    shortName: 'Neuro. Ped.',
    description: 'Enfermedades neurológicas en niños y adolescentes',
    categoryId: 'neurologia',
    icon: 'Brain',
    color: '#8B5CF6',
    keywords: ['neurologia pediatrica', 'pediatric neurology', 'neuropediatria'],
    defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'telemedicina', 'estadisticas'],
    prioritizedKpis: ['pacientes-atendidos', 'desarrollo-neuromotor'],
    defaultAppointmentTypes: ['Consulta Neuropediátrica', 'Evaluación del Desarrollo', 'Control'],
    defaultAppointmentDuration: 30,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'neurologia',
  }),
  identity({
    slug: 'neurofisiologia-clinica',
    masterId: 'neu-4',
    name: 'Neurofisiología Clínica',
    shortName: 'Neurofisio.',
    description: 'Estudio electrofisiológico del sistema nervioso',
    categoryId: 'neurologia',
    icon: 'BrainCircuit',
    color: '#8B5CF6',
    keywords: ['neurofisiologia', 'neurophysiology', 'electroencefalograma', 'electromiografia'],
    defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'],
    prioritizedKpis: ['estudios-realizados', 'electroencefalogramas'],
    defaultAppointmentTypes: ['EEG', 'EMG', 'Potenciales Evocados'],
    defaultAppointmentDuration: 45,
    supportsTelemedicine: false,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'neurologia',
  }),
  identity({
    slug: 'neuropsicologia',
    masterId: 'neu-5',
    name: 'Neuropsicología',
    shortName: 'Neuropsico.',
    description: 'Relación entre funciones cerebrales y comportamiento',
    categoryId: 'neurologia',
    icon: 'BrainCog',
    color: '#8B5CF6',
    keywords: ['neuropsicologia', 'neuropsychology', 'evaluacion neuropsicologica'],
    defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'],
    prioritizedKpis: ['evaluaciones-realizadas', 'rehabilitaciones-cognitivas'],
    defaultAppointmentTypes: ['Evaluación Neuropsicológica', 'Rehabilitación Cognitiva', 'Sesión'],
    defaultAppointmentDuration: 60,
    supportsTelemedicine: true,
    requiresVerification: true,
    isSubSpecialty: true,
    parentSlug: 'neurologia',
  }),
];

// ============================================================================
// DIGESTIVO (5)
// ============================================================================

const DIGESTIVO: SpecialtyIdentity[] = [
  identity({ slug: 'gastroenterologia', masterId: 'dig-1', name: 'Gastroenterología', shortName: 'Gastro.', description: 'Enfermedades del aparato digestivo', categoryId: 'digestivo', icon: 'Utensils', color: '#F59E0B', keywords: ['gastroenterologia', 'gastroenterology', 'gastroenterologo', 'estomago', 'intestino'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'endoscopias', 'colonoscopias'], defaultAppointmentTypes: ['Consulta Gastro', 'Endoscopia', 'Colonoscopia', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false, childSlugs: ['hepatologia', 'coloproctologia', 'gastroenterologia-pediatrica', 'endoscopia-digestiva'] }),
  identity({ slug: 'hepatologia', masterId: 'dig-2', name: 'Hepatología', shortName: 'Hepato.', description: 'Enfermedades del hígado, vías biliares y páncreas', categoryId: 'digestivo', icon: 'Utensils', color: '#F59E0B', keywords: ['hepatologia', 'hepatology', 'higado', 'hepatitis'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'biopsias-hepaticas'], defaultAppointmentTypes: ['Consulta Hepatológica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'gastroenterologia' }),
  identity({ slug: 'coloproctologia', masterId: 'dig-3', name: 'Coloproctología', shortName: 'Coloprocto.', description: 'Enfermedades del colon, recto y ano', categoryId: 'digestivo', icon: 'Utensils', color: '#F59E0B', keywords: ['coloproctologia', 'proctologia', 'colon', 'recto'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'procedimientos'], defaultAppointmentTypes: ['Consulta Proctológica', 'Procedimiento', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'gastroenterologia' }),
  identity({ slug: 'gastroenterologia-pediatrica', masterId: 'dig-4', name: 'Gastroenterología Pediátrica', shortName: 'Gastro. Ped.', description: 'Enfermedades digestivas en niños', categoryId: 'digestivo', icon: 'Utensils', color: '#F59E0B', keywords: ['gastroenterologia pediatrica', 'pediatric gastroenterology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'crecimiento-nutricional'], defaultAppointmentTypes: ['Consulta Gastro Pediátrica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'gastroenterologia' }),
  identity({ slug: 'endoscopia-digestiva', masterId: 'dig-5', name: 'Endoscopia Digestiva', shortName: 'Endoscopia', description: 'Procedimientos endoscópicos diagnósticos y terapéuticos', categoryId: 'digestivo', icon: 'Search', color: '#F59E0B', keywords: ['endoscopia', 'endoscopy', 'endoscopista'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['endoscopias-realizadas', 'hallazgos-significativos'], defaultAppointmentTypes: ['Endoscopia Superior', 'Colonoscopia', 'CPRE'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'gastroenterologia' }),
];

// ============================================================================
// RESPIRATORIO (4)
// ============================================================================

const RESPIRATORIO: SpecialtyIdentity[] = [
  identity({ slug: 'neumologia', masterId: 'res-1', name: 'Neumología', shortName: 'Neumo.', description: 'Enfermedades del sistema respiratorio', categoryId: 'respiratorio', icon: 'Wind', color: '#06B6D4', keywords: ['neumologia', 'pulmonology', 'neumologo', 'pulmon', 'respiratorio'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'espirometrias', 'oximetrias'], defaultAppointmentTypes: ['Consulta Neumológica', 'Espirometría', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'neumologia-pediatrica', masterId: 'res-2', name: 'Neumología Pediátrica', shortName: 'Neumo. Ped.', description: 'Enfermedades respiratorias en niños', categoryId: 'respiratorio', icon: 'Wind', color: '#06B6D4', keywords: ['neumologia pediatrica', 'pediatric pulmonology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'asma-controlada'], defaultAppointmentTypes: ['Consulta Neumo Pediátrica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'neumologia' }),
  identity({ slug: 'cirugia-toracica', masterId: 'res-3', name: 'Cirugía Torácica', shortName: 'Cir. Torácica', description: 'Cirugía del tórax y pulmones', categoryId: 'respiratorio', icon: 'Scissors', color: '#06B6D4', keywords: ['cirugia toracica', 'thoracic surgery'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'complicaciones'], defaultAppointmentTypes: ['Consulta Pre-quirúrgica', 'Control Post-quirúrgico'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'neumologia' }),
  identity({ slug: 'medicina-del-sueno', masterId: 'res-4', name: 'Medicina del Sueño', shortName: 'Med. Sueño', description: 'Diagnóstico y tratamiento de trastornos del sueño', categoryId: 'respiratorio', icon: 'Moon', color: '#06B6D4', keywords: ['medicina del sueno', 'sleep medicine', 'apnea', 'insomnio'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['polisomnografias', 'apnea-tratada'], defaultAppointmentTypes: ['Consulta del Sueño', 'Polisomnografía', 'Control CPAP'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'neumologia' }),
];

// ============================================================================
// RENAL (5)
// ============================================================================

const RENAL: SpecialtyIdentity[] = [
  identity({ slug: 'nefrologia', masterId: 'ren-1', name: 'Nefrología', shortName: 'Nefro.', description: 'Enfermedades de los riñones', categoryId: 'renal', icon: 'Droplets', color: '#0EA5E9', keywords: ['nefrologia', 'nephrology', 'nefrologo', 'rinon', 'renal', 'dialisis'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'tasa-filtracion-glomerular', 'dialisis-pacientes'], defaultAppointmentTypes: ['Consulta Nefrológica', 'Control Diálisis', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'nefrologia-pediatrica', masterId: 'ren-2', name: 'Nefrología Pediátrica', shortName: 'Nefro. Ped.', description: 'Enfermedades renales en niños', categoryId: 'renal', icon: 'Droplets', color: '#0EA5E9', keywords: ['nefrologia pediatrica', 'pediatric nephrology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos'], defaultAppointmentTypes: ['Consulta Nefro Pediátrica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'nefrologia' }),
  identity({ slug: 'urologia', masterId: 'ren-3', name: 'Urología', shortName: 'Uro.', description: 'Enfermedades del tracto urinario y sistema reproductor masculino', categoryId: 'renal', icon: 'Droplet', color: '#0EA5E9', keywords: ['urologia', 'urology', 'urologo', 'prostata', 'vejiga'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'procedimientos-urologicos'], defaultAppointmentTypes: ['Consulta Urológica', 'Cistoscopia', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'urologia-pediatrica', masterId: 'ren-4', name: 'Urología Pediátrica', shortName: 'Uro. Ped.', description: 'Enfermedades urológicas en niños', categoryId: 'renal', icon: 'Droplet', color: '#0EA5E9', keywords: ['urologia pediatrica', 'pediatric urology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'cirugias-pediatricas'], defaultAppointmentTypes: ['Consulta Uro Pediátrica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'urologia' }),
  identity({ slug: 'andrologia', masterId: 'ren-5', name: 'Andrología', shortName: 'Andro.', description: 'Salud reproductiva y sexual masculina', categoryId: 'renal', icon: 'User', color: '#0EA5E9', keywords: ['andrologia', 'andrology', 'andrologo', 'infertilidad masculina'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'espermiogramas'], defaultAppointmentTypes: ['Consulta Andrológica', 'Espermiograma', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'urologia' }),
];

// ============================================================================
// ENDOCRINO (4)
// ============================================================================

const ENDOCRINO: SpecialtyIdentity[] = [
  identity({ slug: 'endocrinologia', masterId: 'end-1', name: 'Endocrinología', shortName: 'Endocrino.', description: 'Enfermedades hormonales y metabólicas', categoryId: 'endocrino', icon: 'Pill', color: '#14B8A6', keywords: ['endocrinologia', 'endocrinology', 'endocrinologo', 'tiroides', 'hormona'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'hemoglobina-glicosilada', 'tiroides-controlada'], defaultAppointmentTypes: ['Consulta Endocrinológica', 'Control Diabetes', 'Control Tiroides'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'diabetologia', masterId: 'end-2', name: 'Diabetología', shortName: 'Diabeto.', description: 'Diagnóstico y manejo integral de la diabetes', categoryId: 'endocrino', icon: 'Pill', color: '#14B8A6', keywords: ['diabetologia', 'diabetology', 'diabetes', 'insulina'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['hemoglobina-glicosilada', 'hipoglucemias', 'adherencia'], defaultAppointmentTypes: ['Consulta Diabetes', 'Educación Diabetológica', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'endocrinologia' }),
  identity({ slug: 'endocrinologia-pediatrica', masterId: 'end-3', name: 'Endocrinología Pediátrica', shortName: 'Endocrino. Ped.', description: 'Enfermedades hormonales en niños', categoryId: 'endocrino', icon: 'Pill', color: '#14B8A6', keywords: ['endocrinologia pediatrica', 'pediatric endocrinology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'crecimiento-controlado'], defaultAppointmentTypes: ['Consulta Endocrino Pediátrica', 'Control Crecimiento'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'endocrinologia' }),
  identity({ slug: 'nutriologia', masterId: 'end-4', name: 'Nutriología', shortName: 'Nutrio.', description: 'Nutrición clínica y dietética', categoryId: 'endocrino', icon: 'Apple', color: '#14B8A6', keywords: ['nutriologia', 'nutrition', 'nutricionista', 'nutriologo', 'dieta'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'peso-objetivo', 'adherencia-dieta'], defaultAppointmentTypes: ['Consulta Nutricional', 'Plan Alimenticio', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: false, isSubSpecialty: true, parentSlug: 'endocrinologia' }),
];

// ============================================================================
// REUMATOLOGÍA (2)
// ============================================================================

const REUMATOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'reumatologia', masterId: 'reu-1', name: 'Reumatología', shortName: 'Reumato.', description: 'Enfermedades autoinmunes y del aparato locomotor', categoryId: 'reumatologia', icon: 'Bone', color: '#D97706', keywords: ['reumatologia', 'rheumatology', 'reumatologo', 'artritis', 'lupus'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'actividad-enfermedad', 'remision'], defaultAppointmentTypes: ['Consulta Reumatológica', 'Infiltración', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'reumatologia-pediatrica', masterId: 'reu-2', name: 'Reumatología Pediátrica', shortName: 'Reumato. Ped.', description: 'Enfermedades reumáticas en niños', categoryId: 'reumatologia', icon: 'Bone', color: '#D97706', keywords: ['reumatologia pediatrica', 'pediatric rheumatology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'artritis-juvenil'], defaultAppointmentTypes: ['Consulta Reumato Pediátrica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'reumatologia' }),
];

// ============================================================================
// HEMATOLOGÍA (5)
// ============================================================================

const HEMATOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'hematologia', masterId: 'hem-1', name: 'Hematología', shortName: 'Hemato.', description: 'Enfermedades de la sangre y órganos hematopoyéticos', categoryId: 'hematologia', icon: 'Syringe', color: '#DC2626', keywords: ['hematologia', 'hematology', 'hematologo', 'sangre', 'anemia', 'leucemia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'hemogramas', 'transfusiones'], defaultAppointmentTypes: ['Consulta Hematológica', 'Control hemograma', 'Biopsia médula'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'oncologia-medica', masterId: 'hem-2', name: 'Oncología Médica', shortName: 'Onco. Méd.', description: 'Diagnóstico y tratamiento del cáncer', categoryId: 'hematologia', icon: 'Ribbon', color: '#DC2626', keywords: ['oncologia', 'oncology', 'oncologo', 'cancer', 'quimioterapia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'estadisticas'], prioritizedKpis: ['pacientes-en-tratamiento', 'ciclos-quimioterapia', 'supervivencia'], defaultAppointmentTypes: ['Consulta Oncológica', 'Quimioterapia', 'Seguimiento'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'oncologia-radioterapica', masterId: 'hem-3', name: 'Oncología Radioterápica', shortName: 'Radioter.', description: 'Tratamiento del cáncer con radioterapia', categoryId: 'hematologia', icon: 'Radiation', color: '#DC2626', keywords: ['radioterapia', 'radiation therapy', 'oncologia radioterapica'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['sesiones-radioterapia', 'tolerancia-tratamiento'], defaultAppointmentTypes: ['Simulación', 'Sesión Radioterapia', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'oncologia-medica' }),
  identity({ slug: 'hemato-oncologia-pediatrica', masterId: 'hem-4', name: 'Hemato-Oncología Pediátrica', shortName: 'Hemato-Onco Ped.', description: 'Cáncer y enfermedades hematológicas en niños', categoryId: 'hematologia', icon: 'Syringe', color: '#DC2626', keywords: ['hemato-oncologia pediatrica', 'pediatric hematology oncology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-en-tratamiento', 'supervivencia'], defaultAppointmentTypes: ['Consulta Hemato-Onco Pediátrica', 'Quimioterapia', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'hematologia' }),
  identity({ slug: 'mastologia', masterId: 'hem-5', name: 'Mastología', shortName: 'Masto.', description: 'Enfermedades de la glándula mamaria', categoryId: 'hematologia', icon: 'Ribbon', color: '#DC2626', keywords: ['mastologia', 'mastology', 'mastologo', 'mama', 'seno'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['mamografias', 'biopsias', 'deteccion-temprana'], defaultAppointmentTypes: ['Consulta Mastológica', 'Biopsia', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
];

// ============================================================================
// INFECTOLOGÍA (5)
// ============================================================================

const INFECTOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'infectologia', masterId: 'inf-1', name: 'Infectología', shortName: 'Infecto.', description: 'Enfermedades infecciosas', categoryId: 'infectologia', icon: 'Shield', color: '#22C55E', keywords: ['infectologia', 'infectious disease', 'infectologo', 'infeccion', 'vih', 'tuberculosis'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'infecciones-resueltas', 'antibiogramas'], defaultAppointmentTypes: ['Consulta Infectológica', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'infectologia-pediatrica', masterId: 'inf-2', name: 'Infectología Pediátrica', shortName: 'Infecto. Ped.', description: 'Enfermedades infecciosas en niños', categoryId: 'infectologia', icon: 'Shield', color: '#22C55E', keywords: ['infectologia pediatrica', 'pediatric infectious disease'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'vacunacion', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'vacunaciones'], defaultAppointmentTypes: ['Consulta Infecto Pediátrica', 'Vacunación', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'infectologia' }),
  identity({ slug: 'inmunologia', masterId: 'inf-3', name: 'Inmunología', shortName: 'Inmuno.', description: 'Sistema inmunológico y sus patologías', categoryId: 'infectologia', icon: 'ShieldCheck', color: '#22C55E', keywords: ['inmunologia', 'immunology', 'inmunologo', 'autoinmune'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'inmunodeficiencias'], defaultAppointmentTypes: ['Consulta Inmunológica', 'Prueba de Alergia', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'alergologia', masterId: 'inf-4', name: 'Alergología', shortName: 'Alergo.', description: 'Diagnóstico y tratamiento de alergias', categoryId: 'infectologia', icon: 'Flower2', color: '#22C55E', keywords: ['alergologia', 'allergology', 'alergologo', 'alergia', 'rinitis'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pruebas-cutaneas', 'inmunoterapias', 'alergias-controladas'], defaultAppointmentTypes: ['Consulta Alergológica', 'Prueba Cutánea', 'Inmunoterapia'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'alergologia-pediatrica', masterId: 'inf-5', name: 'Alergología e Inmunología Pediátrica', shortName: 'Alergo. Ped.', description: 'Alergias e inmunodeficiencias en niños', categoryId: 'infectologia', icon: 'Flower2', color: '#22C55E', keywords: ['alergologia pediatrica', 'pediatric allergy', 'inmunologia pediatrica'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'vacunacion', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'alergias-controladas'], defaultAppointmentTypes: ['Consulta Alergo Pediátrica', 'Prueba Cutánea', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'alergologia' }),
];

// ============================================================================
// DERMATOLOGÍA (4)
// ============================================================================

const DERMATOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'dermatologia', masterId: 'der-1', name: 'Dermatología', shortName: 'Dermato.', description: 'Enfermedades de la piel, pelo y uñas', categoryId: 'dermatologia', icon: 'Fingerprint', color: '#EC4899', keywords: ['dermatologia', 'dermatology', 'dermatologo', 'piel', 'cutaneo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'biopsias', 'dermatoscopias'], defaultAppointmentTypes: ['Consulta Dermatológica', 'Dermatoscopia', 'Procedimiento', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'dermato-oncologia', masterId: 'der-2', name: 'Dermato-oncología', shortName: 'Dermato-Onco.', description: 'Cáncer de piel y lesiones precancerosas', categoryId: 'dermatologia', icon: 'Fingerprint', color: '#EC4899', keywords: ['dermato-oncologia', 'dermato oncology', 'melanoma', 'cancer de piel'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['biopsias', 'melanomas-detectados', 'deteccion-temprana'], defaultAppointmentTypes: ['Consulta Dermato-Onco', 'Biopsia', 'Seguimiento'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'dermatologia' }),
  identity({ slug: 'dermatopatologia', masterId: 'der-3', name: 'Dermatopatología', shortName: 'Dermatopato.', description: 'Diagnóstico histopatológico de enfermedades cutáneas', categoryId: 'dermatologia', icon: 'Microscope', color: '#EC4899', keywords: ['dermatopatologia', 'dermatopathology', 'histopatologia cutanea'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'estadisticas'], prioritizedKpis: ['biopsias-analizadas', 'informes-emitidos'], defaultAppointmentTypes: ['Consulta Dermatopatológica', 'Revisión Histología'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'dermatologia' }),
  identity({ slug: 'dermatologia-pediatrica', masterId: 'der-4', name: 'Dermatología Pediátrica', shortName: 'Dermato. Ped.', description: 'Enfermedades cutáneas en niños', categoryId: 'dermatologia', icon: 'Fingerprint', color: '#EC4899', keywords: ['dermatologia pediatrica', 'pediatric dermatology'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'dermatitis-controlada'], defaultAppointmentTypes: ['Consulta Dermato Pediátrica', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'dermatologia' }),
];

// ============================================================================
// MENTAL (5)
// ============================================================================

const MENTAL: SpecialtyIdentity[] = [
  identity({ slug: 'psiquiatria', masterId: 'psi-1', name: 'Psiquiatría', shortName: 'Psiq.', description: 'Diagnóstico y tratamiento de trastornos mentales', categoryId: 'mental', icon: 'BrainCircuit', color: '#7C3AED', keywords: ['psiquiatria', 'psychiatry', 'psiquiatra', 'trastorno mental', 'depresion', 'ansiedad'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'adherencia-tratamiento', 'crisis-atendidas'], defaultAppointmentTypes: ['Consulta Psiquiátrica', 'Sesión de Seguimiento', 'Control Medicación'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'psiquiatria-infantil', masterId: 'psi-2', name: 'Psiquiatría Infantil y del Adolescente', shortName: 'Psiq. Infantil', description: 'Salud mental en niños y adolescentes', categoryId: 'mental', icon: 'BrainCircuit', color: '#7C3AED', keywords: ['psiquiatria infantil', 'child psychiatry', 'psiquiatria adolescente', 'paidopsiquiatria'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'tdah-tratados'], defaultAppointmentTypes: ['Consulta Psiq. Infantil', 'Terapia', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'psiquiatria' }),
  identity({ slug: 'psicologia-clinica', masterId: 'psi-3', name: 'Psicología Clínica', shortName: 'Psico. Clín.', description: 'Evaluación y tratamiento psicológico', categoryId: 'mental', icon: 'Brain', color: '#7C3AED', keywords: ['psicologia clinica', 'clinical psychology', 'psicologo clinico', 'terapia psicologica'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'sesiones-realizadas', 'mejoria-clinica'], defaultAppointmentTypes: ['Sesión Terapéutica', 'Evaluación Psicológica', 'Seguimiento'], defaultAppointmentDuration: 50, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'sexologia-clinica', masterId: 'psi-4', name: 'Sexología Clínica', shortName: 'Sexo. Clín.', description: 'Salud sexual y trastornos sexuales', categoryId: 'mental', icon: 'Heart', color: '#7C3AED', keywords: ['sexologia', 'sexology', 'sexologo', 'disfuncion sexual'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'satisfaccion-terapia'], defaultAppointmentTypes: ['Consulta Sexológica', 'Terapia de Pareja', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'psicologia-clinica' }),
  identity({ slug: 'adicciones', masterId: 'psi-5', name: 'Adicciones y Toxicomanías', shortName: 'Adicciones', description: 'Prevención y tratamiento de adicciones', categoryId: 'mental', icon: 'ShieldAlert', color: '#7C3AED', keywords: ['adicciones', 'toxicomania', 'addiction', 'drogadiccion', 'alcoholismo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-en-programa', 'recaidas', 'tiempo-abstinencia'], defaultAppointmentTypes: ['Consulta Adicciones', 'Terapia Grupal', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'psiquiatria' }),
];

// ============================================================================
// CIRUGÍA (5)
// ============================================================================

const CIRUGIA: SpecialtyIdentity[] = [
  identity({ slug: 'cirugia-general', masterId: 'cir-1', name: 'Cirugía General', shortName: 'Cir. Gral.', description: 'Cirugía abdominal, heridas, emergencias quirúrgicas', categoryId: 'cirugia', icon: 'Scissors', color: '#6366F1', keywords: ['cirugia general', 'general surgery', 'cirujano general'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'complicaciones', 'tiempo-quirurgico'], defaultAppointmentTypes: ['Consulta Pre-quirúrgica', 'Control Post-operatorio'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'cirugia-bariatrica', masterId: 'cir-2', name: 'Cirugía Bariátrica', shortName: 'Cir. Bariát.', description: 'Cirugía para el tratamiento de la obesidad', categoryId: 'cirugia', icon: 'Scissors', color: '#6366F1', keywords: ['cirugia bariatrica', 'bariatric surgery', 'obesidad', 'bypass gastrico', 'manga gastrica'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'perdida-peso', 'complicaciones'], defaultAppointmentTypes: ['Consulta Bariátrica', 'Control Nutricional', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-general' }),
  identity({ slug: 'cirugia-laparoscopica', masterId: 'cir-3', name: 'Cirugía Laparoscópica', shortName: 'Cir. Laparo.', description: 'Cirugía mínimamente invasiva', categoryId: 'cirugia', icon: 'Scissors', color: '#6366F1', keywords: ['cirugia laparoscopica', 'laparoscopic surgery', 'laparoscopia', 'minima invasion'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'conversion-abierta', 'estancia-hospitalaria'], defaultAppointmentTypes: ['Consulta Pre-quirúrgica', 'Control Post-operatorio'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-general' }),
  identity({ slug: 'cirugia-oncologica', masterId: 'cir-4', name: 'Cirugía Oncológica', shortName: 'Cir. Onco.', description: 'Resección quirúrgica de tumores', categoryId: 'cirugia', icon: 'Scissors', color: '#6366F1', keywords: ['cirugia oncologica', 'surgical oncology', 'cancer cirugia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'margenes-libres', 'supervivencia'], defaultAppointmentTypes: ['Consulta Onco-quirúrgica', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-general' }),
  identity({ slug: 'cirugia-pediatrica', masterId: 'cir-5', name: 'Cirugía Pediátrica', shortName: 'Cir. Ped.', description: 'Cirugía en niños y recién nacidos', categoryId: 'cirugia', icon: 'Scissors', color: '#6366F1', keywords: ['cirugia pediatrica', 'pediatric surgery'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'complicaciones'], defaultAppointmentTypes: ['Consulta Pre-quirúrgica Pediátrica', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-general' }),
];

// ============================================================================
// TRAUMATOLOGÍA (6)
// ============================================================================

const TRAUMATOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'traumatologia', masterId: 'tra-1', name: 'Traumatología y Ortopedia', shortName: 'Trauma.', description: 'Lesiones del aparato locomotor y sistema óseo', categoryId: 'traumatologia', icon: 'Bone', color: '#0891B2', keywords: ['traumatologia', 'ortopedia', 'orthopedics', 'traumatologo', 'fractura', 'hueso'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'cirugias', 'fracturas-tratadas'], defaultAppointmentTypes: ['Consulta Traumatológica', 'Control Fractura', 'Post-operatorio'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'artroscopia', masterId: 'tra-2', name: 'Artroscopia', shortName: 'Artroscopia', description: 'Cirugía articular mínimamente invasiva', categoryId: 'traumatologia', icon: 'Target', color: '#0891B2', keywords: ['artroscopia', 'arthroscopy', 'articular'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['artroscopias-realizadas', 'rehabilitacion'], defaultAppointmentTypes: ['Consulta Artroscopia', 'Control Post-operatorio'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'traumatologia' }),
  identity({ slug: 'cirugia-columna', masterId: 'tra-3', name: 'Cirugía de Columna', shortName: 'Cir. Columna', description: 'Patologías de la columna vertebral', categoryId: 'traumatologia', icon: 'AlignCenter', color: '#0891B2', keywords: ['cirugia de columna', 'spine surgery', 'columna vertebral', 'hernia discal'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-columna', 'mejoria-funcional'], defaultAppointmentTypes: ['Consulta Columna', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'traumatologia' }),
  identity({ slug: 'cirugia-mano', masterId: 'tra-4', name: 'Cirugía de Mano', shortName: 'Cir. Mano', description: 'Patologías de la mano y extremidades superiores', categoryId: 'traumatologia', icon: 'Hand', color: '#0891B2', keywords: ['cirugia de mano', 'hand surgery', 'tunel carpiano', 'mano'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-mano', 'rehabilitacion-funcional'], defaultAppointmentTypes: ['Consulta Mano', 'Control Post-operatorio'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'traumatologia' }),
  identity({ slug: 'medicina-deporte', masterId: 'tra-5', name: 'Medicina del Deporte', shortName: 'Med. Deporte', description: 'Lesiones deportivas y rendimiento atlético', categoryId: 'traumatologia', icon: 'Dumbbell', color: '#0891B2', keywords: ['medicina del deporte', 'sports medicine', 'medicina deportiva', 'deportologo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['atletas-atendidos', 'retorno-actividad', 'lesiones-prevenidas'], defaultAppointmentTypes: ['Consulta Deportiva', 'Evaluación Funcional', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'traumatologia' }),
  identity({ slug: 'ortopedia-pediatrica', masterId: 'tra-6', name: 'Ortopedia Pediátrica', shortName: 'Ortopedia Ped.', description: 'Problemas ortopédicos en niños', categoryId: 'traumatologia', icon: 'Bone', color: '#0891B2', keywords: ['ortopedia pediatrica', 'pediatric orthopedics'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'imagenologia', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos'], defaultAppointmentTypes: ['Consulta Ortopédica Pediátrica', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'traumatologia' }),
];

// ============================================================================
// OFTALMOLOGÍA (6)
// ============================================================================

const OFTALMOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'oftalmologia', masterId: 'oft-1', name: 'Oftalmología', shortName: 'Oftalmo.', description: 'Enfermedades de los ojos y la visión', categoryId: 'oftalmologia', icon: 'Eye', color: '#2563EB', keywords: ['oftalmologia', 'ophthalmology', 'oftalmologo', 'ojo', 'vision'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'cirugias-oculares', 'agudeza-visual'], defaultAppointmentTypes: ['Consulta Oftalmológica', 'Fondo de Ojo', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'retina-vitreo', masterId: 'oft-2', name: 'Retina y Vítreo', shortName: 'Retina', description: 'Enfermedades de la retina y el vítreo', categoryId: 'oftalmologia', icon: 'Eye', color: '#2563EB', keywords: ['retina', 'vitreo', 'retinologo', 'degeneracion macular', 'retinopatia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['procedimientos-retina', 'inyecciones-intravitreas'], defaultAppointmentTypes: ['Consulta Retina', 'Inyección Intravítrea', 'Fotocoagulación'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'oftalmologia' }),
  identity({ slug: 'glaucoma', masterId: 'oft-3', name: 'Glaucoma', shortName: 'Glaucoma', description: 'Diagnóstico y tratamiento del glaucoma', categoryId: 'oftalmologia', icon: 'Eye', color: '#2563EB', keywords: ['glaucoma', 'presion ocular', 'presion intraocular'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['presion-intraocular', 'campo-visual', 'cirugias-glaucoma'], defaultAppointmentTypes: ['Consulta Glaucoma', 'Campimetría', 'Control PIO'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'oftalmologia' }),
  identity({ slug: 'oftalmologia-pediatrica', masterId: 'oft-4', name: 'Oftalmología Pediátrica', shortName: 'Oftalmo. Ped.', description: 'Problemas visuales en niños', categoryId: 'oftalmologia', icon: 'Eye', color: '#2563EB', keywords: ['oftalmologia pediatrica', 'pediatric ophthalmology', 'estrabismo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'estrabismos-tratados'], defaultAppointmentTypes: ['Consulta Oftalmo Pediátrica', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'oftalmologia' }),
  identity({ slug: 'cirugia-refractiva', masterId: 'oft-5', name: 'Cirugía Refractiva', shortName: 'Cir. Refract.', description: 'Corrección quirúrgica de defectos refractivos', categoryId: 'oftalmologia', icon: 'Focus', color: '#2563EB', keywords: ['cirugia refractiva', 'refractive surgery', 'lasik', 'miopia', 'astigmatismo'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'presupuestos', 'estadisticas'], prioritizedKpis: ['cirugias-lasik', 'agudeza-post-operatoria'], defaultAppointmentTypes: ['Evaluación Refractiva', 'LASIK', 'Control Post-operatorio'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'oftalmologia' }),
  identity({ slug: 'optometria', masterId: 'oft-6', name: 'Optometría', shortName: 'Optometría', description: 'Examen visual y prescripción de lentes', categoryId: 'oftalmologia', icon: 'Glasses', color: '#2563EB', keywords: ['optometria', 'optometry', 'optometrista', 'lentes', 'anteojos'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['examenes-visuales', 'prescripciones-lentes'], defaultAppointmentTypes: ['Examen Visual', 'Control Lentes', 'Adaptación Contacto'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
];

// ============================================================================
// ORL (5)
// ============================================================================

const ORL: SpecialtyIdentity[] = [
  identity({ slug: 'otorrinolaringologia', masterId: 'orl-1', name: 'Otorrinolaringología', shortName: 'ORL', description: 'Enfermedades de oído, nariz y garganta', categoryId: 'orl', icon: 'Ear', color: '#059669', keywords: ['otorrinolaringologia', 'otolaryngology', 'otorrino', 'oido', 'nariz', 'garganta', 'orl'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'cirugias-orl', 'audiometrias'], defaultAppointmentTypes: ['Consulta ORL', 'Audiometría', 'Cirugía ORL'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'audiologia', masterId: 'orl-2', name: 'Audiología', shortName: 'Audio.', description: 'Evaluación y rehabilitación de la audición', categoryId: 'orl', icon: 'Volume2', color: '#059669', keywords: ['audiologia', 'audiology', 'audiologo', 'audicion', 'sordera'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['audiometrias', 'adaptaciones-audifonos'], defaultAppointmentTypes: ['Audiometría', 'Adaptación Audífono', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'otorrinolaringologia' }),
  identity({ slug: 'foniatria', masterId: 'orl-3', name: 'Foniatría', shortName: 'Foniatría', description: 'Trastornos de la voz, habla y lenguaje', categoryId: 'orl', icon: 'Mic', color: '#059669', keywords: ['foniatria', 'phoniatrics', 'foniatra', 'voz', 'disfonia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'rehabilitacion-vocal'], defaultAppointmentTypes: ['Consulta Foniátrica', 'Terapia de Voz', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'otorrinolaringologia' }),
  identity({ slug: 'logofonoaudiologia', masterId: 'orl-4', name: 'Logofonoaudiología', shortName: 'Logofono.', description: 'Evaluación y tratamiento de trastornos del lenguaje y comunicación', categoryId: 'orl', icon: 'MessageCircle', color: '#059669', keywords: ['logofonoaudiologia', 'fonoaudiologia', 'speech therapy', 'logopeda', 'fonoaudiologo'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['sesiones-realizadas', 'mejoria-comunicativa'], defaultAppointmentTypes: ['Evaluación del Lenguaje', 'Terapia del Lenguaje', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'otorrinolaringologia' }),
  identity({ slug: 'cirugia-cabeza-cuello', masterId: 'orl-5', name: 'Cirugía de Cabeza y Cuello', shortName: 'Cir. Cab/Cuello', description: 'Cirugía oncológica y reconstructiva de cabeza y cuello', categoryId: 'orl', icon: 'Scissors', color: '#059669', keywords: ['cirugia de cabeza y cuello', 'head and neck surgery', 'tiroides cirugia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'complicaciones'], defaultAppointmentTypes: ['Consulta Pre-quirúrgica', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'otorrinolaringologia' }),
];

// ============================================================================
// GINECOLOGÍA (5)
// ============================================================================

const GINECOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'ginecologia', masterId: 'gin-1', name: 'Ginecología', shortName: 'Gineco.', description: 'Salud del sistema reproductor femenino', categoryId: 'ginecologia', icon: 'Baby', color: '#DB2777', keywords: ['ginecologia', 'gynecology', 'ginecologo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidas', 'citologias', 'ecografias-ginecologicas'], defaultAppointmentTypes: ['Consulta Ginecológica', 'Citología', 'Ecografía', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'obstetricia', masterId: 'gin-2', name: 'Obstetricia', shortName: 'Obstetricia', description: 'Atención del embarazo, parto y puerperio', categoryId: 'ginecologia', icon: 'Baby', color: '#DB2777', keywords: ['obstetricia', 'obstetrics', 'obstetra', 'embarazo', 'parto', 'prenatal'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['controles-prenatales', 'partos-atendidos', 'cesareas'], defaultAppointmentTypes: ['Control Prenatal', 'Ecografía Obstétrica', 'Monitoreo Fetal'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-reproductiva', masterId: 'gin-3', name: 'Medicina Reproductiva', shortName: 'Med. Reprod.', description: 'Fertilidad y reproducción asistida', categoryId: 'ginecologia', icon: 'Sparkles', color: '#DB2777', keywords: ['medicina reproductiva', 'reproductive medicine', 'fertilidad', 'fecundacion in vitro', 'fiv'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'estadisticas'], prioritizedKpis: ['ciclos-fiv', 'tasa-embarazo', 'tratamientos-fertilidad'], defaultAppointmentTypes: ['Consulta Fertilidad', 'Monitoreo Ovulación', 'Procedimiento'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'ginecologia' }),
  identity({ slug: 'ginecologia-oncologica', masterId: 'gin-4', name: 'Ginecología Oncológica', shortName: 'Gineco. Onco.', description: 'Cáncer ginecológico', categoryId: 'ginecologia', icon: 'Ribbon', color: '#DB2777', keywords: ['ginecologia oncologica', 'gynecologic oncology', 'cancer ginecologico', 'cancer cervix'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-en-tratamiento', 'cirugias-oncologicas', 'supervivencia'], defaultAppointmentTypes: ['Consulta Gineco-Onco', 'Quimioterapia', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'ginecologia' }),
  identity({ slug: 'medicina-materno-fetal', masterId: 'gin-5', name: 'Medicina Materno-Fetal', shortName: 'Mat.-Fetal', description: 'Embarazos de alto riesgo', categoryId: 'ginecologia', icon: 'HeartPulse', color: '#DB2777', keywords: ['materno fetal', 'maternal fetal medicine', 'perinatologia', 'embarazo alto riesgo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'laboratorio', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['embarazos-alto-riesgo', 'ecografias-detalladas'], defaultAppointmentTypes: ['Consulta Materno-Fetal', 'Ecografía Detallada', 'Monitoreo'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'obstetricia' }),
];

// ============================================================================
// PEDIATRÍA (4)
// ============================================================================

const PEDIATRIA: SpecialtyIdentity[] = [
  identity({ slug: 'pediatria', masterId: 'ped-1', name: 'Pediatría', shortName: 'Pedia.', description: 'Atención integral de niños y adolescentes', categoryId: 'pediatria', icon: 'Baby', color: '#F97316', keywords: ['pediatria', 'pediatrics', 'pediatra', 'ninos', 'infante'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'vacunacion', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'vacunaciones', 'control-nino-sano'], defaultAppointmentTypes: ['Consulta Pediátrica', 'Control Niño Sano', 'Vacunación', 'Emergencia'], defaultAppointmentDuration: 20, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'neonatologia', masterId: 'ped-2', name: 'Neonatología', shortName: 'Neonato.', description: 'Atención del recién nacido, especialmente prematuros', categoryId: 'pediatria', icon: 'Baby', color: '#F97316', keywords: ['neonatologia', 'neonatology', 'neonatologo', 'recien nacido', 'prematuro'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['neonatos-atendidos', 'prematuros', 'mortalidad-neonatal'], defaultAppointmentTypes: ['Atención Neonatal', 'Control Prematuro', 'Seguimiento'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'pediatria' }),
  identity({ slug: 'cuidados-intensivos-pediatricos', masterId: 'ped-3', name: 'Cuidados Intensivos Pediátricos', shortName: 'UCI Ped.', description: 'Cuidados críticos en niños', categoryId: 'pediatria', icon: 'HeartPulse', color: '#F97316', keywords: ['cuidados intensivos pediatricos', 'pediatric intensive care', 'uci pediatrica', 'ucip'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['pacientes-uci', 'dias-estancia', 'mortalidad'], defaultAppointmentTypes: ['Interconsulta UCI', 'Seguimiento'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'pediatria' }),
  identity({ slug: 'medicina-adolescente', masterId: 'ped-4', name: 'Medicina del Adolescente', shortName: 'Med. Adolesc.', description: 'Salud integral del adolescente', categoryId: 'pediatria', icon: 'User', color: '#F97316', keywords: ['medicina del adolescente', 'adolescent medicine', 'adolescente', 'hebiatria'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'salud-mental-adolescente'], defaultAppointmentTypes: ['Consulta Adolescente', 'Evaluación Integral', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'pediatria' }),
];

// ============================================================================
// PLÁSTICA (3)
// ============================================================================

const PLASTICA: SpecialtyIdentity[] = [
  identity({ slug: 'cirugia-plastica', masterId: 'pla-1', name: 'Cirugía Plástica y Reconstructiva', shortName: 'Cir. Plástica', description: 'Cirugía reconstructiva y reparadora', categoryId: 'plastica', icon: 'Sparkles', color: '#E11D48', keywords: ['cirugia plastica', 'plastic surgery', 'cirujano plastico', 'reconstructiva'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'presupuestos', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'satisfaccion-paciente'], defaultAppointmentTypes: ['Consulta Plástica', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'cirugia-estetica', masterId: 'pla-2', name: 'Cirugía Estética', shortName: 'Cir. Estética', description: 'Procedimientos estéticos y cosméticos', categoryId: 'plastica', icon: 'Sparkles', color: '#E11D48', keywords: ['cirugia estetica', 'cosmetic surgery', 'estetica', 'liposuccion', 'rinoplastia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'presupuestos', 'membresias', 'estadisticas'], prioritizedKpis: ['procedimientos-esteticos', 'satisfaccion-paciente', 'ingresos'], defaultAppointmentTypes: ['Consulta Estética', 'Procedimiento', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-plastica' }),
  identity({ slug: 'quemados', masterId: 'pla-3', name: 'Quemados', shortName: 'Quemados', description: 'Atención y rehabilitación de pacientes quemados', categoryId: 'plastica', icon: 'Flame', color: '#E11D48', keywords: ['quemados', 'burn surgery', 'quemadura'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'injertos-realizados'], defaultAppointmentTypes: ['Consulta Quemados', 'Curaciones', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-plastica' }),
];

// ============================================================================
// VASCULAR (3)
// ============================================================================

const VASCULAR: SpecialtyIdentity[] = [
  identity({ slug: 'cirugia-vascular', masterId: 'vas-1', name: 'Cirugía Vascular y Endovascular', shortName: 'Cir. Vascular', description: 'Enfermedades de arterias y venas', categoryId: 'vascular', icon: 'Activity', color: '#B91C1C', keywords: ['cirugia vascular', 'vascular surgery', 'cirujano vascular', 'aneurisma', 'varices'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['cirugias-vasculares', 'procedimientos-endovasculares'], defaultAppointmentTypes: ['Consulta Vascular', 'Eco Doppler', 'Control Post-operatorio'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'angiologia', masterId: 'vas-2', name: 'Angiología', shortName: 'Angio.', description: 'Diagnóstico y tratamiento de enfermedades vasculares', categoryId: 'vascular', icon: 'GitBranch', color: '#B91C1C', keywords: ['angiologia', 'angiology', 'angiologo'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'eco-doppler'], defaultAppointmentTypes: ['Consulta Angiológica', 'Eco Doppler', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-vascular' }),
  identity({ slug: 'flebologia', masterId: 'vas-3', name: 'Flebología', shortName: 'Flebo.', description: 'Enfermedades del sistema venoso', categoryId: 'vascular', icon: 'GitBranch', color: '#B91C1C', keywords: ['flebologia', 'phlebology', 'flebologo', 'varices', 'insuficiencia venosa'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['procedimientos-venosos', 'escleroterapias'], defaultAppointmentTypes: ['Consulta Flebológica', 'Escleroterapia', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'cirugia-vascular' }),
];

// ============================================================================
// INTENSIVA (4)
// ============================================================================

const INTENSIVA: SpecialtyIdentity[] = [
  identity({ slug: 'medicina-intensiva', masterId: 'int-1', name: 'Medicina Intensiva', shortName: 'UCI', description: 'Cuidados de pacientes en estado crítico', categoryId: 'intensiva', icon: 'Zap', color: '#F59E0B', keywords: ['medicina intensiva', 'intensive care', 'intensivista', 'uci', 'cuidados criticos'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'alertas-criticas', 'laboratorio', 'estadisticas'], prioritizedKpis: ['pacientes-uci', 'mortalidad', 'dias-ventilacion'], defaultAppointmentTypes: ['Interconsulta UCI', 'Seguimiento'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-emergencias', masterId: 'int-2', name: 'Medicina de Emergencias', shortName: 'Emergencias', description: 'Atención médica de urgencias y emergencias', categoryId: 'intensiva', icon: 'Siren', color: '#F59E0B', keywords: ['medicina de emergencias', 'emergency medicine', 'emergenciologo', 'urgencias'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'tiempo-puerta-atencion', 'triaje'], defaultAppointmentTypes: ['Emergencia', 'Observación', 'Seguimiento'], defaultAppointmentDuration: 15, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-paliativa', masterId: 'int-3', name: 'Medicina Paliativa', shortName: 'Paliativa', description: 'Cuidados paliativos y calidad de vida', categoryId: 'intensiva', icon: 'HeartHandshake', color: '#F59E0B', keywords: ['medicina paliativa', 'palliative care', 'cuidados paliativos', 'dolor cronico'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'], prioritizedKpis: ['pacientes-en-programa', 'control-dolor', 'calidad-vida'], defaultAppointmentTypes: ['Consulta Paliativa', 'Visita Domiciliaria', 'Control Dolor'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-dolor', masterId: 'int-4', name: 'Medicina del Dolor', shortName: 'Med. Dolor', description: 'Diagnóstico y tratamiento del dolor crónico', categoryId: 'intensiva', icon: 'Flame', color: '#F59E0B', keywords: ['medicina del dolor', 'pain medicine', 'dolor cronico', 'algologia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'reduccion-dolor', 'bloqueos-nerviosos'], defaultAppointmentTypes: ['Consulta del Dolor', 'Bloqueo Nervioso', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
];

// ============================================================================
// DIAGNÓSTICO POR IMÁGENES (4)
// ============================================================================

const DIAGNOSTICO: SpecialtyIdentity[] = [
  identity({ slug: 'radiologia', masterId: 'img-1', name: 'Radiología e Imágenes', shortName: 'Radiología', description: 'Diagnóstico por imágenes médicas', categoryId: 'diagnostico', icon: 'ScanLine', color: '#4F46E5', keywords: ['radiologia', 'radiology', 'radiologo', 'rayos x', 'tomografia', 'resonancia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['estudios-realizados', 'informes-emitidos', 'tiempo-informe'], defaultAppointmentTypes: ['Radiografía', 'Tomografía', 'Resonancia', 'Ecografía'], defaultAppointmentDuration: 15, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-nuclear', masterId: 'img-2', name: 'Medicina Nuclear', shortName: 'Med. Nuclear', description: 'Diagnóstico y tratamiento con radioisótopos', categoryId: 'diagnostico', icon: 'Atom', color: '#4F46E5', keywords: ['medicina nuclear', 'nuclear medicine', 'gammagrafia', 'pet ct'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['estudios-realizados', 'gammagrafias'], defaultAppointmentTypes: ['Gammagrafía', 'PET-CT', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'radiologia' }),
  identity({ slug: 'intervencionismo-vascular', masterId: 'img-3', name: 'Intervencionismo Vascular', shortName: 'Interv. Vasc.', description: 'Procedimientos vasculares guiados por imagen', categoryId: 'diagnostico', icon: 'Target', color: '#4F46E5', keywords: ['intervencionismo', 'interventional radiology', 'embolizacion', 'angiografia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['procedimientos-intervencionistas', 'tasa-exito'], defaultAppointmentTypes: ['Consulta Intervencionismo', 'Procedimiento', 'Control'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'radiologia' }),
  identity({ slug: 'ecografia', masterId: 'img-4', name: 'Ecografía', shortName: 'Ecografía', description: 'Diagnóstico por ultrasonido', categoryId: 'diagnostico', icon: 'Radio', color: '#4F46E5', keywords: ['ecografia', 'ultrasound', 'ultrasonido', 'ecografista', 'eco'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'imagenologia', 'estadisticas'], prioritizedKpis: ['ecografias-realizadas', 'informes-emitidos'], defaultAppointmentTypes: ['Ecografía Abdominal', 'Ecografía Obstétrica', 'Eco Doppler'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'radiologia' }),
];

// ============================================================================
// ANESTESIA (3)
// ============================================================================

const ANESTESIA: SpecialtyIdentity[] = [
  identity({ slug: 'anestesiologia', masterId: 'ane-1', name: 'Anestesiología', shortName: 'Anestesio.', description: 'Anestesia y cuidados perioperatorios', categoryId: 'anestesia', icon: 'Gauge', color: '#475569', keywords: ['anestesiologia', 'anesthesiology', 'anestesiologo', 'anestesia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['anestesias-realizadas', 'complicaciones-anestesicas'], defaultAppointmentTypes: ['Valoración Pre-anestésica', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'anestesia-pediatrica', masterId: 'ane-2', name: 'Anestesia Pediátrica', shortName: 'Anest. Ped.', description: 'Anestesia en niños', categoryId: 'anestesia', icon: 'Gauge', color: '#475569', keywords: ['anestesia pediatrica', 'pediatric anesthesia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['anestesias-pediatricas', 'complicaciones'], defaultAppointmentTypes: ['Valoración Pre-anestésica Pediátrica', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'anestesiologia' }),
  identity({ slug: 'anestesia-cardiovascular', masterId: 'ane-3', name: 'Anestesia Cardiovascular', shortName: 'Anest. Cardio.', description: 'Anestesia para cirugía cardiovascular', categoryId: 'anestesia', icon: 'Gauge', color: '#475569', keywords: ['anestesia cardiovascular', 'cardiac anesthesia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['anestesias-cardiovasculares', 'complicaciones'], defaultAppointmentTypes: ['Valoración Pre-anestésica Cardiovascular'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'anestesiologia' }),
];

// ============================================================================
// PATOLOGÍA (3)
// ============================================================================

const PATOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'patologia', masterId: 'pat-1', name: 'Patología', shortName: 'Pato.', description: 'Diagnóstico de enfermedades mediante análisis de tejidos', categoryId: 'patologia', icon: 'Microscope', color: '#7C3AED', keywords: ['patologia', 'pathology', 'patologo', 'biopsia', 'histopatologia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'imagenologia', 'estadisticas'], prioritizedKpis: ['biopsias-analizadas', 'informes-emitidos', 'tiempo-resultado'], defaultAppointmentTypes: ['Revisión Patológica', 'Biopsia'], defaultAppointmentDuration: 15, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'patologia-clinica', masterId: 'pat-2', name: 'Patología Clínica', shortName: 'Pato. Clín.', description: 'Análisis de laboratorio clínico', categoryId: 'patologia', icon: 'FlaskConical', color: '#7C3AED', keywords: ['patologia clinica', 'clinical pathology', 'laboratorista', 'bioanalista'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['examenes-analizados', 'tiempo-resultado'], defaultAppointmentTypes: ['Análisis Clínico', 'Toma de Muestra'], defaultAppointmentDuration: 10, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'patologia' }),
  identity({ slug: 'citopatologia', masterId: 'pat-3', name: 'Citopatología', shortName: 'Citopato.', description: 'Diagnóstico citológico', categoryId: 'patologia', icon: 'Microscope', color: '#7C3AED', keywords: ['citopatologia', 'cytopathology', 'citologia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['citologias-analizadas', 'informes-emitidos'], defaultAppointmentTypes: ['Citología', 'Revisión'], defaultAppointmentDuration: 10, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'patologia' }),
];

// ============================================================================
// REHABILITACIÓN (4)
// ============================================================================

const REHABILITACION: SpecialtyIdentity[] = [
  identity({ slug: 'medicina-fisica-rehabilitacion', masterId: 'reh-1', name: 'Medicina Física y Rehabilitación', shortName: 'Med. Rehab.', description: 'Rehabilitación funcional y discapacidad', categoryId: 'rehabilitacion', icon: 'Dumbbell', color: '#10B981', keywords: ['medicina fisica', 'rehabilitation medicine', 'fisiatra', 'rehabilitacion'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-rehabilitados', 'mejoria-funcional', 'sesiones'], defaultAppointmentTypes: ['Evaluación Funcional', 'Sesión Rehabilitación', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'fisioterapia', masterId: 'reh-2', name: 'Fisioterapia', shortName: 'Fisio.', description: 'Tratamiento mediante agentes físicos', categoryId: 'rehabilitacion', icon: 'Dumbbell', color: '#10B981', keywords: ['fisioterapia', 'physiotherapy', 'fisioterapeuta', 'kinesioterapia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['sesiones-realizadas', 'mejoria-funcional'], defaultAppointmentTypes: ['Evaluación Fisioterapéutica', 'Sesión Fisioterapia', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'terapia-ocupacional', masterId: 'reh-3', name: 'Terapia Ocupacional', shortName: 'T. Ocupac.', description: 'Rehabilitación funcional para actividades diarias', categoryId: 'rehabilitacion', icon: 'HandMetal', color: '#10B981', keywords: ['terapia ocupacional', 'occupational therapy', 'terapeuta ocupacional'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['sesiones-realizadas', 'independencia-funcional'], defaultAppointmentTypes: ['Evaluación TO', 'Sesión TO', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'quiropractica', masterId: 'reh-4', name: 'Quiropráctica', shortName: 'Quiro.', description: 'Diagnóstico y tratamiento de trastornos neuromusculoesqueléticos', categoryId: 'rehabilitacion', icon: 'Bone', color: '#10B981', keywords: ['quiropractica', 'chiropractic', 'quiropractico', 'ajuste vertebral'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'ajustes-realizados'], defaultAppointmentTypes: ['Consulta Quiropráctica', 'Ajuste', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
];

// ============================================================================
// ESPECIALIZADA (8)
// ============================================================================

const ESPECIALIZADA: SpecialtyIdentity[] = [
  identity({ slug: 'genetica-medica', masterId: 'esp-1', name: 'Genética Médica', shortName: 'Genética', description: 'Diagnóstico y asesoramiento genético', categoryId: 'especializada', icon: 'Dna', color: '#0D9488', keywords: ['genetica medica', 'medical genetics', 'genetista', 'cromosoma', 'hereditario'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['estudios-geneticos', 'asesorias-geneticas'], defaultAppointmentTypes: ['Asesoría Genética', 'Estudio Genético', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'farmacologia-clinica', masterId: 'esp-2', name: 'Farmacología Clínica', shortName: 'Farmaco. Clín.', description: 'Uso racional de medicamentos', categoryId: 'especializada', icon: 'Pill', color: '#0D9488', keywords: ['farmacologia clinica', 'clinical pharmacology', 'farmacologo', 'farmacovigilancia'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['interconsultas', 'reacciones-adversas'], defaultAppointmentTypes: ['Consulta Farmacológica', 'Revisión Medicación'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'toxicologia', masterId: 'esp-3', name: 'Toxicología', shortName: 'Toxicología', description: 'Intoxicaciones y exposiciones tóxicas', categoryId: 'especializada', icon: 'Skull', color: '#0D9488', keywords: ['toxicologia', 'toxicology', 'toxicologo', 'intoxicacion', 'envenenamiento'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'estadisticas'], prioritizedKpis: ['intoxicaciones-atendidas'], defaultAppointmentTypes: ['Consulta Toxicológica', 'Seguimiento'], defaultAppointmentDuration: 25, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-trabajo', masterId: 'esp-4', name: 'Medicina del Trabajo', shortName: 'Med. Trabajo', description: 'Salud ocupacional y prevención de riesgos laborales', categoryId: 'especializada', icon: 'HardHat', color: '#0D9488', keywords: ['medicina del trabajo', 'occupational medicine', 'salud ocupacional', 'laboral'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['examenes-ocupacionales', 'accidentes-laborales'], defaultAppointmentTypes: ['Examen Pre-empleo', 'Examen Periódico', 'Accidente Laboral'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-legal', masterId: 'esp-5', name: 'Medicina Legal y Forense', shortName: 'Med. Legal', description: 'Aplicación de conocimientos médicos al derecho', categoryId: 'especializada', icon: 'Scale', color: '#0D9488', keywords: ['medicina legal', 'forensic medicine', 'medico forense', 'medico legista', 'peritaje'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['peritajes-realizados', 'informes-legales'], defaultAppointmentTypes: ['Peritaje Médico', 'Informe Legal'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-preventiva', masterId: 'esp-6', name: 'Medicina Preventiva y Salud Pública', shortName: 'Med. Prevent.', description: 'Prevención de enfermedades y promoción de la salud', categoryId: 'especializada', icon: 'ShieldCheck', color: '#0D9488', keywords: ['medicina preventiva', 'preventive medicine', 'salud publica', 'epidemiologia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['campanas-prevencion', 'cobertura-vacunacion'], defaultAppointmentTypes: ['Consulta Preventiva', 'Vacunación', 'Chequeo Ejecutivo'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'medicina-hiperbarica', masterId: 'esp-7', name: 'Medicina Hiperbárica', shortName: 'Med. Hiperb.', description: 'Oxigenoterapia hiperbárica', categoryId: 'especializada', icon: 'Waves', color: '#0D9488', keywords: ['medicina hiperbarica', 'hyperbaric medicine', 'camara hiperbarica', 'oxigeno hiperbarico'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['sesiones-hiperbaricas', 'cicatrizacion'], defaultAppointmentTypes: ['Consulta Hiperbárica', 'Sesión OHB', 'Control'], defaultAppointmentDuration: 20, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: false }),
  identity({ slug: 'transplante-organos', masterId: 'esp-8', name: 'Transplante de Órganos', shortName: 'Transplante', description: 'Programa de trasplante de órganos y tejidos', categoryId: 'especializada', icon: 'HeartHandshake', color: '#0D9488', keywords: ['transplante', 'organ transplant', 'trasplante renal', 'trasplante hepatico'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'laboratorio', 'alertas-criticas', 'estadisticas'], prioritizedKpis: ['transplantes-realizados', 'supervivencia-injerto'], defaultAppointmentTypes: ['Evaluación Pre-transplante', 'Control Post-transplante'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false }),
];

// ============================================================================
// ODONTOLOGÍA (9)
// ============================================================================

const ODONTOLOGIA: SpecialtyIdentity[] = [
  identity({ slug: 'odontologia', masterId: 'odo-1', name: 'Odontología', shortName: 'Odonto.', description: 'Atención integral de la salud bucal', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['odontologia', 'dentistry', 'odontologo', 'dentista', 'dental'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'periodontograma', 'dental-imaging', 'dental-3d', 'presupuestos', 'seguros', 'membresias', 'teledentologia', 'dental-rcm', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos', 'tratamientos-completados', 'ingresos'], defaultAppointmentTypes: ['Consulta Dental', 'Limpieza', 'Restauración', 'Emergencia'], defaultAppointmentDuration: 30, supportsTelemedicine: true, requiresVerification: true, isSubSpecialty: false, childSlugs: ['ortodoncia', 'endodoncia', 'periodoncia', 'implantologia-dental', 'cirugia-oral-maxilofacial', 'odontopediatria', 'ortopedia-dentomaxilofacial', 'prostodoncia'] }),
  identity({ slug: 'ortodoncia', masterId: 'odo-2', name: 'Ortodoncia', shortName: 'Ortodon.', description: 'Corrección de malposiciones dentales y maxilares', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['ortodoncia', 'orthodontics', 'ortodoncista', 'brackets', 'alineadores', 'invisalign'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'dental-3d', 'presupuestos', 'membresias', 'estadisticas'], prioritizedKpis: ['casos-activos', 'tratamientos-completados'], defaultAppointmentTypes: ['Consulta Ortodoncia', 'Control Mensual', 'Cementación', 'Retiro'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'endodoncia', masterId: 'odo-3', name: 'Endodoncia', shortName: 'Endo.', description: 'Tratamiento de conductos radiculares', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['endodoncia', 'endodontics', 'endodoncista', 'conducto radicular', 'nervio dental'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'presupuestos', 'estadisticas'], prioritizedKpis: ['endodoncias-realizadas', 'tasa-exito'], defaultAppointmentTypes: ['Consulta Endodoncia', 'Tratamiento de Conducto', 'Retratamiento'], defaultAppointmentDuration: 60, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'periodoncia', masterId: 'odo-4', name: 'Periodoncia', shortName: 'Perio.', description: 'Enfermedades de las encías y tejidos de soporte', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['periodoncia', 'periodontics', 'periodoncista', 'encia', 'periodontitis', 'gingivitis'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'periodontograma', 'dental-imaging', 'presupuestos', 'estadisticas'], prioritizedKpis: ['periodontogramas', 'cirugias-periodontales'], defaultAppointmentTypes: ['Consulta Periodontal', 'Raspado y Alisado', 'Cirugía Periodontal'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'implantologia-dental', masterId: 'odo-5', name: 'Implantología Dental', shortName: 'Implanto.', description: 'Colocación de implantes dentales', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['implantologia', 'dental implants', 'implantologo', 'implante dental'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'dental-3d', 'presupuestos', 'estadisticas'], prioritizedKpis: ['implantes-colocados', 'tasa-oseointegración'], defaultAppointmentTypes: ['Consulta Implantes', 'Cirugía Implante', 'Control Oseointegración'], defaultAppointmentDuration: 60, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'cirugia-oral-maxilofacial', masterId: 'odo-6', name: 'Cirugía Oral y Maxilofacial', shortName: 'Cir. Maxilo.', description: 'Cirugía de la cavidad oral, maxilares y cara', categoryId: 'odontologia', icon: 'Scissors', color: '#0EA5E9', keywords: ['cirugia oral', 'maxilofacial surgery', 'cirugia maxilofacial', 'exodoncia', 'tercer molar'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'dental-3d', 'imagenologia', 'presupuestos', 'estadisticas'], prioritizedKpis: ['cirugias-realizadas', 'exodoncias'], defaultAppointmentTypes: ['Consulta Maxilofacial', 'Exodoncia', 'Cirugía Ortognática'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'odontopediatria', masterId: 'odo-7', name: 'Odontopediatría', shortName: 'Odontoped.', description: 'Atención dental de niños y adolescentes', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['odontopediatria', 'pediatric dentistry', 'dentista de ninos', 'odontopediatra'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'curvas-crecimiento', 'presupuestos', 'estadisticas'], prioritizedKpis: ['ninos-atendidos', 'tratamientos-preventivos'], defaultAppointmentTypes: ['Consulta Odontopediátrica', 'Sellantes', 'Fluorización'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'ortopedia-dentomaxilofacial', masterId: 'odo-8', name: 'Ortopedia Dentomaxilofacial', shortName: 'Ortop. DMF', description: 'Ortopedia funcional de los maxilares', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['ortopedia dentomaxilofacial', 'dentofacial orthopedics', 'ortopedia maxilar'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'dental-3d', 'presupuestos', 'estadisticas'], prioritizedKpis: ['casos-activos', 'desarrollo-maxilar'], defaultAppointmentTypes: ['Consulta Ortopédica', 'Control Aparatología', 'Seguimiento'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
  identity({ slug: 'prostodoncia', masterId: 'odo-9', name: 'Prostodoncia', shortName: 'Prosto.', description: 'Rehabilitación oral con prótesis dentales', categoryId: 'odontologia', icon: 'SmilePlus', color: '#0EA5E9', keywords: ['prostodoncia', 'prosthodontics', 'protesis dental', 'prostodoncista', 'corona', 'puente'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'dental-imaging', 'dental-3d', 'laboratorio', 'presupuestos', 'estadisticas'], prioritizedKpis: ['protesis-realizadas', 'coronas-cementadas'], defaultAppointmentTypes: ['Consulta Prostodoncia', 'Tallado', 'Cementación', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: true, isSubSpecialty: true, parentSlug: 'odontologia' }),
];

// ============================================================================
// OTROS (6)
// ============================================================================

const OTROS: SpecialtyIdentity[] = [
  identity({ slug: 'psicologia', masterId: 'oth-1', name: 'Psicología', shortName: 'Psicología', description: 'Evaluación y tratamiento psicológico', categoryId: 'otros', icon: 'Brain', color: '#6B7280', keywords: ['psicologia', 'psychology', 'psicologo', 'terapia'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'telemedicina', 'estadisticas'], prioritizedKpis: ['sesiones-realizadas', 'pacientes-activos'], defaultAppointmentTypes: ['Sesión Terapéutica', 'Evaluación Psicológica', 'Seguimiento'], defaultAppointmentDuration: 50, supportsTelemedicine: true, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'podologia', masterId: 'oth-2', name: 'Podología', shortName: 'Podología', description: 'Salud y cuidados del pie', categoryId: 'otros', icon: 'Footprints', color: '#6B7280', keywords: ['podologia', 'podiatry', 'podologo', 'pie', 'una encarnada'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos'], defaultAppointmentTypes: ['Consulta Podológica', 'Procedimiento', 'Control'], defaultAppointmentDuration: 30, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'psicopedagogia', masterId: 'oth-3', name: 'Psicopedagogía', shortName: 'Psicoped.', description: 'Dificultades de aprendizaje y orientación educativa', categoryId: 'otros', icon: 'BookOpen', color: '#6B7280', keywords: ['psicopedagogia', 'educational psychology', 'psicopedagogo', 'aprendizaje'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['evaluaciones-realizadas'], defaultAppointmentTypes: ['Evaluación Psicopedagógica', 'Sesión Terapéutica', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'estimulacion-temprana', masterId: 'oth-4', name: 'Estimulación Temprana', shortName: 'Est. Temprana', description: 'Desarrollo integral del niño de 0 a 6 años', categoryId: 'otros', icon: 'Puzzle', color: '#6B7280', keywords: ['estimulacion temprana', 'early intervention', 'desarrollo infantil'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'curvas-crecimiento', 'estadisticas'], prioritizedKpis: ['ninos-en-programa', 'hitos-del-desarrollo'], defaultAppointmentTypes: ['Evaluación del Desarrollo', 'Sesión Estimulación', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'acupuntura', masterId: 'oth-5', name: 'Acupuntura', shortName: 'Acupuntura', description: 'Terapia con agujas para alivio del dolor y equilibrio energético', categoryId: 'otros', icon: 'Sparkle', color: '#6B7280', keywords: ['acupuntura', 'acupuncture', 'acupunturista', 'medicina china'], defaultModuleIds: ['consulta', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['sesiones-realizadas', 'mejoria-reportada'], defaultAppointmentTypes: ['Sesión Acupuntura', 'Evaluación Inicial', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: false, requiresVerification: false, isSubSpecialty: false }),
  identity({ slug: 'homeopatia', masterId: 'oth-6', name: 'Homeopatía', shortName: 'Homeopatía', description: 'Tratamiento homeopático', categoryId: 'otros', icon: 'Droplet', color: '#6B7280', keywords: ['homeopatia', 'homeopathy', 'homeopata', 'medicina alternativa'], defaultModuleIds: ['consulta', 'recetas', 'historia-clinica', 'citas', 'pacientes', 'estadisticas'], prioritizedKpis: ['pacientes-atendidos'], defaultAppointmentTypes: ['Consulta Homeopática', 'Control'], defaultAppointmentDuration: 45, supportsTelemedicine: true, requiresVerification: false, isSubSpecialty: false }),
];

// ============================================================================
// EXPORT — Array completo y lookup maps
// ============================================================================

/** Array completo con las 132 identidades de especialidades */
export const ALL_SPECIALTY_IDENTITIES: SpecialtyIdentity[] = [
  ...GENERAL,
  ...CARDIOVASCULAR,
  ...NEUROLOGIA,
  ...DIGESTIVO,
  ...RESPIRATORIO,
  ...RENAL,
  ...ENDOCRINO,
  ...REUMATOLOGIA,
  ...HEMATOLOGIA,
  ...INFECTOLOGIA,
  ...DERMATOLOGIA,
  ...MENTAL,
  ...CIRUGIA,
  ...TRAUMATOLOGIA,
  ...OFTALMOLOGIA,
  ...ORL,
  ...GINECOLOGIA,
  ...PEDIATRIA,
  ...PLASTICA,
  ...VASCULAR,
  ...INTENSIVA,
  ...DIAGNOSTICO,
  ...ANESTESIA,
  ...PATOLOGIA,
  ...REHABILITACION,
  ...ESPECIALIZADA,
  ...ODONTOLOGIA,
  ...OTROS,
];

/** Lookup por slug: O(1) */
export const IDENTITY_BY_SLUG: ReadonlyMap<string, SpecialtyIdentity> = new Map(
  ALL_SPECIALTY_IDENTITIES.map((id) => [id.slug, id])
);

/** Lookup por masterId: O(1) */
export const IDENTITY_BY_MASTER_ID: ReadonlyMap<string, SpecialtyIdentity> = new Map(
  ALL_SPECIALTY_IDENTITIES.map((id) => [id.masterId, id])
);

/** Identities grouped by category */
export const IDENTITIES_BY_CATEGORY: ReadonlyMap<string, SpecialtyIdentity[]> = (() => {
  const map = new Map<string, SpecialtyIdentity[]>();
  for (const identity of ALL_SPECIALTY_IDENTITIES) {
    const list = map.get(identity.categoryId) ?? [];
    list.push(identity);
    map.set(identity.categoryId, list);
  }
  return map;
})();
