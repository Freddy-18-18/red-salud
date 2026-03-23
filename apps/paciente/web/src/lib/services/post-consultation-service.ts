import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type ActionType =
  | "prescription"
  | "lab_order"
  | "referral"
  | "follow_up"
  | "care_instructions";

export type ActionStatus = "pending" | "viewed" | "in_progress" | "completed";

export interface PrescriptionActionData {
  prescription_id: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration_days?: number;
    quantity?: string;
  }[];
  diagnosis?: string;
  general_instructions?: string;
}

export interface LabOrderActionData {
  tests: {
    name: string;
    code?: string;
    notes?: string;
  }[];
  urgency: "routine" | "urgent";
  fasting_required?: boolean;
  instructions?: string;
}

export interface ReferralActionData {
  specialty: string;
  doctor_name?: string;
  reason: string;
  urgency: "routine" | "urgent";
}

export interface FollowUpActionData {
  suggested_days: number;
  reason: string;
  notes?: string;
}

export interface CareInstructionsActionData {
  instructions: string;
  category?: string;
}

export type ActionData =
  | PrescriptionActionData
  | LabOrderActionData
  | ReferralActionData
  | FollowUpActionData
  | CareInstructionsActionData;

export interface PostConsultationAction {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  medical_record_id?: string;
  action_type: ActionType;
  action_data: ActionData;
  status: ActionStatus;
  created_at: string;
  updated_at: string;
  doctor?: {
    nombre_completo?: string;
    avatar_url?: string;
  };
  appointment?: {
    appointment_date: string;
    appointment_time: string;
    specialty?: string;
  };
}

export interface PostConsultationSummary {
  appointment_id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  actions: PostConsultationAction[];
}

// ─── Service ─────────────────────────────────────────────────────────

export async function getPostConsultationActions(
  patientId: string
): Promise<{ success: boolean; data: PostConsultationAction[]; error?: unknown }> {
  try {
    const { data, error } = await supabase
      .from("post_consultation_actions")
      .select(`
        *,
        doctor:profiles!post_consultation_actions_doctor_id_fkey(
          nombre_completo, avatar_url
        ),
        appointment:appointments!post_consultation_actions_appointment_id_fkey(
          appointment_date, appointment_time, specialty
        )
      `)
      .eq("patient_id", patientId)
      .in("status", ["pending", "viewed", "in_progress"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: (data || []) as PostConsultationAction[] };
  } catch (error) {
    console.error("Error fetching post-consultation actions:", error);
    return { success: false, data: [], error };
  }
}

export async function getActionsByAppointment(
  appointmentId: string
): Promise<{ success: boolean; data: PostConsultationAction[]; error?: unknown }> {
  try {
    const { data, error } = await supabase
      .from("post_consultation_actions")
      .select(`
        *,
        doctor:profiles!post_consultation_actions_doctor_id_fkey(
          nombre_completo, avatar_url
        ),
        appointment:appointments!post_consultation_actions_appointment_id_fkey(
          appointment_date, appointment_time, specialty
        )
      `)
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: (data || []) as PostConsultationAction[] };
  } catch (error) {
    console.error("Error fetching actions by appointment:", error);
    return { success: false, data: [], error };
  }
}

export async function getPostConsultationSummaries(
  patientId: string
): Promise<{ success: boolean; data: PostConsultationSummary[]; error?: unknown }> {
  try {
    const result = await getPostConsultationActions(patientId);
    if (!result.success) return { success: false, data: [], error: result.error };

    // Group actions by appointment
    const grouped = new Map<string, PostConsultationAction[]>();
    for (const action of result.data) {
      const key = action.appointment_id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(action);
    }

    const summaries: PostConsultationSummary[] = [];
    for (const [appointmentId, actions] of grouped) {
      const first = actions[0];
      summaries.push({
        appointment_id: appointmentId,
        doctor_name: first.doctor?.nombre_completo || "Medico",
        specialty: first.appointment?.specialty || "",
        date: first.appointment?.appointment_date || "",
        time: first.appointment?.appointment_time || "",
        actions,
      });
    }

    // Sort by most recent first
    summaries.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return { success: true, data: summaries };
  } catch (error) {
    console.error("Error fetching post-consultation summaries:", error);
    return { success: false, data: [], error };
  }
}

export async function markActionViewed(
  actionId: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const { error } = await supabase
      .from("post_consultation_actions")
      .update({
        status: "viewed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionId)
      .eq("status", "pending");

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking action as viewed:", error);
    return { success: false, error };
  }
}

export async function markActionCompleted(
  actionId: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const { error } = await supabase
      .from("post_consultation_actions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking action as completed:", error);
    return { success: false, error };
  }
}

export async function getPendingActionsCount(
  patientId: string
): Promise<{ success: boolean; data: number; error?: unknown }> {
  try {
    const { count, error } = await supabase
      .from("post_consultation_actions")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .in("status", ["pending", "viewed", "in_progress"]);

    if (error) throw error;

    return { success: true, data: count || 0 };
  } catch (error) {
    console.error("Error fetching pending actions count:", error);
    return { success: false, data: 0, error };
  }
}
