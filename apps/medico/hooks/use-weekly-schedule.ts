"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWeeklySchedule,
  updateWeeklyScheduleDay,
  bulkUpdateWeeklySchedule,
  computeDayCapacity,
  DAY_LABELS,
  type WeeklyScheduleDay,
  type UpdateWeeklyScheduleDayInput,
  type TimeSlot,
  type DayBreak,
} from "@/lib/supabase/services/weekly-schedule-service";

export type { WeeklyScheduleDay, TimeSlot, DayBreak };
export { DAY_LABELS } from "@/lib/supabase/services/weekly-schedule-service";

interface UseWeeklyScheduleOptions {
  doctorId: string;
  officeId?: string | null;
}

export function useWeeklySchedule({ doctorId, officeId }: UseWeeklyScheduleOptions) {
  const [days, setDays]     = useState<WeeklyScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]  = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Local draft for editing before saving
  const [draft, setDraft]   = useState<WeeklyScheduleDay[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await getWeeklySchedule(doctorId, officeId);
    if (err) setError(err);
    else {
      setDays(data);
      setDraft(data);
    }
    setLoading(false);
    setIsDirty(false);
  }, [doctorId, officeId]);

  useEffect(() => { load(); }, [load]);

  /** Update a single day in the local draft (not saved yet) */
  const updateDayDraft = useCallback((dayOfWeek: number, updates: UpdateWeeklyScheduleDayInput) => {
    setDraft((prev) => prev.map((d) => d.day_of_week === dayOfWeek ? { ...d, ...updates } : d));
    setIsDirty(true);
  }, []);

  /** Save a single day immediately */
  const saveDay = useCallback(
    async (id: string, updates: UpdateWeeklyScheduleDayInput) => {
      setSaving(true);
      const { error: err } = await updateWeeklyScheduleDay(id, updates);
      if (!err) {
        setDays((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
        setDraft((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
        setIsDirty(false);
      } else {
        setError(err);
      }
      setSaving(false);
      return { error: err };
    },
    []
  );

  /** Save all 7 days from the draft */
  const saveAll = useCallback(async () => {
    setSaving(true);
    const { error: err } = await bulkUpdateWeeklySchedule(
      draft.map(({ id, doctor_id, day_of_week, created_at, updated_at, ...rest }) => ({
        id,
        ...rest,
      }))
    );
    if (!err) {
      setDays(draft);
      setIsDirty(false);
    } else {
      setError(err);
    }
    setSaving(false);
    return { error: err };
  }, [draft]);

  const discard = useCallback(() => {
    setDraft(days);
    setIsDirty(false);
  }, [days]);

  /** Computed weekly capacity */
  const weeklyCapacity = draft.reduce((sum, day) => sum + computeDayCapacity(day), 0);
  const workingDays    = draft.filter((d) => d.is_working_day).length;

  return {
    days: draft, // always show draft for live editing
    savedDays: days,
    loading,
    saving,
    error,
    isDirty,
    weeklyCapacity,
    workingDays,
    dayLabels: DAY_LABELS,
    updateDayDraft,
    saveDay,
    saveAll,
    discard,
    refresh: load,
  };
}
