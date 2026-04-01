// ============================================
// SPECIALTIES PUBLIC — Marketing data for showcase
// ============================================

export interface PublicSpecialty {
  name: string;
  slug: string;
  shortDescription: string;
  keyModules: string[];
  keyKPIs: string[];
  accentColor: string;
  iconName: string;
  category: string;
}

export interface SpecialtyCategory {
  name: string;
  id: string;
  specialties: PublicSpecialty[];
}

const clinicasGenerales: PublicSpecialty[] = [
  {
    name: 'Medicina General',
    slug: 'medicina-general',
    shortDescription:
      'Atención integral de primer contacto. Consultas generales, controles periódicos y derivaciones especializadas con flujos optimizados.',
    keyModules: ['Consulta SOAP', 'Recetas Digitales', 'Historia Clínica', 'Telemedicina'],
    keyKPIs: ['Pacientes atendidos/día', 'Tiempo promedio por consulta', 'Satisfacción del paciente'],
    accentColor: 'blue',
    iconName: 'Stethoscope',
    category: 'Clínicas Generales',
  },
  {
    name: 'Medicina Interna',
    slug: 'medicina-interna',
    shortDescription:
      'Diagnóstico y tratamiento no quirúrgico de enfermedades complejas en adultos. Integración con laboratorio e imagenología para diagnósticos precisos.',
    keyModules: ['Consulta Especializada', 'Laboratorio Integrado', 'Interconsultas', 'Estadísticas'],
    keyKPIs: ['Diagnósticos acertados', 'Tiempo de diagnóstico', 'Interconsultas gestionadas'],
    accentColor: 'blue',
    iconName: 'Activity',
    category: 'Clínicas Generales',
  },
];

const quirurgicas: PublicSpecialty[] = [
  {
    name: 'Traumatología y Ortopedia',
    slug: 'traumatologia',
    shortDescription:
      'Sistema musculoesquelético completo con herramientas para clasificación de fracturas, planificación quirúrgica y seguimiento de rehabilitación.',
    keyModules: ['Clasificación de Fracturas', 'Planificación Quirúrgica', 'Rehabilitación', 'Imagenología'],
    keyKPIs: ['Cirugías realizadas', 'Tiempo de recuperación', 'Tasa de éxito quirúrgico'],
    accentColor: 'orange',
    iconName: 'Bone',
    category: 'Quirúrgicas',
  },
];

const cardiovasculares: PublicSpecialty[] = [
  {
    name: 'Cardiología',
    slug: 'cardiologia',
    shortDescription:
      'Módulos especializados para ECG, ecocardiograma, monitoreo de eventos cardíacos y alertas críticas. Seguimiento integral del paciente cardiovascular.',
    keyModules: ['Visor de ECG', 'Alertas Críticas', 'Imagenología Cardíaca', 'Laboratorio Cardiovascular'],
    keyKPIs: ['ECGs realizados', 'Eventos cardíacos detectados', 'Pacientes en seguimiento'],
    accentColor: 'red',
    iconName: 'Heart',
    category: 'Cardiovasculares',
  },
];

const neurologicas: PublicSpecialty[] = [
  {
    name: 'Neurología',
    slug: 'neurologia',
    shortDescription:
      'Herramientas para estudios neurofisiológicos, escalas neurológicas estandarizadas y seguimiento de patologías crónicas del sistema nervioso.',
    keyModules: ['Estudios Neurofisiológicos', 'Escalas Neurológicas', 'Imagenología', 'Telemedicina'],
    keyKPIs: ['Estudios realizados', 'Interconsultas', 'Pacientes en seguimiento'],
    accentColor: 'purple',
    iconName: 'Brain',
    category: 'Neurológicas',
  },
];

const pediatricas: PublicSpecialty[] = [
  {
    name: 'Pediatría',
    slug: 'pediatria',
    shortDescription:
      'Curvas de crecimiento integradas, esquema de vacunación venezolano, hitos del desarrollo y alertas por edad. Diseñado para el cuidado infantil integral.',
    keyModules: ['Curvas de Crecimiento', 'Vacunación', 'Hitos del Desarrollo', 'Control de Niño Sano'],
    keyKPIs: ['Controles de niño sano', 'Vacunaciones completadas', 'Alertas de crecimiento'],
    accentColor: 'sky',
    iconName: 'Baby',
    category: 'Pediátricas',
  },
];

const ginecologicas: PublicSpecialty[] = [
  {
    name: 'Ginecología y Obstetricia',
    slug: 'ginecologia',
    shortDescription:
      'Control prenatal completo, seguimiento obstétrico, citologías y planificación familiar. Herramientas específicas para salud reproductiva femenina.',
    keyModules: ['Control Prenatal', 'Ecografía Obstétrica', 'Citología', 'Planificación Familiar'],
    keyKPIs: ['Controles prenatales', 'Partos atendidos', 'Citologías realizadas'],
    accentColor: 'pink',
    iconName: 'HeartPulse',
    category: 'Ginecológicas',
  },
];

