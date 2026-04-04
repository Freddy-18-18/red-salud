'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type {
  TCategory,
  NCategory,
  MCategory,
  OverallStage,
  HistologicGrade,
  ECOGScore,
  KarnofskyScore,
  RECISTResponse,
  CycleStatus,
  SideEffectGrade,
} from './oncology-staging-data';

// ============================================================================
// TYPES
// ============================================================================

export interface TreatmentCycle {
  cycleNumber: number;
  date: string;
  status: CycleStatus;
  drugs: Array<{ name: string; dose: string; route: string }>;
  sideEffects: Array<{ name: string; grade: SideEffectGrade }>;
  labValues: Record<string, number>;
  doseModification: string | null;
  notes: string | null;
}

export interface OncologyRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  // Staging
  cancer_type: string;
  diagnosis_date: string | null;
  t_category: TCategory;
  n_category: NCategory;
  m_category: MCategory;
  overall_stage: OverallStage;
  histologic_grade: HistologicGrade;
  biomarkers: Record<string, string>;
  ecog: ECOGScore;
  karnofsky: KarnofskyScore;
  // Treatment
  protocol_name: string | null;
  cycles: TreatmentCycle[];
  recist_response: RECISTResponse | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOncologyRecord {
  patient_id?: string | null;
  cancer_type: string;
  diagnosis_date?: string | null;
  t_category: TCategory;
  n_category: NCategory;
  m_category: MCategory;
  overall_stage: OverallStage;
  histologic_grade?: HistologicGrade;
  biomarkers?: Record<string, string>;
  ecog?: ECOGScore;
  karnofsky?: KarnofskyScore;
  protocol_name?: string | null;
  cycles?: TreatmentCycle[];
  recist_response?: RECISTResponse | null;
  notes?: string | null;
}

interface UseOncologyOptions {
  patientId?: string;
  limit?: number;
}

interface UseOncologyReturn {
  records: OncologyRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateOncologyRecord) => Promise<OncologyRecord | null>;
  update: (id: string, data: Partial<CreateOncologyRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useOncology(
  doctorId: string,
  options?: UseOncologyOptions,
): UseOncologyReturn {
  const [records, setRecords] = useState<OncologyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchRecords() {
      let query = supabase
        .from('diagnostic_imaging')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('study_type', 'oncology_staging')
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setRecords([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setRecords([]);
      } else {
        const mapped: OncologyRecord[] = (data ?? []).map((row: Record<string, unknown>) => {
          const parsed = tryParseJSON((row.equipment as string) ?? '{}');
          return {
            id: row.id as string,
            doctor_id: row.doctor_id as string,
            patient_id: (row.patient_id as string) ?? null,
            cancer_type: (parsed?.cancer_type as string) ?? 'other',
            diagnosis_date: (parsed?.diagnosis_date as string) ?? null,
            t_category: (parsed?.t_category as TCategory) ?? 'Tx',
            n_category: (parsed?.n_category as NCategory) ?? 'Nx',
            m_category: (parsed?.m_category as MCategory) ?? 'Mx',
            overall_stage: (parsed?.overall_stage as OverallStage) ?? 'I',
            histologic_grade: (parsed?.histologic_grade as HistologicGrade) ?? 'GX',
            biomarkers: (parsed?.biomarkers as Record<string, string>) ?? {},
            ecog: (parsed?.ecog as ECOGScore) ?? 0,
            karnofsky: (parsed?.karnofsky as KarnofskyScore) ?? 100,
            protocol_name: (parsed?.protocol_name as string) ?? null,
            cycles: (parsed?.cycles as TreatmentCycle[]) ?? [],
            recist_response: (parsed?.recist_response as RECISTResponse) ?? null,
            notes: (row.findings as string) ?? null,
            created_at: row.created_at as string,
            updated_at: row.updated_at as string,
          };
        });
        setRecords(mapped);
      }
      setLoading(false);
    }

    fetchRecords();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.limit, refreshKey]);

  // Create
  const create = useCallback(
    async (data: CreateOncologyRecord): Promise<OncologyRecord | null> => {
      const payload = JSON.stringify({
        cancer_type: data.cancer_type,
        diagnosis_date: data.diagnosis_date,
        t_category: data.t_category,
        n_category: data.n_category,
        m_category: data.m_category,
        overall_stage: data.overall_stage,
        histologic_grade: data.histologic_grade ?? 'GX',
        biomarkers: data.biomarkers ?? {},
        ecog: data.ecog ?? 0,
        karnofsky: data.karnofsky ?? 100,
        protocol_name: data.protocol_name,
        cycles: data.cycles ?? [],
        recist_response: data.recist_response,
      });

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'oncology_staging',
          status: 'completed',
          findings: data.notes ?? null,
          conclusion: data.overall_stage,
          equipment: payload,
          image_urls: [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as OncologyRecord;
    },
    [doctorId, refresh],
  );

  // Update
  const update = useCallback(
    async (id: string, data: Partial<CreateOncologyRecord>): Promise<boolean> => {
      const existing = records.find((r) => r.id === id);
      const updatePayload: Record<string, unknown> = {};

      const merged = {
        cancer_type: data.cancer_type ?? existing?.cancer_type,
        diagnosis_date: data.diagnosis_date ?? existing?.diagnosis_date,
        t_category: data.t_category ?? existing?.t_category,
        n_category: data.n_category ?? existing?.n_category,
        m_category: data.m_category ?? existing?.m_category,
        overall_stage: data.overall_stage ?? existing?.overall_stage,
        histologic_grade: data.histologic_grade ?? existing?.histologic_grade,
        biomarkers: data.biomarkers ?? existing?.biomarkers,
        ecog: data.ecog ?? existing?.ecog,
        karnofsky: data.karnofsky ?? existing?.karnofsky,
        protocol_name: data.protocol_name ?? existing?.protocol_name,
        cycles: data.cycles ?? existing?.cycles,
        recist_response: data.recist_response ?? existing?.recist_response,
      };

      updatePayload.equipment = JSON.stringify(merged);
      if (data.notes !== undefined) updatePayload.findings = data.notes;
      if (data.overall_stage) updatePayload.conclusion = data.overall_stage;

      const { error: updateError } = await supabase
        .from('diagnostic_imaging')
        .update(updatePayload)
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, records, refresh],
  );

  // Delete
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

  return { records, loading, error, create, update, remove, refresh };
}

// ============================================================================
// HELPERS
// ============================================================================

function tryParseJSON(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
