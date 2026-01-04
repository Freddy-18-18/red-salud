import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface RecentActivity {
  id: string;
  type: string;
  activity_type: string;
  description: string;
  date: string;
  status: string;
  created_at: string;
}

/**
 * Hook para cargar actividades recientes y citas próximas
 */
export function useDashboardData(userId: string | undefined) {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<any[]>([]);
  const [activeMedications, setActiveMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecentActivities = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("user_activity_log")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!err && data) {
      setRecentActivities(data);
    }
  }, []);

  const loadUpcomingAppointments = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq("paciente_id", uid)
      .in("status", ["pendiente", "confirmada"])
      .order("fecha_hora", { ascending: true })
      .limit(3);

    if (!err && data) {
      setUpcomingAppointments(data);
    }
  }, []);

  const loadLatestMetrics = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("health_metrics")
      .select(`
        *,
        metric_type:health_metric_types(nombre, unidad_medida, icono)
      `)
      .eq("paciente_id", uid)
      .order("fecha_medicion", { ascending: false })
      .limit(4);

    if (!err && data) {
      setLatestMetrics(data);
    }
  }, []);

  const loadActiveMedications = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("paciente_id", uid)
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!err && data) {
      setActiveMedications(data);
    }
  }, []);

  const loadAllData = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          loadRecentActivities(uid),
          loadUpcomingAppointments(uid),
          loadLatestMetrics(uid),
          loadActiveMedications(uid),
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading data";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      loadRecentActivities,
      loadUpcomingAppointments,
      loadLatestMetrics,
      loadActiveMedications,
    ]
  );

  return {
    recentActivities,
    upcomingAppointments,
    latestMetrics,
    activeMedications,
    loading,
    error,
    loadAllData,
  };
}
