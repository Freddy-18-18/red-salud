// ============================================
// SURGICAL CHECKLISTS DATA — Embedded checklist definitions
// WHO Safe Surgery, Pre-op, Post-op, Day Surgery Discharge
// ============================================

// ============================================================================
// TYPES
// ============================================================================

export type ChecklistPhaseId = 'sign-in' | 'time-out' | 'sign-out';

export type TeamRole = 'cirujano' | 'anestesiologo' | 'enfermero';

export interface ChecklistItem {
  id: string;
  label: string;
  mandatory: boolean;
  /** Which team role is responsible for verifying this item */
  responsible?: TeamRole;
  /** Hint text shown beneath the label */
  hint?: string;
}

export interface ChecklistPhase {
  id: ChecklistPhaseId | string;
  name: string;
  description: string;
  color: string;
  /** Tailwind-compatible background color for the phase header */
  bgColor: string;
  items: ChecklistItem[];
}

export interface ChecklistDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: ChecklistPhase[];
}

// ============================================================================
// TEAM ROLE LABELS
// ============================================================================

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  cirujano: 'Cirujano',
  anestesiologo: 'Anestesiólogo',
  enfermero: 'Enfermero(a)',
};

// ============================================================================
// WHO SAFE SURGERY CHECKLIST
// ============================================================================

const WHO_SAFE_SURGERY: ChecklistDefinition = {
  id: 'who-safe-surgery',
  name: 'Lista de Verificación de Cirugía Segura (OMS)',
  description:
    'Protocolo de la Organización Mundial de la Salud para reducir complicaciones quirúrgicas.',
  icon: 'ShieldCheck',
  phases: [
    {
      id: 'sign-in',
      name: 'Entrada',
      description: 'Antes de la inducción de la anestesia',
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      items: [
        {
          id: 'who-si-01',
          label: 'Identidad del paciente confirmada',
          mandatory: true,
          responsible: 'enfermero',
          hint: 'Nombre completo, fecha de nacimiento, número de historia',
        },
        {
          id: 'who-si-02',
          label: 'Sitio quirúrgico marcado',
          mandatory: true,
          responsible: 'cirujano',
          hint: 'Marcado con rotulador indeleble en el lado correcto',
        },
        {
          id: 'who-si-03',
          label: 'Consentimiento informado firmado',
          mandatory: true,
          responsible: 'cirujano',
          hint: 'El paciente o su representante legal ha firmado',
        },
        {
          id: 'who-si-04',
          label: 'Pulsioxímetro colocado y funcionando',
          mandatory: true,
          responsible: 'anestesiologo',
        },
        {
          id: 'who-si-05',
          label: '¿Tiene el paciente alergias conocidas?',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Verificar historial de alergias a medicamentos y látex',
        },
        {
          id: 'who-si-06',
          label: '¿Vía aérea difícil / riesgo de aspiración?',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Evaluar clasificación de Mallampati y ayuno',
        },
        {
          id: 'who-si-07',
          label: '¿Riesgo de hemorragia > 500 ml (7 ml/kg en niños)?',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Verificar disponibilidad de hemoderivados y accesos IV',
        },
        {
          id: 'who-si-08',
          label: 'Equipos de anestesia verificados',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Máquina de anestesia, aspiración, medicamentos',
        },
      ],
    },
    {
      id: 'time-out',
      name: 'Pausa Quirúrgica',
      description: 'Antes de la incisión cutánea',
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      items: [
        {
          id: 'who-to-01',
          label: 'Todos los miembros del equipo se presentaron por nombre y rol',
          mandatory: true,
          responsible: 'cirujano',
        },
        {
          id: 'who-to-02',
          label: 'Confirmación de identidad del paciente, procedimiento y sitio',
          mandatory: true,
          responsible: 'cirujano',
          hint: 'Lectura en voz alta del procedimiento planificado',
        },
        {
          id: 'who-to-03',
          label: 'Profilaxis antibiótica administrada en los últimos 60 minutos',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Si aplica según protocolo',
        },
        {
          id: 'who-to-04',
          label: 'Profilaxis antitrombótica administrada',
          mandatory: false,
          responsible: 'anestesiologo',
          hint: 'Si aplica según riesgo del paciente',
        },
        {
          id: 'who-to-05',
          label: 'Eventos críticos anticipados — Cirujano',
          mandatory: true,
          responsible: 'cirujano',
          hint: 'Duración estimada, pérdida sanguínea esperada, pasos críticos',
        },
        {
          id: 'who-to-06',
          label: 'Eventos críticos anticipados — Anestesiólogo',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Comorbilidades del paciente, plan anestésico específico',
        },
        {
          id: 'who-to-07',
          label: 'Eventos críticos anticipados — Equipo de enfermería',
          mandatory: true,
          responsible: 'enfermero',
          hint: 'Esterilización confirmada, instrumental completo, implantes disponibles',
        },
        {
          id: 'who-to-08',
          label: 'Imágenes diagnósticas necesarias exhibidas',
          mandatory: false,
          responsible: 'cirujano',
          hint: 'Radiografías, TAC, RMN disponibles en quirófano',
        },
      ],
    },
    {
      id: 'sign-out',
      name: 'Salida',
      description: 'Antes de que el paciente salga del quirófano',
      color: '#10B981',
      bgColor: 'bg-emerald-50',
      items: [
        {
          id: 'who-so-01',
          label: 'Nombre del procedimiento realizado confirmado y registrado',
          mandatory: true,
          responsible: 'enfermero',
        },
        {
          id: 'who-so-02',
          label: 'Recuento de instrumental, gasas y agujas completo',
          mandatory: true,
          responsible: 'enfermero',
          hint: 'Conteo verificado por dos miembros del equipo',
        },
        {
          id: 'who-so-03',
          label: 'Muestras etiquetadas correctamente',
          mandatory: true,
          responsible: 'enfermero',
          hint: 'Nombre del paciente, tipo de muestra, sitio anatómico',
        },
        {
          id: 'who-so-04',
          label: '¿Hubo problemas con el equipamiento?',
          mandatory: true,
          responsible: 'cirujano',
          hint: 'Registrar cualquier falla o incidente',
        },
        {
          id: 'who-so-05',
          label: 'Aspectos clave del manejo postoperatorio revisados',
          mandatory: true,
          responsible: 'cirujano',
          hint: 'Plan de analgesia, antibióticos, tromboprofilaxis, monitoreo',
        },
        {
          id: 'who-so-06',
          label: 'Instrucciones de recuperación comunicadas al equipo',
          mandatory: true,
          responsible: 'anestesiologo',
          hint: 'Criterios de alta de recuperación, complicaciones a vigilar',
        },
      ],
    },
  ],
};

