'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { PainPoint, PainScaleType } from './pain-scales-data';

// ============================================================================
// TYPES
// ============================================================================

export interface PainAssessment {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  assessment_date: string;
  nrs_score: number | null;
  vas_score: number | null;
  scale_type: PainScaleType;
  pain_points: PainPoint[];
  bpi_scores: Record<string, number> | null;
  mcgill_scores: Record<string, number> | null;
  dn4_answers: Record<string, boolean> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePainAssessment {
  patient_id?: string | null;
  assessment_date?: string;
  nrs_score?: number | null;
  vas_score?: number | null;
  scale_type?: PainScaleType;
  pain_points?: PainPoint[];
  bpi_scores?: Record<string, number> | null;
  mcgill_scores?: Record<string, number> | null;
  dn4_answers?: Record<string, boolean> | null;
  notes?: string | null;
}

interface UsePainAssessmentOptions {
  patientId?: string;
  limit?: number;
}

interface UsePainAssessmentReturn {
  assessments: PainAssessment[];
  loading: boolean;
  error: string | null;
  create: (data: CreatePainAssessment) => Promise<PainAssessment | null>;
  update: (id: string, data: Partial<CreatePainAssessment>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
  /** NRS trend data: [{date, score}] */
  trend: Array<{ date: string; score: number }>;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePainAssessment(
  doctorId: string,
  options?: UsePainAssessmentOptions,
): UsePainAssessmentReturn {
  const [assessments, setAssessments] = useState<PainAssessment[]>([]);
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
        .eq('study_type', 'pain_assessment')
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
        const mapped: PainAssessment[] = (data ?? []).map((row: Record<string, unknown>) => {
          const parsed = tryParseJSON((row.equipment as string) ?? '{}');
          return {
            id: row.id as string,
            doctor_id: row.doctor_id as string,
            patient_id: (row.patient_id as string) ?? null,
            assessment_date: (row.created_at as string).slice(0, 10),
            nrs_score: (parsed?.nrs_score as number) ?? null,
            vas_score: (parsed?.vas_score as number) ?? null,
            scale_type: (parsed?.scale_type as PainScaleType) ?? 'nrs',
            pain_points: (parsed?.pain_points as PainPoint[]) ?? [],
            bpi_scores: (parsed?.bpi_scores as Record<string, number>) ?? null,
            mcgill_scores: (parsed?.mcgill_scores as Record<string, number>) ?? null,
            dn4_answers: (parsed?.dn4_answers as Record<string, boolean>) ?? null,
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

  // Trend (NRS over time, ascending by date)
  const trend = useMemo(() => {
    return assessments
      .filter((a) => a.nrs_score != null)
      .map((a) => ({ date: a.assessment_date, score: a.nrs_score! }))
      .reverse(); // oldest first
  }, [assessments]);

  // Create
  const create = useCallback(
    async (data: CreatePainAssessment): Promise<PainAssessment | null> => {
      const payload = JSON.stringify({
        nrs_score: data.nrs_score,
        vas_score: data.vas_score,
        scale_type: data.scale_type ?? 'nrs',
        pain_points: data.pain_points ?? [],
        bpi_scores: data.bpi_scores,
        mcgill_scores: data.mcgill_scores,
        dn4_answers: data.dn4_answers,
      });

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'pain_assessment',
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
      return row as unknown as PainAssessment;
    },
    [doctorId, refresh],
  );

  // Update
  const update = useCallback(
    async (id: string, data: Partial<CreatePainAssessment>): Promise<boolean> => {
      const existing = assessments.find((a) => a.id === id);
      const updatePayload: Record<string, unknown> = {};

      const merged = {
        nrs_score: data.nrs_score ?? existing?.nrs_score,
        vas_score: data.vas_score ?? existing?.vas_score,
        scale_type: data.scale_type ?? existing?.scale_type,
        pain_points: data.pain_points ?? existing?.pain_points,
        bpi_scores: data.bpi_scores ?? existing?.bpi_scores,
        mcgill_scores: data.mcgill_scores ?? existing?.mcgill_scores,
        dn4_answers: data.dn4_answers ?? existing?.dn4_answers,
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

  return { assessments, loading, error, create, update, remove, refresh, trend };
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
