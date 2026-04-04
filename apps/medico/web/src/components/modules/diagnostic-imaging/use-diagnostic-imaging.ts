'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type ImagingStatus = 'ordered' | 'in_progress' | 'completed' | 'reviewed';

export interface ImagingStudy {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  study_type: string;
  body_region: string | null;
  status: ImagingStatus;
  clinical_indication: string | null;
  findings: string | null;
  conclusion: string | null;
  equipment: string | null;
  technique: string | null;
  image_urls: string[];
  patient_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateImagingStudy {
  patient_id?: string | null;
  study_type: string;
  body_region?: string | null;
  status?: ImagingStatus;
  clinical_indication?: string | null;
  findings?: string | null;
  conclusion?: string | null;
  equipment?: string | null;
  technique?: string | null;
  image_urls?: string[];
}

interface UseImagingOptions {
  patientId?: string;
  studyType?: string;
  status?: string;
  limit?: number;
}

interface UseImagingReturn {
  studies: ImagingStudy[];
  loading: boolean;
  error: string | null;
  create: (data: CreateImagingStudy) => Promise<ImagingStudy | null>;
  update: (id: string, data: Partial<CreateImagingStudy>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useDiagnosticImaging(
  doctorId: string,
  options?: UseImagingOptions,
): UseImagingReturn {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch studies
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchStudies() {
      let query = supabase
        .from('diagnostic_imaging')
        .select('*, profiles!diagnostic_imaging_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.studyType) {
        query = query.eq('study_type', options.studyType);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setStudies([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setStudies([]);
      } else {
        const mapped: ImagingStudy[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          study_type: row.study_type ?? '',
          body_region: row.body_region,
          status: row.status ?? 'ordered',
          clinical_indication: row.clinical_indication,
          findings: row.findings,
          conclusion: row.conclusion,
          equipment: row.equipment,
          technique: row.technique,
          image_urls: row.image_urls ?? [],
          patient_name: row.profiles?.full_name ?? undefined,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setStudies(mapped);
      }
      setLoading(false);
    }

    fetchStudies();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.studyType, options?.status, options?.limit, refreshKey]);

  // Create study
  const create = useCallback(
    async (data: CreateImagingStudy): Promise<ImagingStudy | null> => {
      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          ...data,
          status: data.status ?? 'ordered',
          image_urls: data.image_urls ?? [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as ImagingStudy;
    },
    [doctorId, refresh],
  );

  // Update study
  const update = useCallback(
    async (id: string, data: Partial<CreateImagingStudy>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('diagnostic_imaging')
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

  // Delete study
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('diagnostic_imaging')
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

  return { studies, loading, error, create, update, remove, refresh };
}
