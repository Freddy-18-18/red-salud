// ============================================
// TRAUMATOLOGY DASHBOARD DATA HOOK
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

export interface ActiveInjury {
  id: string;
  injuryType: string;
  anatomicalZone: string;
  laterality: string | null;
  severity: string | null;
  surgeryRequired: boolean;
  patientName: string;
  createdAt: string;
}

export interface RehabSession {
  id: string;
  rehabType: string;
  sessionNumber: number;
  totalSessions: number | null;
  painLevelPre: number | null;
  painLevelPost: number | null;
  patientName: string;
  sessionDate: string;
}

export interface TraumaCriticalAlert {
  id: string;
  patientName: string;
  condition: string;
  priority: "high" | "medium" | "low";
  timeSince: string;
}

export interface TraumatologiaDashboardReturn extends SpecialtyDashboardData {
  patientStatus: PatientStatus;
  activeInjuries: ActiveInjury[];
  recentRehabSessions: RehabSession[];
  criticalAlerts: TraumaCriticalAlert[];
  pendingSurgeries: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INJURY_LABELS: Record<string, string> = {
  fractura: "Fractura",
  luxacion: "Luxación",
  esguince: "Esguince",
  "desgarro-muscular": "Desgarro Muscular",
  tendinitis: "Tendinitis",
  bursitis: "Bursitis",
  "hernia-discal": "Hernia Discal",
  "lesion-meniscal": "Lesión Meniscal",
  "lesion-ligamentaria": "Lesión Ligamentaria",
  contusion: "Contusión",
  otro: "Otro",
};

const REHAB_LABELS: Record<string, string> = {
  fisioterapia: "Fisioterapia",
  ejercicios: "Ejercicios",
  hidroterapia: "Hidroterapia",
  electroterapia: "Electroterapia",
  ultrasonido: "Ultrasonido",
  crioterapia: "Crioterapia",
  termoterapia: "Termoterapia",
  masoterapia: "Masoterapia",
  otro: "Otro",
};

// ============================================================================
// HOOK
// ============================================================================

export function useTraumatologiaDashboardData(
  doctorId?: string
): TraumatologiaDashboardReturn {
  const config = useMemo(() => getGeneratedConfig("traumatologia"), []);
  const dashboard = useSpecialtyDashboard(doctorId, config);

  const [patientStatus, setPatientStatus] = useState<PatientStatus>({
    active: 0, activeTrend: 0, followUp: 0, highPriority: 0, newThisMonth: 0,
  });
  const [activeInjuries, setActiveInjuries] = useState<ActiveInjury[]>([]);
  const [recentRehabSessions, setRecentRehabSessions] = useState<RehabSession[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<TraumaCriticalAlert[]>([]);
  const [pendingSurgeries, setPendingSurgeries] = useState(0);
  const [traumaLoading, setTraumaLoading] = useState(true);
  const [traumaError, setTraumaError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchTraumatologyData = useCallback(async () => {
    if (!doctorId) return;
    setTraumaLoading(true);

    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [
        activeInjuriesResult,
        pendingSurgeriesResult,
        recentRehabResult,
        patientsThisMonth,
        patientsLastMonth,
        followUpResult,
      ] = await Promise.all([
        // 1. Active injuries (severity severo/critico or surgery required)
        supabase
          .from("traumatology_injuries")
          .select("id, injury_type, anatomical_zone, laterality, severity, surgery_required, created_at")
          .eq("doctor_id", doctorId)
          .order("created_at", { ascending: false })
          .limit(15),

        // 2. Pending surgeries count
        supabase
          .from("traumatology_injuries")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .eq("surgery_required", true)
          .is("surgery_date", null),

        // 3. Recent rehab sessions (last 7 days)
        supabase
          .from("traumatology_rehab")
          .select("id, rehab_type, session_date, session_number, total_sessions, pain_level_pre, pain_level_post")
          .eq("doctor_id", doctorId)
          .gte("session_date", weekAgo)
          .order("session_date", { ascending: false })
          .limit(10),

        // 4. Patients this month
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 5. Patients last month
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", lastMonthStart)
          .lt("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 6. Follow-ups today
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .eq("tipo", "seguimiento")
          .gte("fecha_hora", `${todayStr}T00:00:00`),
      ]);

      if (!mountedRef.current) return;

      // ── Process active injuries ──
      if (activeInjuriesResult.data) {
        setActiveInjuries(
          activeInjuriesResult.data.map((i) => ({
            id: i.id,
            injuryType: INJURY_LABELS[i.injury_type] || formatLabel(i.injury_type),
            anatomicalZone: i.anatomical_zone,
            laterality: i.laterality,
            severity: i.severity,
            surgeryRequired: i.surgery_required ?? false,
            patientName: "Paciente",
            createdAt: formatScheduledDate(i.created_at),
          }))
        );
      }

      // ── Process rehab sessions ──
      if (recentRehabResult.data) {
        setRecentRehabSessions(
          recentRehabResult.data.map((r) => ({
            id: r.id,
            rehabType: REHAB_LABELS[r.rehab_type] || formatLabel(r.rehab_type),
            sessionNumber: r.session_number ?? 0,
            totalSessions: r.total_sessions,
            painLevelPre: r.pain_level_pre,
            painLevelPost: r.pain_level_post,
            patientName: "Paciente",
            sessionDate: formatScheduledDate(r.session_date),
          }))
        );
      }

      setPendingSurgeries(pendingSurgeriesResult.count ?? 0);

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
        highPriority: pendingSurgeriesResult.count ?? 0,
        newThisMonth: thisMonthCount,
      });

      // ── Critical alerts — severe injuries needing surgery ──
      const urgentAlerts: TraumaCriticalAlert[] = [];
      if (activeInjuriesResult.data) {
        activeInjuriesResult.data
          .filter((i) => i.severity === "critico" || (i.severity === "severo" && i.surgery_required))
          .forEach((i) => {
            urgentAlerts.push({
              id: `alert-${i.id}`,
              patientName: "Paciente",
              condition: `${INJURY_LABELS[i.injury_type] || i.injury_type} — ${i.anatomical_zone}`,
              priority: i.severity === "critico" ? "high" : "medium",
              timeSince: getTimeSince(i.created_at),
            });
          });
      }
      setCriticalAlerts(urgentAlerts);
      setTraumaError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      if (isMissingRelationError(err)) {
        setTraumaError(null);
      } else {
        setTraumaError(
          err instanceof Error ? err.message : "Error cargando datos de traumatología"
        );
      }
    } finally {
      if (mountedRef.current) setTraumaLoading(false);
    }
  }, [doctorId, dashboard.todayAppointments.pending]);

  // ---- Lifecycle ----
  useEffect(() => { fetchTraumatologyData(); }, [fetchTraumatologyData]);

  useEffect(() => {
    if (!doctorId) return;
    const interval = setInterval(fetchTraumatologyData, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchTraumatologyData, doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`traumatology-dashboard-${doctorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "traumatology_injuries", filter: `doctor_id=eq.${doctorId}` }, () => fetchTraumatologyData())
      .on("postgres_changes", { event: "*", schema: "public", table: "traumatology_rehab", filter: `doctor_id=eq.${doctorId}` }, () => fetchTraumatologyData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctorId, fetchTraumatologyData]);

  const refresh = useCallback(() => {
    dashboard.refresh();
    fetchTraumatologyData();
  }, [dashboard, fetchTraumatologyData]);

  return {
    ...dashboard,
    isLoading: dashboard.isLoading || traumaLoading,
    error: combineErrors(dashboard.error, traumaError),
    refresh,
    patientStatus,
    activeInjuries,
    recentRehabSessions,
    criticalAlerts,
    pendingSurgeries,
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
