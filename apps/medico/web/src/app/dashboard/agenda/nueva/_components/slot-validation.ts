/**
 * Validación de un slot candidato contra:
 *   1. weekly_schedule_template — ¿el doctor trabaja ese día/hora?
 *   2. time_blocks               — ¿no está bloqueado (almuerzo/vacaciones)?
 *   3. doctor_availability_exceptions — ¿el día no está cerrado por excepción?
 *   4. appointments              — ¿no choca con otra cita activa?
 *
 * Función pura — recibe todos los datasets ya cargados y devuelve el resultado
 * computado. Reusable en tests y separado del hook (que solo orquesta fetches).
 */

import type {
  AppointmentRow,
  AvailabilityExceptionRow,
  TimeBlockRow,
  WeeklyScheduleRow,
} from '@red-salud/core';

export type SlotIssueSeverity = 'error' | 'warning';

export type SlotIssueCode =
  | 'not_working_day'
  | 'outside_hours'
  | 'inside_break'
  | 'time_block'
  | 'exception_closed'
  | 'appointment_overlap';

export interface SlotIssue {
  code: SlotIssueCode;
  severity: SlotIssueSeverity;
  message: string;
  detail?: string;
}

export interface SlotValidationInput {
  /** Fecha local YYYY-MM-DD */
  date: string;
  /** Hora local HH:mm */
  time: string;
  /** Duración propuesta en minutos */
  durationMin: number;
  weeklySchedule: WeeklyScheduleRow[];
  timeBlocks: TimeBlockRow[];
  exceptions: AvailabilityExceptionRow[];
  /** Citas existentes del doctor (cualquier día — filtramos al date acá). */
  appointments: AppointmentRow[];
}

export interface SlotValidationResult {
  ok: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  issues: SlotIssue[];
}

const STATUSES_THAT_BLOCK_SLOT = new Set([
  'scheduled',
  'pending',
  'confirmed',
  'waiting',
  'in_progress',
]);

function toMinutes(hhmm: string): number {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function validateSlot(input: SlotValidationInput): SlotValidationResult {
  const issues: SlotIssue[] = [];

  const slotStart = toMinutes(input.time);
  const slotEnd = slotStart + input.durationMin;

  // Day-of-week 0=Sunday..6=Saturday — match weekly_schedule_template convention
  const dow = new Date(`${input.date}T00:00:00`).getDay();

  // ---- (1) weekly_schedule_template -----------------------------------------
  const dayTemplate = input.weeklySchedule.find(
    (row) => row.day_of_week === dow && row.is_active,
  );

  if (!dayTemplate) {
    issues.push({
      code: 'not_working_day',
      severity: 'error',
      message: 'El doctor no trabaja este día',
      detail: 'Configurá tu agenda semanal en /dashboard/agenda/configuracion.',
    });
  } else {
    const insideSomeSlot = dayTemplate.slots.some((s) => {
      const ws = toMinutes(s.start);
      const we = toMinutes(s.end);
      return slotStart >= ws && slotEnd <= we;
    });
    if (!insideSomeSlot) {
      const slotsLabel = dayTemplate.slots
        .map((s) => `${s.start}–${s.end}`)
        .join(', ');
      issues.push({
        code: 'outside_hours',
        severity: 'warning',
        message: 'Fuera del horario habitual',
        detail: slotsLabel
          ? `Tus horarios para este día: ${slotsLabel}`
          : 'Este día no tiene tramos definidos.',
      });
    }

    const insideBreak = dayTemplate.breaks.find((b) => {
      const bs = toMinutes(b.start);
      const be = toMinutes(b.end);
      return intervalsOverlap(slotStart, slotEnd, bs, be);
    });
    if (insideBreak) {
      issues.push({
        code: 'inside_break',
        severity: 'warning',
        message: `Cae en tu pausa: ${insideBreak.label}`,
        detail: `${insideBreak.start}–${insideBreak.end}`,
      });
    }
  }

  // ---- (2) doctor_availability_exceptions -----------------------------------
  const exception = input.exceptions.find((ex) => ex.date === input.date);
  if (exception && !exception.is_available) {
    issues.push({
      code: 'exception_closed',
      severity: 'error',
      message: 'Día marcado como no disponible',
      detail: exception.reason ?? 'Sin motivo registrado.',
    });
  }
  if (exception && exception.is_available && exception.custom_slots) {
    const insideCustom = exception.custom_slots.some((s) => {
      const ws = toMinutes(s.start);
      const we = toMinutes(s.end);
      return slotStart >= ws && slotEnd <= we;
    });
    if (!insideCustom) {
      issues.push({
        code: 'outside_hours',
        severity: 'warning',
        message: 'Fuera de los horarios excepcionales del día',
        detail: exception.custom_slots
          .map((s) => `${s.start}–${s.end}`)
          .join(', '),
      });
    }
  }

  // ---- (3) time_blocks ------------------------------------------------------
  const slotDateStart = new Date(`${input.date}T${input.time}:00`);
  const slotDateEnd = new Date(slotDateStart);
  slotDateEnd.setMinutes(slotDateEnd.getMinutes() + input.durationMin);

  const blockingBlock = input.timeBlocks.find((b) => {
    const bs = new Date(b.starts_at);
    const be = new Date(b.ends_at);
    return slotDateStart < be && bs < slotDateEnd;
  });
  if (blockingBlock) {
    issues.push({
      code: 'time_block',
      severity: 'error',
      message: `Bloqueado: ${blockingBlock.title}`,
      detail: blockingBlock.notes ?? blockingBlock.block_type,
    });
  }

  // ---- (4) appointments overlap ---------------------------------------------
  const dayAppts = input.appointments.filter(
    (apt) =>
      apt.scheduled_at.slice(0, 10) === input.date &&
      STATUSES_THAT_BLOCK_SLOT.has(apt.status),
  );

  const overlapping = dayAppts.find((apt) => {
    const aStart = new Date(apt.scheduled_at);
    const aStartMin =
      aStart.getHours() * 60 + aStart.getMinutes();
    const aEndMin = aStartMin + (apt.duration_minutes || 30);
    return intervalsOverlap(slotStart, slotEnd, aStartMin, aEndMin);
  });

  if (overlapping) {
    const t = new Date(overlapping.scheduled_at);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    issues.push({
      code: 'appointment_overlap',
      severity: 'error',
      message: 'Se superpone con otra cita',
      detail: `${overlapping.patient?.full_name ?? 'Paciente'} a las ${hh}:${mm} (${overlapping.duration_minutes || 30} min)`,
    });
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');

  return {
    ok: !hasErrors,
    hasErrors,
    hasWarnings,
    issues,
  };
}
