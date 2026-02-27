/**
 * @file specialty-kpi-resolver.ts
 * @description Servicio que resuelve KPIs genéricos contra datos reales de Supabase.
 *
 * Cada especialidad define KPI keys abstractos (ej. 'pacientes-atendidos',
 * 'satisfaccion', 'tasa-exito'). Este resolver los mapea a queries concretas
 * contra las tablas y materialized views existentes.
 *
 * Estrategia:
 * - KPIs universales (pacientes, satisfacción, no-show, etc.) se resuelven
 *   vía las vistas materializadas `mv_doctor_*`
 * - KPIs especializados sin tabla real devuelven null (para implementación futura)
 * - Graceful degradation: si una vista no existe, retorna undefined sin error
 *
 * @module Data/Specialties
 */

import { supabase } from "@/lib/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

interface KpiResolverContext {
  doctorId: string;
  dateRange: DateRange;
}

interface DateRange {
  start: Date;
  end: Date;
}

export interface KpiResolutionResult {
  /** Resolved values for each KPI key */
  values: Record<string, number>;
  /** Keys that couldn't be resolved (no mapping or no data) */
  unresolved: string[];
  /** Errors encountered during resolution */
  errors: string[];
}

// ============================================================================
// KPI RESOLVER GROUPS
// ============================================================================

/**
 * Groups KPI keys by the data source they need, so we can batch queries.
 *
 * Each group maps to a single Supabase query/view.
 */
type KpiGroup =
  | "efficiency"     // mv_doctor_efficiency_agg
  | "patients"       // mv_doctor_patients_agg
  | "revenue"        // mv_doctor_revenue_agg
  | "lab"            // mv_doctor_lab_agg
  | "appointments"   // Direct appointments query
  | "ratings"        // Direct ratings query
  | "unresolvable";  // No data source yet

/**
 * Maps each KPI key to its data source group and extraction function.
 */
interface KpiMapping {
  group: KpiGroup;
  /** Extracts the value from the group's raw data */
  extract: (data: Record<string, unknown>) => number | undefined;
}

// ============================================================================
// KPI KEY → GROUP MAPPING
// ============================================================================

/**
 * Universal KPI mappings.
 * These work for all specialties because they use shared data sources.
 */
