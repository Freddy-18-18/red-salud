/**
 * @file vaccination-schedule.ts
 * @description Venezuelan vaccination schedule data (PAI — Programa Ampliado de Inmunizaciones).
 *
 * Contains the full schedule with dose info, recommended ages,
 * routes, sites, and helper functions for computing vaccine status.
 */

// ============================================================================
// TYPES
// ============================================================================

export type VaccineRoute = 'IM' | 'SC' | 'oral' | 'intradermal';

export type VaccineSite =
  | 'brazo_izquierdo'
  | 'brazo_derecho'
  | 'muslo_izquierdo'
  | 'muslo_derecho'
  | 'gluteo'
  | 'oral'
  | 'antebrazo';

export type VaccineStatus =
  | 'administered'   // Applied
  | 'pending'        // Due but not yet
  | 'overdue'        // Past due date
  | 'upcoming'       // Not yet due
  | 'contraindicated'; // Cannot be administered

export interface VaccineDose {
  doseNumber: number;
  label: string;
  /** Recommended age in months (0 = birth) */
  ageMonths: number;
}

export interface VaccineScheduleEntry {
  id: string;
  vaccine: string;
  shortName: string;
  doses: VaccineDose[];
  route: VaccineRoute;
  defaultSite: VaccineSite;
  note?: string;
  /** Only applies to specific sex */
  sexRestriction?: 'male' | 'female';
}

export interface VaccineStatusResult {
  entry: VaccineScheduleEntry;
  dose: VaccineDose;
  status: VaccineStatus;
  /** Date administered, if available */
  dateAdministered?: string;
  /** Days until due (negative = overdue) */
  daysUntilDue: number;
}

// ============================================================================
// SITE LABELS
// ============================================================================

export const VACCINE_SITE_LABELS: Record<VaccineSite, string> = {
  brazo_izquierdo: 'Brazo izquierdo',
  brazo_derecho: 'Brazo derecho',
  muslo_izquierdo: 'Muslo izquierdo',
  muslo_derecho: 'Muslo derecho',
  gluteo: 'Glúteo',
  oral: 'Oral',
  antebrazo: 'Antebrazo',
};

export const VACCINE_ROUTE_LABELS: Record<VaccineRoute, string> = {
  IM: 'Intramuscular',
  SC: 'Subcutánea',
  oral: 'Oral',
  intradermal: 'Intradérmica',
};

// ============================================================================
// VENEZUELAN VACCINATION SCHEDULE (PAI)
// ============================================================================

