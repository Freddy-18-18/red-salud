'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface AllergyTest {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  study_type: 'allergy_test';
  test_method: 'skin_prick' | 'ige_specific' | 'ige_total' | 'patch_test';
  body_region: string | null;
  status: 'ordered' | 'in_progress' | 'completed' | 'reviewed';
  clinical_indication: string | null;
  findings: string | null;
  conclusion: string | null;
  results_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAllergyTest {
  patient_id?: string | null;
  test_method: AllergyTest['test_method'];
  status?: AllergyTest['status'];
  clinical_indication?: string | null;
  findings?: string | null;
  conclusion?: string | null;
  results_data?: Record<string, unknown> | null;
}

interface UseAllergyOptions {
  patientId?: string;
  limit?: number;
}

interface UseAllergyReturn {
  tests: AllergyTest[];
  loading: boolean;
  error: string | null;
  create: (data: CreateAllergyTest) => Promise<AllergyTest | null>;
  update: (id: string, data: Partial<CreateAllergyTest>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAllergy(
  doctorId: string,
  options?: UseAllergyOptions,
): UseAllergyReturn {
  const [tests, setTests] = useState<AllergyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch tests
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchTests() {
      let query = supabase
        .from('diagnostic_imaging')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('study_type', 'allergy_test')
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
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setTests([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setTests([]);
      } else {
        const mapped: AllergyTest[] = (data ?? []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          doctor_id: row.doctor_id as string,
          patient_id: (row.patient_id as string) ?? null,
          study_type: 'allergy_test' as const,
          test_method: (row.technique as AllergyTest['test_method']) ?? 'skin_prick',
          body_region: (row.body_region as string) ?? null,
          status: (row.status as AllergyTest['status']) ?? 'ordered',
          clinical_indication: (row.clinical_indication as string) ?? null,
          findings: (row.findings as string) ?? null,
          conclusion: (row.conclusion as string) ?? null,
          results_data: row.equipment ? tryParseJSON(row.equipment as string) : null,
          created_at: row.created_at as string,
          updated_at: row.updated_at as string,
        }));
        setTests(mapped);
      }
      setLoading(false);
    }

    fetchTests();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.limit, refreshKey]);

  // Create test
  const create = useCallback(
    async (data: CreateAllergyTest): Promise<AllergyTest | null> => {
      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'allergy_test',
          technique: data.test_method,
          status: data.status ?? 'ordered',
          clinical_indication: data.clinical_indication ?? null,
          findings: data.findings ?? null,
          conclusion: data.conclusion ?? null,
          equipment: data.results_data ? JSON.stringify(data.results_data) : null,
          image_urls: [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as AllergyTest;
    },
    [doctorId, refresh],
  );

  // Update test
  const update = useCallback(
    async (id: string, data: Partial<CreateAllergyTest>): Promise<boolean> => {
      const updateData: Record<string, unknown> = {};
      if (data.test_method !== undefined) updateData.technique = data.test_method;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.clinical_indication !== undefined) updateData.clinical_indication = data.clinical_indication;
      if (data.findings !== undefined) updateData.findings = data.findings;
      if (data.conclusion !== undefined) updateData.conclusion = data.conclusion;
      if (data.results_data !== undefined) updateData.equipment = JSON.stringify(data.results_data);

      const { error: updateError } = await supabase
        .from('diagnostic_imaging')
        .update(updateData)
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

  // Delete test
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

  return { tests, loading, error, create, update, remove, refresh };
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