const UNIVERSAL_KPI_MAP: Record<string, KpiMapping> = {
  // ==================== EFFICIENCY-based KPIs ====================
  "pacientes-atendidos": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments),
  },
  "tasa-no-show": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.total_appointments);
      const noShow = asNum(d.no_show_appointments);
      return total > 0 ? (noShow / total) * 100 : 0;
    },
  },
  "inasistencia": {
    group: "efficiency",
    extract: (d) => asNum(d.no_show_appointments),
  },
  "tasa-cancelacion": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.total_appointments);
      const cancelled = asNum(d.cancelled_appointments);
      return total > 0 ? (cancelled / total) * 100 : 0;
    },
  },
  "tiempo-consulta": {
    group: "efficiency",
    extract: (d) => asNum(d.avg_duration),
  },
  "consultas-dia": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.completed_appointments);
      // Approximate: assume ~22 working days in the period
      return Math.round(total / 22);
    },
  },
  "citas-completadas": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments),
  },
  "ocupacion": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.total_appointments);
      const completed = asNum(d.completed_appointments);
      return total > 0 ? (completed / total) * 100 : 0;
    },
  },

  // ==================== PATIENT-based KPIs ====================
  "pacientes-nuevos": {
    group: "patients",
    extract: (d) => asNum(d.new_patients_month),
  },
  "pacientes-recurrentes": {
    group: "patients",
    extract: (d) =>
      asNum(d.unique_patients) - asNum(d.new_patients_month),
  },
  "retencion-30d": {
    group: "patients",
    extract: (d) => {
      const total = asNum(d.unique_patients);
      const active30 = asNum(d.active_patients_30d);
      return total > 0 ? (active30 / total) * 100 : 0;
    },
  },
  "pacientes-activos": {
    group: "patients",
    extract: (d) => asNum(d.active_patients_30d),
  },
  "pacientes-inactivos": {
    group: "patients",
    extract: (d) => asNum(d.inactive_patients),
  },

  // ==================== REVENUE-based KPIs ====================
  "ingresos": {
    group: "revenue",
    extract: (d) => asNum(d.gross_revenue),
  },
  "produccion": {
    group: "revenue",
    extract: (d) => asNum(d.gross_revenue),
  },
  "ticket-promedio": {
    group: "revenue",
    extract: (d) => {
      const rev = asNum(d.gross_revenue);
      const consults = asNum(d.consultations);
      return consults > 0 ? rev / consults : 0;
    },
  },
  "revenue": {
    group: "revenue",
    extract: (d) => asNum(d.gross_revenue),
  },

  // ==================== LAB-based KPIs ====================
  "examenes-laboratorio": {
    group: "lab",
    extract: (d) => asNum(d.total_orders),
  },
  "resultados-anormales": {
    group: "lab",
    extract: (d) => asNum(d.abnormal_results),
  },
  "tasa-anormalidad": {
    group: "lab",
    extract: (d) => {
      const total = asNum(d.total_orders);
      const abnormal = asNum(d.abnormal_results);
      return total > 0 ? (abnormal / total) * 100 : 0;
    },
  },
  "tiempo-resultado-lab": {
    group: "lab",
    extract: (d) => asNum(d.avg_days_to_result),
  },

  // ==================== RATINGS-based KPIs ====================
  "satisfaccion": {
    group: "ratings",
    extract: (d) => asNum(d.avg_rating),
  },
  "calificacion-promedio": {
    group: "ratings",
    extract: (d) => asNum(d.avg_rating),
  },

  // ==================== APPOINTMENTS-based KPIs ====================
  "citas-hoy": {
    group: "appointments",
    extract: (d) => asNum(d.today_count),
  },
  "citas-semana": {
    group: "appointments",
    extract: (d) => asNum(d.week_count),
  },
  "telemedicina": {
    group: "appointments",
    extract: (d) => asNum(d.telemedicina_count),
  },

  // ============================================================================
  // OVERRIDE KPI ALIASES — maps override-specific KPI keys to existing data
  // ============================================================================

  // ==================== Dental Override KPIs ====================
  "no_show_rate": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.total_appointments);
      const noShow = asNum(d.no_show_appointments);
      return total > 0 ? (noShow / total) * 100 : 0;
    },
  },
  "production_per_day": {
    group: "revenue",
    extract: (d) => {
      const rev = asNum(d.gross_revenue);
      // Approximate: ~22 working days in period
      return rev / 22;
    },
  },
  "new_patient_acquisition": {
    group: "patients",
    extract: (d) => asNum(d.new_patients_month),
  },
  "consultations_per_day": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.completed_appointments);
      return Math.round(total / 22);
    },
  },
  "avg_consultation_duration": {
    group: "efficiency",
    extract: (d) => asNum(d.avg_duration),
  },

  // ==================== Cardiology Override KPIs ====================
  "patient_throughput": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.completed_appointments);
      return Math.round(total / 22);
    },
  },
  "patient_satisfaction_score": {
    group: "ratings",
    extract: (d) => asNum(d.avg_rating) * 20, // 5-star → percentage
  },

  // ==================== Pediatrics Override KPIs ====================
  "follow_up_rate": {
    group: "patients",
    extract: (d) => {
      const total = asNum(d.unique_patients);
      const returning = total - asNum(d.new_patients_month);
      return total > 0 ? (returning / total) * 100 : 0;
    },
  },

  // ==================== Generic identity KPIs ====================
  "tasa-exito": {
    group: "efficiency",
    extract: (d) => {
      const total = asNum(d.total_appointments);
      const completed = asNum(d.completed_appointments);
      return total > 0 ? (completed / total) * 100 : 0;
    },
  },
  "complicaciones": {
    group: "efficiency",
    extract: (d) => asNum(d.cancelled_appointments), // proxy
  },
  "procedimientos-realizados": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments),
  },
  "cirugias-realizadas": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments),
  },
  "tratamientos-completados": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments),
  },
  "control-nino-sano": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments), // proxy
  },
  "vacunaciones": {
    group: "efficiency",
    extract: (d) => asNum(d.completed_appointments), // proxy
  },
};

/**
 * KPI keys that are specialty-specific and don't have
 * a universal data source yet. They will be resolved
 * when specialty-specific tables/views are created.
 *
 * Returns them as unresolvable with value undefined.
 */
function isUnresolvable(key: string): boolean {
  // If it's in the universal map, it IS resolvable
  if (UNIVERSAL_KPI_MAP[key]) return false;

  // Everything else is currently unresolvable
  return true;
}

// ============================================================================
// QUERY EXECUTORS (one per group)
// ============================================================================

