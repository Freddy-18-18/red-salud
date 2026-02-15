import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface GynecologyControl extends SpecialtyRecord {
  control_type: string;
  control_date: string;
  menstrual_date: string | null;
  cycle_length: number | null;
  cycle_regularity: string | null;
  contraceptive_method: string | null;
  findings: string | null;
  cervical_exam: string | null;
  breast_exam: string | null;
  pap_result: string | null;
  hpv_test: string | null;
  diagnosis: string | null;
  treatment: string | null;
  next_control_date: string | null;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export interface GynecologyObstetric extends SpecialtyRecord {
  pregnancy_id: string;
  control_type: string;
  control_date: string;
  gestational_weeks: number | null;
  weight: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  uterine_height: number | null;
  fetal_heart_rate: number | null;
  fetal_presentation: string | null;
  fetal_movements: string | null;
  edema: string | null;
  lab_results: Record<string, unknown> | null;
  ultrasound_findings: string | null;
  risk_level: string | null;
  diagnosis: string | null;
  indications: string | null;
  next_control_date: string | null;
  delivery_type: string | null;
  delivery_date: string | null;
  baby_weight: number | null;
  baby_height: number | null;
  apgar_1min: number | null;
  apgar_5min: number | null;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export const gynecologyControlService = createSpecialtyCrudService<GynecologyControl>('gynecology_controls', { dateColumn: 'control_date' });
export const gynecologyObstetricService = createSpecialtyCrudService<GynecologyObstetric>('gynecology_obstetric', { dateColumn: 'control_date' });

export async function getPregnancyControls(doctorId: string, pregnancyId: string): Promise<ServiceResult<GynecologyObstetric[]>> {
  try {
    const { data, error } = await supabase
      .from('gynecology_obstetric')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('pregnancy_id', pregnancyId)
      .order('control_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as GynecologyObstetric[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getUpcomingControls(doctorId: string): Promise<ServiceResult<GynecologyControl[]>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('gynecology_controls')
      .select('*')
      .eq('doctor_id', doctorId)
      .gte('next_control_date', today)
      .order('next_control_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as GynecologyControl[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
