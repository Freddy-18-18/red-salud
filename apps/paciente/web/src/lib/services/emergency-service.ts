import { supabase } from "@/lib/supabase/client";

// --- Types ---

export type EmergencyPriority = "red" | "yellow" | "green";

export type EmergencyStatus =
  | "requesting"
  | "dispatched"
  | "en_route"
  | "on_scene"
  | "transporting"
  | "completed"
  | "cancelled";

export interface EmergencyLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface EmergencyRequest {
  id: string;
  patient_id: string;
  family_member_id?: string | null;
  priority: EmergencyPriority;
  location_lat: number;
  location_lng: number;
  location_address: string;
  symptoms: string;
  medical_summary: MedicalSummary | null;
  ambulance_id?: string | null;
  status: EmergencyStatus;
  dispatched_at?: string | null;
  arrived_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MedicalSummary {
  nombre_completo: string;
  edad: number | null;
  grupo_sanguineo: string | null;
  alergias: string[];
  medicamentos_actuales: string | null;
  enfermedades_cronicas: string[];
  contacto_emergencia: {
    nombre: string | null;
    telefono: string | null;
    relacion: string | null;
  };
}

export interface FamilyMember {
  id: string;
  nombre_completo: string;
  parentesco: string;
  fecha_nacimiento?: string | null;
  grupo_sanguineo?: string | null;
  alergias?: string[] | null;
  enfermedades_cronicas?: string[] | null;
  medicamentos_actuales?: string | null;
}

export interface CreateEmergencyData {
  patientId: string;
  familyMemberId?: string;
  priority: EmergencyPriority;
  location: EmergencyLocation;
  symptoms: string;
}

// --- Service Functions ---

/**
 * Build medical summary for paramedics from the patient's profile data.
 */
export async function getMedicalSummary(
  patientId: string
): Promise<{ success: boolean; data: MedicalSummary | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("nombre_completo, fecha_nacimiento")
      .eq("id", patientId)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: medical } = await supabase
      .from("patient_details")
      .select(
        "grupo_sanguineo, alergias, medicamentos_actuales, enfermedades_cronicas, contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion"
      )
      .eq("profile_id", patientId)
      .maybeSingle();

    let edad: number | null = null;
    if (profile?.fecha_nacimiento) {
      const birth = new Date(profile.fecha_nacimiento);
      const now = new Date();
      edad = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        edad--;
      }
    }

    const summary: MedicalSummary = {
      nombre_completo: profile?.nombre_completo || "Desconocido",
      edad,
      grupo_sanguineo: medical?.grupo_sanguineo || null,
      alergias: medical?.alergias || [],
      medicamentos_actuales: medical?.medicamentos_actuales || null,
      enfermedades_cronicas: medical?.enfermedades_cronicas || [],
      contacto_emergencia: {
        nombre: medical?.contacto_emergencia_nombre || null,
        telefono: medical?.contacto_emergencia_telefono || null,
        relacion: medical?.contacto_emergencia_relacion || null,
      },
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error building medical summary:", error);
    return { success: false, data: null };
  }
}

/**
 * Build medical summary for a family member.
 */
export async function getFamilyMemberMedicalSummary(
  familyMemberId: string
): Promise<{ success: boolean; data: MedicalSummary | null }> {
  try {
    const { data: member, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("id", familyMemberId)
      .maybeSingle();

    if (error) throw error;
    if (!member) return { success: false, data: null };

    let edad: number | null = null;
    if (member.fecha_nacimiento) {
      const birth = new Date(member.fecha_nacimiento);
      const now = new Date();
      edad = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        edad--;
      }
    }

    const summary: MedicalSummary = {
      nombre_completo: member.nombre_completo || "Familiar",
      edad,
      grupo_sanguineo: member.grupo_sanguineo || null,
      alergias: member.alergias || [],
      medicamentos_actuales: member.medicamentos_actuales || null,
      enfermedades_cronicas: member.enfermedades_cronicas || [],
      contacto_emergencia: {
        nombre: null,
        telefono: null,
        relacion: member.parentesco || null,
      },
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error building family member medical summary:", error);
    return { success: false, data: null };
  }
}

/**
 * Create a new emergency request with auto-attached medical summary.
 */
export async function createEmergencyRequest(
  data: CreateEmergencyData
): Promise<{ success: boolean; data: EmergencyRequest | null; error?: unknown }> {
  try {
    // Build medical summary based on who needs help
    const summaryResult = data.familyMemberId
      ? await getFamilyMemberMedicalSummary(data.familyMemberId)
      : await getMedicalSummary(data.patientId);

    const { data: request, error } = await supabase
      .from("emergency_requests")
      .insert({
        patient_id: data.patientId,
        family_member_id: data.familyMemberId || null,
        priority: data.priority,
        location_lat: data.location.lat,
        location_lng: data.location.lng,
        location_address: data.location.address,
        symptoms: data.symptoms,
        medical_summary: summaryResult.data,
        status: "requesting" as EmergencyStatus,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: data.patientId,
      activity_type: "emergency_request",
      description: `Emergencia ${data.priority}: ${data.symptoms.slice(0, 100)}`,
      status: "success",
    });

    return { success: true, data: request as EmergencyRequest };
  } catch (error) {
    console.error("Error creating emergency request:", error);
    return { success: false, data: null, error };
  }
}

/**
 * Get current status of an emergency request.
 */
export async function getRequestStatus(
  requestId: string
): Promise<{ success: boolean; data: EmergencyRequest | null }> {
  try {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data: data as EmergencyRequest | null };
  } catch (error) {
    console.error("Error fetching emergency status:", error);
    return { success: false, data: null };
  }
}

/**
 * Cancel an active emergency request (with status guard).
 */
export async function cancelEmergencyRequest(
  requestId: string,
  patientId: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const { error } = await supabase
      .from("emergency_requests")
      .update({
        status: "cancelled" as EmergencyStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("patient_id", patientId)
      .in("status", ["requesting", "dispatched", "en_route"]);

    if (error) throw error;

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "emergency_cancelled",
      description: `Emergencia cancelada: ${requestId}`,
      status: "success",
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling emergency request:", error);
    return { success: false, error };
  }
}

/**
 * Get past emergency requests for a patient.
 */
export async function getEmergencyHistory(
  patientId: string
): Promise<{ success: boolean; data: EmergencyRequest[] }> {
  try {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: (data || []) as EmergencyRequest[] };
  } catch (error) {
    console.error("Error fetching emergency history:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get patient's family members for the "who needs help?" step.
 */
export async function getFamilyMembers(
  patientId: string
): Promise<{ success: boolean; data: FamilyMember[] }> {
  try {
    const { data, error } = await supabase
      .from("family_members")
      .select("id, nombre_completo, parentesco, fecha_nacimiento, grupo_sanguineo, alergias, enfermedades_cronicas, medicamentos_actuales")
      .eq("patient_id", patientId)
      .order("nombre_completo");

    if (error) throw error;

    return { success: true, data: (data || []) as FamilyMember[] };
  } catch (error) {
    console.error("Error fetching family members:", error);
    return { success: false, data: [] };
  }
}

/**
 * Subscribe to realtime status updates on an emergency request.
 * Returns an unsubscribe function.
 */
export function subscribeToEmergencyStatus(
  requestId: string,
  onUpdate: (request: EmergencyRequest) => void
) {
  const channel = supabase
    .channel(`emergency:${requestId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "emergency_requests",
        filter: `id=eq.${requestId}`,
      },
      (payload) => {
        onUpdate(payload.new as EmergencyRequest);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
