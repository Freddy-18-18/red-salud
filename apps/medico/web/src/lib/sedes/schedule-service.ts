/**
 * @file lib/sedes/schedule-service.ts
 * @description CRUD for per-sede weekly schedules.
 *
 * Backed by `public.weekly_schedule_template` (one row per `(doctor_id,
 * office_id, day_of_week)` triple). The wizard hydrates from these rows and
 * persists 7 inserts on save — one row per weekday — using upsert semantics so
 * editing an existing sede doesn't duplicate rows.
 *
 * RLS pins ownership to `doctor_id = auth.uid()`. The service relies on that
 * (we never filter by doctor_id in queries to avoid double-enforcement that
 * silently swallows debug pain when policies drift).
 */

import { supabase } from '@/lib/supabase/client';

import type {
  ScheduleDay,
  ScheduleSlot,
  WeeklySchedule,
} from '@/components/sedes/sede-wizard-types';
import { DEFAULT_WEEKLY_SCHEDULE } from '@/components/sedes/sede-wizard-types';

const TABLE = 'weekly_schedule_template';

interface WeeklyScheduleRow {
  id: string;
  doctor_id: string;
  office_id: string | null;
  day_of_week: number;
  is_working_day: boolean;
  slots: unknown;
  default_duration_mins: number;
  buffer_after_mins: number;
}

function parseSlots(raw: unknown): ScheduleSlot[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) return null;
      const obj = entry as Record<string, unknown>;
      const start = typeof obj.start === 'string' ? obj.start : null;
      const end = typeof obj.end === 'string' ? obj.end : null;
      if (!start || !end) return null;
      return { start, end } as ScheduleSlot;
    })
    .filter((s): s is ScheduleSlot => s !== null);
}

/**
 * Fetch the 7-row weekly template for a given sede. Returns the canonical
 * default schedule when no rows exist yet (brand-new sede). Days that are
 * partially populated get their missing fields filled from the default.
 */
export async function listWeeklyScheduleForSede(
  sedeId: string,
): Promise<WeeklySchedule> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'id,doctor_id,office_id,day_of_week,is_working_day,slots,default_duration_mins,buffer_after_mins',
    )
    .eq('office_id', sedeId);

  if (error) throw error;

  const rows = (data ?? []) as WeeklyScheduleRow[];
  if (rows.length === 0) return DEFAULT_WEEKLY_SCHEDULE;

  const days: ScheduleDay[] = Array.from({ length: 7 }, (_, dow) => {
    const row = rows.find((r) => r.day_of_week === dow);
    if (!row) return DEFAULT_WEEKLY_SCHEDULE.days[dow];
    return {
      dayOfWeek: row.day_of_week,
      isWorkingDay: row.is_working_day,
      slots: parseSlots(row.slots),
    };
  });

  return {
    days,
    defaultDurationMins:
      rows[0]?.default_duration_mins ?? DEFAULT_WEEKLY_SCHEDULE.defaultDurationMins,
    bufferAfterMins:
      rows[0]?.buffer_after_mins ?? DEFAULT_WEEKLY_SCHEDULE.bufferAfterMins,
  };
}

/**
 * Persist the wizard's weekly schedule for a sede. Implemented as a delete +
 * insert pair inside a single round-trip to keep the row set canonical (no
 * leftover rows from previous edits). RLS guarantees only the doctor's own
 * rows get touched.
 */
export async function upsertWeeklyScheduleForSede(
  doctorId: string,
  sedeId: string,
  schedule: WeeklySchedule,
): Promise<void> {
  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .eq('office_id', sedeId);
  if (deleteError) throw deleteError;

  const rows = schedule.days.map((day) => ({
    doctor_id: doctorId,
    office_id: sedeId,
    name: 'Horario Principal',
    is_active: true,
    day_of_week: day.dayOfWeek,
    is_working_day: day.isWorkingDay,
    slots: day.isWorkingDay ? day.slots : [],
    default_duration_mins: schedule.defaultDurationMins,
    buffer_after_mins: schedule.bufferAfterMins,
  }));

  const { error: insertError } = await supabase.from(TABLE).insert(rows);
  if (insertError) throw insertError;
}
