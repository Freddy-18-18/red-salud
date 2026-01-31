import { supabase } from "../client";
import { logActivity } from "./activity-service";

export interface PatientProfile {
  // Datos básicos del perfil
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
  
  // Campos CNE
  cne_estado?: string;
  cne_municipio?: string;
  cne_parroquia?: string;
  cne_centro_electoral?: string;
  rif?: string;
  nacionalidad?: string;
  primer_nombre?: string;
  segundo_nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  
  // Verificación
  cedula_verificada?: boolean;
  cedula_photo_verified?: boolean;
  cedula_photo_verified_at?: string;
  didit_request_id?: string;
  profile_locked?: boolean;
  
  // Información médica (de patient_details)
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
    // Obtener datos del perfil principal
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Obtener datos médicos del paciente
    const { data: medicalData, error: medicalError } = await supabase
      .from("patient_details")
      .select("*")
      .eq("profile_id", userId)
      .single();

    // Si no existe registro médico, crear uno vacío
    if (medicalError && medicalError.code === "PGRST116") {
      const { data: newMedical, error: insertError } = await supabase
        .from("patient_details")
        .insert({
          profile_id: userId,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating patient_details:", insertError);
      }

      return {
        ...profile,
        ...newMedical,
      };
    }

    if (medicalError) {
      console.error("Error fetching medical data:", medicalError);
    }

    // Combinar datos del perfil y médicos
    return {
      ...profile,
      ...medicalData,
    };
  } catch (error) {
    console.error("Error in getPatientProfile:", error);
    return null;
  }
}

export async function updateBasicProfile(
  userId: string,
  data: Partial<PatientProfile>
) {
  try {
    // Preparar datos para actualizar
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Solo incluir campos que están presentes en data
    if (data.nombre_completo !== undefined) updateData.nombre_completo = data.nombre_completo;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.cedula !== undefined) updateData.cedula = data.cedula;
    if (data.fecha_nacimiento !== undefined) updateData.fecha_nacimiento = data.fecha_nacimiento;
    if (data.direccion !== undefined) updateData.direccion = data.direccion;
    if (data.ciudad !== undefined) updateData.ciudad = data.ciudad;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.codigo_postal !== undefined) updateData.codigo_postal = data.codigo_postal;
    
    // Campos CNE
    if (data.cne_estado !== undefined) updateData.cne_estado = data.cne_estado;
    if (data.cne_municipio !== undefined) updateData.cne_municipio = data.cne_municipio;
    if (data.cne_parroquia !== undefined) updateData.cne_parroquia = data.cne_parroquia;
    if (data.cne_centro_electoral !== undefined) updateData.cne_centro_electoral = data.cne_centro_electoral;
    if (data.rif !== undefined) updateData.rif = data.rif;
    if (data.nacionalidad !== undefined) updateData.nacionalidad = data.nacionalidad;
    if (data.primer_nombre !== undefined) updateData.primer_nombre = data.primer_nombre;
    if (data.segundo_nombre !== undefined) updateData.segundo_nombre = data.segundo_nombre;
    if (data.primer_apellido !== undefined) updateData.primer_apellido = data.primer_apellido;
    if (data.segundo_apellido !== undefined) updateData.segundo_apellido = data.segundo_apellido;
    
    // Verificación
    if (data.cedula_verificada !== undefined) updateData.cedula_verificada = data.cedula_verificada;
    if (data.cedula_photo_verified !== undefined) updateData.cedula_photo_verified = data.cedula_photo_verified;
    if (data.cedula_photo_verified_at !== undefined) updateData.cedula_photo_verified_at = data.cedula_photo_verified_at;
    if (data.didit_request_id !== undefined) updateData.didit_request_id = data.didit_request_id;
    if (data.profile_locked !== undefined) updateData.profile_locked = data.profile_locked;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) throw error;

    await logActivity(userId, "profile_update", "Perfil actualizado");

    return { success: true };
  } catch (error) {
    console.error("Error updating basic profile:", error);
    return { success: false, error };
  }
}

export async function updateMedicalInfo(
  userId: string,
  data: Partial<PatientProfile>
) {
  try {
    // Preparar datos médicos
    const medicalData: any = {
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
      .upsert(medicalData, {
        onConflict: "profile_id",
      });

    if (error) throw error;

    await logActivity(
      userId,
      "medical_info_update",
      "Información médica actualizada"
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating medical info:", error);
    return { success: false, error };
  }
}

// Función para actualizar avatar
export async function updateAvatar(userId: string, avatarUrl: string) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    await logActivity(userId, "avatar_update", "Avatar actualizado");

    return { success: true };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { success: false, error };
  }
}
