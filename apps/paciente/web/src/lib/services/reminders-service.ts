import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MedicationReminder {
  id: string;
  patient_id: string;
  medication_name: string;
  dosis?: string;
  frequency?: string;
  starts_at: string;
  ends_at?: string;
  schedule_times: string[]; // e.g. ["08:00", "12:00", "20:00"]
  notes?: string;
  created_at: string;
}

export interface MedicationIntakeLog {
  id: string;
  patient_id: string;
  medication_reminder_id: string;
  scheduled_at: string;
  taken_at?: string;
  status: "taken" | "missed" | "pending";
  notes?: string;
}

export interface HealthMetricType {
  id: string;
  name: string;
  description?: string;
  unit: string;
  min_value?: number;
  max_value?: number;
}

export interface HealthMetric {
  id: string;
  patient_id: string;
  metric_type_id: string;
  value: number;
  measured_at: string;
  notes?: string;
  metric_type?: HealthMetricType;
}

export interface HealthGoal {
  id: string;
  patient_id: string;
  description: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  starts_at: string;
  target_date?: string;
  notes?: string;
  status: "active" | "completed" | "abandoned";
  created_at: string;
}

export interface CreateMedicationReminder {
  medication_name: string;
  dosage?: string;
  frequency?: string;
  starts_at: string;
  ends_at?: string;
  schedule_times: string[];
  notes?: string;
}

export interface CreateHealthMetric {
  metric_type_id: string;
  value: number;
  measured_at: string;
  notes?: string;
}

export interface CreateHealthGoal {
  description: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  starts_at: string;
  target_date?: string;
  notes?: string;
}

// ─── Medication Reminders ────────────────────────────────────────────────────

export async function getMedicationReminders(patientId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("patient_id", patientId)
      .lte("starts_at", today)
      .or(`ends_at.is.null,ends_at.gte.${today}`)
      .order("created_at", { ascending: false });

    if (error) return { success: true as const, data: [] as MedicationReminder[] };

    return { success: true as const, data: (data || []) as MedicationReminder[] };
  } catch {
    return { success: true as const, data: [] as MedicationReminder[] };
  }
}

export async function addMedicationReminder(
  patientId: string,
  reminder: CreateMedicationReminder,
) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .insert({
        patient_id: patientId,
        medication_name: reminder.medication_name,
        dosis: reminder.dosage,
        frequency: reminder.frequency,
        starts_at: reminder.starts_at,
        ends_at: reminder.ends_at || null,
        schedule_times: reminder.schedule_times,
        notes: reminder.notes,
      })
      .select()
      .single();

    if (error) return { success: false as const, error, data: null };

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "medication_reminder_created",
      description: `Recordatorio creado: ${reminder.medication_name}`,
      status: "success",
    });

    return { success: true as const, data: data as MedicationReminder };
  } catch {
    return { success: false as const, error: null, data: null };
  }
}

export async function deleteMedicationReminder(reminderId: string) {
  try {
    const { error } = await supabase
      .from("medication_reminders")
      .delete()
      .eq("id", reminderId);

    if (error) return { success: false as const, error };

    return { success: true as const };
  } catch {
    return { success: false as const, error: null };
  }
}

// ─── Medication Intake ───────────────────────────────────────────────────────

export async function getTodayIntakeLogs(patientId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("medication_intake_log")
      .select("*")
      .eq("patient_id", patientId)
      .gte("scheduled_at", `${today}T00:00:00`)
      .lt("scheduled_at", `${tomorrow}T00:00:00`)
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    return { success: true as const, data: (data || []) as MedicationIntakeLog[] };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] as MedicationIntakeLog[] };
  }
}

export async function getIntakeLogsForPeriod(
  patientId: string,
  startDate: string,
  endDate: string,
) {
  try {
    const { data, error } = await supabase
      .from("medication_intake_log")
      .select("*")
      .eq("patient_id", patientId)
      .gte("scheduled_at", `${startDate}T00:00:00`)
      .lte("scheduled_at", `${endDate}T23:59:59`)
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    return { success: true as const, data: (data || []) as MedicationIntakeLog[] };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] as MedicationIntakeLog[] };
  }
}

