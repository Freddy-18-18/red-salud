'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SpirometryValues } from './spirometry-reference-data';

// ============================================================================
// TYPES
// ============================================================================

export interface SpirometryRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  test_date: string;
  pre_values: SpirometryValues;
  post_values: SpirometryValues;
  demographics: { age: number; sex: 'male' | 'female'; heightCm: number } | null;
  notes: string | null;
  interpretation: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSpirometryRecord {
  patient_id?: string | null;
  test_date?: string;
  pre_values: SpirometryValues;
  post_values?: SpirometryValues;
  demographics?: { age: number; sex: 'male' | 'female'; heightCm: number } | null;
  notes?: string | null;
  interpretation?: string | null;
}

interface UseSpirometryOptions {
  patientId?: string;
  limit?: number;
}

interface UseSpirometryReturn {
  records: SpirometryRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateSpirometryRecord) => Promise<SpirometryRecord | null>;
  update: (id: string, data: Partial<CreateSpirometryRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

const EMPTY_VALUES: SpirometryValues = {
  fvc: null,
  fev1: null,
  fev1Fvc: null,
  pef: null,
  fef2575: null,
};

// ============================================================================
// HOOK
// ============================================================================

export function useSpirometry(
  doctorId: string,
  options?: UseSpirometryOptions,
): UseSpirometryReturn {
  const [records, setRecords] = useState<SpirometryRecord[]>([]);
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
        .eq('study_type', 'spirometry')
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
        const mapped: SpirometryRecord[] = (data ?? []).map((row: Record<string, unknown>) => {
          const parsed = tryParseJSON((row.equipment as string) ?? '{}');
          return {
            id: row.id as string,
            doctor_id: row.doctor_id as string,
            patient_id: (row.patient_id as string) ?? null,
            test_date: (row.created_at as string).slice(0, 10),
            pre_values: (parsed?.pre_values as SpirometryValues) ?? { ...EMPTY_VALUES },
            post_values: (parsed?.post_values as SpirometryValues) ?? { ...EMPTY_VALUES },
            demographics: (parsed?.demographics as SpirometryRecord['demographics']) ?? null,
            notes: (row.findings as string) ?? null,
            interpretation: (row.conclusion as string) ?? null,
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
    async (data: CreateSpirometryRecord): Promise<SpirometryRecord | null> => {
      const payload = JSON.stringify({
        pre_values: data.pre_values,
        post_values: data.post_values ?? { ...EMPTY_VALUES },
        demographics: data.demographics ?? null,
      });

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'spirometry',
          status: 'completed',
          findings: data.notes ?? null,
          conclusion: data.interpretation ?? null,
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
      return row as unknown as SpirometryRecord;
    },
    [doctorId, refresh],
  );

  // Update
  const update = useCallback(
    async (id: string, data: Partial<CreateSpirometryRecord>): Promise<boolean> => {
      const updatePayload: Record<string, unknown> = {};

      if (data.pre_values || data.post_values || data.demographics) {
        const existing = records.find((r) => r.id === id);
        updatePayload.equipment = JSON.stringify({
          pre_values: data.pre_values ?? existing?.pre_values ?? { ...EMPTY_VALUES },
          post_values: data.post_values ?? existing?.post_values ?? { ...EMPTY_VALUES },
          demographics: data.demographics ?? existing?.demographics ?? null,
        });
      }
      if (data.notes !== undefined) updatePayload.findings = data.notes;
      if (data.interpretation !== undefined) updatePayload.conclusion = data.interpretation;

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
