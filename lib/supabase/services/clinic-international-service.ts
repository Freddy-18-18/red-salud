/**
 * Servicio para gestión de pacientes internacionales
 * 
 * Maneja registro, documentos de viaje y seguimiento de pacientes extranjeros
 */

import { createClient } from '@/lib/supabase/client';
import type {
  InternationalPatient,
  TravelDocument,
  CreateInternationalPatientInput,
} from '@/lib/types/clinic.types';

const supabase = createClient();

// ============ Pacientes Internacionales ============

export async function getInternationalPatients(clinicId: string): Promise<InternationalPatient[]> {
  const { data, error } = await supabase
    .from('international_patients')
    .select(`
      *,
      patient:patient_id (email, raw_user_meta_data)
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getInternationalPatientById(
  patientId: string
): Promise<InternationalPatient | null> {
  const { data, error } = await supabase
    .from('international_patients')
    .select(`
      *,
      patient:patient_id (email, raw_user_meta_data)
    `)
    .eq('id', patientId)
    .single();

  if (error) throw error;
  return data;
}

export async function getInternationalPatientByUserId(
  userId: string,
  clinicId: string
): Promise<InternationalPatient | null> {
  const { data, error } = await supabase
    .from('international_patients')
    .select('*')
    .eq('patient_id', userId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createInternationalPatient(
  input: CreateInternationalPatientInput
): Promise<InternationalPatient> {
  const { data, error } = await supabase
    .from('international_patients')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInternationalPatient(
  patientId: string,
  updates: Partial<InternationalPatient>
): Promise<InternationalPatient> {
  const { data, error } = await supabase
    .from('international_patients')
    .update(updates)
    .eq('id', patientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePatientStatus(
  patientId: string,
  status: InternationalPatient['status']
): Promise<InternationalPatient> {
  return updateInternationalPatient(patientId, { status });
}

export async function getActiveInternationalPatients(
  clinicId: string
): Promise<InternationalPatient[]> {
  const { data, error } = await supabase
    .from('international_patients')
    .select(`
      *,
      patient:patient_id (email, raw_user_meta_data)
    `)
    .eq('clinic_id', clinicId)
    .in('status', ['confirmed', 'arrived', 'in_treatment'])
    .order('estimated_arrival_date');

  if (error) throw error;
  return data || [];
}

export async function getPendingArrivals(
  clinicId: string,
  daysAhead: number = 30
): Promise<InternationalPatient[]> {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('international_patients')
    .select(`
      *,
      patient:patient_id (email, raw_user_meta_data)
    `)
    .eq('clinic_id', clinicId)
    .eq('status', 'confirmed')
    .gte('estimated_arrival_date', today.toISOString().split('T')[0])
    .lte('estimated_arrival_date', futureDate.toISOString().split('T')[0])
    .order('estimated_arrival_date');

  if (error) throw error;
  return data || [];
}

// ============ Documentos de Viaje ============

export async function getTravelDocuments(
  internationalPatientId: string
): Promise<TravelDocument[]> {
  const { data, error } = await supabase
    .from('travel_documents')
    .select('*')
    .eq('international_patient_id', internationalPatientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function uploadTravelDocument(
  internationalPatientId: string,
  documentType: TravelDocument['document_type'],
  documentName: string,
  file: File
): Promise<TravelDocument> {
  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${internationalPatientId}/${documentType}_${Date.now()}.${fileExt}`;
  const filePath = `travel-documents/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('clinic-documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('clinic-documents').getPublicUrl(filePath);

  // Create document record
  const { data, error } = await supabase
    .from('travel_documents')
    .insert({
      international_patient_id: internationalPatientId,
      document_type: documentType,
      document_name: documentName,
      file_url: publicUrl,
      file_size_bytes: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function verifyTravelDocument(
  documentId: string,
  userId: string
): Promise<TravelDocument> {
  const { data, error } = await supabase
    .from('travel_documents')
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      verified_by: userId,
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTravelDocument(documentId: string): Promise<void> {
  // Primero obtener el documento para eliminar el archivo
  const { data: doc } = await supabase
    .from('travel_documents')
    .select('file_url')
    .eq('id', documentId)
    .single();

  if (doc?.file_url) {
    // Extraer path del URL
    const urlParts = doc.file_url.split('/travel-documents/');
    if (urlParts.length > 1) {
      const filePath = `travel-documents/${urlParts[1]}`;
      await supabase.storage.from('clinic-documents').remove([filePath]);
    }
  }

  // Eliminar registro
  const { error } = await supabase.from('travel_documents').delete().eq('id', documentId);

  if (error) throw error;
}

export async function getPendingDocumentVerifications(
  clinicId: string
): Promise<TravelDocument[]> {
  const { data, error } = await supabase
    .from('travel_documents')
    .select(`
      *,
      international_patient:international_patient_id (
        clinic_id,
        patient:patient_id (email, raw_user_meta_data)
      )
    `)
    .eq('verified', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Filtrar por clinic_id
  return (data || []).filter(
    (doc: any) => doc.international_patient?.clinic_id === clinicId
  );
}

// ============ Estadísticas ============

export async function getInternationalPatientStats(clinicId: string): Promise<{
  total: number;
  by_status: Record<string, number>;
  by_country: Record<string, number>;
  pending_arrivals: number;
  pending_verifications: number;
}> {
  const patients = await getInternationalPatients(clinicId);
  const pendingArrivals = await getPendingArrivals(clinicId, 30);
  const pendingDocs = await getPendingDocumentVerifications(clinicId);

  const byStatus: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  patients.forEach((p) => {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    byCountry[p.origin_country] = (byCountry[p.origin_country] || 0) + 1;
  });

  return {
    total: patients.length,
    by_status: byStatus,
    by_country: byCountry,
    pending_arrivals: pendingArrivals.length,
    pending_verifications: pendingDocs.length,
  };
}

/**
 * Obtiene requerimientos de documentos por país
 */
export async function getCountryRequirements(countryCode: string): Promise<{
  required_documents: string[];
  visa_required: boolean;
  medical_clearance_required: boolean;
  insurance_required: boolean;
  notes?: string;
}> {
  // Esta información debería venir de una tabla configurada
  // Por ahora retornamos estructura base
  const requirements: Record<string, any> = {
    USA: {
      required_documents: ['passport', 'visa', 'medical_clearance', 'insurance_card'],
      visa_required: true,
      medical_clearance_required: true,
      insurance_required: true,
      notes: 'Se requiere visa de turismo médico o visa B-2',
    },
    CAN: {
      required_documents: ['passport', 'insurance_card'],
      visa_required: false,
      medical_clearance_required: false,
      insurance_required: true,
      notes: 'Ciudadanos canadienses no requieren visa',
    },
    // Agregar más países según necesidad
  };

  return (
    requirements[countryCode] || {
      required_documents: ['passport'],
      visa_required: true,
      medical_clearance_required: false,
      insurance_required: false,
    }
  );
}
