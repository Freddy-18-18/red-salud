/**
 * Sistema de permisos para secretarias médicas
 * Proporciona funciones para verificar y gestionar permisos
 */

import { supabase } from "@/lib/supabase/client";
import type { SecretaryPermissions, DoctorSecretaryRelation } from "@/lib/types/secretary";

/**
 * Obtiene la relación médico-secretaria activa
 */
export async function getSecretaryRelation(
  secretaryId: string,
  doctorId: string
): Promise<DoctorSecretaryRelation | null> {
  const { data, error } = await supabase
    .from("doctor_secretaries")
    .select("*")
    .eq("secretary_id", secretaryId)
    .eq("doctor_id", doctorId)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return null;
  }

  return data as DoctorSecretaryRelation;
}

/**
 * Obtiene todos los médicos vinculados a una secretaria
 */
export async function getSecretaryDoctors(secretaryId: string) {
  const { data, error } = await supabase
    .from("doctor_secretary_relationships")
    .select("*")
    .eq("secretary_id", secretaryId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching secretary doctors:", error);
    return [];
  }

  return data || [];
}

/**
 * Verifica si una secretaria tiene un permiso específico
 */
export async function checkSecretaryPermission(
  secretaryId: string,
  doctorId: string,
  permission: keyof SecretaryPermissions
): Promise<boolean> {
  const relation = await getSecretaryRelation(secretaryId, doctorId);
  
  if (!relation || relation.status !== "active") {
    return false;
  }

  return relation.permissions[permission] === true;
}

/**
 * Verifica múltiples permisos a la vez
 */
export async function checkSecretaryPermissions(
  secretaryId: string,
  doctorId: string,
  permissions: Array<keyof SecretaryPermissions>
): Promise<Record<keyof SecretaryPermissions, boolean>> {
  const relation = await getSecretaryRelation(secretaryId, doctorId);
  
  const result: any = {};
  
  if (!relation || relation.status !== "active") {
    permissions.forEach(perm => {
      result[perm] = false;
    });
    return result;
  }

  permissions.forEach(perm => {
    result[perm] = relation.permissions[perm] === true;
  });

  return result;
}

/**
 * Actualiza los permisos de una secretaria (solo médicos)
 */
export async function updateSecretaryPermissions(
  doctorId: string,
  secretaryId: string,
  permissions: Partial<SecretaryPermissions>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("doctor_secretaries")
    .update({ permissions })
    .eq("doctor_id", doctorId)
    .eq("secretary_id", secretaryId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Cambia el estado de una secretaria (activar/desactivar/suspender)
 */
export async function updateSecretaryStatus(
  doctorId: string,
  secretaryId: string,
  status: 'active' | 'inactive' | 'suspended'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("doctor_secretaries")
    .update({ status })
    .eq("doctor_id", doctorId)
    .eq("secretary_id", secretaryId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Agrega una nueva secretaria a un médico
 */
export async function addSecretary(
  doctorId: string,
  secretaryEmail: string,
  permissions?: Partial<SecretaryPermissions>
): Promise<{ success: boolean; error?: string }> {
  // Buscar el perfil de la secretaria por email
  const { data: secretaryProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", secretaryEmail)
    .eq("role", "secretaria")
    .single();

  if (profileError || !secretaryProfile) {
    return { 
      success: false, 
      error: "No se encontró una secretaria con ese email" 
    };
  }

  // Crear la relación
  const { error: insertError } = await supabase
    .from("doctor_secretaries")
    .insert({
      doctor_id: doctorId,
      secretary_id: secretaryProfile.id,
      permissions: permissions || undefined,
      status: "active",
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return { 
        success: false, 
        error: "Esta secretaria ya está vinculada a tu cuenta" 
      };
    }
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

/**
 * Elimina una secretaria de un médico
 */
export async function removeSecretary(
  doctorId: string,
  secretaryId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("doctor_secretaries")
    .delete()
    .eq("doctor_id", doctorId)
    .eq("secretary_id", secretaryId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
