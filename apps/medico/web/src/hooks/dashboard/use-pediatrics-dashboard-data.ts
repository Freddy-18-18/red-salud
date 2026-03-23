// ============================================
// PEDIATRICS DASHBOARD DATA HOOK
// Real Supabase queries + Specialty KPI system integration
// ============================================

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  useSpecialtyDashboard,
  type SpecialtyDashboardData,
} from "./use-specialty-dashboard";
import { getGeneratedConfig } from "@/lib/specialties";

// ============================================================================
// TYPES
// ============================================================================

export interface PatientStatus {
  active: number;
  activeTrend: number;
  followUp: number;
  highPriority: number;
  newThisMonth: number;
  nutritionAlerts: number;
}

export interface GrowthAlert {
  id: string;
  patientName: string;
  ageMonths: number;
  nutritionalStatus: string | null;
  weightPercentile: number | null;
  heightPercentile: number | null;
  severity: "high" | "medium" | "low";
  measurementDate: string;
}

export interface UpcomingVaccine {
  id: string;
  patientName: string;
  vaccineName: string;
  vaccineType: string;
  doseNumber: number;
  nextDoseDate: string | null;
}

export interface RecentGrowthRecord {
  id: string;
  patientName: string;
  ageMonths: number;
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  nutritionalStatus: string | null;
  measurementDate: string;
}