async function queryEfficiency(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    const { data } = await supabase
      .from("mv_doctor_efficiency_agg")
      .select("*")
      .eq("doctor_id", ctx.doctorId)
      .gte("month", ctx.dateRange.start.toISOString())
      .lte("month", ctx.dateRange.end.toISOString());

    if (!data || data.length === 0) return {};

    // Aggregate across months
    return {
      total_appointments: sumField(data, "total_appointments"),
      completed_appointments: sumField(data, "completed_appointments"),
      cancelled_appointments: sumField(data, "cancelled_appointments"),
      no_show_appointments: sumField(data, "no_show_appointments"),
      avg_duration: avgField(data, "avg_duration"),
    };
  } catch {
    return {};
  }
}

async function queryPatients(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    const { data } = await supabase
      .from("mv_doctor_patients_agg")
      .select("*")
      .eq("doctor_id", ctx.doctorId)
      .gte("month", ctx.dateRange.start.toISOString())
      .lte("month", ctx.dateRange.end.toISOString())
      .order("month", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return {};
    return data[0] as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function queryRevenue(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    const { data } = await supabase
      .from("mv_doctor_revenue_agg")
      .select("*")
      .eq("doctor_id", ctx.doctorId)
      .eq("status", "completed")
      .gte("month", ctx.dateRange.start.toISOString())
      .lte("month", ctx.dateRange.end.toISOString());

    if (!data || data.length === 0) return {};

    return {
      gross_revenue: sumField(data, "gross_revenue"),
      consultations: sumField(data, "consultations"),
    };
  } catch {
    return {};
  }
}

async function queryLab(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    const { data } = await supabase
      .from("mv_doctor_lab_agg")
      .select("*")
      .eq("doctor_id", ctx.doctorId)
      .gte("month", ctx.dateRange.start.toISOString())
      .lte("month", ctx.dateRange.end.toISOString());

    if (!data || data.length === 0) return {};

    return {
      total_orders: sumField(data, "total_orders"),
      abnormal_results: sumField(data, "abnormal_results"),
      avg_days_to_result: avgField(data, "avg_days_to_result"),
    };
  } catch {
    return {};
  }
}

async function queryRatings(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    // Use mv_doctor_ratings_agg (aggregated from doctor_reviews table)
    const { data } = await supabase
      .from("mv_doctor_ratings_agg")
      .select("*")
      .eq("doctor_id", ctx.doctorId)
      .gte("month", ctx.dateRange.start.toISOString())
      .lte("month", ctx.dateRange.end.toISOString());

    if (!data || data.length === 0) {
      // Fallback: try direct query to doctor_reviews
      const { data: reviews } = await supabase
        .from("doctor_reviews")
        .select("rating")
        .eq("doctor_id", ctx.doctorId)
        .gte("created_at", ctx.dateRange.start.toISOString())
        .lte("created_at", ctx.dateRange.end.toISOString());

      if (!reviews || reviews.length === 0) return { avg_rating: 0 };
      const sum = reviews.reduce(
        (acc, r) => acc + (typeof r.rating === "number" ? r.rating : 0),
        0
      );
      return { avg_rating: reviews.length > 0 ? sum / reviews.length : 0 };
    }

    // Weighted average across months
    const totalReviews = sumField(data, "total_reviews");
    if (totalReviews === 0) return { avg_rating: 0 };

    const weightedSum = data.reduce(
      (acc, row) =>
        acc + asNum(row.avg_rating) * asNum(row.total_reviews),
      0
    );
    return {
      avg_rating: weightedSum / totalReviews,
      total_reviews: totalReviews,
      avg_punctuality: avgField(data, "avg_punctuality"),
      avg_communication: avgField(data, "avg_communication"),
      avg_professionalism: avgField(data, "avg_professionalism"),
    };
  } catch {
    return { avg_rating: 0 };
  }
}

async function queryAppointments(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    // Use RPC to get all 3 counts in a single database call
    const { data, error } = await supabase.rpc(
      "get_doctor_appointment_counts",
      {
        p_doctor_id: ctx.doctorId,
        p_range_start: ctx.dateRange.start.toISOString(),
        p_range_end: ctx.dateRange.end.toISOString(),
      }
    );

    if (error || !data) {
      // Fallback to individual queries if RPC not available
      return await queryAppointmentsFallback(ctx);
    }

    return {
      today_count: data.today_count ?? 0,
      week_count: data.week_count ?? 0,
      telemedicina_count: data.telemedicina_count ?? 0,
    };
  } catch {
    return { today_count: 0, week_count: 0, telemedicina_count: 0 };
  }
}

