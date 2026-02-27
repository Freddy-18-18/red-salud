import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface DashboardStats {
  upcomingAppointments: number;
  totalConsultations: number;
  activeMedications: number;
  pendingLabResults: number;
  unreadMessages: number;
  activeTelemed: number;
}

const INITIAL_STATS: DashboardStats = {
  upcomingAppointments: 0,
  totalConsultations: 0,
  activeMedications: 0,
  pendingLabResults: 0,
  unreadMessages: 0,
  activeTelemed: 0,
};

/**
 * Hook para cargar estadísticas del dashboard del paciente
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointmentsStats = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("paciente_id", uid);

    if (!err && data) {
      const upcoming = data.filter(
        (apt) => apt.status === "pendiente" || apt.status === "confirmada"
      ).length;
      const total = data.length;

      setStats((prev) => ({
        ...prev,
        upcomingAppointments: upcoming,
        totalConsultations: total,
      }));
    }
  }, []);

  const loadMedicationsStats = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("medication_reminders")
      .select("id")
      .eq("paciente_id", uid)
      .eq("activo", true);

    if (!err && data) {
      setStats((prev) => ({ ...prev, activeMedications: data.length }));
    }
  }, []);

  const loadLabStats = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("lab_orders")
      .select("id")
      .eq("paciente_id", uid)
      .in("status", ["en_proceso", "muestra_tomada"]);

    if (!err && data) {
      setStats((prev) => ({ ...prev, pendingLabResults: data.length }));
    }
  }, []);

  const loadMessagesStats = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("messages_new")
      .select("id")
      .neq("sender_id", uid)
      .eq("is_read", false);

    if (!err && data) {
      setStats((prev) => ({ ...prev, unreadMessages: data.length }));
    }
  }, []);

  const loadTelemedicineStats = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from("telemedicine_sessions")
      .select("id")
      .eq("patient_id", uid)
      .in("status", ["waiting", "active"]);

    if (!err && data) {
      setStats((prev) => ({ ...prev, activeTelemed: data.length }));
    }
  }, []);

  const loadAllStats = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          loadAppointmentsStats(uid),
          loadMedicationsStats(uid),
          loadLabStats(uid),
          loadMessagesStats(uid),
          loadTelemedicineStats(uid),
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading stats";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      loadAppointmentsStats,
      loadMedicationsStats,
      loadLabStats,
      loadMessagesStats,
      loadTelemedicineStats,
    ]
  );

  return { stats, loading, error, loadAllStats };
}
