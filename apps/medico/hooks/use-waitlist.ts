"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WaitlistEntry } from "@/types/dental";
import {
  getWaitlistEntries,
  createWaitlistEntry,
  notifyWaitlistEntry,
  confirmWaitlistEntry,
  cancelWaitlistEntry,
  deleteWaitlistEntry,
  getDoctorPatientsForWaitlist,
  type CreateWaitlistInput,
} from "@/lib/supabase/services/waitlist-service";

const supabase = createClient();

export interface WaitlistPatientOption {
  id: string;
  name: string;
  phone: string;
  type: "registered" | "offline";
  cedula?: string | null;
}

export interface WaitlistStats {
  waiting: number;
  notified: number;
  confirmed: number;
  total: number;
}

export function useWaitlist(doctorId: string | null, officeId?: string | null) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<WaitlistPatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Load entries ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!doctorId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: err } = await getWaitlistEntries(doctorId, officeId);
    setEntries(data);
    setError(err);
    setLoading(false);
  }, [doctorId, officeId]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    void load();

    // Clean up previous channel
    if (channelRef.current) channelRef.current.unsubscribe();

    const channel = supabase
      .channel(`waitlist:${doctorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "smart_waitlist",
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => void load()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [doctorId, load]);

  // ── Patient list for form ─────────────────────────────────────────────────
  const loadPatients = useCallback(async () => {
    if (!doctorId) return;
    setLoadingPatients(true);
    const list = await getDoctorPatientsForWaitlist(doctorId);
    setPatients(list);
    setLoadingPatients(false);
  }, [doctorId]);

  // ── CRUD actions ──────────────────────────────────────────────────────────
  const addEntry = useCallback(
    async (input: Omit<CreateWaitlistInput, "doctorId">) => {
      if (!doctorId) return { error: "No doctor ID" };
      const result = await createWaitlistEntry({
        ...input,
        doctorId,
        officeId: input.officeId ?? officeId ?? undefined,
      });
      if (result.error) setError(result.error);
      // Realtime will trigger reload; but add optimistically too
      if (result.data) {
        setEntries((prev) => [result.data!, ...prev]);
      }
      return result;
    },
    [doctorId, officeId]
  );

  const notify = useCallback(async (id: string) => {
    // Optimistic update
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "notified" as const, notifiedAt: new Date().toISOString() }
          : e
      )
    );
    const { error: err } = await notifyWaitlistEntry(id);
    if (err) {
      setError(err);
      void load(); // revert on error
    }
  }, [load]);

  const confirm = useCallback(async (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "confirmed" as const, confirmedAt: new Date().toISOString() }
          : e
      )
    );
    const { error: err } = await confirmWaitlistEntry(id);
    if (err) {
      setError(err);
      void load();
    }
  }, [load]);

  const cancel = useCallback(async (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "cancelled" as const } : e
      )
    );
    const { error: err } = await cancelWaitlistEntry(id);
    if (err) {
      setError(err);
      void load();
    }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    const { error: err } = await deleteWaitlistEntry(id);
    if (err) {
      setError(err);
      void load();
    }
  }, [load]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats: WaitlistStats = useMemo(
    () => ({
      waiting: entries.filter((e) => e.status === "waiting").length,
      notified: entries.filter((e) => e.status === "notified").length,
      confirmed: entries.filter((e) => e.status === "confirmed").length,
      total: entries.length,
    }),
    [entries]
  );

  return {
    entries,
    loading,
    error,
    stats,
    patients,
    loadingPatients,
    load,
    loadPatients,
    addEntry,
    notify,
    confirm,
    cancel,
    remove,
  };
}
