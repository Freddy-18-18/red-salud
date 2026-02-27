/**
 * @file use-specialty-dashboard.ts
 * @description Hook orquestador principal para dashboards de especialidad.
 *
 * Combina:
 * - KPIs resueltos (via useSpecialtyKpis)
 * - Citas del día/semana
 * - Estado de carga/error/refresh unificado
 *
 * Diseñado para alimentar SpecialtyDashboardShell con todos los datos
 * que necesita, independientemente de la especialidad.
 *
 * @module Hooks/Dashboard
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SpecialtyConfig } from "@/lib/specialties";
import { useSpecialtyKpis } from "./use-specialty-kpis";

// ============================================================================
// TYPES
// ============================================================================

export interface SpecialtyDashboardData {
  /** KPI values — key → number */
  kpiValues: Record<string, number>;
  /** KPI keys that couldn't be resolved */
  unresolvedKpis: string[];

  /** Today's appointments summary */
  todayAppointments: TodayAppointmentSummary;

  /** Overall loading state (initial load) */
  isLoading: boolean;
  /** Whether a background refresh is happening */
  isRefreshing: boolean;
  /** Combined error message */
  error: string | null;
  /** Last successful data refresh */
  refreshedAt: Date | null;
  /** Force refresh all data */
  refresh: () => void;
}

export interface TodayAppointmentSummary {
  total: number;
  completed: number;
  pending: number;
  nextAppointmentTime: string | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSpecialtyDashboard(
  doctorId: string | undefined,
  config: SpecialtyConfig | undefined
): SpecialtyDashboardData {
  // ---- Guards ----
  const enabled = Boolean(doctorId && config);
  const kpiKeys = useMemo(
    () => config?.prioritizedKpis ?? [],
    [config?.prioritizedKpis]
  );

  // ---- KPI sub-hook ----
  const kpis = useSpecialtyKpis({
    doctorId: doctorId ?? "",
    kpiKeys,
    enabled,
  });

  // ---- Today's appointments ----
  const [todayData, setTodayData] = useState<TodayAppointmentSummary>({
    total: 0,
    completed: 0,
    pending: 0,
    nextAppointmentTime: null,
  });
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchTodayAppointments = useCallback(async () => {
    if (!doctorId || !enabled) return;

    setTodayLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      const { data, error: queryError } = await supabase
        .from("appointments")
        .select("id, fecha_hora, status")
        .eq("medico_id", doctorId)
        .gte("fecha_hora", `${today}T00:00:00`)
        .lte("fecha_hora", `${today}T23:59:59`)
        .order("fecha_hora", { ascending: true });

      if (!mountedRef.current) return;

      if (queryError) {
        // Graceful degradation — don't crash if table is missing
        if (isMissingRelationError(queryError)) {
          setTodayData({
            total: 0,
            completed: 0,
            pending: 0,
            nextAppointmentTime: null,
          });
          return;
        }
        throw queryError;
      }

      const rows = data ?? [];
      const now = new Date();

      const completed = rows.filter(
        (r) => r.status === "completed" || r.status === "completada"
      ).length;

      const pending = rows.filter(
        (r) =>
          r.status !== "completed" &&
          r.status !== "completada" &&
          r.status !== "cancelled" &&
          r.status !== "cancelada"
      );

      // Next upcoming appointment
      const nextAppointment = pending.find(
        (r) => new Date(r.fecha_hora) > now
      );

      setTodayData({
        total: rows.length,
        completed,
        pending: pending.length,
        nextAppointmentTime: nextAppointment
          ? new Date(nextAppointment.fecha_hora).toLocaleTimeString("es-VE", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      });
      setTodayError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setTodayError(
        err instanceof Error ? err.message : "Error cargando citas del día"
      );
    } finally {
      if (mountedRef.current) setTodayLoading(false);
    }
  }, [doctorId, enabled]);

  // Fetch on mount
  useEffect(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);

  // Auto-refresh appointments every 2 minutes
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(fetchTodayAppointments, 2 * 60_000);
    return () => clearInterval(interval);
  }, [fetchTodayAppointments, enabled]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---- Real-time subscription for appointment changes ----
  useEffect(() => {
    if (!doctorId || !enabled) return;

    const channel = supabase
      .channel(`specialty-dashboard-${doctorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `medico_id=eq.${doctorId}`,
        },
        () => {
          // Re-fetch when any appointment changes
          fetchTodayAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorId, enabled, fetchTodayAppointments]);

  // ---- Combined refresh ----
  const refresh = useCallback(() => {
    kpis.refresh();
    fetchTodayAppointments();
  }, [kpis, fetchTodayAppointments]);

  // ---- Combined state ----
  const isLoading = kpis.isLoading || todayLoading;
  const isRefreshing = kpis.isRefreshing;
  const error = combineErrors(kpis.error, todayError);
  const refreshedAt = kpis.refreshedAt;

  return {
    kpiValues: kpis.values,
    unresolvedKpis: kpis.unresolved,
    todayAppointments: todayData,
    isLoading,
    isRefreshing,
    error,
    refreshedAt,
    refresh,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function combineErrors(...errors: (string | null)[]): string | null {
  const nonNull = errors.filter(Boolean) as string[];
  return nonNull.length > 0 ? nonNull.join("; ") : null;
}

/**
 * Checks if a Supabase error is due to a missing relation (table/view).
 * This allows graceful degradation when materialized views or
 * specialty-specific tables haven't been created yet.
 */
function isMissingRelationError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  // 42P01 = relation does not exist
  // PGRST205 = PostgREST: table not found
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("relation") === true ||
    error.message?.includes("does not exist") === true
  );
}
