"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getWaitingRoom,
  checkInPatient,
  callPatientIn,
  completeConsultation,
  subscribeToWaitingRoom,
  generateCheckinToken,
  type WaitingRoomEntry,
  type WaitingRoomStats,
  type CheckinMethod,
} from "@/lib/supabase/services/checkin-service";

interface UseCheckinOptions {
  doctorId: string;
  officeId?: string | null;
  autoRefreshSeconds?: number;
}

export function useCheckin({ doctorId, officeId, autoRefreshSeconds = 30 }: UseCheckinOptions) {
  const [entries, setEntries]     = useState<WaitingRoomEntry[]>([]);
  const [stats, setStats]         = useState<WaitingRoomStats>({
    total_today: 0, checked_in: 0, in_consultation: 0,
    completed: 0, avg_wait_mins: 0, avg_consultation_mins: 0, on_time_rate_pct: 0,
  });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const channelRef                = useRef<ReturnType<typeof subscribeToWaitingRoom> | null>(null);

  const refresh = useCallback(async () => {
    const result = await getWaitingRoom(doctorId, officeId);
    if (result.error) {
      setError(result.error);
    } else {
      setEntries(result.data);
      setStats(result.stats);
      setError(null);
    }
    setLoading(false);
  }, [doctorId, officeId]);

  useEffect(() => {
    setLoading(true);
    refresh();

    // Real-time subscription
    channelRef.current = subscribeToWaitingRoom(doctorId, refresh);

    // Periodic fallback refresh
    const interval = setInterval(refresh, autoRefreshSeconds * 1000);

    return () => {
      channelRef.current?.unsubscribe();
      clearInterval(interval);
    };
  }, [doctorId, officeId, refresh, autoRefreshSeconds]);

  const checkIn = useCallback(
    async (
      appointmentId: string,
      options: { method?: CheckinMethod; patientId?: string | null; notes?: string } = {}
    ) => {
      const result = await checkInPatient(appointmentId, doctorId, options);
      if (!result.error) refresh();
      return result;
    },
    [doctorId, refresh]
  );

  const callIn = useCallback(
    async (appointmentId: string, checkinId: string) => {
      const result = await callPatientIn(appointmentId, checkinId);
      if (!result.error) refresh();
      return result;
    },
    [refresh]
  );

  const complete = useCallback(
    async (appointmentId: string, checkinId: string | null) => {
      const result = await completeConsultation(appointmentId, checkinId);
      if (!result.error) refresh();
      return result;
    },
    [refresh]
  );

  const getToken = useCallback(generateCheckinToken, []);

  const queue     = entries.filter((e) => e.status === "en_espera");
  const inConsult = entries.filter((e) => e.status === "en_consulta");
  const upcoming  = entries.filter((e) => e.status === "pendiente" || e.status === "confirmada");

  return {
    entries,
    queue,
    inConsult,
    upcoming,
    stats,
    loading,
    error,
    checkIn,
    callIn,
    complete,
    getToken,
    refresh,
  };
}