// ============================================================================
// PRE-OPERATIVE CHECKLIST
// ============================================================================

const PRE_OPERATIVE: ChecklistDefinition = {
  id: 'pre-operative',
  name: 'Lista Preoperatoria',
  description:
    'Verificación previa a la cirugía: laboratorios, imágenes, consentimiento, estado del paciente.',
  icon: 'ClipboardList',
  phases: [
    {
      id: 'labs-imaging',
      name: 'Laboratorios e Imágenes',
      description: 'Estudios diagnósticos previos',
      color: '#6366F1',
      bgColor: 'bg-indigo-50',
      items: [
        {
          id: 'pre-li-01',
          label: 'Hematología completa dentro de los últimos 30 días',
          mandatory: true,
        },
        {
          id: 'pre-li-02',
          label: 'Tiempos de coagulación (PT, PTT, INR)',
          mandatory: true,
        },
        {
          id: 'pre-li-03',
          label: 'Química sanguínea (glicemia, creatinina, urea)',
          mandatory: true,
        },
        {
          id: 'pre-li-04',
          label: 'Grupo sanguíneo y Rh determinado',
          mandatory: true,
          hint: 'Verificar tipaje disponible en banco de sangre',
        },
        {
          id: 'pre-li-05',
          label: 'Radiografía de tórax (si > 40 años o indicación clínica)',
          mandatory: false,
        },
        {
          id: 'pre-li-06',
          label: 'Electrocardiograma (si > 40 años o indicación clínica)',
          mandatory: false,
        },
        {
          id: 'pre-li-07',
          label: 'Estudios de imagen específicos del procedimiento disponibles',
          mandatory: false,
        },
        {
          id: 'pre-li-08',
          label: 'Prueba de embarazo (mujeres en edad fértil)',
          mandatory: false,
          hint: 'Si aplica, resultado negativo confirmado',
        },
      ],
    },
    {
      id: 'patient-status',
      name: 'Estado del Paciente',
      description: 'Condición y preparación del paciente',
      color: '#EC4899',
      bgColor: 'bg-pink-50',
      items: [
        {
          id: 'pre-ps-01',
          label: 'Consentimiento informado firmado y en expediente',
          mandatory: true,
        },
        {
          id: 'pre-ps-02',
          label: 'Ayuno (NPO) verificado — mínimo 8 horas sólidos, 2 horas líquidos claros',
          mandatory: true,
          hint: 'Registrar hora de última ingesta',
        },
        {
          id: 'pre-ps-03',
          label: 'Alergias documentadas y verificadas',
          mandatory: true,
          hint: 'Alergias medicamentosas, alimentarias, látex',
        },
        {
          id: 'pre-ps-04',
          label: 'Medicación habitual revisada',
          mandatory: true,
          hint: 'Anticoagulantes suspendidos según protocolo',
        },
        {
          id: 'pre-ps-05',
          label: 'Evaluación preanestésica completada',
          mandatory: true,
          hint: 'ASA, Mallampati, antecedentes anestésicos',
        },
        {
          id: 'pre-ps-06',
          label: 'Valoración de riesgo tromboembólico (Caprini)',
          mandatory: false,
        },
        {
          id: 'pre-ps-07',
          label: 'Prótesis, joyas y objetos de valor retirados',
          mandatory: true,
        },
        {
          id: 'pre-ps-08',
          label: 'Brazalete de identificación colocado',
          mandatory: true,
        },
      ],
    },
  ],
};