/** Fallback: individual count queries if RPC is not deployed yet */
async function queryAppointmentsFallback(
  ctx: KpiResolverContext
): Promise<Record<string, unknown>> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = getWeekStart(new Date()).toISOString().slice(0, 10);

    const [todayRes, weekRes, teleRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("medico_id", ctx.doctorId)
        .gte("fecha_hora", `${today}T00:00:00`)
        .lte("fecha_hora", `${today}T23:59:59`),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("medico_id", ctx.doctorId)
        .gte("fecha_hora", `${weekStart}T00:00:00`),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("medico_id", ctx.doctorId)
        .eq("tipo", "telemedicina")
        .gte("fecha_hora", ctx.dateRange.start.toISOString())
        .lte("fecha_hora", ctx.dateRange.end.toISOString()),
    ]);

    return {
      today_count: todayRes.count ?? 0,
      week_count: weekRes.count ?? 0,
      telemedicina_count: teleRes.count ?? 0,
    };
  } catch {
    return { today_count: 0, week_count: 0, telemedicina_count: 0 };
  }
}

// ============================================================================
// GROUP EXECUTOR MAP
// ============================================================================

const GROUP_EXECUTORS: Record<
  Exclude<KpiGroup, "unresolvable">,
  (ctx: KpiResolverContext) => Promise<Record<string, unknown>>
> = {
  efficiency: queryEfficiency,
  patients: queryPatients,
  revenue: queryRevenue,
  lab: queryLab,
  ratings: queryRatings,
  appointments: queryAppointments,
};

// ============================================================================
// MAIN RESOLVER
// ============================================================================

/**
 * Resolves a set of KPI keys to their numeric values.
 *
 * Strategy:
 * 1. Group requested KPI keys by data source
 * 2. Execute one query per group (parallel)
 * 3. Extract values from raw data using per-KPI extractors
 * 4. Return { values, unresolved, errors }
 *
 * @example
 * ```ts
 * const result = await resolveKpis({
 *   kpiKeys: ['pacientes-atendidos', 'satisfaccion', 'tasa-no-show'],
 *   doctorId: 'uuid',
 *   dateRange: { start: sixMonthsAgo, end: now },
 * });
 * // result.values → { 'pacientes-atendidos': 142, 'satisfaccion': 4.3, 'tasa-no-show': 8.5 }
 * ```
 */
export async function resolveKpis(params: {
  kpiKeys: string[];
  doctorId: string;
  dateRange?: DateRange;
}): Promise<KpiResolutionResult> {
  const { kpiKeys, doctorId, dateRange } = params;
  const result: KpiResolutionResult = {
    values: {},
    unresolved: [],
    errors: [],
  };

  // Default date range: last 6 months
  const range = dateRange ?? {
    start: new Date(Date.now() - 180 * 24 * 60 * 60_000),
    end: new Date(),
  };

  const ctx: KpiResolverContext = { doctorId, dateRange: range };

  // 1. Separate resolvable from unresolvable
  const resolvable: Array<{ key: string; mapping: KpiMapping }> = [];

  for (const key of kpiKeys) {
    const mapping = UNIVERSAL_KPI_MAP[key];
    if (mapping) {
      resolvable.push({ key, mapping });
    } else {
      result.unresolved.push(key);
    }
  }

  // 2. Determine which groups we need to query
  const neededGroups = new Set<Exclude<KpiGroup, "unresolvable">>();
  for (const { mapping } of resolvable) {
    if (mapping.group !== "unresolvable") {
      neededGroups.add(mapping.group as Exclude<KpiGroup, "unresolvable">);
    }
  }

  // 3. Execute queries in parallel
  const groupData: Record<string, Record<string, unknown>> = {};
  const queries = Array.from(neededGroups).map(async (group) => {
    try {
      groupData[group] = await GROUP_EXECUTORS[group](ctx);
    } catch (err) {
      result.errors.push(
        `Error querying ${group}: ${err instanceof Error ? err.message : String(err)}`
      );
      groupData[group] = {};
    }
  });

  await Promise.all(queries);

  // 4. Extract values
  for (const { key, mapping } of resolvable) {
    const data = groupData[mapping.group] ?? {};
    try {
      const value = mapping.extract(data);
      if (value !== undefined && !Number.isNaN(value)) {
        result.values[key] = Math.round(value * 100) / 100; // 2 decimal places
      } else {
        result.unresolved.push(key);
      }
    } catch {
      result.unresolved.push(key);
    }
  }

  return result;
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function asNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function sumField(rows: Record<string, unknown>[], field: string): number {
  return rows.reduce((sum, row) => sum + asNum(row[field]), 0);
}

function avgField(rows: Record<string, unknown>[], field: string): number {
  const valid = rows.filter((r) => r[field] !== null && r[field] !== undefined);
  if (valid.length === 0) return 0;
  return sumField(valid, field) / valid.length;
}

function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}
