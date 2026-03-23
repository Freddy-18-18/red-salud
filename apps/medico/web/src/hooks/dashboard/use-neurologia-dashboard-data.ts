// ============================================
// NEUROLOGY DASHBOARD DATA HOOK
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

export interface RecentStudy {
  id: string;
  studyType: string;
  patientName: string;
  studyDate: string;
  isAbnormal: boolean;
  urgency: "normal" | "urgente" | "critico";
}

export interface AssessmentSummary {
  id: string;
  assessmentType: string;
  patientName: string;
  totalScore: number | null;
  severity: string | null;
  trend: string | null;
  assessmentDate: string;
}

export interface NeurologyCriticalAlert {
  id: string;
  patientName: string;
  condition: string;
  priority: "high" | "medium" | "low";
  timeSince: string;
}

export interface NeurologiaDashboardReturn extends SpecialtyDashboardData {
  patientStatus: PatientStatus;
  recentStudies: RecentStudy[];
  recentAssessments: AssessmentSummary[];
  criticalAlerts: NeurologyCriticalAlert[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STUDY_LABELS: Record<string, string> = {
  eeg: "Electroencefalograma",
  "eeg-video": "Video-EEG",
  emg: "Electromiografía",
  "velocidad-conduccion": "Velocidad de Conducción",
  "potenciales-evocados": "Potenciales Evocados",
  pet: "PET Cerebral",
  "rmn-cerebral": "RMN Cerebral",
  "rmn-columna": "RMN Columna",
  "angiografia-cerebral": "Angiografía Cerebral",
  "doppler-transcraneal": "Doppler Transcraneal",
};

const ASSESSMENT_LABELS: Record<string, string> = {
  glasgow: "Escala de Glasgow",
  nihss: "NIHSS",
  mmse: "Mini-Mental (MMSE)",
  moca: "MoCA",
  barthel: "Índice de Barthel",
  rankin: "Escala de Rankin",
  edss: "EDSS",
  updrs: "UPDRS",
  "berg-balance": "Escala de Berg",
  tinetti: "Test de Tinetti",
};

// ============================================================================
// HOOK
// ============================================================================

export function useNeurologiaDashboardData(
  doctorId?: string
): NeurologiaDashboardReturn {
  // ---- Specialty system integration ----
  const config = useMemo(() => getGeneratedConfig("neurologia"), []);
  const dashboard = useSpecialtyDashboard(doctorId, config);

  // ---- Neurology-specific state ----
  const [patientStatus, setPatientStatus] = useState<PatientStatus>({
    active: 0,
    activeTrend: 0,
    followUp: 0,
    highPriority: 0,
    newThisMonth: 0,
  });
  const [recentStudies, setRecentStudies] = useState<RecentStudy[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentSummary[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<NeurologyCriticalAlert[]>([]);
  const [neuroLoading, setNeuroLoading] = useState(true);
  const [neuroError, setNeuroError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // ---- Fetch neurology-specific data ----
  const fetchNeurologyData = useCallback(async () => {
    if (!doctorId) return;
    setNeuroLoading(true);

    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      // Run all queries in parallel
      const [
        recentStudiesResult,
        abnormalStudiesResult,
        recentAssessmentsResult,
        patientsThisMonth,
        patientsLastMonth,
        followUpResult,
      ] = await Promise.all([
        // 1. Recent neurological studies (last 7 days)
        supabase
          .from("neurology_studies")
          .select("id, study_type, study_date, is_abnormal, urgency")
          .eq("doctor_id", doctorId)
          .gte("study_date", weekAgo)
          .order("study_date", { ascending: false })
          .limit(10),

        // 2. Abnormal studies requiring follow-up
        supabase
          .from("neurology_studies")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", doctorId)
          .eq("is_abnormal", true)
          .gte("study_date", monthStart),

        // 3. Recent assessments
        supabase
          .from("neurology_assessments")
          .select("id, assessment_type, assessment_date, total_score, severity, trend")
          .eq("doctor_id", doctorId)
          .gte("assessment_date", weekAgo)
          .order("assessment_date", { ascending: false })
          .limit(8),

        // 4. Unique patients this month
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 5. Unique patients last month (for trend)
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", lastMonthStart)
          .lt("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 6. Follow-up appointments today
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .eq("tipo", "seguimiento")
          .gte("fecha_hora", `${todayStr}T00:00:00`),
      ]);

      if (!mountedRef.current) return;

      // ── Process recent studies ──
      if (recentStudiesResult.data) {
        setRecentStudies(
          recentStudiesResult.data.map((s) => ({
            id: s.id,
            studyType: STUDY_LABELS[s.study_type] || formatLabel(s.study_type),
            patientName: "Paciente",
            studyDate: formatScheduledDate(s.study_date),
            isAbnormal: s.is_abnormal ?? false,
            urgency: (s.urgency as "normal" | "urgente" | "critico") ?? "normal",
          }))
        );
      }

      // ── Process recent assessments ──
      if (recentAssessmentsResult.data) {
        setRecentAssessments(
          recentAssessmentsResult.data.map((a) => ({
            id: a.id,
            assessmentType: ASSESSMENT_LABELS[a.assessment_type] || formatLabel(a.assessment_type),
            patientName: "Paciente",
            totalScore: a.total_score,
            severity: a.severity,
            trend: a.trend,
            assessmentDate: formatScheduledDate(a.assessment_date),
          }))
        );
      }

      // ── Compute patient status ──
      const thisMonthCount = patientsThisMonth.count ?? 0;
      const lastMonthCount = patientsLastMonth.count ?? 0;
      const trend =
        lastMonthCount > 0
          ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
          : 0;

      setPatientStatus({
        active: thisMonthCount,
        activeTrend: trend,
        followUp: followUpResult.count ?? 0,
        highPriority: abnormalStudiesResult.count ?? 0,
        newThisMonth: thisMonthCount,
      });

      // ── Critical alerts from abnormal/urgent studies ──
      const urgentAlerts: NeurologyCriticalAlert[] = [];
      if (recentStudiesResult.data) {
        recentStudiesResult.data
          .filter((s) => s.urgency === "critico" || (s.is_abnormal && s.urgency === "urgente"))
          .forEach((s) => {
            urgentAlerts.push({
              id: `alert-${s.id}`,
              patientName: "Paciente",
              condition: `${STUDY_LABELS[s.study_type] || s.study_type} — resultado anormal`,
              priority: s.urgency === "critico" ? "high" : "medium",
              timeSince: getTimeSince(s.study_date),
            });
          });
      }
      setCriticalAlerts(urgentAlerts);
      setNeuroError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      if (isMissingRelationError(err)) {
        setNeuroError(null);
      } else {
        setNeuroError(
          err instanceof Error ? err.message : "Error cargando datos de neurología"
        );
      }
    } finally {
      if (mountedRef.current) setNeuroLoading(false);
    }
  }, [doctorId, dashboard.todayAppointments.pending]);

  // ---- Lifecycle ----
  useEffect(() => {
    fetchNeurologyData();
  }, [fetchNeurologyData]);

  useEffect(() => {
    if (!doctorId) return;
    const interval = setInterval(fetchNeurologyData, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchNeurologyData, doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`neurology-dashboard-${doctorId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "neurology_studies", filter: `doctor_id=eq.${doctorId}` },
        () => fetchNeurologyData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "neurology_assessments", filter: `doctor_id=eq.${doctorId}` },
        () => fetchNeurologyData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctorId, fetchNeurologyData]);

  // ---- Combined refresh ----
  const refresh = useCallback(() => {
    dashboard.refresh();
    fetchNeurologyData();
  }, [dashboard, fetchNeurologyData]);

  return {
    ...dashboard,
    isLoading: dashboard.isLoading || neuroLoading,
    error: combineErrors(dashboard.error, neuroError),
    refresh,
    patientStatus,
    recentStudies,
    recentAssessments,
    criticalAlerts,
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
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function combineErrors(...errors: (string | null)[]): string | null {
  const nonNull = errors.filter(Boolean) as string[];
  return nonNull.length > 0 ? nonNull.join("; ") : null;
}

function isMissingRelationError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === "42P01" ||
    e.code === "PGRST205" ||
    e.message?.includes("relation") === true ||
    e.message?.includes("does not exist") === true
  );
}
