import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
  type MedicationIntakeLog,
  type CreateMedicationReminder,
  type CreateHealthMetric,
  type CreateHealthGoal,
} from "@/lib/services/reminders-service";
import { supabase } from "@/lib/supabase/client";

// ─── Medication Schedule ─────────────────────────────────────────────────────

export interface TodayMedicationEntry {
  reminder: MedicationReminder;
  scheduledTime: string; // "08:00"
  scheduledAt: string; // full ISO datetime
  status: "taken" | "missed" | "pending";
  intake?: MedicationIntakeLog;
}

export function useTodayMedications(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery({
    queryKey: ["todayMedications", patientId],
    queryFn: async () => {
      const [remindersResult, intakeResult, adherenceResult] =
        await Promise.all([
          getMedicationReminders(patientId!),
          getTodayIntakeLogs(patientId!),
          getAdherence(patientId!, 7),
        ]);

      if (!remindersResult.success)
        throw new Error("Error cargando recordatorios");

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

          const intake = intakes.find(
            (log) =>
              log.medication_reminder_id === reminder.id &&
              log.scheduled_at === scheduledAt,
          );

          let status: "taken" | "missed" | "pending";
          if (intake?.status === "taken") {
            status = "taken";
          } else if (scheduledDate < now) {
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

      todayEntries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

      // Calculate streak (consecutive days with 100% adherence)
      let currentStreak = 0;
      for (let i = 1; i <= 90; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        const result = await getIntakeLogsForPeriod(patientId!, dateStr, dateStr);
        if (!result.success || result.data.length === 0) break;

        const allTaken = result.data.every((log) => log.status === "taken");
        if (allTaken) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        entries: todayEntries,
        adherence: adherenceResult.success ? adherenceResult.data : 0,
        streak: currentStreak,
      };
    },
    enabled: !!patientId,
  });

  const { mutateAsync: markMutation } = useMutation({
    mutationFn: async ({
      reminderId,
      scheduledAt,
    }: {
      reminderId: string;
      scheduledAt: string;
    }) => {
      return await logMedicationIntake(patientId!, reminderId, scheduledAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todayMedications", patientId],
      });
    },
  });

  const markAsTaken = async (reminderId: string, scheduledAt: string) => {
    if (!patientId) return;
    return markMutation({ reminderId, scheduledAt });
  };

  const refresh = useCallback(
    () => queryClient.refetchQueries({ queryKey: ["todayMedications", patientId] }),
    [queryClient, patientId]
  );

  return {
    entries: data?.entries ?? [],
    adherence: data?.adherence ?? 0,
    streak: data?.streak ?? 0,
    loading: isFetching,
    error: error ? (error instanceof Error ? error.message : "Error desconocido") : null,
    refresh,
    markAsTaken,
  };
}

// ─── Medication CRUD ─────────────────────────────────────────────────────────

export function useMedicationReminders(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data,
    isFetching,
    refetch: refresh,
  } = useQuery({
    queryKey: ["medicationReminders", patientId],
    queryFn: async () => {
      const result = await getMedicationReminders(patientId!);
      if (!result.success) throw new Error("Error loading reminders");
      return result.data;
    },
    enabled: !!patientId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: CreateMedicationReminder) => {
      if (!patientId) throw new Error("No patient");
      return await addMedicationReminder(patientId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicationReminders", patientId],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      return await deleteMedicationReminder(reminderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medicationReminders", patientId],
      });
    },
  });

  const add = async (data: CreateMedicationReminder) => {
    if (!patientId)
      return { success: false as const, error: "No patient", data: null };
    return addMutation.mutateAsync(data);
  };

  const remove = async (reminderId: string) => {
    return removeMutation.mutateAsync(reminderId);
  };

  return { reminders: data ?? [], loading: isFetching, refresh, add, remove };
}

// ─── Health Metrics ──────────────────────────────────────────────────────────

export function useHealthMetrics(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["healthMetrics", patientId],
    queryFn: async () => {
      const [typesResult, latestResult] = await Promise.all([
        getHealthMetricTypes(),
        getLatestMetrics(patientId!),
      ]);

      return {
        metricTypes: typesResult.success ? typesResult.data : [],
        latestMetrics: latestResult.success ? latestResult.data : [],
      };
    },
    enabled: !!patientId,
  });

  const logMutation = useMutation({
    mutationFn: async (data: CreateHealthMetric) => {
      if (!patientId) throw new Error("No patient");
      return await logHealthMetric(patientId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["healthMetrics", patientId],
      });
    },
  });

  const log = async (data: CreateHealthMetric) => {
    if (!patientId)
      return { success: false as const, error: "No patient", data: null };
    return logMutation.mutateAsync(data);
  };

  const getHistory = async (metricTypeId: string, days: number) => {
    if (!patientId)
      return { success: false as const, error: "No patient", data: [] };
    return getHealthMetrics(patientId, metricTypeId, days);
  };

  const refresh = useCallback(
    () => queryClient.refetchQueries({ queryKey: ["healthMetrics", patientId] }),
    [queryClient, patientId]
  );

  return {
    metricTypes: data?.metricTypes ?? [],
    latestMetrics: data?.latestMetrics ?? [],
    loading: isFetching,
    refresh,
    log,
    getHistory,
  };
}

// ─── Health Goals ────────────────────────────────────────────────────────────

export function useHealthGoals(patientId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data,
    isFetching,
    refetch: refresh,
  } = useQuery({
    queryKey: ["healthGoals", patientId],
    queryFn: async () => {
      const result = await getHealthGoals(patientId!);
      if (!result.success) throw new Error("Error loading goals");
      return result.data;
    },
    enabled: !!patientId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: CreateHealthGoal) => {
      if (!patientId) throw new Error("No patient");
      return await createHealthGoal(patientId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthGoals", patientId] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({
      goalId,
      value,
    }: {
      goalId: string;
      value: number;
    }) => {
      return await updateGoalProgress(goalId, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthGoals", patientId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (goalId: string) => {
      return await completeGoal(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthGoals", patientId] });
    },
  });

  const add = async (data: CreateHealthGoal) => {
    if (!patientId)
      return { success: false as const, error: "No patient", data: null };
    return addMutation.mutateAsync(data);
  };

  const updateProgress = async (goalId: string, value: number) => {
    return updateProgressMutation.mutateAsync({ goalId, value });
  };

  const complete = async (goalId: string) => {
    return completeMutation.mutateAsync(goalId);
  };

  return { goals: data ?? [], loading: isFetching, refresh, add, updateProgress, complete };
}

// ─── Upcoming Appointments ───────────────────────────────────────────────────

export function useUpcomingAppointments(patientId: string | undefined) {
  const {
    data,
    isFetching,
    refetch: refresh,
  } = useQuery({
    queryKey: ["upcomingAppointments", patientId],
    queryFn: async () => {
      const result = await getUpcomingAppointments(patientId!);
      if (!result.success) throw new Error("Error loading appointments");
      return result.data;
    },
    enabled: !!patientId,
  });

  return { appointments: data ?? [], loading: isFetching, refresh };
}

// ─── Combined Dashboard Hook ─────────────────────────────────────────────────

export function useRemindersDashboard() {
  const { data: userId, isLoading: initialLoading } = useQuery({
    queryKey: ["currentUserId"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id;
    },
    staleTime: 5 * 60 * 1000,
  });

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
