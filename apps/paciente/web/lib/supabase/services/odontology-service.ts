import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface DentalTreatment extends SpecialtyRecord {
  treatment_type: string;
  tooth_number: number | null;
  tooth_surface: string | null;
  material: string | null;
  treatment_date: string;
  status: string;
  cost: number | null;
  insurance_covered: boolean;
  warranty_months: number | null;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export interface DentalImaging extends SpecialtyRecord {
  imaging_type: string;
  imaging_date: string;
  region: string | null;
  tooth_numbers: number[] | null;
  findings: string | null;
  diagnosis: string | null;
  image_urls: string[] | null;
  notes: string | null;
  appointment_id: string | null;
}

export const dentalTreatmentService = createSpecialtyCrudService<DentalTreatment>('dental_treatments', { dateColumn: 'treatment_date' });
export const dentalImagingService = createSpecialtyCrudService<DentalImaging>('dental_imaging', { dateColumn: 'imaging_date' });

export async function getTreatmentPlan(doctorId: string, patientId: string): Promise<ServiceResult<DentalTreatment[]>> {
  try {
    const { data, error } = await supabase
      .from('dental_treatments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .eq('status', 'planificado')
      .order('treatment_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as DentalTreatment[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getPatientDentalHistory(doctorId: string, patientId: string): Promise<ServiceResult<DentalTreatment[]>> {
  try {
    const { data, error } = await supabase
      .from('dental_treatments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('treatment_date', { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as DentalTreatment[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
