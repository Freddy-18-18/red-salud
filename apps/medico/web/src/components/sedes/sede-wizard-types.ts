/**
 * @file components/sedes/sede-wizard-types.ts
 * @description Shared types for the multi-step sede wizard.
 *
 * Each step receives a slice of the draft and an `onPatch` callback. We never
 * mutate the draft in place — every step returns a partial that the orchestrator
 * merges into the source-of-truth state. This keeps the back/forward stepper
 * idempotent and makes form validation straightforward.
 */

import type { DoctorPracticeLocation } from '@/lib/sedes/types';

/**
 * A single time interval for a working day. Both ends are HH:MM strings in
 * 24-hour format. End must be strictly greater than start — validated at the
 * step level before letting the doctor advance.
 */
export interface ScheduleSlot {
  start: string;
  end: string;
}

/**
 * One day of the weekly template. `dayOfWeek` matches the
 * `weekly_schedule_template.day_of_week` integer convention:
 *   0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
export interface ScheduleDay {
  dayOfWeek: number;
  isWorkingDay: boolean;
  slots: ScheduleSlot[];
}

/**
 * Schedule payload for the wizard's third step. Default duration applies to
 * every day; per-day overrides land in a later iteration when the table grows
 * past MVP.
 */
export interface WeeklySchedule {
  days: ScheduleDay[];
  defaultDurationMins: number;
  bufferAfterMins: number;
}

/**
 * Complete draft state owned by the wizard orchestrator. Stays in memory until
 * the doctor reaches the "Confirmar" step — only then does it become a Supabase
 * round-trip (one insert into doctor_practice_locations + N inserts into
 * weekly_schedule_template).
 */
export interface SedeWizardDraft {
  name: string;
  phone: string;
  notes: string;
  isPrimary: boolean;

  address: string;
  city: string;
  state: string;
  postalCode: string;
  arrivalInstructions: string;
  /** Lat/lng captured by MapPicker. Null until the doctor places the pin. */
  coordinates: { lat: number; lng: number } | null;

  schedule: WeeklySchedule;
}

/**
 * Sede shape the wizard accepts as initial data when editing instead of
 * creating. Maps cleanly from `DoctorPracticeLocation` + its schedule rows.
 */
export interface SedeWizardInitialData {
  sede: DoctorPracticeLocation;
  schedule: WeeklySchedule | null;
}

/**
 * Default 9-to-5 Monday-to-Friday weekly schedule used when the doctor opens
 * the wizard fresh. Saturdays and Sundays are off; the doctor flips them on
 * if needed.
 */
export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  days: Array.from({ length: 7 }, (_, dow) => ({
    dayOfWeek: dow,
    isWorkingDay: dow >= 1 && dow <= 5,
    slots: dow >= 1 && dow <= 5 ? [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] : [],
  })),
  defaultDurationMins: 30,
  bufferAfterMins: 5,
};

export const EMPTY_WIZARD_DRAFT: SedeWizardDraft = {
  name: '',
  phone: '',
  notes: '',
  isPrimary: false,
  address: '',
  city: '',
  state: '',
  postalCode: '',
  arrivalInstructions: '',
  coordinates: null,
  schedule: DEFAULT_WEEKLY_SCHEDULE,
};

export const SPANISH_DAY_NAMES: Record<number, { short: string; long: string }> = {
  0: { short: 'Dom', long: 'Domingo' },
  1: { short: 'Lun', long: 'Lunes' },
  2: { short: 'Mar', long: 'Martes' },
  3: { short: 'Mié', long: 'Miércoles' },
  4: { short: 'Jue', long: 'Jueves' },
  5: { short: 'Vie', long: 'Viernes' },
  6: { short: 'Sáb', long: 'Sábado' },
};
