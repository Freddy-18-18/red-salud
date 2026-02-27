/**
 * @file weekly-schedule-service.ts
 * @description CRUD para plantillas semanales de disponibilidad del médico.
 *   Permite configurar el horario base por día, breaks, y límites de citas.
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface DayBreak {
  start: string;
  end: string;
  label: string; // e.g. "Almuerzo"
}

export interface WeeklyScheduleDay {
  id: string;
  doctor_id: string;
  office_id: string | null;
  name: string;
  is_active: boolean;
  day_of_week: number; // 0=Dom, 1=Lun...6=Sab
  is_working_day: boolean;
  slots: TimeSlot[];
  default_duration_mins: number;
  buffer_after_mins: number;
  max_appointments: number | null;
  breaks: DayBreak[];
  created_at: string;
  updated_at: string;
}

export type UpdateWeeklyScheduleDayInput = Partial<Omit<WeeklyScheduleDay,
  "id" | "doctor_id" | "day_of_week" | "created_at" | "updated_at"
>>;

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** Load the 7-day template for a doctor/office. Creates defaults if missing. */
export async function getWeeklySchedule(
  doctorId: string,
  officeId?: string | null
): Promise<{ data: WeeklyScheduleDay[]; error: string | null }> {
  let query = supabase
    .from("weekly_schedule_template")
    .select("*")
    .eq("doctor_id", doctorId);

  if (officeId) query = query.eq("office_id", officeId);
  else          query = query.is("office_id", null);

  query = query
    .order("day_of_week", { ascending: true })
    .order("updated_at", { ascending: false });

  const { data, error } = await query;

  if (error) return { data: [], error: error.message };

  // If no template exists, create defaults
  if (!data || data.length === 0) {
    await supabase.rpc("create_default_schedule_template", {
      p_doctor_id: doctorId,
      p_office_id: officeId ?? null,
    });

    const { data: fresh } = await query;
    const normalizedFresh = normalizeWeeklyDays((fresh as WeeklyScheduleDay[]) ?? []);
    return { data: normalizedFresh, error: null };
  }

  const normalized = normalizeWeeklyDays(data as WeeklyScheduleDay[]);
  return { data: normalized, error: null };
}

function normalizeWeeklyDays(days: WeeklyScheduleDay[]): WeeklyScheduleDay[] {
  const byDay = new Map<number, WeeklyScheduleDay>();

  for (const day of days) {
    if (!byDay.has(day.day_of_week)) {
      byDay.set(day.day_of_week, day);
    }
  }

  return Array.from(byDay.values()).sort((a, b) => a.day_of_week - b.day_of_week);
}

export async function updateWeeklyScheduleDay(
  id: string,
  updates: UpdateWeeklyScheduleDayInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("weekly_schedule_template")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

/** Bulk update all 7 days at once */
export async function bulkUpdateWeeklySchedule(
  days: Array<{ id: string } & UpdateWeeklyScheduleDayInput>
): Promise<{ error: string | null }> {
  const updates = days.map((day) => {
    const { id, ...rest } = day;
    return supabase
      .from("weekly_schedule_template")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id);
  });

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error)?.error;
  return { error: firstError?.message ?? null };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const DAY_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const DAY_SHORT: Record<number, string> = {
  0: "Dom", 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb",
};

/**
 * Computes how many appointment slots a day has given slots + buffer + duration.
 */
export function computeDayCapacity(day: WeeklyScheduleDay): number {
  if (!day.is_working_day) return 0;

  const totalMinutes = day.slots.reduce((sum, slot) => {
    const [sh = 0, sm = 0] = slot.start.split(":").map(Number);
    const [eh = 0, em = 0] = slot.end.split(":").map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  const breakMinutes = day.breaks.reduce((sum, b) => {
    const [sh = 0, sm = 0] = b.start.split(":").map(Number);
    const [eh = 0, em = 0] = b.end.split(":").map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  const slotWithBuffer = day.default_duration_mins + day.buffer_after_mins;
  const available = totalMinutes - breakMinutes;

  return Math.floor(available / slotWithBuffer);
}
