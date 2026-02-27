import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './specialty-crud-factory';
import { supabase } from '../client';

export interface OphthalmologyExam extends SpecialtyRecord {
  exam_type: string;
  exam_date: string;
  va_od_sc: string | null;
  va_od_cc: string | null;
  va_oi_sc: string | null;
  va_oi_cc: string | null;
  sphere_od: number | null;
  cylinder_od: number | null;
  axis_od: number | null;
  sphere_oi: number | null;
  cylinder_oi: number | null;
  axis_oi: number | null;
  add_power: number | null;
  iop_od: number | null;
  iop_oi: number | null;
  iop_method: string | null;
  findings: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export interface OphthalmologyProcedure extends SpecialtyRecord {
  procedure_type: string;
  eye: string;
  procedure_date: string;
  indication: string | null;
  technique: string | null;
  anesthesia: string | null;
  intraop_findings: string | null;
  complications: string | null;
  postop_instructions: string | null;
  follow_up_schedule: string | null;
  status: string;
  notes: string | null;
  attachment_urls: string[] | null;
  appointment_id: string | null;
}

export const ophthalmologyExamService = createSpecialtyCrudService<OphthalmologyExam>('ophthalmology_exams', { dateColumn: 'exam_date' });
export const ophthalmologyProcedureService = createSpecialtyCrudService<OphthalmologyProcedure>('ophthalmology_procedures', { dateColumn: 'procedure_date' });

export async function getPatientVisualHistory(doctorId: string, patientId: string): Promise<ServiceResult<OphthalmologyExam[]>> {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_exams')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('exam_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data || []) as OphthalmologyExam[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
