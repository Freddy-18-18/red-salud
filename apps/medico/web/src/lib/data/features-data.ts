// ============================================
// FEATURES DATA — 8 core features for landing page
// ============================================

export interface Feature {
  iconName: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    iconName: 'CalendarClock',
    title: 'Agenda Inteligente',
    description:
      'Gestión de citas con bloques de tiempo configurables por tipo de consulta. Sincronización con Google Calendar y notificaciones automáticas a pacientes.',
  },
  {
    iconName: 'Stethoscope',
    title: 'Consulta Digital',
    description:
      'Notas clínicas con formato SOAP adaptado a tu especialidad. Examen físico estructurado, diagnósticos ICD-11 y planes de tratamiento integrados.',
  },
  {
    iconName: 'Pill',
    title: 'Recetas Electrónicas',
    description:
      'Prescripciones con firma digital, plantillas por especialidad y verificación de interacciones medicamentosas. Imprimí o compartí digitalmente.',
  },
  {
    iconName: 'ClipboardList',
    title: 'Historia Clínica',
    description:
      'Expediente médico digital completo con timeline cronológico, documentos adjuntos, y acceso seguro desde cualquier dispositivo.',
  },
  {
    iconName: 'BrainCircuit',
    title: 'IA Diagnóstica',
    description:
      'Sugerencias inteligentes de códigos ICD-11 potenciadas por Gemini AI. Asistencia en diagnóstico diferencial basada en síntomas y signos clínicos.',
  },
  {
    iconName: 'Calendar',
    title: 'Integración Google Calendar',
    description:
      'Sincronización bidireccional con Google Calendar. Tus citas médicas y agenda personal en un solo lugar, siempre actualizadas.',
  },
  {
    iconName: 'BarChart3',
    title: 'Estadísticas por Especialidad',
    description:
      'KPIs y métricas específicas para tu área. Desde ECGs realizados en cardiología hasta espirometrías en neumología — datos que importan.',
  },
  {
    iconName: 'ShieldCheck',
    title: 'Verificación SACS',
    description:
      'Validación automática contra el Sistema Autónomo de Certificación Sanitaria de Venezuela. Tu registro profesional, siempre verificado.',
  },
];
