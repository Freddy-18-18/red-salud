import { supabase } from "@/lib/supabase/client";

// TODO: Import PatientProfile from @red-salud/types once available
export interface PatientProfile {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
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

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    const { data: medicalData, error: medicalError } = await supabase
      .from("patient_details")
      .select("*")
      .eq("profile_id", userId)
      .maybeSingle();

    if (medicalError && medicalError.code === "PGRST116") {
      // No medical record exists, create one
      const { data: newMedical, error: insertError } = await supabase
        .from("patient_details")
        .insert({ profile_id: userId })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating patient_details:", insertError);
      }

      return { ...profile, ...newMedical } as PatientProfile;
    }

    if (medicalError) {
      console.error("Error fetching medical data:", medicalError);
    }

    return { ...profile, ...medicalData } as PatientProfile;
  } catch (error) {
    console.error("Error in getPatientProfile:", error);
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

    if (data.nombre_completo !== undefined) updateData.nombre_completo = data.nombre_completo;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.cedula !== undefined) updateData.cedula = data.cedula;
    if (data.fecha_nacimiento !== undefined) updateData.fecha_nacimiento = data.fecha_nacimiento;
    if (data.direccion !== undefined) updateData.direccion = data.direccion;
    if (data.ciudad !== undefined) updateData.ciudad = data.ciudad;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.codigo_postal !== undefined) updateData.codigo_postal = data.codigo_postal;

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
    console.error("Error updating basic profile:", error);
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

    const { error } = await supabase
      .from("patient_details")
      .upsert(medicalData, { onConflict: "profile_id" });

    if (error) throw error;

    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "medical_info_update",
      description: "Información médica actualizada",
      status: "success",
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating medical info:", error);
    return { success: false, error: error as Error };
  }
}