export const VACCINATION_SCHEDULE: VaccineScheduleEntry[] = [
  {
    id: 'bcg',
    vaccine: 'BCG',
    shortName: 'BCG',
    doses: [
      { doseNumber: 1, label: 'Dosis única', ageMonths: 0 },
    ],
    route: 'intradermal',
    defaultSite: 'brazo_izquierdo',
  },
  {
    id: 'hep-b',
    vaccine: 'Hepatitis B',
    shortName: 'HepB',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 0 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 2 },
      { doseNumber: 3, label: '3era dosis', ageMonths: 6 },
    ],
    route: 'IM',
    defaultSite: 'muslo_derecho',
  },
  {
    id: 'pentavalente',
    vaccine: 'Pentavalente (DPT+HB+Hib)',
    shortName: 'Penta',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 2 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 4 },
      { doseNumber: 3, label: '3era dosis', ageMonths: 6 },
    ],
    route: 'IM',
    defaultSite: 'muslo_izquierdo',
  },
  {
    id: 'polio',
    vaccine: 'Polio (IPV/OPV)',
    shortName: 'Polio',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 2 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 4 },
      { doseNumber: 3, label: '3era dosis', ageMonths: 6 },
      { doseNumber: 4, label: 'Refuerzo', ageMonths: 18 },
    ],
    route: 'IM',
    defaultSite: 'muslo_derecho',
    note: 'IPV primeras 2 dosis, luego OPV',
  },
  {
    id: 'rotavirus',
    vaccine: 'Rotavirus',
    shortName: 'Rota',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 2 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 4 },
    ],
    route: 'oral',
    defaultSite: 'oral',
  },
  {
    id: 'neumococo',
    vaccine: 'Neumococo Conjugada',
    shortName: 'PCV',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 2 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 4 },
      { doseNumber: 3, label: 'Refuerzo', ageMonths: 12 },
    ],
    route: 'IM',
    defaultSite: 'muslo_izquierdo',
  },
  {
    id: 'influenza',
    vaccine: 'Influenza',
    shortName: 'Flu',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 6 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 7 },
    ],
    route: 'IM',
    defaultSite: 'brazo_derecho',
    note: 'Luego anual',
  },
  {
    id: 'srp',
    vaccine: 'SRP (Triple Viral)',
    shortName: 'SRP',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 12 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 60 },
    ],
    route: 'SC',
    defaultSite: 'brazo_izquierdo',
  },
  {
    id: 'fiebre-amarilla',
    vaccine: 'Fiebre Amarilla',
    shortName: 'FA',
    doses: [
      { doseNumber: 1, label: 'Dosis única', ageMonths: 12 },
    ],
    route: 'SC',
    defaultSite: 'brazo_derecho',
  },
  {
    id: 'varicela',
    vaccine: 'Varicela',
    shortName: 'Var',
    doses: [
      { doseNumber: 1, label: 'Dosis única', ageMonths: 12 },
    ],
    route: 'SC',
    defaultSite: 'brazo_izquierdo',
  },
  {
    id: 'hepatitis-a',
    vaccine: 'Hepatitis A',
    shortName: 'HepA',
    doses: [
      { doseNumber: 1, label: 'Dosis única', ageMonths: 12 },
    ],
    route: 'IM',
    defaultSite: 'brazo_derecho',
  },
  {
    id: 'dpt-refuerzo',
    vaccine: 'DPT (refuerzo)',
    shortName: 'DPT-R',
    doses: [
      { doseNumber: 1, label: '1er refuerzo', ageMonths: 18 },
      { doseNumber: 2, label: '2do refuerzo', ageMonths: 60 },
    ],
    route: 'IM',
    defaultSite: 'brazo_izquierdo',
  },
  {
    id: 'td',
    vaccine: 'Toxoide Tetánico/Diftérico',
    shortName: 'Td',
    doses: [
      { doseNumber: 1, label: 'Dosis', ageMonths: 120 },
    ],
    route: 'IM',
    defaultSite: 'brazo_derecho',
    note: 'Refuerzo cada 10 años',
  },
  {
    id: 'vph',
    vaccine: 'VPH',
    shortName: 'VPH',
    doses: [
      { doseNumber: 1, label: '1era dosis', ageMonths: 132 },
      { doseNumber: 2, label: '2da dosis', ageMonths: 138 },
    ],
    route: 'IM',
    defaultSite: 'brazo_izquierdo',
    note: 'Solo niñas',
    sexRestriction: 'female',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate age in months from date of birth.
 */
export function getAgeInMonths(dob: Date, referenceDate: Date = new Date()): number {
  const years = referenceDate.getFullYear() - dob.getFullYear();
  const months = referenceDate.getMonth() - dob.getMonth();
  const days = referenceDate.getDate() - dob.getDate();
  let totalMonths = years * 12 + months;
  if (days < 0) totalMonths -= 1;
  return Math.max(0, totalMonths);
}

/**
 * Get the recommended date for a vaccine dose given a date of birth.
 */
export function getDoseRecommendedDate(dob: Date, ageMonths: number): Date {
  const date = new Date(dob);
  date.setMonth(date.getMonth() + ageMonths);
  return date;
}

/**
 * Compute days until a dose is due. Negative means overdue.
 */
export function getDaysUntilDue(dob: Date, ageMonths: number): number {
  const recommended = getDoseRecommendedDate(dob, ageMonths);
  const now = new Date();
  const diffMs = recommended.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine vaccine status for a dose.
 */
export function computeVaccineStatus(
  dob: Date,
  dose: VaccineDose,
  isAdministered: boolean,
  isContraindicated: boolean = false,
): VaccineStatus {
  if (isContraindicated) return 'contraindicated';
  if (isAdministered) return 'administered';

  const daysUntil = getDaysUntilDue(dob, dose.ageMonths);
  // Grace period: 30 days before due is "pending"
  if (daysUntil > 30) return 'upcoming';
  if (daysUntil >= -30) return 'pending';
  return 'overdue';
}

/**
 * Get color for vaccine status.
 */
export function getStatusColor(status: VaccineStatus): string {
  switch (status) {
    case 'administered': return '#22c55e';
    case 'pending': return '#eab308';
    case 'overdue': return '#ef4444';
    case 'upcoming': return '#9ca3af';
    case 'contraindicated': return '#6b7280';
  }
}

/**
 * Get label for vaccine status.
 */
export function getStatusLabel(status: VaccineStatus): string {
  switch (status) {
    case 'administered': return 'Aplicada';
    case 'pending': return 'Pendiente';
    case 'overdue': return 'Vencida';
    case 'upcoming': return 'Próxima';
    case 'contraindicated': return 'Contraindicada';
  }
}

/**
 * Get all doses in the schedule that apply to a given sex,
 * sorted by recommended age.
 */
export function getApplicableDoses(
  sex: 'male' | 'female',
): Array<{ entry: VaccineScheduleEntry; dose: VaccineDose }> {
  const result: Array<{ entry: VaccineScheduleEntry; dose: VaccineDose }> = [];

  for (const entry of VACCINATION_SCHEDULE) {
    if (entry.sexRestriction && entry.sexRestriction !== sex) continue;
    for (const dose of entry.doses) {
      result.push({ entry, dose });
    }
  }

  return result.sort((a, b) => a.dose.ageMonths - b.dose.ageMonths);
}

/**
 * Format age in months to a human-readable string.
 */
export function formatAge(ageMonths: number): string {
  if (ageMonths === 0) return 'Recién nacido';
  if (ageMonths < 12) return `${ageMonths} ${ageMonths === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(ageMonths / 12);
  const remainingMonths = ageMonths % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
  return `${years} ${years === 1 ? 'año' : 'años'} ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
}
