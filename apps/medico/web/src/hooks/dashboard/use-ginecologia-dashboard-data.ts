// ============================================
// GYNECOLOGY DASHBOARD DATA HOOK
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
}

export interface RecentControl {
  id: string;
  controlType: string;
  patientName: string;
  controlDate: string;
  papResult: string | null;
  hpvTest: string | null;
  nextControlDate: string | null;
}

export interface ActivePregnancy {
  id: string;
  patientName: string;
  gestationalWeeks: number | null;
  riskLevel: string | null;
  nextControlDate: string | null;
  lastControlDate: string;
  fetalHeartRate: number | null;
}

export interface GynecologyCriticalAlert {
  id: string;
  patientName: string;
  condition: string;
  priority: "high" | "medium" | "low";
  timeSince: string;
}

export interface GinecologiaDashboardReturn extends SpecialtyDashboardData {
  patientStatus: PatientStatus;
  recentControls: RecentControl[];
  activePregnancies: ActivePregnancy[];
  criticalAlerts: GynecologyCriticalAlert[];
  highRiskPregnancies: number;
  pendingPapResults: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTROL_LABELS: Record<string, string> = {
  rutinario: "Control Rutinario",
  papanicolaou: "Papanicolaou",
  colposcopia: "Colposcopía",
  "ecografia-pelvica": "Ecografía Pélvica",
  "ecografia-mamaria": "Ecografía Mamaria",
  mamografia: "Mamografía",
  densitometria: "Densitometría",
  "planificacion-familiar": "Planificación Familiar",
  menopausia: "Menopausia",
  otro: "Otro",
};

const OBSTETRIC_LABELS: Record<string, string> = {
  prenatal: "Control Prenatal",
  "ecografia-obstetrica": "Ecografía Obstétrica",
  "ecografia-genetica": "Ecografía Genética",
  "monitorizacion-fetal": "Monitorización Fetal",
  parto: "Parto",
  puerperio: "Puerperio",
  cesarea: "Cesárea",
  otro: "Otro",
};

// ============================================================================
// HOOK
// ============================================================================

export function useGinecologiaDashboardData(
  doctorId?: string
): GinecologiaDashboardReturn {
  const config = useMemo(() => getGeneratedConfig("ginecologia"), []);
  const dashboard = useSpecialtyDashboard(doctorId, config);

  const [patientStatus, setPatientStatus] = useState<PatientStatus>({
    active: 0, activeTrend: 0, followUp: 0, highPriority: 0, newThisMonth: 0,
  });
  const [recentControls, setRecentControls] = useState<RecentControl[]>([]);
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<GynecologyCriticalAlert[]>([]);
  const [highRiskPregnancies, setHighRiskPregnancies] = useState(0);
  const [pendingPapResults, setPendingPapResults] = useState(0);
  const [gyneLoading, setGyneLoading] = useState(true);
  const [gyneError, setGyneError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchGynecologyData = useCallback(async () => {
    if (!doctorId) return;
    setGyneLoading(true);

    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [
        recentControlsResult,
        pendingPapResult,
        activePregnanciesResult,
        highRiskResult,
        patientsThisMonth,
        patientsLastMonth,
        followUpResult,
      ] = await Promise.all([
        // 1. Recent gynecology controls (last 7 days)
        supabase
          .from("gynecology_controls")
          .select("id, control_type, control_date, pap_result, hpv_test, next_control_date")
          .eq("doctor_id", doctorId)
          .gte("control_date", weekAgo)
          .order("control_date", { ascending: false })
          .limit(10),

        // 2. Pending PAP results
        supabase
          .from("gynecology_controls")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .eq("pap_result", "pendiente")
          .gte("control_date", monthStart),

        // 3. Active pregnancies (recent obstetric controls with gestational weeks)
        supabase
          .from("gynecology_obstetric")
          .select("id, pregnancy_id, control_date, gestational_weeks, risk_level, next_control_date, fetal_heart_rate")
          .eq("doctor_id", doctorId)
          .not("gestational_weeks", "is", null)
          .order("control_date", { ascending: false })
          .limit(20),

        // 4. High-risk pregnancies count
        supabase
          .from("gynecology_obstetric")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .eq("risk_level", "alto")
          .not("gestational_weeks", "is", null),

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

      // ── Process recent controls ──
      if (recentControlsResult.data) {
        setRecentControls(
          recentControlsResult.data.map((c) => ({
            id: c.id,
            controlType: CONTROL_LABELS[c.control_type] || formatLabel(c.control_type),
            patientName: "Paciente",
            controlDate: formatScheduledDate(c.control_date),
            papResult: c.pap_result,
            hpvTest: c.hpv_test,
            nextControlDate: c.next_control_date,
          }))
        );
      }

      // ── Process active pregnancies (deduplicate by pregnancy_id, keep latest) ──
      if (activePregnanciesResult.data) {
        const pregnancyMap = new Map<string, typeof activePregnanciesResult.data[0]>();
        for (const record of activePregnanciesResult.data) {
          const key = record.pregnancy_id || record.id;
          if (!pregnancyMap.has(key)) {
            pregnancyMap.set(key, record);
          }
        }
        setActivePregnancies(
          Array.from(pregnancyMap.values()).map((p) => ({
            id: p.id,
            patientName: "Paciente",
            gestationalWeeks: p.gestational_weeks,
            riskLevel: p.risk_level,
            nextControlDate: p.next_control_date,
            lastControlDate: formatScheduledDate(p.control_date),
            fetalHeartRate: p.fetal_heart_rate,
          }))
        );
      }

      setHighRiskPregnancies(highRiskResult.count ?? 0);
      setPendingPapResults(pendingPapResult.count ?? 0);

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
        highPriority: (highRiskResult.count ?? 0) + (pendingPapResult.count ?? 0),
        newThisMonth: thisMonthCount,
      });

      // ── Critical alerts — high-risk pregnancies & positive HPV ──
      const urgentAlerts: GynecologyCriticalAlert[] = [];

      // High-risk pregnancies
      if (activePregnanciesResult.data) {
        activePregnanciesResult.data
          .filter((p) => p.risk_level === "alto")
          .forEach((p) => {
            urgentAlerts.push({
              id: `alert-preg-${p.id}`,
              patientName: "Paciente",
              condition: `Embarazo alto riesgo — ${p.gestational_weeks ?? "?"} semanas`,
              priority: "high",
              timeSince: getTimeSince(p.control_date),
            });
          });
      }

      // Positive HPV results
      if (recentControlsResult.data) {
        recentControlsResult.data
          .filter((c) => c.hpv_test === "positivo-alto-riesgo")
          .forEach((c) => {
            urgentAlerts.push({
              id: `alert-hpv-${c.id}`,
              patientName: "Paciente",
              condition: "VPH alto riesgo — requiere seguimiento",
              priority: "high",
              timeSince: getTimeSince(c.control_date),
            });
          });
      }

      setCriticalAlerts(urgentAlerts);
      setGyneError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      if (isMissingRelationError(err)) {
        setGyneError(null);
      } else {
        setGyneError(
          err instanceof Error ? err.message : "Error cargando datos de ginecología"
        );
      }
    } finally {
      if (mountedRef.current) setGyneLoading(false);
    }
  }, [doctorId, dashboard.todayAppointments.pending]);

  // ---- Lifecycle ----
  useEffect(() => { fetchGynecologyData(); }, [fetchGynecologyData]);

  useEffect(() => {
    if (!doctorId) return;
    const interval = setInterval(fetchGynecologyData, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchGynecologyData, doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`gynecology-dashboard-${doctorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "gynecology_controls", filter: `doctor_id=eq.${doctorId}` }, () => fetchGynecologyData())
      .on("postgres_changes", { event: "*", schema: "public", table: "gynecology_obstetric", filter: `doctor_id=eq.${doctorId}` }, () => fetchGynecologyData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctorId, fetchGynecologyData]);

  const refresh = useCallback(() => {
    dashboard.refresh();
    fetchGynecologyData();
  }, [dashboard, fetchGynecologyData]);

  return {
    ...dashboard,
    isLoading: dashboard.isLoading || gyneLoading,
    error: combineErrors(dashboard.error, gyneError),
    refresh,
    patientStatus,
    recentControls,
    activePregnancies,
    criticalAlerts,
    highRiskPregnancies,
    pendingPapResults,
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

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d`;
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
