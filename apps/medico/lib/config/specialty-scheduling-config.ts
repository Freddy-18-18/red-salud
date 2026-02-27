/**
 * @file specialty-scheduling-config.ts
 * @description Enterprise specialty-aware scheduling configuration.
 *   Defines how the agenda behaves differently per medical specialty:
 *   - Default durations and buffers by appointment type
 *   - Reminder message privacy levels
 *   - Preparation instructions per procedure
 *   - UI feature flags (session counter, tooth selector, etc.)
 *   - Special scheduling rules
 */

export type AppointmentTypeKey =
  | "primera_vez"
  | "seguimiento"
  | "presencial"
  | "telemedicina"
  | "urgencia"
  | "procedimiento"
  | "evaluacion"
  | "sesion"
  | "cirugia"
  | "control";

export interface AppointmentTypeConfig {
  label: string;
  duracion: number;      // default minutes
  bufferAntes: number;   // buffer before (prep)
  bufferDespues: number; // buffer after (cleanup/notes)
  color: string;
  icon: string;
  reminderMessage?: string; // override default reminder text
}

export interface SpecialtySchedulingConfig {
  name: string;
  slug: string;
  /** High-privacy: omit procedure details from patient reminders */
  isHighPrivacy: boolean;
  /** Show session counter (Fisioterapia, Psicología) */
  showSessionCounter: boolean;
  /** Show tooth selector (Odontología) */
  showToothSelector: boolean;
  /** Support telemedicine */
  supportsTelemedicine: boolean;
  /** Require pre-appointment form */
  requiresPreForm: boolean;
  /** Pre-appointment preparation instructions (auto-sent on confirmation) */
  preparationInstructions?: string;
  /** Appointment types and their configs */
  appointmentTypes: Partial<Record<AppointmentTypeKey, AppointmentTypeConfig>>;
  /** Default appointment type for new appointments */
  defaultAppointmentType: AppointmentTypeKey;
  /** Min granularity for time slots (minutes) */
  slotGranularity: number;
  /** Speciality-specific reminder override message (null = use default) */
  reminderOverride?: string;
  /** Morning huddle tab visible (only for clinic-heavy specialties) */
  showMorningHuddle: boolean;
  /** Specialty notes placeholder */
  notesPlaceholder: string;
  /** Recurring appointments common? */
  recurringCommon: boolean;
  /** Reason/motivo suggestions */
  motivoSuggestions: string[];
}

// ─── Specialty Configurations ─────────────────────────────────────────────────

const DEFAULT_TYPES: Partial<Record<AppointmentTypeKey, AppointmentTypeConfig>> = {
  primera_vez:  { label: "Primera consulta", duracion: 45, bufferAntes: 5,  bufferDespues: 10, color: "#F59E0B", icon: "🆕" },
  seguimiento:  { label: "Seguimiento",       duracion: 20, bufferAntes: 0,  bufferDespues: 5,  color: "#8B5CF6", icon: "🔄" },
  presencial:   { label: "Consulta",          duracion: 30, bufferAntes: 0,  bufferDespues: 5,  color: "#3B82F6", icon: "🏥" },
  telemedicina: { label: "Telemedicina",       duracion: 30, bufferAntes: 0,  bufferDespues: 5,  color: "#10B981", icon: "💻" },
  urgencia:     { label: "Urgencia",           duracion: 30, bufferAntes: 0,  bufferDespues: 15, color: "#EF4444", icon: "🚨" },
};

