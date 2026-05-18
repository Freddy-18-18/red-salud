/**
 * Encuentra el próximo slot disponible para el doctor en función de:
 *   - weeklySchedule (días/tramos hábiles)
 *   - timeBlocks (vacaciones, almuerzos personalizados, etc.)
 *   - exceptions (días cerrados o con horarios especiales)
 *   - existingAppointments (citas activas que ocupan slots)
 *
 * Walk forward por slots de SLOT_MINUTES desde `from` (inclusive) hasta
 * encontrar el primero que pase validateSlot sin errores duros.
 * Búsqueda acotada por `maxDays` (default 30) para no entrar en loop infinito
 * si el doctor no trabaja ningún día configurado.
 */

import type {
  AppointmentRow,
  AvailabilityExceptionRow,
  TimeBlockRow,
  WeeklyScheduleRow,
} from '@red-salud/core';

import { validateSlot } from './slot-validation';

const SLOT_MINUTES = 15;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;

interface FindOptions {
  from: Date;
  durationMin: number;
  weeklySchedule: WeeklyScheduleRow[];
  timeBlocks: TimeBlockRow[];
  exceptions: AvailabilityExceptionRow[];
  appointments: AppointmentRow[];
  maxDays?: number;
}

export interface NextSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function findNextAvailableSlot(opts: FindOptions): NextSlot | null {
  const maxDays = opts.maxDays ?? 30;

  // Snap `from` al próximo slot de 15 min
  const cursor = new Date(opts.from);
  cursor.setSeconds(0, 0);
  const nextMin = Math.ceil(cursor.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES;
  cursor.setMinutes(nextMin);

  // Si la hora cae fuera del día hábil, saltar al DAY_START_HOUR del mismo o siguiente día
  if (cursor.getHours() < DAY_START_HOUR) {
    cursor.setHours(DAY_START_HOUR, 0, 0, 0);
  } else if (cursor.getHours() >= DAY_END_HOUR) {
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(DAY_START_HOUR, 0, 0, 0);
  }

  const endLimit = new Date(opts.from);
  endLimit.setDate(endLimit.getDate() + maxDays);

  while (cursor.getTime() < endLimit.getTime()) {
    // Reinicia el día si el cursor pasó el fin del día hábil
    if (cursor.getHours() >= DAY_END_HOUR) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(DAY_START_HOUR, 0, 0, 0);
      continue;
    }

    const date = formatDateKey(cursor);
    const time = formatTime(cursor);

    // Filtrar appointments al día actual para velocidad
    const dayAppts = opts.appointments.filter(
      (a) => a.scheduled_at.slice(0, 10) === date,
    );

    const validation = validateSlot({
      date,
      time,
      durationMin: opts.durationMin,
      weeklySchedule: opts.weeklySchedule,
      timeBlocks: opts.timeBlocks,
      exceptions: opts.exceptions,
      appointments: dayAppts,
    });

    // Solo aceptar slots SIN errores duros (warnings OK — el doctor decide).
    if (!validation.hasErrors) {
      return { date, time };
    }

    // Heurística: si el error es "not_working_day" o "exception_closed",
    // saltar al día siguiente; ahorra cientos de iteraciones.
    const codes = validation.issues.map((i) => i.code);
    if (codes.includes('not_working_day') || codes.includes('exception_closed')) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(DAY_START_HOUR, 0, 0, 0);
      continue;
    }

    // Avanzar un slot
    cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
  }

  return null;
}
