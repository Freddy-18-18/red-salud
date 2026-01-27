/**
 * Queries para el sistema de recetas avanzado
 */

import { supabase } from '@/lib/supabase/client';
import {
  PrescriptionTemplate,
  DoctorSignature,
  PrescriptionScan,
  PrescriptionPrint,
  TemplateFilters,
  PrescriptionScanFilters,
  PrescriptionPrintFilters,
  ServiceResponse,
  PrescriptionExtended,
  PrescriptionDetailResponse,
  PatientDataSnapshot,
  MedicoDataSnapshot,
  PrescriptionMedication,
} from '../../types/prescriptions-advanced';

// ============================================================================
// TEMPLATE QUERIES
// ============================================================================

/**
 * Obtiene todos los templates disponibles para un médico
 */
export async function getDoctorTemplates(
  medicoId: string,
  filters?: TemplateFilters
): Promise<ServiceResponse<PrescriptionTemplate[]>> {
  try {
    let query = supabase
      .from('prescription_templates')
      .select('*')
      .or(`medico_id.eq.${medicoId},tipo.eq.sistema`)
      .eq('activo', true);

    // Aplicar filtros
    if (filters?.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    if (filters?.search) {
      query = query.or(`nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('es_predeterminado', { ascending: false })
      .order('usos_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getDoctorTemplates] Error:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Obtiene un template por ID
 */
export async function getTemplateById(
  templateId: string
): Promise<ServiceResponse<PrescriptionTemplate>> {
  try {
    const { data, error } = await supabase
      .from('prescription_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[getTemplateById] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Obtiene templates del sistema
 */
export async function getSystemTemplates(
  categoria?: string
): Promise<ServiceResponse<PrescriptionTemplate[]>> {
  try {
    let query = supabase
      .from('prescription_templates')
      .select('*')
      .eq('tipo', 'sistema')
      .eq('activo', true);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query.order('nombre', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getSystemTemplates] Error:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Obtiene templates personalizados de un médico
 */
export async function getCustomTemplates(
  medicoId: string
): Promise<ServiceResponse<PrescriptionTemplate[]>> {
  try {
    const { data, error } = await supabase
      .from('prescription_templates')
      .select('*')
      .eq('medico_id', medicoId)
      .eq('tipo', 'personalizado')
      .eq('activo', true)
      .order('usos_count', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getCustomTemplates] Error:', error);
    return { success: false, error, data: [] };
  }
}

// ============================================================================
// SIGNATURE QUERIES
// ============================================================================

/**
 * Obtiene la firma activa de un médico
 */
export async function getDoctorActiveSignature(
  medicoId: string
): Promise<ServiceResponse<DoctorSignature>> {
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
    console.error('[getDoctorActiveSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Obtiene todas las firmas de un médico
 */
export async function getDoctorSignatures(
  medicoId: string
): Promise<ServiceResponse<DoctorSignature[]>> {
  try {
    const { data, error } = await supabase
      .from('doctor_signatures')
      .select('*')
      .eq('medico_id', medicoId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getDoctorSignatures] Error:', error);
    return { success: false, error, data: [] };
  }
}

// ============================================================================
// SCAN QUERIES
// ============================================================================

/**
 * Obtiene escaneos de un médico
 */
export async function getDoctorScans(
  medicoId: string,
  filters?: PrescriptionScanFilters
): Promise<ServiceResponse<PrescriptionScan[]>> {
  try {
    let query = supabase
      .from('prescription_scans')
      .select('*')
      .eq('medico_id', medicoId);

    // Aplicar filtros
    if (filters?.procesada !== undefined) {
      query = query.eq('procesada', filters.procesada);
    }

    if (filters?.paciente_id) {
      query = query.eq('paciente_id', filters.paciente_id);
    }

    const { data, error } = await query.order('fecha_escaneo', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getDoctorScans] Error:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Obtiene un escaneo por ID
 */
export async function getScanById(
  scanId: string
): Promise<ServiceResponse<PrescriptionScan>> {
  try {
    const { data, error } = await supabase
      .from('prescription_scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[getScanById] Error:', error);
    return { success: false, error, data: undefined };
  }
}

// ============================================================================
// PRESCRIPTION QUERIES (EXTENDED)
// ============================================================================

/**
 * Obtiene recetas con información extendida (template, firma, etc.)
 */
export async function getPrescriptionsExtended(
  medicoId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ServiceResponse<PrescriptionExtended[]>> {
  try {
    const { data, error } = await supabase
      .from('farmacia_recetas')
      .select(`
        *,
        prescription_templates(id, nombre, tipo, layout_config, custom_styles),
        doctor_signatures(id, firma_url, firma_type)
      `)
      .eq('medico_id', medicoId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data: (data as PrescriptionExtended[]) || [] };
  } catch (error) {
    console.error('[getPrescriptionsExtended] Error:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Obtiene detalle completo de una receta
 */
export async function getPrescriptionDetail(
  prescriptionId: string
): Promise<ServiceResponse<PrescriptionDetailResponse>> {
  try {
    const { data, error } = await supabase
      .from('farmacia_recetas')
      .select(`
        *,
        prescription_templates(*),
        doctor_signatures(*),
        prescription_scans(*)
      `)
      .eq('id', prescriptionId)
      .single();

    if (error) throw error;

    // TODO: Cargar datos del paciente y médico si están en snapshot
    const prescription = data as PrescriptionExtended;

    return {
      success: true,
      data: {
        prescription,
        template: prescription.template_id ? data.prescription_templates : undefined,
        signature: prescription.signature_id ? data.doctor_signatures : undefined,
        scan: data.prescription_scans || undefined,
        medications: prescription.medicamentos as PrescriptionMedication[],
        patient: prescription.paciente_data as PatientDataSnapshot,
        doctor: prescription.medico_data as MedicoDataSnapshot,
      },
    };
  } catch (error) {
    console.error('[getPrescriptionDetail] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Obtiene recetas por paciente
 */
export async function getPatientPrescriptionsExtended(
  pacienteId: string,
  medicoId: string,
  limit: number = 20
): Promise<ServiceResponse<PrescriptionExtended[]>> {
  try {
    const { data, error } = await supabase
      .from('farmacia_recetas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('medico_id', medicoId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data as PrescriptionExtended[]) || [] };
  } catch (error) {
    console.error('[getPatientPrescriptionsExtended] Error:', error);
    return { success: false, error, data: [] };
  }
}

// ============================================================================
// PRINT QUERIES
// ============================================================================

/**
 * Obtiene historial de impresiones de un médico
 */
export async function getDoctorPrintHistory(
  medicoId: string,
  filters?: PrescriptionPrintFilters,
  limit: number = 50
): Promise<ServiceResponse<PrescriptionPrint[]>> {
  try {
    let query = supabase
      .from('prescription_prints')
      .select('*')
      .eq('medico_id', medicoId);

    // Aplicar filtros
    if (filters?.template_id) {
      query = query.eq('template_id', filters.template_id);
    }

    if (filters?.formato) {
      query = query.eq('formato', filters.formato);
    }

    if (filters?.fecha_desde) {
      query = query.gte('fecha_impresion', filters.fecha_desde.toISOString());
    }

    if (filters?.fecha_hasta) {
      query = query.lte('fecha_impresion', filters.fecha_hasta.toISOString());
    }

    const { data, error } = await query
      .order('fecha_impresion', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[getDoctorPrintHistory] Error:', error);
    return { success: false, error, data: [] };
  }
}

/**
 * Obtiene estadísticas de impresiones
 */
export async function getPrintStatistics(
  medicoId: string,
  fechaDesde?: Date,
  fechaHasta?: Date
): Promise<ServiceResponse<{
  total: number;
  por_template: Record<string, number>;
  por_formato: Record<string, number>;
}>> {
  try {
    let query = supabase
      .from('prescription_prints')
      .select('*')
      .eq('medico_id', medicoId);

    if (fechaDesde) {
      query = query.gte('fecha_impresion', fechaDesde.toISOString());
    }

    if (fechaHasta) {
      query = query.lte('fecha_impresion', fechaHasta.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calcular estadísticas
    const total = data?.length || 0;
    const por_template: Record<string, number> = {};
    const por_formato: Record<string, number> = {};

    data?.forEach((print) => {
      if (print.template_id) {
        por_template[print.template_id] = (por_template[print.template_id] || 0) + 1;
      }
      por_formato[print.formato] = (por_formato[print.formato] || 0) + 1;
    });

    return {
      success: true,
      data: { total, por_template, por_formato },
    };
  } catch (error) {
    console.error('[getPrintStatistics] Error:', error);
    return { success: false, error, data: undefined };
  }
}
