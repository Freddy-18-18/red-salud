'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  countTenderJoints,
  countSwollenJoints,
  calculateDAS28ESR,
  calculateDAS28CRP,
  getDAS28ActivityLevel,
  calculateCDAI,
  getCDAIActivityLevel,
  calculateHAQDI,
  type RheumatologyAssessment,
  type JointStatus,
  type DAS28Result,
  type HAQResult,
  type CDAIResult,
} from './rheumatology-scales-data';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateRheumatologyAssessment {
  patient_id?: string | null;
  assessment_type: 'das28' | 'haq' | 'cdai' | 'joint-map';
  joints?: Record<string, JointStatus>;
  das28_input?: {
    esr?: number;
    crp?: number;
    marker: 'ESR' | 'CRP';
    vasPatient: number;
  };
  haq_input?: {
    responses: Record<string, number>;
    aids: string[];
  };
  cdai_input?: {
    vasPatient: number;
    vasEvaluator: number;
  };
  notes?: string | null;
  assessment_date?: string;
}

interface UseRheumatologyOptions {
  patientId?: string;
  assessmentType?: string;
  limit?: number;
}

interface UseRheumatologyReturn {
  assessments: RheumatologyAssessment[];
  loading: boolean;
  error: string | null;
  create: (data: CreateRheumatologyAssessment) => Promise<RheumatologyAssessment | null>;
  update: (id: string, data: Partial<CreateRheumatologyAssessment>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useRheumatology(
  doctorId: string,
  options?: UseRheumatologyOptions,
): UseRheumatologyReturn {
  const [assessments, setAssessments] = useState<RheumatologyAssessment[]>([]);
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
        .from('rheumatology_assessments')
        .select('*, profiles!rheumatology_assessments_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .order('assessment_date', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.assessmentType) {
        query = query.eq('assessment_type', options.assessmentType);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setAssessments([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setAssessments([]);
      } else {
        const mapped: RheumatologyAssessment[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          patient_name: row.profiles?.full_name ?? undefined,
          assessment_type: row.assessment_type ?? 'joint-map',
          joints: row.joints ?? {},
          das28_result: row.das28_result ?? null,
          haq_result: row.haq_result ?? null,
          cdai_result: row.cdai_result ?? null,
          notes: row.notes ?? null,
          assessment_date: row.assessment_date ?? row.created_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setAssessments(mapped);
      }
      setLoading(false);
    }

    fetchAssessments();
    return () => {
      cancelled = true;
    };
  }, [
    doctorId,
    options?.patientId,
    options?.assessmentType,
    options?.limit,
    refreshKey,
  ]);

  // Create assessment with auto-calculation
  const create = useCallback(
    async (data: CreateRheumatologyAssessment): Promise<RheumatologyAssessment | null> => {
      const joints = data.joints ?? {};
      const tjc = countTenderJoints(joints);
      const sjc = countSwollenJoints(joints);

      let das28Result: DAS28Result | null = null;
      let haqResult: HAQResult | null = null;
      let cdaiResult: CDAIResult | null = null;

      // Calculate DAS28
      if (data.assessment_type === 'das28' && data.das28_input) {
        const { marker, vasPatient } = data.das28_input;
        let score: number;

        if (marker === 'ESR' && data.das28_input.esr != null) {
          score = calculateDAS28ESR(tjc, sjc, data.das28_input.esr, vasPatient);
          das28Result = {
            tjc28: tjc,
            sjc28: sjc,
            esr: data.das28_input.esr,
            vasPatient,
            score,
            marker: 'ESR',
            activityLevel: getDAS28ActivityLevel(score).level,
          };
        } else if (marker === 'CRP' && data.das28_input.crp != null) {
          score = calculateDAS28CRP(tjc, sjc, data.das28_input.crp, vasPatient);
          das28Result = {
            tjc28: tjc,
            sjc28: sjc,
            crp: data.das28_input.crp,
            vasPatient,
            score,
            marker: 'CRP',
            activityLevel: getDAS28ActivityLevel(score).level,
          };
        }
      }

      // Calculate HAQ-DI
      if (data.assessment_type === 'haq' && data.haq_input) {
        haqResult = calculateHAQDI(data.haq_input.responses, data.haq_input.aids);
      }

      // Calculate CDAI
      if (data.assessment_type === 'cdai' && data.cdai_input) {
        const score = calculateCDAI(
          tjc,
          sjc,
          data.cdai_input.vasPatient,
          data.cdai_input.vasEvaluator,
        );
        cdaiResult = {
          tjc28: tjc,
          sjc28: sjc,
          vasPatient: data.cdai_input.vasPatient,
          vasEvaluator: data.cdai_input.vasEvaluator,
          score,
          activityLevel: getCDAIActivityLevel(score).level,
        };
      }

      const { data: row, error: insertError } = await supabase
        .from('rheumatology_assessments')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          assessment_type: data.assessment_type,
          joints,
          das28_result: das28Result,
          haq_result: haqResult,
          cdai_result: cdaiResult,
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
      return row as unknown as RheumatologyAssessment;
    },
    [doctorId, refresh],
  );

  // Update assessment
  const update = useCallback(
    async (id: string, data: Partial<CreateRheumatologyAssessment>): Promise<boolean> => {
      const updatePayload: Record<string, unknown> = {};

      if (data.joints) updatePayload.joints = data.joints;
      if (data.notes !== undefined) updatePayload.notes = data.notes;
      if (data.assessment_date) updatePayload.assessment_date = data.assessment_date;

      const { error: updateError } = await supabase
        .from('rheumatology_assessments')
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
        .from('rheumatology_assessments')
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
