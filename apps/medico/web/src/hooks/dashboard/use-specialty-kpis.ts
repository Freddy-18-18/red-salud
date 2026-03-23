/**
 * @file use-specialty-kpis.ts
 * @description Hook para resolver KPIs de cualquier especialidad.
 *
 * Acepta una lista de KPI keys (del SpecialtyConfig.prioritizedKpis)
 * y retorna sus valores numéricos resueltos contra las vistas materializadas
 * y tablas de Supabase.
 *
 * Diseñado para consumirse por SpecialtyKpiGrid y SpecialtyDashboardShell.
 *
 * @module Hooks/Dashboard
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  resolveKpis,
  type KpiResolutionResult,
} from "@/lib/specialties/data/specialty-kpi-resolver";

// ============================================================================
// TYPES
// ============================================================================

interface UseSpecialtyKpisOptions {
  /** Doctor UUID */
  doctorId: string;
  /** KPI keys to resolve (from config.prioritizedKpis) */
  kpiKeys: string[];
  /** Custom date range — defaults to last 6 months */
  dateRange?: { start: Date; end: Date };
  /** Auto-refresh interval in ms (0 = disabled). Default: 5 min */
  refreshIntervalMs?: number;
  /** Skip fetching */
  enabled?: boolean;
}

interface UseSpecialtyKpisReturn {
  /** Resolved KPI values — key → number */
  values: Record<string, number>;
  /** KPI keys that could not be resolved */
  unresolved: string[];
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
  /** Error message, if any */
  error: string | null;
  /** Timestamp of last successful fetch */
  refreshedAt: Date | null;
  /** Force a refresh */
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

const DEFAULT_REFRESH_INTERVAL = 5 * 60_000; // 5 minutes

export function useSpecialtyKpis(
  options: UseSpecialtyKpisOptions
): UseSpecialtyKpisReturn {
  const {
    doctorId,
    kpiKeys,
    dateRange,
    refreshIntervalMs = DEFAULT_REFRESH_INTERVAL,
    enabled = true,
  } = options;

  // ---- State ----
  const [values, setValues] = useState<Record<string, number>>({});
  const [unresolved, setUnresolved] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  // Ref to prevent stale closure issues with interval
  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  // ---- Stable key list (memoized to prevent unnecessary re-fetches) ----
  const stableKeys = useMemo(
    () => JSON.stringify(kpiKeys.sort()),
    [kpiKeys]
  );

  // ---- Fetch function ----
  const fetchKpis = useCallback(
    async (isRefresh: boolean) => {
      if (!doctorId || !enabled) return;

      const fetchId = ++fetchIdRef.current;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result: KpiResolutionResult = await resolveKpis({
          kpiKeys: JSON.parse(stableKeys) as string[],
          doctorId,
          dateRange,
        });

        // Only update state if this is still the latest fetch
        if (!mountedRef.current || fetchId !== fetchIdRef.current) return;

        setValues(result.values);
        setUnresolved(result.unresolved);
        setError(
          result.errors.length > 0 ? result.errors.join("; ") : null
        );
        setRefreshedAt(new Date());
      } catch (err) {
        if (!mountedRef.current || fetchId !== fetchIdRef.current) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar KPIs"
        );
      } finally {
        if (mountedRef.current && fetchId === fetchIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [doctorId, stableKeys, dateRange, enabled]
  );

  // ---- Initial load ----
  useEffect(() => {
    fetchKpis(false);
  }, [fetchKpis]);

  // ---- Auto-refresh ----
  useEffect(() => {
    if (!enabled || refreshIntervalMs <= 0) return;

    const interval = setInterval(() => {
      fetchKpis(true);
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [fetchKpis, refreshIntervalMs, enabled]);

  // ---- Cleanup ----
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---- Manual refresh ----
  const refresh = useCallback(() => {
    fetchKpis(true);
  }, [fetchKpis]);

  return {
    values,
    unresolved,
    isLoading,
    isRefreshing,
    error,
    refreshedAt,
    refresh,
  };
}