export async function logMedicationIntake(
  patientId: string,
  reminderId: string,
  scheduledAt: string,
) {
  try {
    // Check for existing entry
    const { data: existing } = await supabase
      .from("medication_intake_log")
      .select("id")
      .eq("medication_reminder_id", reminderId)
      .eq("scheduled_at", scheduledAt)
      .maybeSingle();

    if (existing) {
      // Update the existing log
      const { data, error } = await supabase
        .from("medication_intake_log")
        .update({
          taken_at: new Date().toISOString(),
          status: "taken",
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true as const, data: data as MedicationIntakeLog };
    }

    // Create new log
    const { data, error } = await supabase
      .from("medication_intake_log")
      .insert({
        patient_id: patientId,
        medication_reminder_id: reminderId,
        scheduled_at: scheduledAt,
        taken_at: new Date().toISOString(),
        status: "taken",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true as const, data: data as MedicationIntakeLog };
  } catch (error) {
    void error;
    return { success: false as const, error, data: null };
  }
}

export async function getAdherence(patientId: string, days: number) {
  try {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 86400000);

    const { data, error } = await supabase
      .from("medication_intake_log")
      .select("status")
      .eq("patient_id", patientId)
      .gte("scheduled_at", startDate.toISOString())
      .lte("scheduled_at", endDate.toISOString());

    if (error) throw error;

    const logs = data || [];
    if (logs.length === 0) return { success: true as const, data: 0 };

    const taken = logs.filter((l) => l.status === "taken").length;
    const percentage = Math.round((taken / logs.length) * 100);

    return { success: true as const, data: percentage };
  } catch (error) {
    void error;
    return { success: false as const, error, data: 0 };
  }
}

// ─── Health Metrics ──────────────────────────────────────────────────────────

export async function getHealthMetricTypes() {
  try {
    const { data, error } = await supabase
      .from("health_metric_types")
      .select("*")
      .order("name");

    if (error) throw error;

    return { success: true as const, data: (data || []) as HealthMetricType[] };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] as HealthMetricType[] };
  }
}

export async function getHealthMetrics(
  patientId: string,
  metricTypeId: string,
  days: number,
) {
  try {
    const startDate = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await supabase
      .from("health_metrics")
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .eq("patient_id", patientId)
      .eq("metric_type_id", metricTypeId)
      .gte("measured_at", startDate)
      .order("measured_at", { ascending: true });

    if (error) throw error;

    return { success: true as const, data: (data || []) as HealthMetric[] };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] as HealthMetric[] };
  }
}

export async function getLatestMetrics(patientId: string) {
  try {
    // Get all metric types
    const { data: types, error: typesError } = await supabase
      .from("health_metric_types")
      .select("*")
      .order("name");

    if (typesError) throw typesError;

    // For each type, get the latest measurement
    const metricsWithLatest = await Promise.all(
      (types || []).map(async (metricType) => {
        const { data: latest } = await supabase
          .from("health_metrics")
          .select("*")
          .eq("patient_id", patientId)
          .eq("metric_type_id", metricType.id)
          .order("measured_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          metricType: metricType as HealthMetricType,
          latest: latest as HealthMetric | null,
        };
      }),
    );

    return { success: true as const, data: metricsWithLatest };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] };
  }
}

export async function logHealthMetric(
  patientId: string,
  metric: CreateHealthMetric,
) {
  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .insert({
        patient_id: patientId,
        metric_type_id: metric.metric_type_id,
        value: metric.value,
        measured_at: metric.measured_at,
        notes: metric.notes,
      })
      .select(`
        *,
        metric_type:health_metric_types(*)
      `)
      .single();

    if (error) throw error;

    return { success: true as const, data: data as HealthMetric };
  } catch (error) {
    void error;
    return { success: false as const, error, data: null };
  }
}

// ─── Health Goals ────────────────────────────────────────────────────────────

export async function getHealthGoals(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("health_goals")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true as const, data: (data || []) as HealthGoal[] };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] as HealthGoal[] };
  }
}

export async function createHealthGoal(
  patientId: string,
  goal: CreateHealthGoal,
) {
  try {
    const { data, error } = await supabase
      .from("health_goals")
      .insert({
        patient_id: patientId,
        description: goal.description,
        target_value: goal.target_value,
        current_value: goal.current_value || 0,
        unit: goal.unit,
        starts_at: goal.starts_at,
        target_date: goal.target_date,
        notes: goal.notes,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true as const, data: data as HealthGoal };
  } catch (error) {
    void error;
    return { success: false as const, error, data: null };
  }
}

export async function updateGoalProgress(
  goalId: string,
  currentValue: number,
) {
  try {
    const { data, error } = await supabase
      .from("health_goals")
      .update({ current_value: currentValue })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;

    return { success: true as const, data: data as HealthGoal };
  } catch (error) {
    void error;
    return { success: false as const, error, data: null };
  }
}

export async function completeGoal(goalId: string) {
  try {
    const { data, error } = await supabase
      .from("health_goals")
      .update({ status: "completed" })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;

    return { success: true as const, data: data as HealthGoal };
  } catch (error) {
    void error;
    return { success: false as const, error, data: null };
  }
}

// ─── Upcoming Appointments ───────────────────────────────────────────────────

export async function getUpcomingAppointments(_patientId: string, _limit = 3) {
  try {
    const res = await fetch("/api/appointments?status=confirmada");
    if (!res.ok) throw new Error("Failed to fetch appointments");
    const { data } = await res.json();

    // Filter to upcoming only and apply limit
    const now = new Date().toISOString();
    const upcoming = (data || [])
      .filter((a: Record<string, unknown>) => (a.scheduled_at as string) >= now)
      .slice(0, _limit);

    return { success: true as const, data: upcoming };
  } catch (error) {
    void error;
    return { success: false as const, error, data: [] };
  }
}
