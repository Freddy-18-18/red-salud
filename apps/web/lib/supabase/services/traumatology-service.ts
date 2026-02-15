import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface TraumatologyInjury extends SpecialtyRecord {
  injury_type: string;
  anatomical_zone: string;
  laterality: string | null;
  mechanism: string | null;
  severity: string | null;
  diagnosis: string | null;
  imaging_findings: string | null;
  treatment_plan: string | null;
  surgery_required: boolean;
  surgery_date: string | null;
  immobilization_type: string | null;
  immobilization_duration_days: number | null;
  weight_bearing_status: string | null;
  return_to_activity_date: string | null;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export interface TraumatologyRehab extends SpecialtyRecord {
  injury_id: string;
  rehab_type: string;
  session_date: string;
  session_number: number;
  total_sessions: number | null;
  exercises: Record<string, unknown> | null;
  pain_level_pre: number | null;
  pain_level_post: number | null;
  range_of_motion: Record<string, unknown> | null;
  strength_assessment: string | null;
  functional_progress: string | null;
  next_goals: string | null;
  notes: string | null;
  appointment_id: string | null;
}

export const traumatologyInjuryService = createSpecialtyCrudService<TraumatologyInjury>('traumatology_injuries');
export const traumatologyRehabService = createSpecialtyCrudService<TraumatologyRehab>('traumatology_rehab', { dateColumn: 'session_date' });

export async function getActiveInjuries(doctorId: string): Promise<ServiceResult<TraumatologyInjury[]>> {
  try {
    const { data, error } = await supabase
      .from('traumatology_injuries')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('surgery_required', true)
      .is('return_to_activity_date', null)
      .order('created_at', { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as TraumatologyInjury[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getRehabSessions(doctorId: string, injuryId: string): Promise<ServiceResult<TraumatologyRehab[]>> {
  try {
    const { data, error } = await supabase
      .from('traumatology_rehab')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('injury_id', injuryId)
      .order('session_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as TraumatologyRehab[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
