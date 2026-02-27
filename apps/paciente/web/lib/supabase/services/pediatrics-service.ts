import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface PediatricsGrowth extends SpecialtyRecord {
  measurement_date: string;
  age_months: number;
  weight_kg: number | null;
  height_cm: number | null;
  head_circumference_cm: number | null;
  bmi: number | null;
  weight_percentile: number | null;
  height_percentile: number | null;
  bmi_percentile: number | null;
  head_percentile: number | null;
  growth_chart_standard: string | null;
  nutritional_status: string | null;
  developmental_milestones: Record<string, unknown> | null;
  feeding_type: string | null;
  notes: string | null;
  appointment_id: string | null;
}

export interface PediatricsVaccine extends SpecialtyRecord {
  vaccine_name: string;
  vaccine_type: string;
  dose_number: number;
  total_doses: number | null;
  administration_date: string;
  batch_number: string | null;
  manufacturer: string | null;
  administration_site: string | null;
  administration_route: string | null;
  adverse_reactions: string | null;
  next_dose_date: string | null;
  is_catch_up: boolean;
  notes: string | null;
  appointment_id: string | null;
}

export const pediatricsGrowthService = createSpecialtyCrudService<PediatricsGrowth>('pediatrics_growth', { dateColumn: 'measurement_date' });
export const pediatricsVaccineService = createSpecialtyCrudService<PediatricsVaccine>('pediatrics_vaccines', { dateColumn: 'administration_date' });

export async function getGrowthCurve(doctorId: string, patientId: string): Promise<ServiceResult<PediatricsGrowth[]>> {
  try {
    const { data, error } = await supabase
      .from('pediatrics_growth')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('age_months', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as PediatricsGrowth[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getPendingVaccines(doctorId: string, patientId: string): Promise<ServiceResult<PediatricsVaccine[]>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('pediatrics_vaccines')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .lte('next_dose_date', today)
      .not('next_dose_date', 'is', null)
      .order('next_dose_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as PediatricsVaccine[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
