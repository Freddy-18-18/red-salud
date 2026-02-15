// ============================================
// OPHTHALMOLOGY DASHBOARD DATA HOOK
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

export interface RecentExam {
  id: string;
  examType: string;
  patientName: string;
  examDate: string;
  vaOdCc: string | null;
  vaOiCc: string | null;
  iopOd: number | null;
  iopOi: number | null;
}

export interface UpcomingProcedure {
  id: string;
  procedureType: string;
  eye: string;
  patientName: string;
  procedureDate: string;
  status: string;
}

export interface OphthalmologyCriticalAlert {
  id: string;
  patientName: string;
  condition: string;
  priority: "high" | "medium" | "low";
  timeSince: string;
}

export interface OftalmologiaDashboardReturn extends SpecialtyDashboardData {
  patientStatus: PatientStatus;
  recentExams: RecentExam[];
  upcomingProcedures: UpcomingProcedure[];
  criticalAlerts: OphthalmologyCriticalAlert[];
  highIopCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXAM_LABELS: Record<string, string> = {
  "agudeza-visual": "Agudeza Visual",
  refraccion: "Refracción",
  biomicroscopia: "Biomicroscopía",
  "fondo-ojo": "Fondo de Ojo",
  tonometria: "Tonometría",
  campimetria: "Campimetría",
  "topografia-corneal": "Topografía Corneal",
  paquimetria: "Paquimetría",
  oct: "OCT",
  "angiografia-fluoresceina": "Angiografía Fluoresceína",
  "ecografia-ocular": "Ecografía Ocular",
};

const PROCEDURE_LABELS: Record<string, string> = {
  lasik: "LASIK",
  prk: "PRK",
  facoemulsificacion: "Facoemulsificación",
  vitrectomia: "Vitrectomía",
  trabeculectomia: "Trabeculectomía",
  "iridotomia-laser": "Iridotomía Láser",
  fotocoagulacion: "Fotocoagulación",
  "inyeccion-intravitrea": "Inyección Intravítrea",
  crosslinking: "Crosslinking",
  pterigion: "Pterigión",
  chalazion: "Chalazión",
  "sondaje-lagrimal": "Sondaje Lagrimal",
  otro: "Otro",
};

/** IOP threshold for glaucoma alert (mmHg) */
const HIGH_IOP_THRESHOLD = 21;

// ============================================================================
// HOOK
// ============================================================================

export function useOftalmologiaDashboardData(
  doctorId?: string
): OftalmologiaDashboardReturn {
  const config = useMemo(() => getGeneratedConfig("oftalmologia"), []);
  const dashboard = useSpecialtyDashboard(doctorId, config);

  const [patientStatus, setPatientStatus] = useState<PatientStatus>({
    active: 0, activeTrend: 0, followUp: 0, highPriority: 0, newThisMonth: 0,
  });
  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [upcomingProcedures, setUpcomingProcedures] = useState<UpcomingProcedure[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<OphthalmologyCriticalAlert[]>([]);
  const [highIopCount, setHighIopCount] = useState(0);
  const [ophthoLoading, setOphthoLoading] = useState(true);
  const [ophthoError, setOphthoError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchOphthalmologyData = useCallback(async () => {
    if (!doctorId) return;
    setOphthoLoading(true);

    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [
        recentExamsResult,
        highIopResult,
        upcomingProcResult,
        patientsThisMonth,
        patientsLastMonth,
        followUpResult,
      ] = await Promise.all([
        // 1. Recent eye exams (last 7 days)
        supabase
          .from("ophthalmology_exams")
          .select("id, exam_type, exam_date, va_od_cc, va_oi_cc, iop_od, iop_oi")
          .eq("doctor_id", doctorId)
          .gte("exam_date", weekAgo)
          .order("exam_date", { ascending: false })
          .limit(10),

        // 2. High IOP count (glaucoma risk — IOP > 21)
        supabase
          .from("ophthalmology_exams")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .or(`iop_od.gt.${HIGH_IOP_THRESHOLD},iop_oi.gt.${HIGH_IOP_THRESHOLD}`)
          .gte("exam_date", monthStart),

        // 3. Upcoming procedures (next 7 days)
        supabase
          .from("ophthalmology_procedures")
          .select("id, procedure_type, eye, procedure_date, status")
          .eq("doctor_id", doctorId)
          .gte("procedure_date", now.toISOString())
          .lte("procedure_date", weekFromNow)
          .neq("status", "cancelled")
          .order("procedure_date", { ascending: true })
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

      // ── Process recent exams ──
      if (recentExamsResult.data) {
        setRecentExams(
          recentExamsResult.data.map((e) => ({
            id: e.id,
            examType: EXAM_LABELS[e.exam_type] || formatLabel(e.exam_type),
            patientName: "Paciente",
            examDate: formatScheduledDate(e.exam_date),
            vaOdCc: e.va_od_cc,
            vaOiCc: e.va_oi_cc,
            iopOd: e.iop_od,
            iopOi: e.iop_oi,
          }))
        );
      }

      // ── Process upcoming procedures ──
      if (upcomingProcResult.data) {
        setUpcomingProcedures(
          upcomingProcResult.data.map((p) => ({
            id: p.id,
            procedureType: PROCEDURE_LABELS[p.procedure_type] || formatLabel(p.procedure_type),
            eye: p.eye,
            patientName: "Paciente",
            procedureDate: formatScheduledDate(p.procedure_date),
            status: p.status,
          }))
        );
      }

      setHighIopCount(highIopResult.count ?? 0);

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
        highPriority: highIopResult.count ?? 0,
        newThisMonth: thisMonthCount,
      });

      // ── Critical alerts — high IOP cases ──
      const urgentAlerts: OphthalmologyCriticalAlert[] = [];
      if (recentExamsResult.data) {
        recentExamsResult.data
          .filter((e) =>
            (e.iop_od !== null && e.iop_od > HIGH_IOP_THRESHOLD) ||
            (e.iop_oi !== null && e.iop_oi > HIGH_IOP_THRESHOLD)
          )
          .forEach((e) => {
            const iopValues: string[] = [];
            if (e.iop_od !== null && e.iop_od > HIGH_IOP_THRESHOLD) iopValues.push(`OD: ${e.iop_od} mmHg`);
            if (e.iop_oi !== null && e.iop_oi > HIGH_IOP_THRESHOLD) iopValues.push(`OI: ${e.iop_oi} mmHg`);
            urgentAlerts.push({
              id: `alert-${e.id}`,
              patientName: "Paciente",
              condition: `PIO elevada — ${iopValues.join(", ")}`,
              priority: "high",
              timeSince: getTimeSince(e.exam_date),
            });
          });
      }
      setCriticalAlerts(urgentAlerts);
      setOphthoError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      if (isMissingRelationError(err)) {
        setOphthoError(null);
      } else {
        setOphthoError(
          err instanceof Error ? err.message : "Error cargando datos de oftalmología"
        );
      }
    } finally {
      if (mountedRef.current) setOphthoLoading(false);
    }
  }, [doctorId, dashboard.todayAppointments.pending]);

  // ---- Lifecycle ----
  useEffect(() => { fetchOphthalmologyData(); }, [fetchOphthalmologyData]);

  useEffect(() => {
    if (!doctorId) return;
    const interval = setInterval(fetchOphthalmologyData, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchOphthalmologyData, doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`ophthalmology-dashboard-${doctorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ophthalmology_exams", filter: `doctor_id=eq.${doctorId}` }, () => fetchOphthalmologyData())
      .on("postgres_changes", { event: "*", schema: "public", table: "ophthalmology_procedures", filter: `doctor_id=eq.${doctorId}` }, () => fetchOphthalmologyData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctorId, fetchOphthalmologyData]);

  const refresh = useCallback(() => {
    dashboard.refresh();
    fetchOphthalmologyData();
  }, [dashboard, fetchOphthalmologyData]);

  return {
    ...dashboard,
    isLoading: dashboard.isLoading || ophthoLoading,
    error: combineErrors(dashboard.error, ophthoError),
    refresh,
    patientStatus,
    recentExams,
    upcomingProcedures,
    criticalAlerts,
    highIopCount,
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