export const SPECIALTY_CONFIGS: Record<string, SpecialtySchedulingConfig> = {

  // ── Medicina General / Familiar ────────────────────────────────────────────
  medicina_general: {
    name: "Medicina General",
    slug: "medicina_general",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: false,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: false,
    defaultAppointmentType: "presencial",
    notesPlaceholder: "Síntomas, evolución, plan de tratamiento...",
    motivoSuggestions: [
      "Control general", "Fiebre", "Gripe", "Presión arterial", "Diabetes",
      "Cholesterol", "Revisión de medicamentos", "Certificado médico",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      control: { label: "Control periódico", duracion: 20, bufferAntes: 0, bufferDespues: 5, color: "#059669", icon: "✅" },
    },
  },

  // ── Odontología ────────────────────────────────────────────────────────────
  odontologia: {
    name: "Odontología",
    slug: "odontologia",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: true,
    supportsTelemedicine: false,
    requiresPreForm: false,
    showMorningHuddle: true,
    slotGranularity: 15,
    recurringCommon: false,
    defaultAppointmentType: "presencial",
    notesPlaceholder: "Piezas dentales, procedimiento, materiales, observaciones...",
    motivoSuggestions: [
      "Limpieza dental", "Extracción", "Caries", "Endodoncia", "Corona",
      "Ortodoncia", "Implante", "Blanqueamiento", "Emergencia dental",
      "Evaluación radiográfica", "Periodoncia",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      primera_vez:  { label: "Evaluación inicial",  duracion: 60, bufferAntes: 0, bufferDespues: 10, color: "#F59E0B", icon: "🦷" },
      procedimiento:{ label: "Procedimiento",        duracion: 90, bufferAntes: 5, bufferDespues: 15, color: "#EC4899", icon: "🔧" },
      cirugia:      { label: "Cirugía oral",          duracion: 120, bufferAntes: 10, bufferDespues: 20, color: "#EF4444", icon: "🩺" },
      urgencia:     { label: "Urgencia dental",       duracion: 30, bufferAntes: 0, bufferDespues: 10, color: "#EF4444", icon: "🚨" },
    },
  },

  // ── Fisioterapia / Rehabilitación ──────────────────────────────────────────
  fisioterapia: {
    name: "Fisioterapia",
    slug: "fisioterapia",
    isHighPrivacy: false,
    showSessionCounter: true,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: true,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: true,
    defaultAppointmentType: "sesion",
    preparationInstructions:
      "Por favor use ropa cómoda y traiga sus estudios previos (RX, RM). Llegue 5 minutos antes.",
    notesPlaceholder: "Sesión #, ejercicios realizados, progreso, dolor EVA 0-10...",
    motivoSuggestions: [
      "Rehabilitación post-quirúrgica", "Dolor lumbar", "Cervicalgia",
      "Fractura", "Accidente cerebrovascular", "Tendinitis", "Esguince",
      "Evaluación inicial", "Electroterapia", "Masaje terapéutico",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      sesion:      { label: "Sesión de fisioterapia", duracion: 45, bufferAntes: 0, bufferDespues: 10, color: "#0EA5E9", icon: "💪" },
      evaluacion:  { label: "Evaluación inicial",     duracion: 60, bufferAntes: 5, bufferDespues: 10, color: "#F59E0B", icon: "📋" },
      seguimiento: { label: "Control",                duracion: 30, bufferAntes: 0, bufferDespues: 5,  color: "#8B5CF6", icon: "🔄" },
    },
  },

  // ── Psicología / Psiquiatría ────────────────────────────────────────────────
  psicologia: {
    name: "Psicología",
    slug: "psicologia",
    isHighPrivacy: true,   // ← omitir detalles en recordatorios
    showSessionCounter: true,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: true,
    showMorningHuddle: false,
    slotGranularity: 5,
    recurringCommon: true,
    defaultAppointmentType: "sesion",
    reminderOverride:
      "Hola {{patient_name}}, tiene una cita mañana {{appointment_date}} a las {{appointment_time}} con {{doctor_name}}.",
    notesPlaceholder: "Evolución de sesión (solo visible para el médico)...",
    motivoSuggestions: [
      "Sesión semanal", "Evaluación psicodiagnóstica", "Primera consulta",
      "Terapia cognitivo-conductual", "Control farmacológico",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      sesion:      { label: "Sesión terapéutica", duracion: 50, bufferAntes: 0, bufferDespues: 10, color: "#6366F1", icon: "🧠" },
      evaluacion:  { label: "Evaluación inicial", duracion: 90, bufferAntes: 5, bufferDespues: 10, color: "#F59E0B", icon: "📋" },
      urgencia:    { label: "Crisis",              duracion: 60, bufferAntes: 0, bufferDespues: 15, color: "#EF4444", icon: "🆘" },
    },
  },

  // ── Ginecología / Obstetricia ──────────────────────────────────────────────
  ginecologia: {
    name: "Ginecología",
    slug: "ginecologia",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: true,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: true,
    defaultAppointmentType: "presencial",
    preparationInstructions:
      "Para colposcopía o PAP: evite relaciones sexuales 48h antes. Para ecografía pélvica: beba 1L de agua 1h antes sin orinar. Para control prenatal: traiga su carnet y ecografías anteriores.",
    notesPlaceholder: "Semanas de gestación, FUM, síntomas, resultados...",
    motivoSuggestions: [
      "Consulta ginecológica", "Control prenatal", "PAP / Citología",
      "Colposcopía", "Ecografía obstétrica", "Ecografía pélvica",
      "Anticoncepción", "Menopausia", "Infección vaginal",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      primera_vez:  { label: "Primera consulta",   duracion: 45, bufferAntes: 5, bufferDespues: 5, color: "#F59E0B", icon: "🌸" },
      control:      { label: "Control prenatal",   duracion: 30, bufferAntes: 0, bufferDespues: 5, color: "#EC4899", icon: "🤰" },
      procedimiento:{ label: "Procedimiento",      duracion: 60, bufferAntes: 10, bufferDespues: 15, color: "#8B5CF6", icon: "🔬" },
    },
  },

  // ── Cardiología ────────────────────────────────────────────────────────────
  cardiologia: {
    name: "Cardiología",
    slug: "cardiologia",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: false,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: false,
    defaultAppointmentType: "presencial",
    preparationInstructions:
      "Para prueba de esfuerzo: traiga ropa deportiva y ayuno de 4h. Para ecocardiograma: no es necesaria ninguna preparación especial.",
    notesPlaceholder: "FC, TA, síntomas cardiovasculares, ECG, medicación...",
    motivoSuggestions: [
      "Consulta cardiológica", "Control hipertensión", "Arritmia",
      "Dolor precordial", "ECG", "Ecocardiograma", "Prueba de esfuerzo",
      "Holter", "Palpitaciones", "Insuficiencia cardíaca",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      procedimiento:{ label: "Procedimiento diagnóstico", duracion: 60, bufferAntes: 5, bufferDespues: 10, color: "#EF4444", icon: "❤️" },
      primera_vez:  { label: "Primera consulta",         duracion: 50, bufferAntes: 5, bufferDespues: 10, color: "#F59E0B", icon: "🆕" },
    },
  },

  // ── Pediatría ──────────────────────────────────────────────────────────────
  pediatria: {
    name: "Pediatría",
    slug: "pediatria",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: false,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: true,
    defaultAppointmentType: "presencial",
    notesPlaceholder: "Edad, peso, talla, temperatura, esquema de vacunación...",
    motivoSuggestions: [
      "Control de crecimiento", "Vacunación", "Fiebre", "Infección respiratoria",
      "Dolor abdominal", "Control neonatal", "Revisión de resultados", "Consulta preventiva",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      control:     { label: "Control de crecimiento", duracion: 30, bufferAntes: 0, bufferDespues: 5, color: "#F59E0B", icon: "👶" },
      urgencia:    { label: "Urgencia pediátrica",    duracion: 30, bufferAntes: 0, bufferDespues: 10, color: "#EF4444", icon: "🚨" },
    },
  },

  // ── Traumatología / Ortopedia ──────────────────────────────────────────────
  traumatologia: {
    name: "Traumatología",
    slug: "traumatologia",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: false,
    requiresPreForm: false,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: false,
    defaultAppointmentType: "presencial",
    preparationInstructions:
      "Traiga radiografías o estudios de imagen previos. Si viene por cirugía: ayuno de 8h antes.",
    notesPlaceholder: "Región anatómica, mecanismo de lesión, RX, plan quirúrgico...",
    motivoSuggestions: [
      "Evaluación de fractura", "Postoperatorio", "Dolor articular", "Esguince",
      "Rodilla", "Hombro", "Columna", "Cadera", "RX", "RM", "Prótesis",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      procedimiento:{ label: "Procedimiento / Cirugia", duracion: 120, bufferAntes: 15, bufferDespues: 20, color: "#EF4444", icon: "🦴" },
    },
  },

  // ── Neurología ─────────────────────────────────────────────────────────────
  neurologia: {
    name: "Neurología",
    slug: "neurologia",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: true,
    requiresPreForm: false,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: false,
    defaultAppointmentType: "presencial",
    notesPlaceholder: "Síntomas neurológicos, escala de valoración, medicación, EEG, RM...",
    motivoSuggestions: [
      "Cefalea / Migraña", "Epilepsia", "Mareos", "ACV", "Temblor", "Esclerosis múltiple",
      "Neuropatía periférica", "EEG", "Control de medicación",
    ],
    appointmentTypes: DEFAULT_TYPES,
  },

  // ── Oftalmología ───────────────────────────────────────────────────────────
  oftalmologia: {
    name: "Oftalmología",
    slug: "oftalmologia",
    isHighPrivacy: false,
    showSessionCounter: false,
    showToothSelector: false,
    supportsTelemedicine: false,
    requiresPreForm: false,
    showMorningHuddle: false,
    slotGranularity: 15,
    recurringCommon: false,
    defaultAppointmentType: "presencial",
    preparationInstructions:
      "Si viene para fondo de ojo o dilatación pupilar, traiga acompañante pues no podrá manejar.",
    notesPlaceholder: "Agudeza visual, tonometría, fondo de ojo, lentes, plan...",
    motivoSuggestions: [
      "Control de visión", "Glaucoma", "Catarata", "Conjuntivitis", "Ojo rojo",
      "Fondo de ojo", "Lentes de contacto", "Pre-quirúrgico", "Cirugía refractiva",
    ],
    appointmentTypes: {
      ...DEFAULT_TYPES,
      primera_vez:  { label: "Examen visual completo", duracion: 50, bufferAntes: 5, bufferDespues: 10, color: "#F59E0B", icon: "👁️" },
      procedimiento:{ label: "Procedimiento",          duracion: 90, bufferAntes: 10, bufferDespues: 15, color: "#8B5CF6", icon: "🔬" },
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve specialty config from a specialty name string.
 * Falls back to medicina_general defaults.
 */
export function getSpecialtySchedulingConfig(specialtyName?: string | null): SpecialtySchedulingConfig {
  if (!specialtyName) return SPECIALTY_CONFIGS.medicina_general!;

  const normalized = specialtyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_");

  // Direct match
  if (SPECIALTY_CONFIGS[normalized]) return SPECIALTY_CONFIGS[normalized]!;

  // Partial match
  const key = Object.keys(SPECIALTY_CONFIGS).find((k) => normalized.includes(k) || k.includes(normalized));
  return SPECIALTY_CONFIGS[key ?? "medicina_general"]!;
}

/**
 * Get appointment type config for a given specialty and type.
 */
export function getAppointmentTypeConfig(
  specialtyName?: string | null,
  tipoKey?: AppointmentTypeKey | string | null
): AppointmentTypeConfig {
  const specialty = getSpecialtySchedulingConfig(specialtyName);
  const type = tipoKey as AppointmentTypeKey;
  return (
    specialty.appointmentTypes[type] ??
    specialty.appointmentTypes.presencial ??
    { label: "Consulta", duracion: 30, bufferAntes: 0, bufferDespues: 0, color: "#3B82F6", icon: "🏥" }
  );
}

/**
 * Get all available appointment types for a specialty (for the form dropdown).
 */
export function getSpecialtyAppointmentTypes(specialtyName?: string | null) {
  const specialty = getSpecialtySchedulingConfig(specialtyName);
  return Object.entries(specialty.appointmentTypes).map(([key, config]) => ({
    value: key,
    label: config?.label ?? key,
    duracion: config?.duracion ?? 30,
    color:    config?.color ?? "#3B82F6",
    icon:     config?.icon ?? "🏥",
  }));
}
