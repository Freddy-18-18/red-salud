'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { UroflowmetryValues, FlowPattern } from './urology-scales-data';

// ============================================================================
// TYPES
// ============================================================================

export interface IPSSAssessment {
  scores: number[];        // 7 symptom scores (0-5 each)
  qolScore: number;        // quality of life (0-6)
  totalScore: number;      // sum of 7 symptom scores (0-35)
}

export interface PSAReading {
  value: number;           // ng/mL
  date: string;            // ISO date
  freePsa: number | null;  // ng/mL
  prostateVolume: number | null; // mL
}

export interface UroflowmetryData {
  values: UroflowmetryValues;
  pattern: FlowPattern;
}

export interface UrologyRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  assessment_type: 'ipss' | 'psa' | 'uroflowmetry';
  ipss: IPSSAssessment | null;
  psa: PSAReading | null;
  uroflowmetry: UroflowmetryData | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUrologyRecord {
  patient_id?: string | null;
  assessment_type: 'ipss' | 'psa' | 'uroflowmetry';
  ipss?: IPSSAssessment | null;
  psa?: PSAReading | null;
  uroflowmetry?: UroflowmetryData | null;
  notes?: string | null;
}

interface UseUrologyOptions {
  patientId?: string;
  limit?: number;
  assessmentType?: 'ipss' | 'psa' | 'uroflowmetry';
}

interface UseUrologyReturn {
  records: UrologyRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateUrologyRecord) => Promise<UrologyRecord | null>;
  update: (id: string, data: Partial<CreateUrologyRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useUrology(
  doctorId: string,
  options?: UseUrologyOptions,
): UseUrologyReturn {
  const [records, setRecords] = useState<UrologyRecord[]>([]);
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
        .eq('study_type', 'urology-assessment')
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
        const mapped: UrologyRecord[] = (data ?? []).map((row: Record<string, unknown>) => {
          const parsed = tryParseJSON((row.equipment as string) ?? '{}');
          const assessmentType = (parsed?.assessment_type as string) ?? 'ipss';

          return {
            id: row.id as string,
            doctor_id: row.doctor_id as string,
            patient_id: (row.patient_id as string) ?? null,
            assessment_type: assessmentType as UrologyRecord['assessment_type'],
            ipss: (parsed?.ipss as IPSSAssessment) ?? null,
            psa: (parsed?.psa as PSAReading) ?? null,
            uroflowmetry: (parsed?.uroflowmetry as UroflowmetryData) ?? null,
            notes: (row.findings as string) ?? null,
            created_at: row.created_at as string,
            updated_at: row.updated_at as string,
          };
        });

        // Filter by assessment type if specified
        const filtered = options?.assessmentType
          ? mapped.filter((r) => r.assessment_type === options.assessmentType)
          : mapped;

        setRecords(filtered);
      }
      setLoading(false);
    }

    fetchRecords();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.limit, options?.assessmentType, refreshKey]);

  // Create
  const create = useCallback(
    async (data: CreateUrologyRecord): Promise<UrologyRecord | null> => {
      const payload = JSON.stringify({
        assessment_type: data.assessment_type,
        ipss: data.ipss ?? null,
        psa: data.psa ?? null,
        uroflowmetry: data.uroflowmetry ?? null,
      });

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'urology-assessment',
          status: 'completed',
          findings: data.notes ?? null,
          conclusion: data.assessment_type,
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
      return row as unknown as UrologyRecord;
    },
    [doctorId, refresh],
  );

  // Update
  const update = useCallback(
    async (id: string, data: Partial<CreateUrologyRecord>): Promise<boolean> => {
      const existing = records.find((r) => r.id === id);
      const updatePayload: Record<string, unknown> = {};

      updatePayload.equipment = JSON.stringify({
        assessment_type: data.assessment_type ?? existing?.assessment_type ?? 'ipss',
        ipss: data.ipss ?? existing?.ipss ?? null,
        psa: data.psa ?? existing?.psa ?? null,
        uroflowmetry: data.uroflowmetry ?? existing?.uroflowmetry ?? null,
      });

      if (data.notes !== undefined) updatePayload.findings = data.notes;
      if (data.assessment_type) updatePayload.conclusion = data.assessment_type;

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