export interface PediatricsDashboardReturn extends SpecialtyDashboardData {
  patientStatus: PatientStatus;
  growthAlerts: GrowthAlert[];
  upcomingVaccines: UpcomingVaccine[];
  recentGrowthRecords: RecentGrowthRecord[];
  pendingVaccines: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NUTRITIONAL_SEVERITY: Record<string, "high" | "medium" | "low"> = {
  "desnutricion-severa": "high",
  desnutricion: "high",
  "bajo-peso": "medium",
  normal: "low",
  sobrepeso: "medium",
  obesidad: "high",
};

const NUTRITIONAL_LABELS: Record<string, string> = {
  "desnutricion-severa": "Desnutrición Severa",
  desnutricion: "Desnutrición",
  "bajo-peso": "Bajo Peso",
  normal: "Normal",
  sobrepeso: "Sobrepeso",
  obesidad: "Obesidad",
};

const VACCINE_LABELS: Record<string, string> = {
  bcg: "BCG",
  "hepatitis-b": "Hepatitis B",
  pentavalente: "Pentavalente",
  rotavirus: "Rotavirus",
  neumococo: "Neumococo",
  influenza: "Influenza",
  srp: "SRP (Triple Viral)",
  varicela: "Varicela",
  "hepatitis-a": "Hepatitis A",
  vph: "VPH",
  meningococo: "Meningococo",
  "fiebre-amarilla": "Fiebre Amarilla",
  "covid-19": "COVID-19",
  "polio-ipv": "Polio (IPV)",
  "polio-opv": "Polio (OPV)",
  dpt: "DPT",
  td: "Td",
  otro: "Otro",
};

// ============================================================================
// HOOK
// ============================================================================

export function usePediatricsDashboardData(
  doctorId?: string
): PediatricsDashboardReturn {
  const config = useMemo(() => getGeneratedConfig("pediatria"), []);
  const dashboard = useSpecialtyDashboard(doctorId, config);

  const [patientStatus, setPatientStatus] = useState<PatientStatus>({
    active: 0, activeTrend: 0, followUp: 0, highPriority: 0, newThisMonth: 0, nutritionAlerts: 0,
  });
  const [growthAlerts, setGrowthAlerts] = useState<GrowthAlert[]>([]);
  const [upcomingVaccines, setUpcomingVaccines] = useState<UpcomingVaccine[]>([]);
  const [recentGrowthRecords, setRecentGrowthRecords] = useState<RecentGrowthRecord[]>([]);
  const [pendingVaccines, setPendingVaccines] = useState(0);
  const [pedLoading, setPedLoading] = useState(true);
  const [pedError, setPedError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchPediatricsData = useCallback(async () => {
    if (!doctorId) return;
    setPedLoading(true);

    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const weekFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const [
        recentGrowthResult,
        nutritionAlertsResult,
        pendingVaccinesResult,
        upcomingVaccinesResult,
        patientsThisMonth,
        patientsLastMonth,
        followUpResult,
      ] = await Promise.all([
        // 1. Recent growth records (last 7 days)
        supabase
          .from("pediatrics_growth")
          .select("id, measurement_date, age_months, weight_kg, height_cm, bmi, nutritional_status, weight_percentile, height_percentile")
          .eq("doctor_id", doctorId)
          .gte("measurement_date", weekAgo)
          .order("measurement_date", { ascending: false })
          .limit(10),

        // 2. Nutrition alerts (non-normal nutritional status this month)
        supabase
          .from("pediatrics_growth")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .gte("measurement_date", monthStart)
          .not("nutritional_status", "eq", "normal")
          .not("nutritional_status", "is", null),

        // 3. Pending vaccines (where next_dose_date is in the past or today)
        supabase
          .from("pediatrics_vaccines")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .not("next_dose_date", "is", null)
          .lte("next_dose_date", todayStr),

        // 4. Upcoming vaccines (next 2 weeks)
        supabase
          .from("pediatrics_vaccines")
          .select("id, vaccine_name, vaccine_type, dose_number, next_dose_date")
          .eq("doctor_id", doctorId)
          .not("next_dose_date", "is", null)
          .gte("next_dose_date", todayStr)
          .lte("next_dose_date", weekFromNow)
          .order("next_dose_date", { ascending: true })
          .limit(10),

        // 5. Patients this month
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 6. Patients last month
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", lastMonthStart)
          .lt("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 7. Follow-ups today
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .eq("tipo", "seguimiento")
          .gte("fecha_hora", `${todayStr}T00:00:00`),
      ]);

      if (!mountedRef.current) return;

      // ── Process recent growth records ──
      if (recentGrowthResult.data) {
        setRecentGrowthRecords(
          recentGrowthResult.data.map((r) => ({
            id: r.id,
            patientName: "Paciente",
            ageMonths: r.age_months ?? 0,
            weightKg: r.weight_kg,
            heightCm: r.height_cm,
            bmi: r.bmi,
            nutritionalStatus: r.nutritional_status
              ? NUTRITIONAL_LABELS[r.nutritional_status] || r.nutritional_status
              : null,
            measurementDate: formatScheduledDate(r.measurement_date),
          }))
        );

        // ── Growth alerts (abnormal nutritional status or low percentiles) ──
        const alerts: GrowthAlert[] = recentGrowthResult.data
          .filter((r) =>
            (r.nutritional_status && r.nutritional_status !== "normal") ||
            (r.weight_percentile !== null && r.weight_percentile < 5) ||
            (r.height_percentile !== null && r.height_percentile < 5)
          )
          .map((r) => {
            let alertText = "";
            if (r.nutritional_status && r.nutritional_status !== "normal") {
              alertText = NUTRITIONAL_LABELS[r.nutritional_status] || r.nutritional_status;
            }
            if (r.weight_percentile !== null && r.weight_percentile < 5) {
              alertText += alertText ? " | " : "";
              alertText += `Peso P${r.weight_percentile}`;
            }
            if (r.height_percentile !== null && r.height_percentile < 5) {
              alertText += alertText ? " | " : "";
              alertText += `Talla P${r.height_percentile}`;
            }

            return {
              id: r.id,
              patientName: "Paciente",
              ageMonths: r.age_months ?? 0,
              nutritionalStatus: r.nutritional_status,
              weightPercentile: r.weight_percentile,
              heightPercentile: r.height_percentile,
              severity: NUTRITIONAL_SEVERITY[r.nutritional_status ?? ""] ?? "medium",
              measurementDate: formatScheduledDate(r.measurement_date),
            };
          });
        setGrowthAlerts(alerts);
      }

      // ── Process upcoming vaccines ──
      if (upcomingVaccinesResult.data) {
        setUpcomingVaccines(
          upcomingVaccinesResult.data.map((v) => ({
            id: v.id,
            patientName: "Paciente",
            vaccineName: v.vaccine_name,
            vaccineType: VACCINE_LABELS[v.vaccine_type] || formatLabel(v.vaccine_type),
            doseNumber: v.dose_number,
            nextDoseDate: v.next_dose_date,
          }))
        );
      }

      setPendingVaccines(pendingVaccinesResult.count ?? 0);

      // ── Compute patient status ──
      const thisMonthCount = patientsThisMonth.count ?? 0;
      const lastMonthCount = patientsLastMonth.count ?? 0;
      const trend = lastMonthCount > 0
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : 0;

      setPatientStatus({
        active: thisMonthCount,
        activeTrend: trend,
        followUp: followUpResult.count ?? 0,
        highPriority: (pendingVaccinesResult.count ?? 0) + (nutritionAlertsResult.count ?? 0),
        newThisMonth: thisMonthCount,
        nutritionAlerts: nutritionAlertsResult.count ?? 0,
      });

      setPedError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      if (isMissingRelationError(err)) {
        setPedError(null);
      } else {
        setPedError(
          err instanceof Error ? err.message : "Error cargando datos de pediatría"
        );
      }
    } finally {
      if (mountedRef.current) setPedLoading(false);
    }
  }, [doctorId, dashboard.todayAppointments.pending]);

  // ---- Lifecycle ----
  useEffect(() => { fetchPediatricsData(); }, [fetchPediatricsData]);

  useEffect(() => {
    if (!doctorId) return;
    const interval = setInterval(fetchPediatricsData, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchPediatricsData, doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`pediatrics-dashboard-${doctorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pediatrics_growth", filter: `doctor_id=eq.${doctorId}` }, () => fetchPediatricsData())
      .on("postgres_changes", { event: "*", schema: "public", table: "pediatrics_vaccines", filter: `doctor_id=eq.${doctorId}` }, () => fetchPediatricsData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctorId, fetchPediatricsData]);

  const refresh = useCallback(() => {
    dashboard.refresh();
    fetchPediatricsData();
  }, [dashboard, fetchPediatricsData]);

  return {
    ...dashboard,
    isLoading: dashboard.isLoading || pedLoading,
    error: combineErrors(dashboard.error, pedError),
    refresh,
    patientStatus,
    growthAlerts,
    upcomingVaccines,
    recentGrowthRecords,
    pendingVaccines,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function formatLabel(value: string): string {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatScheduledDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const time = date.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Hoy, ${time}`;
  if (isTomorrow) return `Mañana, ${time}`;
  return date.toLocaleDateString("es-VE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function combineErrors(...errors: (string | null)[]): string | null {
  const nonNull = errors.filter(Boolean) as string[];
  return nonNull.length > 0 ? nonNull.join("; ") : null;
}

function isMissingRelationError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === "42P01" || e.code === "PGRST205" ||
    e.message?.includes("relation") === true ||
    e.message?.includes("does not exist") === true
  );
}
