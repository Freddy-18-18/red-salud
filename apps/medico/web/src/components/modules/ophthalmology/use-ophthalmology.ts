'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type ExamType =
  | 'visual_acuity'
  | 'refraction'
  | 'iop'
  | 'fundoscopy'
  | 'complete';

export type AcuityValue =
  | '20/20'
  | '20/25'
  | '20/30'
  | '20/40'
  | '20/50'
  | '20/70'
  | '20/100'
  | '20/200'
  | 'CF'
  | 'MM'
  | 'PL'
  | 'NPL'
  | string;

export type IopMethod =
  | 'goldmann'
  | 'tonopen'
  | 'icare'
  | 'non_contact'
  | 'palpation';

export interface VisualAcuityData {
  od_uncorrected: AcuityValue | null;
  od_corrected: AcuityValue | null;
  od_pinhole: AcuityValue | null;
  os_uncorrected: AcuityValue | null;
  os_corrected: AcuityValue | null;
  os_pinhole: AcuityValue | null;
  ou_uncorrected: AcuityValue | null;
  ou_corrected: AcuityValue | null;
}

export interface RefractionData {
  od_sphere: number | null;
  od_cylinder: number | null;
  od_axis: number | null;
  od_add: number | null;
  os_sphere: number | null;
  os_cylinder: number | null;
  os_axis: number | null;
  os_add: number | null;
  pupillary_distance: number | null;
}

export interface IopData {
  od_value: number | null;
  os_value: number | null;
  method: IopMethod | null;
  time_of_day: string | null;
}

export interface FundoscopyData {
  od_findings: string | null;
  os_findings: string | null;
  od_cup_disc_ratio: number | null;
  os_cup_disc_ratio: number | null;
}

export interface OphthalmologyExam {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  exam_type: ExamType;
  exam_date: string;
  visual_acuity: VisualAcuityData | null;
  refraction: RefractionData | null;
  iop: IopData | null;
  fundoscopy: FundoscopyData | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOphthalmologyExam {
  patient_id?: string | null;
  exam_type: ExamType;
  exam_date?: string;
  visual_acuity?: VisualAcuityData | null;
  refraction?: RefractionData | null;
  iop?: IopData | null;
  fundoscopy?: FundoscopyData | null;
  notes?: string | null;
}

interface UseOphthalmologyOptions {
  patientId?: string;
  examType?: ExamType;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

interface UseOphthalmologyReturn {
  exams: OphthalmologyExam[];
  loading: boolean;
  error: string | null;
  create: (data: CreateOphthalmologyExam) => Promise<OphthalmologyExam | null>;
  update: (id: string, data: Partial<CreateOphthalmologyExam>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useOphthalmology(
  doctorId: string,
  options?: UseOphthalmologyOptions,
): UseOphthalmologyReturn {
  const [exams, setExams] = useState<OphthalmologyExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch exams
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchExams() {
      let query = supabase
        .from('ophthalmology_exams')
        .select('*, profiles!ophthalmology_exams_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .order('exam_date', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.examType) {
        query = query.eq('exam_type', options.examType);
      }
      if (options?.dateFrom) {
        query = query.gte('exam_date', options.dateFrom);
      }
      if (options?.dateTo) {
        query = query.lte('exam_date', options.dateTo);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet (42P01) — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setExams([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setExams([]);
      } else {
        const mapped: OphthalmologyExam[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          patient_name: row.profiles?.full_name ?? undefined,
          exam_type: row.exam_type ?? 'complete',
          exam_date: row.exam_date ?? row.created_at,
          visual_acuity: row.visual_acuity ?? null,
          refraction: row.refraction ?? null,
          iop: row.iop ?? null,
          fundoscopy: row.fundoscopy ?? null,
          notes: row.notes ?? null,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setExams(mapped);
      }
      setLoading(false);
    }

    fetchExams();
    return () => { cancelled = true; };
  }, [
    doctorId,
    options?.patientId,
    options?.examType,
    options?.dateFrom,
    options?.dateTo,
    options?.limit,
    refreshKey,
  ]);

  // Create exam
  const create = useCallback(
    async (data: CreateOphthalmologyExam): Promise<OphthalmologyExam | null> => {
      const { data: row, error: insertError } = await supabase
        .from('ophthalmology_exams')
        .insert({
          ...data,
          doctor_id: doctorId,
          exam_date: data.exam_date ?? new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as OphthalmologyExam;
    },
    [doctorId, refresh],
  );

  // Update exam
  const update = useCallback(
    async (id: string, data: Partial<CreateOphthalmologyExam>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('ophthalmology_exams')
        .update(data)
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  // Delete exam
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('ophthalmology_exams')
        .delete()
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, refresh],
  );

  return { exams, loading, error, create, update, remove, refresh };
}
