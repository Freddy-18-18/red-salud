import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface NeurologyStudy extends SpecialtyRecord {
  study_type: string;
  study_date: string;
  indication: string | null;
  findings: string | null;
  interpretation: string | null;
  is_abnormal: boolean;
  abnormality_type: string | null;
  lateralization: string | null;
  region: string | null;
  results_summary: string | null;
  recommendations: string | null;
  urgency: string;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export interface NeurologyAssessment extends SpecialtyRecord {
  assessment_type: string;
  assessment_date: string;
  total_score: number | null;
  subscores: Record<string, unknown> | null;
  severity: string | null;
  interpretation: string | null;
  previous_score: number | null;
  trend: string | null;
  notes: string | null;
  appointment_id: string | null;
}

export const neurologyStudyService = createSpecialtyCrudService<NeurologyStudy>('neurology_studies', { dateColumn: 'study_date' });
export const neurologyAssessmentService = createSpecialtyCrudService<NeurologyAssessment>('neurology_assessments', { dateColumn: 'assessment_date' });

export async function getRecentStudies(doctorId: string, limit = 5): Promise<ServiceResult<NeurologyStudy[]>> {
  return neurologyStudyService.list(doctorId, { limit, orderBy: 'study_date', orderDirection: 'desc' });
}

export async function getAssessmentTrend(doctorId: string, patientId: string, assessmentType: string): Promise<ServiceResult<NeurologyAssessment[]>> {
  try {
    const { data, error } = await supabase
      .from('neurology_assessments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .eq('assessment_type', assessmentType)
      .order('assessment_date', { ascending: true })
      .limit(10);
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as NeurologyAssessment[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
