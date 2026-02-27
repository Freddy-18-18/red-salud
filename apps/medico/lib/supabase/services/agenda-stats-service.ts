/**
 * @file agenda-stats-service.ts
 * @description Estadísticas avanzadas de agenda: no-shows, hora pico, revenue,
 *   conversión lista de espera, duración real por procedimiento.
 */

import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

const supabase = createClient();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface NoShowTrend {
  month: string;
  total: number;
  no_shows: number;
  rate_pct: number;
}

export interface HourlyHeatmapEntry {
  day_of_week: number;
  hour_of_day: number;
  appointment_count: number;
  no_shows: number;
  avg_revenue: number;
}

export interface AppointmentTypeMetrics {
  tipo_cita: string;
  total: number;
  completed: number;
  cancelled: number;
  no_show: number;
  avg_scheduled_mins: number;
  avg_actual_mins: number | null;
  avg_overrun_mins: number | null;
  total_revenue: number;
  avg_revenue: number;
}

export interface RevenueVsGoal {
  month: string;
  actual: number;
  goal: number;
  pct: number;
}

export interface WaitlistConversionEntry {
  month: string;
  total: number;
  confirmed: number;
  conversion_rate_pct: number;
}

export interface AgendaSummaryKPIs {
  total_appointments_30d: number;
  completed_30d: number;
  no_show_rate_pct: number;
  cancellation_rate_pct: number;
  avg_actual_duration_mins: number | null;
  occupancy_rate_pct: number;
  revenue_30d: number;
  waitlist_conversion_pct: number;
  avg_wait_time_mins: number | null;
  on_time_rate_pct: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export async function getAgendaSummaryKPIs(doctorId: string): Promise<AgendaSummaryKPIs> {
  const from = subMonths(new Date(), 1).toISOString();

  const [apts, waitlistData, checkinData] = await Promise.all([
    supabase
      .from("appointments")
      .select("status, duracion_minutos, actual_duration_minutes, price, fecha_hora, started_at")
      .eq("medico_id", doctorId)
      .gte("fecha_hora", from),

    supabase
      .from("smart_waitlist")
      .select("status")
      .eq("doctor_id", doctorId)
      .gte("created_at", from),

    supabase
      .from("appointment_checkin")
      .select("checkin_at, called_in_at")
      .eq("doctor_id", doctorId)
      .gte("created_at", from),
  ]);

  const rows = apts.data ?? [];
  const total = rows.length;
  const completed = rows.filter((r) => r.status === "completada").length;
  const noShows   = rows.filter((r) => r.status === "no_asistio").length;
  const cancelled = rows.filter((r) => r.status === "cancelada").length;
  const revenue30d = rows.reduce((s, r) => s + (r.price ?? 0), 0);

  // Actual duration avg
  const withDuration = rows.filter((r) => r.actual_duration_minutes != null);
  const avgActual = withDuration.length
    ? Math.round(withDuration.reduce((s, r) => s + (r.actual_duration_minutes ?? 0), 0) / withDuration.length)
    : null;

  // Occupancy (total scheduled minutes / 480 min/day * 30 days)
  const totalScheduledMins = rows.reduce((s, r) => s + (r.duracion_minutos ?? 30), 0);
  const occupancy = Math.round((totalScheduledMins / (480 * 22)) * 100); // 22 working days

  // Waitlist conversion
  const wlRows = waitlistData.data ?? [];
  const wlConfirmed = wlRows.filter((r) => r.status === "confirmed").length;
  const wlConversion = wlRows.length ? Math.round((wlConfirmed / wlRows.length) * 100) : 0;

  // Avg wait time
  const checkins = (checkinData.data ?? []).filter((c) => c.called_in_at);
  const avgWait = checkins.length
    ? Math.round(
        checkins.reduce((s, c) => {
          return s + (new Date(c.called_in_at!).getTime() - new Date(c.checkin_at).getTime()) / 60000;
        }, 0) / checkins.length
      )
    : null;

  // On-time rate
  const started = rows.filter((r) => r.started_at);
  const onTime  = started.filter((r) => {
    const delay = (new Date(r.started_at!).getTime() - new Date(r.fecha_hora).getTime()) / 60000;
    return Math.abs(delay) <= 15;
  }).length;

  return {
    total_appointments_30d:   total,
    completed_30d:            completed,
    no_show_rate_pct:         total ? Math.round((noShows / total) * 100) : 0,
    cancellation_rate_pct:    total ? Math.round((cancelled / total) * 100) : 0,
    avg_actual_duration_mins: avgActual,
    occupancy_rate_pct:       Math.min(occupancy, 100),
    revenue_30d:              revenue30d,
    waitlist_conversion_pct:  wlConversion,
    avg_wait_time_mins:       avgWait,
    on_time_rate_pct:         started.length ? Math.round((onTime / started.length) * 100) : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// NO-SHOW TREND (last 12 months)
// ─────────────────────────────────────────────────────────────────────────────

export async function getNoShowTrend(doctorId: string, months = 12): Promise<NoShowTrend[]> {
  const from = subMonths(new Date(), months).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("fecha_hora, status")
    .eq("medico_id", doctorId)
    .gte("fecha_hora", from)
    .not("status", "eq", "pendiente");

  if (!data) return [];

  // Group by month
  const byMonth: Record<string, { total: number; no_shows: number }> = {};
  for (const row of data) {
    const key = format(new Date(row.fecha_hora), "yyyy-MM");
    if (!byMonth[key]) byMonth[key] = { total: 0, no_shows: 0 };
    byMonth[key].total++;
    if (row.status === "no_asistio") byMonth[key].no_shows++;
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      total:    v.total,
      no_shows: v.no_shows,
      rate_pct: v.total ? Math.round((v.no_shows / v.total) * 100) : 0,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// HOURLY HEATMAP (peak hours)
// ─────────────────────────────────────────────────────────────────────────────

export async function getHourlyHeatmap(doctorId: string): Promise<HourlyHeatmapEntry[]> {
  const { data, error } = await supabase
    .from("appointment_hourly_heatmap")
    .select("*")
    .eq("doctor_id", doctorId);

  if (error || !data) return [];
  return data as HourlyHeatmapEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT TYPE METRICS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAppointmentTypeMetrics(
  doctorId: string,
  months = 6
): Promise<AppointmentTypeMetrics[]> {
  const from = subMonths(new Date(), months).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("tipo_cita, status, duracion_minutos, actual_duration_minutes, price")
    .eq("medico_id", doctorId)
    .gte("fecha_hora", from);

  if (!data) return [];

  const byType: Record<string, {
    total: number; completed: number; cancelled: number; no_show: number;
    scheduled_mins: number[]; actual_mins: number[]; revenue: number[];
  }> = {};

  for (const r of data) {
    const t = r.tipo_cita ?? "presencial";
    if (!byType[t]) byType[t] = { total: 0, completed: 0, cancelled: 0, no_show: 0, scheduled_mins: [], actual_mins: [], revenue: [] };
    byType[t].total++;
    if (r.status === "completada") byType[t].completed++;
    if (r.status === "cancelada")  byType[t].cancelled++;
    if (r.status === "no_asistio") byType[t].no_show++;
    byType[t].scheduled_mins.push(r.duracion_minutos ?? 30);
    if (r.actual_duration_minutes != null) byType[t].actual_mins.push(r.actual_duration_minutes);
    if (r.price != null) byType[t].revenue.push(r.price);
  }

  return Object.entries(byType).map(([tipo_cita, v]) => {
    const avgScheduled = v.scheduled_mins.length ? Math.round(v.scheduled_mins.reduce((s, x) => s + x, 0) / v.scheduled_mins.length) : 0;
    const avgActual    = v.actual_mins.length ? Math.round(v.actual_mins.reduce((s, x) => s + x, 0) / v.actual_mins.length) : null;
    const totalRevenue = v.revenue.reduce((s, x) => s + x, 0);
    return {
      tipo_cita,
      total:               v.total,
      completed:           v.completed,
      cancelled:           v.cancelled,
      no_show:             v.no_show,
      avg_scheduled_mins:  avgScheduled,
      avg_actual_mins:     avgActual,
      avg_overrun_mins:    avgActual != null ? avgActual - avgScheduled : null,
      total_revenue:       totalRevenue,
      avg_revenue:         v.revenue.length ? Math.round(totalRevenue / v.revenue.length) : 0,
    };
  }).sort((a, b) => b.total - a.total);
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE VS GOAL
// ─────────────────────────────────────────────────────────────────────────────

export async function getRevenueVsGoal(
  doctorId: string,
  monthlyGoal: number,
  months = 6
): Promise<RevenueVsGoal[]> {
  const from = subMonths(new Date(), months).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("fecha_hora, price, status")
    .eq("medico_id", doctorId)
    .gte("fecha_hora", from)
    .in("status", ["completada", "confirmada"]);

  if (!data) return [];

  const byMonth: Record<string, number> = {};
  for (const r of data) {
    const key = format(new Date(r.fecha_hora), "yyyy-MM");
    byMonth[key] = (byMonth[key] ?? 0) + (r.price ?? 0);
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, actual]) => ({
      month,
      actual: Math.round(actual),
      goal:   monthlyGoal,
      pct:    monthlyGoal > 0 ? Math.round((actual / monthlyGoal) * 100) : 0,
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// WAITLIST CONVERSION
// ─────────────────────────────────────────────────────────────────────────────

export async function getWaitlistConversion(doctorId: string, months = 6): Promise<WaitlistConversionEntry[]> {
  const { data } = await supabase
    .from("waitlist_conversion_stats")
    .select("*")
    .eq("doctor_id", doctorId)
    .gte("month", subMonths(new Date(), months).toISOString());

  if (!data) return [];

  return (data as Array<{ month: string; total_entries: number; confirmed: number; conversion_rate_pct: number }>).map((r) => ({
    month:               format(new Date(r.month), "yyyy-MM"),
    total:               r.total_entries,
    confirmed:           r.confirmed,
    conversion_rate_pct: r.conversion_rate_pct ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// DURATION DRILL-DOWN (per procedure)
// ─────────────────────────────────────────────────────────────────────────────

export async function getDurationDrillDown(
  doctorId: string,
  months = 3
): Promise<Array<{ tipo_cita: string; procedure_name: string; avg_scheduled: number; avg_actual: number | null; count: number; overrun_pct: number }>> {
  const from = subMonths(new Date(), months).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("tipo_cita, duracion_minutos, actual_duration_minutes")
    .eq("medico_id", doctorId)
    .gte("fecha_hora", from)
    .not("actual_duration_minutes", "is", null);

  if (!data) return [];

  const byType: Record<string, { scheduled: number[]; actual: number[] }> = {};
  for (const r of data) {
    const key = r.tipo_cita ?? "presencial";
    if (!byType[key]) byType[key] = { scheduled: [], actual: [] };
    byType[key].scheduled.push(r.duracion_minutos ?? 30);
    if (r.actual_duration_minutes != null) byType[key].actual.push(r.actual_duration_minutes);
  }

  return Object.entries(byType).map(([tipo, v]) => {
    const avgSch = Math.round(v.scheduled.reduce((s, x) => s + x, 0) / v.scheduled.length);
    const avgAct = v.actual.length ? Math.round(v.actual.reduce((s, x) => s + x, 0) / v.actual.length) : null;
    return {
      tipo_cita:      tipo,
      procedure_name: tipo,
      avg_scheduled:  avgSch,
      avg_actual:     avgAct,
      count:          v.scheduled.length,
      overrun_pct:    avgAct != null ? Math.round(((avgAct - avgSch) / avgSch) * 100) : 0,
    };
  }).sort((a, b) => (b.avg_actual ?? 0) - (a.avg_actual ?? 0));
}
