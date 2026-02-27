"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAgendaSummaryKPIs,
  getNoShowTrend,
  getHourlyHeatmap,
  getAppointmentTypeMetrics,
  getRevenueVsGoal,
  getWaitlistConversion,
  getDurationDrillDown,
  type AgendaSummaryKPIs,
  type NoShowTrend,
  type HourlyHeatmapEntry,
  type AppointmentTypeMetrics,
  type RevenueVsGoal,
  type WaitlistConversionEntry,
} from "@/lib/supabase/services/agenda-stats-service";

interface UseAgendaStatsOptions {
  doctorId: string;
  monthlyRevenueGoal?: number;
}

export function useAgendaStats({ doctorId, monthlyRevenueGoal = 0 }: UseAgendaStatsOptions) {
  const [kpis, setKpis]           = useState<AgendaSummaryKPIs | null>(null);
  const [noShowTrend, setNoShowTrend] = useState<NoShowTrend[]>([]);
  const [heatmap, setHeatmap]     = useState<HourlyHeatmapEntry[]>([]);
  const [typeMetrics, setTypeMetrics] = useState<AppointmentTypeMetrics[]>([]);
  const [revenue, setRevenue]     = useState<RevenueVsGoal[]>([]);
  const [waitlist, setWaitlist]   = useState<WaitlistConversionEntry[]>([]);
  const [duration, setDuration]   = useState<Array<{ tipo_cita: string; procedure_name: string; avg_scheduled: number; avg_actual: number | null; count: number; overrun_pct: number }>>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, ns, hm, tm, rv, wl, dr] = await Promise.all([
        getAgendaSummaryKPIs(doctorId),
        getNoShowTrend(doctorId),
        getHourlyHeatmap(doctorId),
        getAppointmentTypeMetrics(doctorId),
        getRevenueVsGoal(doctorId, monthlyRevenueGoal),
        getWaitlistConversion(doctorId),
        getDurationDrillDown(doctorId),
      ]);
      setKpis(k);
      setNoShowTrend(ns);
      setHeatmap(hm);
      setTypeMetrics(tm);
      setRevenue(rv);
      setWaitlist(wl);
      setDuration(dr);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando estadísticas");
    } finally {
      setLoading(false);
    }
  }, [doctorId, monthlyRevenueGoal]);

  useEffect(() => { load(); }, [load]);

  return {
    kpis,
    noShowTrend,
    heatmap,
    typeMetrics,
    revenue,
    waitlist,
    duration,
    loading,
    error,
    refresh: load,
  };
}
