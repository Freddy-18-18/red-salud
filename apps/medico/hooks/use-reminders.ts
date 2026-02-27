"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getReminderRules,
  createReminderRule,
  updateReminderRule,
  deleteReminderRule,
  toggleReminderRule,
  ensureDefaultReminderRules,
  getDoctorReminders,
  getReminderStats,
  subscribeToCancellationEvents,
  type ReminderRule,
  type AppointmentReminder,
  type ReminderStats,
  type CreateReminderRuleInput,
} from "@/lib/supabase/services/reminder-service";

interface UseRemindersOptions {
  doctorId: string;
  onCancellationEvent?: (event: { appointment_id: string; cancelled_at: string }) => void;
}

export function useReminders({ doctorId, onCancellationEvent }: UseRemindersOptions) {
  const [rules, setRules]       = useState<ReminderRule[]>([]);
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [stats, setStats]       = useState<ReminderStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const channelRef              = useRef<ReturnType<typeof subscribeToCancellationEvents> | null>(null);

  const load = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    const [rulesResult, remindersResult, statsResult] = await Promise.all([
      getReminderRules(doctorId),
      getDoctorReminders(doctorId),
      getReminderStats(doctorId),
    ]);

    if (rulesResult.error) {
      setError(rulesResult.error);
    } else {
      setRules(rulesResult.data ?? []);
    }
    if (!remindersResult.error) setReminders(remindersResult.data ?? []);
    setStats(statsResult);
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    load();

    // Subscribe to cancellation events for auto-waitlist trigger
    if (onCancellationEvent) {
      channelRef.current = subscribeToCancellationEvents(doctorId, (event) => {
        onCancellationEvent({
          appointment_id: event.appointment_id as string,
          cancelled_at: event.cancelled_at as string,
        });
      });
    }

    return () => { channelRef.current?.unsubscribe(); };
  }, [doctorId, load, onCancellationEvent]);

  const addRule = useCallback(
    async (input: CreateReminderRuleInput) => {
      const result = await createReminderRule(doctorId, input);
      if (!result.error) load();
      return result;
    },
    [doctorId, load]
  );

  const editRule = useCallback(
    async (id: string, updates: Partial<CreateReminderRuleInput>) => {
      const result = await updateReminderRule(id, updates);
      if (!result.error) load();
      return result;
    },
    [load]
  );

  const removeRule = useCallback(
    async (id: string) => {
      const result = await deleteReminderRule(id);
      if (!result.error) setRules((prev) => prev.filter((r) => r.id !== id));
      return result;
    },
    []
  );

  const toggleRule = useCallback(
    async (id: string, enabled: boolean) => {
      // Optimistic update first for instant feedback
      setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: enabled } : r));
      const result = await toggleReminderRule(id, enabled);
      // Revert on error
      if (result.error) setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !enabled } : r));
      return result;
    },
    []
  );

  const makeDefaults = useCallback(
    () => ensureDefaultReminderRules(doctorId).then(() => load()),
    [doctorId, load]
  );

  return {
    rules,
    reminders,
    stats,
    loading,
    error,
    addRule,
    editRule,
    removeRule,
    toggleRule,
    makeDefaults,
    refresh: load,
  };
}
