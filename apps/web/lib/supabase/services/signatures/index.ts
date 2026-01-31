/**
 * Servicio de Firmas Digitales
 * Manejo de firmas digitales de médicos
 */

import { supabase } from '@/lib/supabase/client';
import { DoctorSignature, CreateDoctorSignatureInput, UpdateDoctorSignatureInput, ServiceResponse } from '@/lib/supabase/types/prescriptions-advanced';

// ============================================================================
// SIGNATURE QUERIES
// ============================================================================

/**
 * Obtiene la firma activa de un médico
 */
export async function getActiveSignature(medicoId: string): Promise<ServiceResponse<DoctorSignature>> {
  try {
    const { data, error } = await supabase
      .from('doctor_signatures')
      .select('*')
      .eq('medico_id', medicoId)
      .eq('activa', true)
      .order('fecha_creacion', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[getActiveSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Obtiene todas las firmas de un médico
 */
export async function getAllSignatures(medicoId: string): Promise<ServiceResponse<DoctorSignature[]>> {
  try {
    const { data, error } = await supabase
      .from('doctor_signatures')
      .select('*')
      .eq('medico_id', medicoId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getAllSignatures] Error:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Obtiene una firma por ID
 */
export async function getSignatureById(signatureId: string): Promise<ServiceResponse<DoctorSignature>> {
  try {
    const { data, error } = await supabase
      .from('doctor_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[getSignatureById] Error:', error);
    return { success: false, error, data: undefined };
  }
}

// ============================================================================
// SIGNATURE MUTATIONS
// ============================================================================

/**
 * Crea una nueva firma digital
 * Nota: Esto desactiva automáticamente todas las firmas anteriores del médico
 */
export async function createSignature(
  medicoId: string,
  input: CreateDoctorSignatureInput
): Promise<ServiceResponse<DoctorSignature>> {
  try {
    // Primero, desactivar todas las firmas anteriores
    await supabase
      .from('doctor_signatures')
      .update({ activa: false })
      .eq('medico_id', medicoId);

    // Crear nueva firma
    const { data, error } = await supabase
      .from('doctor_signatures')
      .insert({
        medico_id: medicoId,
        firma_url: input.firma_url || null,
        firma_type: input.firma_type,
        firma_data: input.firma_data || null,
        es_firma_autografa: input.es_firma_autografa || false,
        activa: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[createSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Actualiza una firma existente
 */
export async function updateSignature(
  signatureId: string,
  medicoId: string,
  input: UpdateDoctorSignatureInput
): Promise<ServiceResponse<DoctorSignature>> {
  try {
    // Verificar que la firma pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('doctor_signatures')
      .select('medico_id')
      .eq('id', signatureId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Firma no encontrada');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para editar esta firma');
    }

    // Actualizar firma
    const updateData: any = {};

    if (input.firma_url !== undefined) updateData.firma_url = input.firma_url;
    if (input.firma_type !== undefined) updateData.firma_type = input.firma_type;
    if (input.firma_data !== undefined) updateData.firma_data = input.firma_data;
    if (input.es_firma_autografa !== undefined) updateData.es_firma_autografa = input.es_firma_autografa;

    // Si se está activando, desactivar las demás
    if (input.activa) {
      updateData.activa = true;
      await supabase
        .from('doctor_signatures')
        .update({ activa: false })
        .eq('medico_id', medicoId)
        .neq('id', signatureId);
    } else if (input.activa === false) {
      updateData.activa = false;
    }

    const { data, error } = await supabase
      .from('doctor_signatures')
      .update(updateData)
      .eq('id', signatureId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[updateSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Activa una firma específica y desactiva las demás
 */
export async function activateSignature(
  signatureId: string,
  medicoId: string
): Promise<ServiceResponse<DoctorSignature>> {
  try {
    // Verificar que la firma pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('doctor_signatures')
      .select('medico_id')
      .eq('id', signatureId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Firma no encontrada');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para activar esta firma');
    }

    // Desactivar todas las firmas
    await supabase
      .from('doctor_signatures')
      .update({ activa: false })
      .eq('medico_id', medicoId);

    // Activar la firma seleccionada
    const { data, error } = await supabase
      .from('doctor_signatures')
      .update({ activa: true })
      .eq('id', signatureId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[activateSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Elimina una firma
 */
export async function deleteSignature(
  signatureId: string,
  medicoId: string
): Promise<ServiceResponse<void>> {
  try {
    // Verificar que la firma pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('doctor_signatures')
      .select('medico_id, activa')
      .eq('id', signatureId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Firma no encontrada');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para eliminar esta firma');
    }

    // Eliminar firma
    const { error } = await supabase
      .from('doctor_signatures')
      .delete()
      .eq('id', signatureId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[deleteSignature] Error:', error);
    return { success: false, error };
  }
}

// ============================================================================
// SIGNATURE UTILITIES
// ============================================================================

/**
 * Verifica si un médico tiene una firma activa
 */
export async function hasActiveSignature(medicoId: string): Promise<boolean> {
  const result = await getActiveSignature(medicoId);
  return result.data !== null;
}

/**
 * Obtiene la URL de la firma activa de un médico
 */
export async function getActiveSignatureUrl(medicoId: string): Promise<string | null> {
  const result = await getActiveSignature(medicoId);
  return result.data?.firma_url || null;
}

/**
 * Convierte una firma capturada (canvas) a base64
 */
export function canvasToSignatureDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * Convierte una firma capturada (canvas) a SVG
 */
export function canvasToSignatureSvg(canvas: HTMLCanvasElement): string {
  const dataUrl = canvas.toDataURL('image/png');
  // Simplificado - en producción usar una librería de conversión real
  return `<svg xmlns="http://www.w3.org/2000/svg"><image href="${dataUrl}" /></svg>`;
}

