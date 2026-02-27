// ============================================
// CARDIOLOGY DASHBOARD DATA HOOK
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

export interface UpcomingProcedure {
  id: string;
  procedureName: string;
  patientName: string;
  scheduledDate: string;
  type: "diagnostic" | "interventional" | "follow_up";
  urgency: "low" | "medium" | "high";
}

export interface ECGQueueItem {
  id: string;
  patientName: string;
  urgency: "routine" | "urgent" | "emergency";
  timeInQueue: string;
}

export interface CriticalAlert {
  id: string;
  patientName: string;
  condition: string;
  priority: "high" | "medium" | "low";
  timeSince: string;
}

export interface CardiologyDashboardReturn extends SpecialtyDashboardData {
  patientStatus: PatientStatus;
  upcomingProcedures: UpcomingProcedure[];
  ecgQueue: ECGQueueItem[];
  criticalAlerts: CriticalAlert[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Appointment types considered cardiology procedures */
const CARDIOLOGY_PROCEDURE_TYPES = [
  "ecg",
  "ecocardiograma",
  "prueba_esfuerzo",
  "holter_colocacion",
  "holter_retiro",
  "cateterismo",
  "consulta_post_procedimiento",
] as const;

/** Map raw appointment type to display name */
const PROCEDURE_LABELS: Record<string, string> = {
  ecg: "Electrocardiograma",
  ecocardiograma: "Ecocardiograma",
  prueba_esfuerzo: "Prueba de Esfuerzo",
  holter_colocacion: "Holter — Colocación",
  holter_retiro: "Holter — Retiro",
  cateterismo: "Cateterismo Cardíaco",
  consulta_post_procedimiento: "Post-Procedimiento",
};

// ============================================================================
// HOOK
// ============================================================================

export function useCardiologyDashboardData(
  doctorId?: string
): CardiologyDashboardReturn {
  // ---- Specialty system integration ----
  const config = useMemo(() => getGeneratedConfig("cardiologia"), []);
  const dashboard = useSpecialtyDashboard(doctorId, config);

  // ---- Cardiology-specific state ----
  const [patientStatus, setPatientStatus] = useState<PatientStatus>({
    active: 0,
    activeTrend: 0,
    followUp: 0,
    highPriority: 0,
    newThisMonth: 0,
  });
  const [upcomingProcedures, setUpcomingProcedures] = useState<
    UpcomingProcedure[]
  >([]);
  const [ecgQueue, setEcgQueue] = useState<ECGQueueItem[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [cardioLoading, setCardioLoading] = useState(true);
  const [cardioError, setCardioError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // ---- Fetch cardiology-specific data ----
  const fetchCardiologyData = useCallback(async () => {
    if (!doctorId) return;
    setCardioLoading(true);

    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const lastMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).toISOString();

      // Run all queries in parallel
      const [
        proceduresResult,
        ecgResult,
        patientsThisMonth,
        patientsLastMonth,
        followUpResult,
      ] = await Promise.all([
        // 1. Upcoming cardiology procedures (next 7 days)
        supabase
          .from("appointments")
          .select("id, tipo, fecha_hora, status, notas")
          .eq("medico_id", doctorId)
          .in("tipo", [...CARDIOLOGY_PROCEDURE_TYPES])
          .gte("fecha_hora", now.toISOString())
          .lte("fecha_hora", weekFromNow)
          .neq("status", "cancelada")
          .order("fecha_hora", { ascending: true })
          .limit(10),

        // 2. ECG queue (pending ECGs today)
        supabase
          .from("appointments")
          .select("id, fecha_hora, status, notas")
          .eq("medico_id", doctorId)
          .eq("tipo", "ecg")
          .gte("fecha_hora", `${todayStr}T00:00:00`)
          .lte("fecha_hora", `${todayStr}T23:59:59`)
          .in("status", ["pendiente", "pending", "en_espera"])
          .order("fecha_hora", { ascending: true }),

        // 3. Unique patients this month
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 4. Unique patients last month (for trend)
        supabase
          .from("appointments")
          .select("paciente_id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .gte("fecha_hora", lastMonthStart)
          .lt("fecha_hora", monthStart)
          .neq("status", "cancelada"),

        // 5. Follow-up patients
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("medico_id", doctorId)
          .eq("tipo", "seguimiento")
          .gte("fecha_hora", `${todayStr}T00:00:00`),
      ]);

      if (!mountedRef.current) return;

      // ── Process upcoming procedures ──
      if (proceduresResult.data) {
        setUpcomingProcedures(
          proceduresResult.data.map((p) => ({
            id: p.id,
            procedureName:
              PROCEDURE_LABELS[p.tipo] || formatProcedureName(p.tipo),
            patientName: "Paciente",
            scheduledDate: formatScheduledDate(p.fecha_hora),
            type: getAppointmentCategory(p.tipo),
            urgency: p.status === "urgente" ? "high" : "low",
          }))
        );
      }

      // ── Process ECG queue ──
      if (ecgResult.data) {
        setEcgQueue(
          ecgResult.data.map((e) => ({
            id: e.id,
            patientName: "Paciente",
            urgency: getEcgUrgency(e.status),
            timeInQueue: getTimeInQueue(e.fecha_hora),
          }))
        );
      }

      // ── Compute patient status ──
      const thisMonthCount = patientsThisMonth.count ?? 0;
      const lastMonthCount = patientsLastMonth.count ?? 0;
      const trend =
        lastMonthCount > 0
          ? Math.round(
              ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
            )
          : 0;

      setPatientStatus({
        active: thisMonthCount,
        activeTrend: trend,
        followUp: followUpResult.count ?? 0,
        highPriority: dashboard.todayAppointments.pending,
        newThisMonth: thisMonthCount,
      });

      // ── Critical alerts from today's overdue/urgent items ──
      const urgentAlerts: CriticalAlert[] = [];
      if (ecgResult.data) {
        ecgResult.data
          .filter((e) => {
            const appointmentTime = new Date(e.fecha_hora);
            // Overdue by more than 30 minutes
            return now.getTime() - appointmentTime.getTime() > 30 * 60_000;
          })
          .forEach((e) => {
            urgentAlerts.push({
              id: `alert-${e.id}`,
              patientName: "Paciente",
              condition: "ECG pendiente — tiempo de espera excedido",
              priority: "high",
              timeSince: getTimeInQueue(e.fecha_hora),
            });
          });
      }
      setCriticalAlerts(urgentAlerts);

      setCardioError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      // Graceful degradation — if tables are missing, show empty state
      if (isMissingRelationError(err)) {
        setCardioError(null);
      } else {
        setCardioError(
          err instanceof Error
            ? err.message
            : "Error cargando datos de cardiología"
        );
      }
    } finally {
      if (mountedRef.current) setCardioLoading(false);
    }
  }, [doctorId, dashboard.todayAppointments.pending]);

  // ---- Lifecycle ----
  useEffect(() => {
    fetchCardiologyData();
  }, [fetchCardiologyData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!doctorId) return;
    const interval = setInterval(fetchCardiologyData, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchCardiologyData, doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---- Real-time subscription ----
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel(`cardiology-dashboard-${doctorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `medico_id=eq.${doctorId}`,
        },
        () => fetchCardiologyData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId, fetchCardiologyData]);

  // ---- Combined refresh ----
  const refresh = useCallback(() => {
    dashboard.refresh();
    fetchCardiologyData();
  }, [dashboard, fetchCardiologyData]);

  // ---- Combined state ----
  return {
    ...dashboard,
    isLoading: dashboard.isLoading || cardioLoading,
    error: combineErrors(dashboard.error, cardioError),
    refresh,
    patientStatus,
    upcomingProcedures,
    ecgQueue,
    criticalAlerts,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function formatProcedureName(tipo: string): string {
  return tipo
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatScheduledDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Hoy, ${time}`;
  if (isTomorrow) return `Mañana, ${time}`;
  return date.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAppointmentCategory(
  tipo: string
): "diagnostic" | "interventional" | "follow_up" {
  if (tipo === "cateterismo") return "interventional";
  if (tipo === "consulta_post_procedimiento" || tipo === "seguimiento")
    return "follow_up";
  return "diagnostic";
}

function getEcgUrgency(
  status: string
): "routine" | "urgent" | "emergency" {
  if (status === "urgente" || status === "urgent") return "urgent";
  if (status === "emergencia" || status === "emergency") return "emergency";
  return "routine";
}

function getTimeInQueue(fechaHora: string): string {
  const diff = Date.now() - new Date(fechaHora).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
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
