/**
 * Mutations para el sistema de recetas avanzado
 */

import { supabase } from '@/lib/supabase/client';
import {
  PrescriptionTemplate,
  DoctorSignature,
  PrescriptionScan,
  CreatePrescriptionTemplateInput,
  UpdatePrescriptionTemplateInput,
  CreateDoctorSignatureInput,
  UpdateDoctorSignatureInput,
  CreatePrescriptionScanInput,
  ServiceResponse,
  OCRData,
  LayoutConfig,
  PrescriptionMedication,
  PatientDataSnapshot,
  MedicoDataSnapshot,
  PrescriptionExtended,
} from '../../types/prescriptions-advanced';

// ============================================================================
// TEMPLATE MUTATIONS
// ============================================================================

/**
 * Crea un nuevo template de receta
 */
export async function createPrescriptionTemplate(
  medicoId: string,
  input: CreatePrescriptionTemplateInput
): Promise<ServiceResponse<PrescriptionTemplate>> {
  try {
    // Valores por defecto
    const defaultLayoutConfig = {
      show_logo: true,
      show_header: true,
      show_medico_name: true,
      show_medico_specialty: true,
      show_medico_address: true,
      show_patient_details: true,
      show_patient_fields: ['nombre', 'edad', 'sexo', 'peso', 'id'],
      show_horario: true,
      show_firma: true,
      show_instrucciones: true,
      show_footer: true,
      orientation: 'portrait' as const,
    };

    const defaultCustomStyles = {
      primary_color: '#1e40af',
      secondary_color: '#7c3aed',
      font_family: 'Arial',
      font_size: 12,
      line_height: 1.4,
    };

    const defaultHeaderConfig = {
      logo_type: 'esculapio' as const,
      logo_url: null,
      show_medico_data: true,
    };

    const defaultFooterConfig = {
      show_firma: true,
      show_horario: true,
      horario_texto: null,
      show_instrucciones: true,
    };

    const defaultPatientFields = [
      { field: 'nombre', required: true, label: 'NOMBRE' },
      { field: 'apellido', required: true, label: 'APELLIDO' },
      { field: 'edad', required: false, label: 'EDAD' },
      { field: 'sexo', required: false, label: 'SEXO' },
      { field: 'peso', required: false, label: 'PESO' },
      { field: 'id', required: false, label: 'ID' },
    ];

    const templateData = {
      medico_id: medicoId,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      tipo: 'personalizado' as const,
      categoria: input.categoria || 'general',
      layout_config: input.layout_config ? { ...defaultLayoutConfig, ...input.layout_config } : defaultLayoutConfig,
      custom_styles: input.custom_styles ? { ...defaultCustomStyles, ...input.custom_styles } : defaultCustomStyles,
      header_config: input.header_config ? { ...defaultHeaderConfig, ...input.header_config } : defaultHeaderConfig,
      patient_fields: input.patient_fields || defaultPatientFields,
      footer_config: input.footer_config ? { ...defaultFooterConfig, ...input.footer_config } : defaultFooterConfig,
      texto_encabezado: input.texto_encabezado || null,
      texto_pie: input.texto_pie || null,
      texto_instrucciones: input.texto_instrucciones || 'Favor de traer su receta en la próxima cita',
      es_predeterminado: false,
      activo: true,
      usos_count: 0,
    };

    const { data, error } = await supabase
      .from('prescription_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[createPrescriptionTemplate] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Actualiza un template existente
 */
export async function updatePrescriptionTemplate(
  templateId: string,
  medicoId: string,
  input: UpdatePrescriptionTemplateInput
): Promise<ServiceResponse<PrescriptionTemplate>> {
  try {
    // Verificar que el template pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('prescription_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Template no encontrado');
    if (existing.medico_id !== medicoId && existing.tipo !== 'sistema') {
      throw new Error('No tienes permiso para editar este template');
    }

    // Solo los templates del sistema pueden ser editados por otros médicos (crear copia)
    if (existing.tipo === 'sistema' && existing.medico_id !== medicoId) {
      // Crear una copia personalizada
      return createPrescriptionTemplate(medicoId, {
        nombre: input.nombre || 'Copia de template',
        descripcion: input.descripcion,
        categoria: input.categoria,
        layout_config: input.layout_config,
        custom_styles: input.custom_styles,
        header_config: input.header_config,
        patient_fields: input.patient_fields,
        footer_config: input.footer_config,
        texto_encabezado: input.texto_encabezado,
        texto_pie: input.texto_pie,
        texto_instrucciones: input.texto_instrucciones,
      });
    }

    // Actualizar template
    const updateData: Partial<PrescriptionTemplate> = {};

    if (input.nombre !== undefined) updateData.nombre = input.nombre;
    if (input.descripcion !== undefined) updateData.descripcion = input.descripcion;
    if (input.categoria !== undefined) updateData.categoria = input.categoria;
    if (input.layout_config !== undefined) updateData.layout_config = { ...existing.layout_config, ...input.layout_config };
    if (input.custom_styles !== undefined) updateData.custom_styles = { ...existing.custom_styles, ...input.custom_styles };
    if (input.header_config !== undefined) updateData.header_config = { ...existing.header_config, ...input.header_config };
    if (input.patient_fields !== undefined) updateData.patient_fields = input.patient_fields; // Is array, strict replace?
    if (input.footer_config !== undefined) updateData.footer_config = { ...existing.footer_config, ...input.footer_config };
    if (input.texto_encabezado !== undefined) updateData.texto_encabezado = input.texto_encabezado;
    if (input.texto_pie !== undefined) updateData.texto_pie = input.texto_pie;
    if (input.texto_instrucciones !== undefined) updateData.texto_instrucciones = input.texto_instrucciones;
    if (input.activo !== undefined) updateData.activo = input.activo;

    const { data, error } = await supabase
      .from('prescription_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[updatePrescriptionTemplate] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Elimina un template (soft delete)
 */
export async function deletePrescriptionTemplate(
  templateId: string,
  medicoId: string
): Promise<ServiceResponse<void>> {
  try {
    // Verificar que el template pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('prescription_templates')
      .select('medico_id, tipo')
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Template no encontrado');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para eliminar este template');
    }
    if (existing.tipo === 'sistema') {
      throw new Error('No puedes eliminar templates del sistema');
    }

    // Soft delete
    const { error } = await supabase
      .from('prescription_templates')
      .update({ activo: false })
      .eq('id', templateId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[deletePrescriptionTemplate] Error:', error);
    return { success: false, error };
  }
}

/**
 * Incrementa el contador de usos de un template
 */
export async function incrementTemplateUsage(
  templateId: string
): Promise<ServiceResponse<void>> {
  try {
    // First, get the current count
    const { data: template, error: fetchError } = await supabase
      .from('prescription_templates')
      .select('usos_count')
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;

    // Then update with incremented value
    const { error } = await supabase
      .from('prescription_templates')
      .update({
        usos_count: (template?.usos_count || 0) + 1
      })
      .eq('id', templateId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[incrementTemplateUsage] Error:', error);
    return { success: false, error };
  }
}

// ============================================================================
// SIGNATURE MUTATIONS
// ============================================================================

/**
 * Crea una nueva firma digital
 */
export async function createDoctorSignature(
  medicoId: string,
  input: CreateDoctorSignatureInput
): Promise<ServiceResponse<DoctorSignature>> {
  try {
    // Desactivar firmas anteriores
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
    console.error('[createDoctorSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Actualiza una firma existente
 */
export async function updateDoctorSignature(
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
    const updateData: Partial<DoctorSignature> = {};

    if (input.firma_url !== undefined) updateData.firma_url = input.firma_url;
    if (input.firma_type !== undefined) updateData.firma_type = input.firma_type;
    if (input.firma_data !== undefined) updateData.firma_data = input.firma_data;
    if (input.es_firma_autografa !== undefined) updateData.es_firma_autografa = input.es_firma_autografa;
    if (input.activa !== undefined) {
      updateData.activa = input.activa;
      // Si se activa, desactivar las demás
      if (input.activa) {
        await supabase
          .from('doctor_signatures')
          .update({ activa: false })
          .eq('medico_id', medicoId)
          .neq('id', signatureId);
      }
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
    console.error('[updateDoctorSignature] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Elimina una firma
 */
export async function deleteDoctorSignature(
  signatureId: string,
  medicoId: string
): Promise<ServiceResponse<void>> {
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
    console.error('[deleteDoctorSignature] Error:', error);
    return { success: false, error };
  }
}

// ============================================================================
// SCAN MUTATIONS
// ============================================================================

/**
 * Crea un nuevo escaneo de receta
 */
export async function createPrescriptionScan(
  medicoId: string,
  input: CreatePrescriptionScanInput
): Promise<ServiceResponse<PrescriptionScan>> {
  try {
    const { data, error } = await supabase
      .from('prescription_scans')
      .insert({
        medico_id: medicoId,
        paciente_id: input.paciente_id || null,
        imagen_url: input.imagen_url,
        imagen_type: input.imagen_type,
        ocr_data: input.ocr_data || null,
        notas: input.notas || null,
        procesada: false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[createPrescriptionScan] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Actualiza un escaneo (procesamiento OCR, asociar a receta, etc.)
 */
export async function updatePrescriptionScan(
  scanId: string,
  medicoId: string,
  updates: {
    procesada?: boolean;
    template_id?: string;
    prescription_id?: string;
    ocr_data?: OCRData;
    notas?: string;
  }
): Promise<ServiceResponse<PrescriptionScan>> {
  try {
    // Verificar que el escaneo pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('prescription_scans')
      .select('medico_id')
      .eq('id', scanId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Escaneo no encontrado');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para editar este escaneo');
    }

    // Actualizar escaneo
    const updateData: Partial<PrescriptionScan> = {};

    if (updates.procesada !== undefined) updateData.procesada = updates.procesada;
    if (updates.template_id !== undefined) updateData.template_id = updates.template_id;
    if (updates.prescription_id !== undefined) updateData.prescription_id = updates.prescription_id;
    if (updates.ocr_data !== undefined) updateData.ocr_data = updates.ocr_data;
    if (updates.notas !== undefined) updateData.notas = updates.notas;

    const { data, error } = await supabase
      .from('prescription_scans')
      .update(updateData)
      .eq('id', scanId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[updatePrescriptionScan] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Elimina un escaneo
 */
export async function deletePrescriptionScan(
  scanId: string,
  medicoId: string
): Promise<ServiceResponse<void>> {
  try {
    // Verificar que el escaneo pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('prescription_scans')
      .select('medico_id')
      .eq('id', scanId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Escaneo no encontrado');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para eliminar este escaneo');
    }

    // Eliminar escaneo
    const { error } = await supabase
      .from('prescription_scans')
      .delete()
      .eq('id', scanId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[deletePrescriptionScan] Error:', error);
    return { success: false, error };
  }
}

// ============================================================================
// PRESCRIPTION MUTATIONS (EXTENDED)
// ============================================================================

/**
 * Crea una receta con información extendida (template, firma, etc.)
 */
export async function createPrescriptionExtended(
  medicoId: string,
  pacienteId: string,
  data: {
    template_id?: string;
    signature_id?: string;
    custom_layout?: LayoutConfig;
    diagnostico?: string;
    notas?: string;
    medications: PrescriptionMedication[];
    paciente_data?: PatientDataSnapshot;
    medico_data?: MedicoDataSnapshot;
  }
): Promise<ServiceResponse<PrescriptionExtended>> {
  try {
    const { data: result, error } = await supabase
      .from('farmacia_recetas')
      .insert({
        medico_id: medicoId,
        paciente_id: pacienteId,
        template_id: data.template_id || null,
        signature_id: data.signature_id || null,
        custom_layout: data.custom_layout || null,
        diagnostico: data.diagnostico || null,
        medicamentos: data.medications,
        indicaciones: data.notas || null,
        paciente_data: data.paciente_data || null,
        medico_data: data.medico_data || null,
        fecha_emision: new Date().toISOString().split('T')[0],
        estado: 'pendiente',
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error('[createPrescriptionExtended] Error:', error);
    return { success: false, error, data: undefined };
  }
}

/**
 * Actualiza una receta
 */
export async function updatePrescriptionExtended(
  prescriptionId: string,
  medicoId: string,
  updates: {
    template_id?: string;
    signature_id?: string;
    custom_layout?: LayoutConfig;
    diagnostico?: string;
    notas?: string;
    medications?: PrescriptionMedication[];
  }
): Promise<ServiceResponse<PrescriptionExtended>> {
  try {
    // Verificar que la receta pertenece al médico
    const { data: existing, error: fetchError } = await supabase
      .from('farmacia_recetas')
      .select('medico_id')
      .eq('id', prescriptionId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Receta no encontrada');
    if (existing.medico_id !== medicoId) {
      throw new Error('No tienes permiso para editar esta receta');
    }

    // Actualizar receta
    const updateData: Partial<PrescriptionExtended> = {};

    if (updates.template_id !== undefined) updateData.template_id = updates.template_id;
    if (updates.signature_id !== undefined) updateData.signature_id = updates.signature_id;

    if (updates.custom_layout !== undefined) updateData.custom_layout = updates.custom_layout;
    if (updates.diagnostico !== undefined) updateData.diagnostico = updates.diagnostico;
    if (updates.notas !== undefined) updateData.indicaciones = updates.notas;
    if (updates.medications !== undefined) updateData.medicamentos = updates.medications;

    const { data, error } = await supabase
      .from('farmacia_recetas')
      .update(updateData)
      .eq('id', prescriptionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[updatePrescriptionExtended] Error:', error);
    return { success: false, error, data: undefined };
  }
}

// ============================================================================
// PRINT MUTATIONS
// ============================================================================

/**
 * Registra una impresión de receta
 */
export async function recordPrescriptionPrint(
  prescriptionId: string,
  medicoId: string,
  options: {
    template_id?: string;
    formato?: 'pdf' | 'print';
    copias?: number;
  }
): Promise<ServiceResponse<unknown>> {
  try {
    const { data, error } = await supabase
      .from('prescription_prints')
      .insert({
        prescription_id: prescriptionId,
        medico_id: medicoId,
        template_id: options.template_id || null,
        formato: options.formato || 'print',
        copias: options.copias || 1,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[recordPrescriptionPrint] Error:', error);
    return { success: false, error, data: undefined };
  }
}