// ============================================================================
// POST-OPERATIVE CHECKLIST
// ============================================================================

const POST_OPERATIVE: ChecklistDefinition = {
  id: 'post-operative',
  name: 'Lista Postoperatoria',
  description:
    'Seguimiento postquirúrgico: signos vitales, dolor, drenajes, dieta, cuidados.',
  icon: 'HeartPulse',
  phases: [
    {
      id: 'immediate-recovery',
      name: 'Recuperación Inmediata',
      description: 'Primera hora en sala de recuperación',
      color: '#EF4444',
      bgColor: 'bg-red-50',
      items: [
        {
          id: 'post-ir-01',
          label: 'Signos vitales estables y dentro de parámetros',
          mandatory: true,
          hint: 'PA, FC, FR, SpO2, temperatura cada 15 min',
        },
        {
          id: 'post-ir-02',
          label: 'Escala de dolor evaluada (EVA/NRS)',
          mandatory: true,
          hint: 'Objetivo: EVA < 4 en reposo',
        },
        {
          id: 'post-ir-03',
          label: 'Plan de analgesia postoperatoria implementado',
          mandatory: true,
        },
        {
          id: 'post-ir-04',
          label: 'Escala de Aldrete >= 9 (si anestesia general)',
          mandatory: false,
          hint: 'Actividad, respiración, circulación, conciencia, SpO2',
        },
        {
          id: 'post-ir-05',
          label: 'Drenajes revisados y con gasto registrado',
          mandatory: false,
          hint: 'Tipo, ubicación, cantidad y características del drenaje',
        },
        {
          id: 'post-ir-06',
          label: 'Apósitos y herida quirúrgica revisados',
          mandatory: true,
          hint: 'Sin sangrado activo ni signos de complicación',
        },
        {
          id: 'post-ir-07',
          label: 'Balance hídrico iniciado',
          mandatory: true,
        },
        {
          id: 'post-ir-08',
          label: 'Profilaxis antiemética administrada',
          mandatory: false,
        },
      ],
    },
    {
      id: 'ward-follow-up',
      name: 'Seguimiento en Piso',
      description: 'Evolución en las primeras 24–48 horas',
      color: '#8B5CF6',
      bgColor: 'bg-violet-50',
      items: [
        {
          id: 'post-wf-01',
          label: 'Dieta progresiva iniciada según tolerancia',
          mandatory: true,
          hint: 'Líquidos claros → blanda → regular',
        },
        {
          id: 'post-wf-02',
          label: 'Deambulación precoz iniciada',
          mandatory: true,
          hint: 'Según tipo de cirugía y condición del paciente',
        },
        {
          id: 'post-wf-03',
          label: 'Tromboprofilaxis continuada',
          mandatory: false,
          hint: 'Medias compresivas y/o heparina según protocolo',
        },
        {
          id: 'post-wf-04',
          label: 'Función urinaria verificada',
          mandatory: true,
          hint: 'Diuresis espontánea dentro de las 6–8 horas',
        },
        {
          id: 'post-wf-05',
          label: 'Laboratorios de control solicitados',
          mandatory: false,
          hint: 'Hemoglobina, electrolitos según necesidad',
        },
        {
          id: 'post-wf-06',
          label: 'Signos de alarma explicados al paciente/familiar',
          mandatory: true,
          hint: 'Fiebre, sangrado, dolor no controlado, dificultad respiratoria',
        },
      ],
    },
  ],
};

