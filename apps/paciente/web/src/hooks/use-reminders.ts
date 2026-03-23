import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getMedicationReminders,
  getTodayIntakeLogs,
  getIntakeLogsForPeriod,
  logMedicationIntake,
  getAdherence,
  addMedicationReminder,
  deleteMedicationReminder,
  getLatestMetrics,
  logHealthMetric,
  getHealthMetrics,
  getHealthMetricTypes,
  getHealthGoals,
  createHealthGoal,
  updateGoalProgress,
  completeGoal,
  getUpcomingAppointments,
  type MedicationReminder,
  type MedicationIntakeLog,
  type HealthMetricType,
  type HealthMetric,
  type HealthGoal,
  type CreateMedicationReminder,
  type CreateHealthMetric,
  type CreateHealthGoal,
} from "@/lib/services/reminders-service";

// ─── Medication Schedule ─────────────────────────────────────────────────────

export interface TodayMedicationEntry {
  reminder: MedicationReminder;
  scheduledTime: string; // "08:00"
  scheduledAt: string; // full ISO datetime
  status: "taken" | "missed" | "pending";
  intake?: MedicationIntakeLog;
}

export function useTodayMedications(patientId: string | undefined) {
  const [entries, setEntries] = useState<TodayMedicationEntry[]>([]);
  const [adherence, setAdherence] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    try {
      const [remindersResult, intakeResult, adherenceResult] =
        await Promise.all([
          getMedicationReminders(patientId),
          getTodayIntakeLogs(patientId),
          getAdherence(patientId, 7),
        ]);

      if (!remindersResult.success) throw new Error("Error cargando recordatorios");

      const reminders = remindersResult.data;
      const intakes = intakeResult.success ? intakeResult.data : [];
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();

      // Build today's schedule from reminders
      const todayEntries: TodayMedicationEntry[] = [];

      for (const reminder of reminders) {
        const times = reminder.schedule_times || [];
        for (const time of times) {
          const scheduledAt = `${today}T${time}:00`;
          const scheduledDate = new Date(scheduledAt);

          // Find matching intake log
          const intake = intakes.find(
            (log) =>
              log.medication_reminder_id === reminder.id &&
              log.scheduled_at === scheduledAt,
          );

          let status: "taken" | "missed" | "pending";
          if (intake?.status === "taken") {
            status = "taken";
          } else if (scheduledDate < now) {
            // Past time, no intake recorded
            status = "missed";
          } else {
            status = "pending";
          }

          todayEntries.push({
            reminder,
            scheduledTime: time,
            scheduledAt,
            status,
            intake,
          });
        }
      }

      // Sort by time
      todayEntries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

      setEntries(todayEntries);
      setAdherence(adherenceResult.success ? adherenceResult.data : 0);

      // Calculate streak (consecutive days with 100% adherence)
      await calculateStreak(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const calculateStreak = async (pid: string) => {
    let currentStreak = 0;
    const today = new Date();

    for (let i = 1; i <= 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const result = await getIntakeLogsForPeriod(pid, dateStr, dateStr);
      if (!result.success || result.data.length === 0) break;

      const allTaken = result.data.every((log) => log.status === "taken");
      if (allTaken) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const markAsTaken = async (reminderId: string, scheduledAt: string) => {
    if (!patientId) return;

    const result = await logMedicationIntake(patientId, reminderId, scheduledAt);
    if (result.success) {
      await refresh();
    }
    return result;
  };

  useEffect(() => {
    if (patientId) {
      refresh();
    }
  }, [patientId, refresh]);

  return { entries, adherence, streak, loading, error, refresh, markAsTaken };
}

// ─── Medication CRUD ─────────────────────────────────────────────────────────

export function useMedicationReminders(patientId: string | undefined) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getMedicationReminders(patientId);
    if (result.success) setReminders(result.data);
    setLoading(false);
  }, [patientId]);

  const add = async (data: CreateMedicationReminder) => {
    if (!patientId) return { success: false as const, error: "No patient", data: null };
    const result = await addMedicationReminder(patientId, data);
    if (result.success) await refresh();
    return result;
  };

  const remove = async (reminderId: string) => {
    const result = await deleteMedicationReminder(reminderId);
    if (result.success) await refresh();
    return result;
  };

  useEffect(() => {
    if (patientId) refresh();
  }, [patientId, refresh]);

  return { reminders, loading, refresh, add, remove };
}

// ─── Health Metrics ──────────────────────────────────────────────────────────

export function useHealthMetrics(patientId: string | undefined) {
  const [metricTypes, setMetricTypes] = useState<HealthMetricType[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<
    Array<{ metricType: HealthMetricType; latest: HealthMetric | null }>
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);

    const [typesResult, latestResult] = await Promise.all([
      getHealthMetricTypes(),
      getLatestMetrics(patientId),
    ]);

    if (typesResult.success) setMetricTypes(typesResult.data);
    if (latestResult.success) setLatestMetrics(latestResult.data);

    setLoading(false);
  }, [patientId]);

  const log = async (data: CreateHealthMetric) => {
    if (!patientId) return { success: false as const, error: "No patient", data: null };
    const result = await logHealthMetric(patientId, data);
    if (result.success) await refresh();
    return result;
  };

  const getHistory = async (metricTypeId: string, days: number) => {
    if (!patientId) return { success: false as const, error: "No patient", data: [] };
    return getHealthMetrics(patientId, metricTypeId, days);
  };

  useEffect(() => {
    if (patientId) refresh();
  }, [patientId, refresh]);

  return { metricTypes, latestMetrics, loading, refresh, log, getHistory };
}

// ─── Health Goals ────────────────────────────────────────────────────────────

export function useHealthGoals(patientId: string | undefined) {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getHealthGoals(patientId);
    if (result.success) setGoals(result.data);
    setLoading(false);
  }, [patientId]);

  const add = async (data: CreateHealthGoal) => {
    if (!patientId) return { success: false as const, error: "No patient", data: null };
    const result = await createHealthGoal(patientId, data);
    if (result.success) await refresh();
    return result;
  };

  const updateProgress = async (goalId: string, value: number) => {
    const result = await updateGoalProgress(goalId, value);
    if (result.success) await refresh();
    return result;
  };

  const complete = async (goalId: string) => {
    const result = await completeGoal(goalId);
    if (result.success) await refresh();
    return result;
  };

  useEffect(() => {
    if (!patientId) return;
    const load = async () => { await refresh(); };
    load();
  }, [patientId, refresh]);

  return { goals, loading, refresh, add, updateProgress, complete };
}

// ─── Upcoming Appointments ───────────────────────────────────────────────────

export function useUpcomingAppointments(patientId: string | undefined) {
  const [appointments, setAppointments] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getUpcomingAppointments(patientId);
    if (result.success) setAppointments(result.data);
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const load = async () => { await refresh(); };
    load();
  }, [patientId, refresh]);

  return { appointments, loading, refresh };
}

// ─── Combined Dashboard Hook ─────────────────────────────────────────────────

export function useRemindersDashboard() {
  const [userId, setUserId] = useState<string>();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setInitialLoading(false);
    };
    loadUser();
  }, []);

  const medications = useTodayMedications(userId);
  const metrics = useHealthMetrics(userId);
  const goals = useHealthGoals(userId);
  const appointments = useUpcomingAppointments(userId);

  return {
    userId,
    initialLoading,
    medications,
    metrics,
    goals,
    appointments,
  };
}
