'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface NutritionAssessment {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  assessment_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  waist_hip_ratio: number | null;
  body_fat_percent: number | null;
  skinfolds: Record<string, number> | null;
  bmr: number | null;
  tdee: number | null;
  target_kcal: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNutritionAssessment {
  patient_id?: string | null;
  assessment_date?: string;
  weight_kg?: number | null;
  height_cm?: number | null;
  bmi?: number | null;
  waist_cm?: number | null;
  hip_cm?: number | null;
  waist_hip_ratio?: number | null;
  body_fat_percent?: number | null;
  skinfolds?: Record<string, number> | null;
  bmr?: number | null;
  tdee?: number | null;
  target_kcal?: number | null;
  notes?: string | null;
}

interface UseNutritionOptions {
  patientId?: string;
  limit?: number;
}

interface UseNutritionReturn {
  assessments: NutritionAssessment[];
  loading: boolean;
  error: string | null;
  create: (data: CreateNutritionAssessment) => Promise<NutritionAssessment | null>;
  update: (id: string, data: Partial<CreateNutritionAssessment>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useNutrition(
  doctorId: string,
  options?: UseNutritionOptions,
): UseNutritionReturn {
  const [assessments, setAssessments] = useState<NutritionAssessment[]>([]);
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

    async function fetchAssessments() {
      let query = supabase
        .from('diagnostic_imaging')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('study_type', 'nutrition_assessment')
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
          setAssessments([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setAssessments([]);
      } else {
        const mapped: NutritionAssessment[] = (data ?? []).map((row: Record<string, unknown>) => {
          const parsed = tryParseJSON((row.equipment as string) ?? '{}');
          return {
            id: row.id as string,
            doctor_id: row.doctor_id as string,
            patient_id: (row.patient_id as string) ?? null,
            assessment_date: (row.created_at as string).slice(0, 10),
            weight_kg: (parsed?.weight_kg as number) ?? null,
            height_cm: (parsed?.height_cm as number) ?? null,
            bmi: (parsed?.bmi as number) ?? null,
            waist_cm: (parsed?.waist_cm as number) ?? null,
            hip_cm: (parsed?.hip_cm as number) ?? null,
            waist_hip_ratio: (parsed?.waist_hip_ratio as number) ?? null,
            body_fat_percent: (parsed?.body_fat_percent as number) ?? null,
            skinfolds: (parsed?.skinfolds as Record<string, number>) ?? null,
            bmr: (parsed?.bmr as number) ?? null,
            tdee: (parsed?.tdee as number) ?? null,
            target_kcal: (parsed?.target_kcal as number) ?? null,
            notes: (row.findings as string) ?? null,
            created_at: row.created_at as string,
            updated_at: row.updated_at as string,
          };
        });
        setAssessments(mapped);
      }
      setLoading(false);
    }

    fetchAssessments();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.limit, refreshKey]);

  // Create
  const create = useCallback(
    async (data: CreateNutritionAssessment): Promise<NutritionAssessment | null> => {
      const payload = JSON.stringify({
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        bmi: data.bmi,
        waist_cm: data.waist_cm,
        hip_cm: data.hip_cm,
        waist_hip_ratio: data.waist_hip_ratio,
        body_fat_percent: data.body_fat_percent,
        skinfolds: data.skinfolds,
        bmr: data.bmr,
        tdee: data.tdee,
        target_kcal: data.target_kcal,
      });

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'nutrition_assessment',
          status: 'completed',
          findings: data.notes ?? null,
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
      return row as unknown as NutritionAssessment;
    },
    [doctorId, refresh],
  );

  // Update
  const update = useCallback(
    async (id: string, data: Partial<CreateNutritionAssessment>): Promise<boolean> => {
      const existing = assessments.find((a) => a.id === id);
      const updatePayload: Record<string, unknown> = {};

      const merged = {
        weight_kg: data.weight_kg ?? existing?.weight_kg,
        height_cm: data.height_cm ?? existing?.height_cm,
        bmi: data.bmi ?? existing?.bmi,
        waist_cm: data.waist_cm ?? existing?.waist_cm,
        hip_cm: data.hip_cm ?? existing?.hip_cm,
        waist_hip_ratio: data.waist_hip_ratio ?? existing?.waist_hip_ratio,
        body_fat_percent: data.body_fat_percent ?? existing?.body_fat_percent,
        skinfolds: data.skinfolds ?? existing?.skinfolds,
        bmr: data.bmr ?? existing?.bmr,
        tdee: data.tdee ?? existing?.tdee,
        target_kcal: data.target_kcal ?? existing?.target_kcal,
      };

      updatePayload.equipment = JSON.stringify(merged);
      if (data.notes !== undefined) updatePayload.findings = data.notes;

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
    [doctorId, assessments, refresh],
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

  return { assessments, loading, error, create, update, remove, refresh };
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