// ============================================================================
// DAY SURGERY DISCHARGE CHECKLIST
// ============================================================================

const DAY_SURGERY_DISCHARGE: ChecklistDefinition = {
  id: 'day-surgery-discharge',
  name: 'Lista de Alta — Cirugía Ambulatoria',
  description:
    'Criterios de egreso para pacientes de cirugía ambulatoria (mismo día).',
  icon: 'DoorOpen',
  phases: [
    {
      id: 'discharge-criteria',
      name: 'Criterios de Egreso',
      description: 'Requisitos para autorizar el alta',
      color: '#14B8A6',
      bgColor: 'bg-teal-50',
      items: [
        {
          id: 'day-dc-01',
          label: 'Signos vitales estables por al menos 1 hora',
          mandatory: true,
        },
        {
          id: 'day-dc-02',
          label: 'Paciente orientado y alerta',
          mandatory: true,
        },
        {
          id: 'day-dc-03',
          label: 'Dolor controlado con medicación oral (EVA < 4)',
          mandatory: true,
        },
        {
          id: 'day-dc-04',
          label: 'Tolerancia a líquidos orales sin náuseas/vómitos',
          mandatory: true,
        },
        {
          id: 'day-dc-05',
          label: 'Deambulación sin asistencia ni mareos',
          mandatory: true,
        },
        {
          id: 'day-dc-06',
          label: 'Herida quirúrgica sin complicaciones',
          mandatory: true,
          hint: 'Sin sangrado activo, hematoma ni signos de infección',
        },
        {
          id: 'day-dc-07',
          label: 'Micción espontánea (si aplica)',
          mandatory: false,
          hint: 'Obligatorio en cirugías pélvicas, hernias inguinales, anestesia espinal',
        },
        {
          id: 'day-dc-08',
          label: 'Acompañante responsable presente para el traslado',
          mandatory: true,
        },
      ],
    },
    {
      id: 'discharge-instructions',
      name: 'Instrucciones de Egreso',
      description: 'Información entregada al paciente',
      color: '#0EA5E9',
      bgColor: 'bg-sky-50',
      items: [
        {
          id: 'day-di-01',
          label: 'Receta médica entregada y explicada',
          mandatory: true,
          hint: 'Analgésicos, antibióticos, otros medicamentos',
        },
        {
          id: 'day-di-02',
          label: 'Instrucciones de cuidado de herida entregadas por escrito',
          mandatory: true,
        },
        {
          id: 'day-di-03',
          label: 'Signos de alarma explicados y entregados por escrito',
          mandatory: true,
          hint: 'Fiebre > 38.5°C, sangrado, dolor no controlado, enrojecimiento',
        },
        {
          id: 'day-di-04',
          label: 'Cita de control postoperatorio agendada',
          mandatory: true,
          hint: 'Generalmente a los 7–10 días',
        },
        {
          id: 'day-di-05',
          label: 'Restricciones de actividad explicadas',
          mandatory: true,
          hint: 'No conducir, no levantar peso, reposo relativo',
        },
        {
          id: 'day-di-06',
          label: 'Número de contacto de emergencia proporcionado',
          mandatory: true,
        },
        {
          id: 'day-di-07',
          label: 'Incapacidad/reposo médico emitido',
          mandatory: false,
        },
      ],
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const SURGICAL_CHECKLISTS: ChecklistDefinition[] = [
  WHO_SAFE_SURGERY,
  PRE_OPERATIVE,
  POST_OPERATIVE,
  DAY_SURGERY_DISCHARGE,
];

/**
 * Get a checklist definition by its ID.
 */
export function getChecklistById(id: string): ChecklistDefinition | undefined {
  return SURGICAL_CHECKLISTS.find((c) => c.id === id);
}

/**
 * Get the total number of items across all phases in a checklist.
 */
export function getTotalItems(checklist: ChecklistDefinition): number {
  return checklist.phases.reduce((sum, phase) => sum + phase.items.length, 0);
}

/**
 * Get the number of mandatory items across all phases.
 */
export function getMandatoryItems(checklist: ChecklistDefinition): number {
  return checklist.phases.reduce(
    (sum, phase) => sum + phase.items.filter((i) => i.mandatory).length,
    0,
  );
}
