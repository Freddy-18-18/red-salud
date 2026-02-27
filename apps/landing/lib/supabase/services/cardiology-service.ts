import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface CardiologyEcg extends SpecialtyRecord {
  ecg_type: string;
  heart_rate: number | null;
  rhythm: string | null;
  pr_interval: number | null;
  qrs_duration: number | null;
  qt_interval: number | null;
  qtc_interval: number | null;
  axis: string | null;
  interpretation: string | null;
  findings: string[] | null;
  is_abnormal: boolean;
  urgency: string;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export interface CardiologyProcedure extends SpecialtyRecord {
  procedure_type: string;
  procedure_date: string;
  indication: string | null;
  findings: string | null;
  results: Record<string, unknown> | null;
  complications: string | null;
  follow_up_plan: string | null;
  status: string;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export const cardiologyEcgService = createSpecialtyCrudService<CardiologyEcg>('cardiology_ecg');
export const cardiologyProcedureService = createSpecialtyCrudService<CardiologyProcedure>('cardiology_procedures', { dateColumn: 'procedure_date' });

export async function getRecentEcgs(doctorId: string, limit = 5): Promise<ServiceResult<CardiologyEcg[]>> {
  return cardiologyEcgService.list(doctorId, { limit, orderBy: 'created_at', orderDirection: 'desc' });
}

export async function getAbnormalEcgs(doctorId: string): Promise<ServiceResult<CardiologyEcg[]>> {
  try {
    const { data, error } = await supabase
      .from('cardiology_ecg')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_abnormal', true)
      .order('created_at', { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as CardiologyEcg[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getProceduresByType(doctorId: string, procedureType: string): Promise<ServiceResult<CardiologyProcedure[]>> {
  try {
    const { data, error } = await supabase
      .from('cardiology_procedures')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('procedure_type', procedureType)
      .order('procedure_date', { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as CardiologyProcedure[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
