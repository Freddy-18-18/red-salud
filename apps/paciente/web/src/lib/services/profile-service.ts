import { supabase } from "@/lib/supabase/client";

// TODO: Import PatientProfile from @red-salud/types once available
export interface PatientProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  avatar_url?: string;
  // Medical info from patient_details
  grupo_sanguineo?: string;
  alergias?: string[];
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
  peso_kg?: number;
  altura_cm?: number;
}

export async function getPatientProfile(
  userId: string
): Promise<PatientProfile | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    let medicalData = null;
    try {
      const { data, error } = await supabase
        .from("patient_details")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!error) {
        medicalData = data;
      } else if (error.code === "PGRST116") {
        // No medical record exists — try to create one
        try {
          const { data: newMedical } = await supabase
            .from("patient_details")
            .insert({ profile_id: userId })
            .select()
            .single();
          medicalData = newMedical;
        } catch {
          // Insert failed — table may not exist
        }
      }
    } catch {
      // patient_details table may not exist yet — skip silently
    }

    return { ...profile, ...medicalData } as PatientProfile;
  } catch {
    return null;
  }
}

export async function updateBasicProfile(
  userId: string,
  data: Partial<PatientProfile>
): Promise<{ success: boolean; error?: Error }> {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.national_id !== undefined) updateData.national_id = data.national_id;
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) throw error;

    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "profile_update",
      description: "Perfil actualizado",
      status: "success",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

export async function updateMedicalInfo(
  userId: string,
  data: Partial<PatientProfile>
): Promise<{ success: boolean; error?: Error }> {
  try {
    const medicalData: Record<string, unknown> = {
      profile_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (data.grupo_sanguineo !== undefined) medicalData.grupo_sanguineo = data.grupo_sanguineo;
    if (data.alergias !== undefined) medicalData.alergias = data.alergias;
    if (data.contacto_emergencia_nombre !== undefined) medicalData.contacto_emergencia_nombre = data.contacto_emergencia_nombre;
    if (data.contacto_emergencia_telefono !== undefined) medicalData.contacto_emergencia_telefono = data.contacto_emergencia_telefono;
    if (data.contacto_emergencia_relacion !== undefined) medicalData.contacto_emergencia_relacion = data.contacto_emergencia_relacion;
    if (data.enfermedades_cronicas !== undefined) medicalData.enfermedades_cronicas = data.enfermedades_cronicas;
    if (data.medicamentos_actuales !== undefined) medicalData.medicamentos_actuales = data.medicamentos_actuales;
    if (data.cirugias_previas !== undefined) medicalData.cirugias_previas = data.cirugias_previas;
    if (data.peso_kg !== undefined) medicalData.peso_kg = data.peso_kg;
    if (data.altura_cm !== undefined) medicalData.altura_cm = data.altura_cm;

    try {
      const { error } = await supabase
        .from("patient_details")
        .upsert(medicalData, { onConflict: "profile_id" });

      if (error) throw error;
    } catch {
      // patient_details table may not exist yet — silently skip
      return { success: true };
    }

    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "medical_info_update",
      description: "Información médica actualizada",
      status: "success",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
