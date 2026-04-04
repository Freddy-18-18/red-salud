'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  calculateTotalScore,
  getSeverityBand,
  hasSuicideRisk,
  type SeverityBand,
} from './psychiatric-scales-data';

// ============================================================================
// TYPES
// ============================================================================

export interface PsychiatricAssessment {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  scale_id: string;
  responses: Record<string, number>;
  total_score: number;
  severity: string;
  severity_band: SeverityBand | null;
  suicide_risk_flagged: boolean;
  notes: string | null;
  assessment_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssessment {
  patient_id?: string | null;
  scale_id: string;
  responses: Record<string, number>;
  notes?: string | null;
  assessment_date?: string;
}

interface UseAssessmentOptions {
  patientId?: string;
  scaleId?: string;
  limit?: number;
}

interface UseAssessmentReturn {
  assessments: PsychiatricAssessment[];
  loading: boolean;
  error: string | null;
  create: (data: CreateAssessment) => Promise<PsychiatricAssessment | null>;
  update: (id: string, data: Partial<CreateAssessment>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePsychiatricAssessment(
  doctorId: string,
  options?: UseAssessmentOptions,
): UseAssessmentReturn {
  const [assessments, setAssessments] = useState<PsychiatricAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch assessments
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAssessments() {
      let query = supabase
        .from('psychiatric_assessments')
        .select('*, profiles!psychiatric_assessments_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .order('assessment_date', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.scaleId) {
        query = query.eq('scale_id', options.scaleId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setAssessments([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setAssessments([]);
      } else {
        const mapped: PsychiatricAssessment[] = (data ?? []).map((row: any) => {
          const responses = row.responses ?? {};
          const scaleId = row.scale_id ?? '';
          const totalScore = row.total_score ?? calculateTotalScore(scaleId, responses);
          const severityBand = getSeverityBand(scaleId, totalScore);

          return {
            id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? undefined,
            scale_id: scaleId,
            responses,
            total_score: totalScore,
            severity: row.severity ?? severityBand?.label ?? 'Desconocida',
            severity_band: severityBand,
            suicide_risk_flagged: row.suicide_risk_flagged ?? hasSuicideRisk(scaleId, responses),
            notes: row.notes ?? null,
            assessment_date: row.assessment_date ?? row.created_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });
        setAssessments(mapped);
      }
      setLoading(false);
    }

    fetchAssessments();
    return () => { cancelled = true; };
  }, [
    doctorId,
    options?.patientId,
    options?.scaleId,
    options?.limit,
    refreshKey,
  ]);

  // Create assessment
  const create = useCallback(
    async (data: CreateAssessment): Promise<PsychiatricAssessment | null> => {
      const totalScore = calculateTotalScore(data.scale_id, data.responses);
      const severityBand = getSeverityBand(data.scale_id, totalScore);
      const suicideRisk = hasSuicideRisk(data.scale_id, data.responses);

      const { data: row, error: insertError } = await supabase
        .from('psychiatric_assessments')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          scale_id: data.scale_id,
          responses: data.responses,
          total_score: totalScore,
          severity: severityBand?.label ?? 'Desconocida',
          suicide_risk_flagged: suicideRisk,
          notes: data.notes ?? null,
          assessment_date: data.assessment_date ?? new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as PsychiatricAssessment;
    },
    [doctorId, refresh],
  );

  // Update assessment
  const update = useCallback(
    async (id: string, data: Partial<CreateAssessment>): Promise<boolean> => {
      const updatePayload: Record<string, unknown> = { ...data };

      // Recalculate scores if responses changed
      if (data.responses && data.scale_id) {
        updatePayload.total_score = calculateTotalScore(data.scale_id, data.responses);
        const band = getSeverityBand(data.scale_id, updatePayload.total_score as number);
        updatePayload.severity = band?.label ?? 'Desconocida';
        updatePayload.suicide_risk_flagged = hasSuicideRisk(data.scale_id, data.responses);
      }

      const { error: updateError } = await supabase
        .from('psychiatric_assessments')
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
    [doctorId, refresh],
  );

  // Delete assessment
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('psychiatric_assessments')
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