const oftalmologicas: PublicSpecialty[] = [
  {
    name: 'Oftalmología',
    slug: 'oftalmologia',
    shortDescription:
      'Examen oftalmológico digital con campos visuales, fondo de ojo, tonometría y prescripción óptica integrada. Imagenología ocular especializada.',
    keyModules: ['Examen Visual', 'Campo Visual', 'Fondo de Ojo', 'Prescripción Óptica'],
    keyKPIs: ['Exámenes realizados', 'Cirugías oculares', 'Detección de glaucoma'],
    accentColor: 'cyan',
    iconName: 'Eye',
    category: 'Oftalmológicas',
  },
];

const dermatologicas: PublicSpecialty[] = [
  {
    name: 'Dermatología',
    slug: 'dermatologia',
    shortDescription:
      'Dermatoscopía digital, atlas de lesiones, seguimiento fotográfico evolutivo y biopsias. Teledermatología para consultas remotas.',
    keyModules: ['Dermatoscopía Digital', 'Atlas de Lesiones', 'Seguimiento Fotográfico', 'Telemedicina'],
    keyKPIs: ['Dermatoscopías', 'Biopsias realizadas', 'Lesiones en seguimiento'],
    accentColor: 'pink',
    iconName: 'Fingerprint',
    category: 'Dermatológicas',
  },
];

const psiquiatricas: PublicSpecialty[] = [
  {
    name: 'Psiquiatría',
    slug: 'psiquiatria',
    shortDescription:
      'Escalas psicométricas estandarizadas, seguimiento farmacológico especializado, notas de sesión estructuradas y telemedicina para salud mental.',
    keyModules: ['Escalas Psicométricas', 'Seguimiento Farmacológico', 'Notas de Sesión', 'Telemedicina'],
    keyKPIs: ['Sesiones realizadas', 'Adherencia al tratamiento', 'Evolución clínica'],
    accentColor: 'violet',
    iconName: 'Brain',
    category: 'Salud Mental',
  },
];

const urologicas: PublicSpecialty[] = [
  {
    name: 'Urología',
    slug: 'urologia',
    shortDescription:
      'Estudios urodinámicos, imagenología urológica, seguimiento de PSA y procedimientos ambulatorios. Todo el flujo del paciente urológico.',
    keyModules: ['Estudios Urodinámicos', 'Imagenología', 'Seguimiento PSA', 'Procedimientos'],
    keyKPIs: ['Procedimientos urológicos', 'Cistoscopías', 'Pacientes en seguimiento'],
    accentColor: 'sky',
    iconName: 'Droplet',
    category: 'Urológicas',
  },
];

const odontologicas: PublicSpecialty[] = [
  {
    name: 'Odontología',
    slug: 'odontologia-general',
    shortDescription:
      'Odontograma interactivo, periodontograma digital, planificación de tratamientos dentales y radiología oral. La consulta odontológica completa.',
    keyModules: ['Odontograma', 'Periodontograma', 'Radiología Oral', 'Plan de Tratamiento'],
    keyKPIs: ['Tratamientos completados', 'Procedimientos por tipo', 'Pacientes activos'],
    accentColor: 'teal',
    iconName: 'SmilePlus',
    category: 'Odontológicas',
  },
];

export const specialtyCategories: SpecialtyCategory[] = [
  { name: 'Clínicas Generales', id: 'generales', specialties: clinicasGenerales },
  { name: 'Cardiovasculares', id: 'cardiovasculares', specialties: cardiovasculares },
  { name: 'Neurológicas', id: 'neurologicas', specialties: neurologicas },
  { name: 'Quirúrgicas', id: 'quirurgicas', specialties: quirurgicas },
  { name: 'Pediátricas', id: 'pediatricas', specialties: pediatricas },
  { name: 'Ginecológicas', id: 'ginecologicas', specialties: ginecologicas },
  { name: 'Oftalmológicas', id: 'oftalmologicas', specialties: oftalmologicas },
  { name: 'Dermatológicas', id: 'dermatologicas', specialties: dermatologicas },
  { name: 'Salud Mental', id: 'mental', specialties: psiquiatricas },
  { name: 'Urológicas', id: 'urologicas', specialties: urologicas },
  { name: 'Odontológicas', id: 'odontologicas', specialties: odontologicas },
];

export const allShowcaseSpecialties: PublicSpecialty[] = specialtyCategories.flatMap(
  (cat) => cat.specialties
);
