'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { NeurologyScaleType } from './neurology-scales-data';

// ============================================================================
// TYPES
// ============================================================================

export interface GcsScores {
  eye: number;
  verbal: number;
  motor: number;
}

export interface NeurologyAssessment {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  scale_type: NeurologyScaleType;
  scores: Record<string, number>;
  total: number;
  /** For GCS: quick documentation string */
  gcs_string: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNeurologyAssessment {
  patient_id?: string | null;
  scale_type: NeurologyScaleType;
  scores: Record<string, number>;
  total: number;
  gcs_string?: string | null;
  notes?: string | null;
}

// ============================================================================
// GCS AUTO-CALCULATION
// ============================================================================

export function calculateGcsTotal(scores: Record<string, number>): number {
  return (scores['eye'] ?? 1) + (scores['verbal'] ?? 1) + (scores['motor'] ?? 1);
}

export function buildGcsString(scores: Record<string, number>): string {
  const e = scores['eye'] ?? 1;
  const v = scores['verbal'] ?? 1;
  const m = scores['motor'] ?? 1;
  return `GCS ${e + v + m} (E${e} V${v} M${m})`;
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseNeurologyScalesOptions {
  patientId?: string;
  scaleType?: NeurologyScaleType;
  limit?: number;
}

interface UseNeurologyScalesReturn {
  assessments: NeurologyAssessment[];
  loading: boolean;
  error: string | null;
  createAssessment: (data: CreateNeurologyAssessment) => Promise<NeurologyAssessment | null>;
  updateAssessment: (id: string, data: Partial<CreateNeurologyAssessment>) => Promise<boolean>;
  removeAssessment: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useNeurologyScales(
  doctorId: string,
  options?: UseNeurologyScalesOptions,
): UseNeurologyScalesReturn {
  const [assessments, setAssessments] = useState<NeurologyAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Fetch assessments ───────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAssessments() {
      let query = supabase
        .from('clinical_templates')
        .select('*, profiles!clinical_templates_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .eq('type', 'neurology_scale')
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
        const mapped: NeurologyAssessment[] = (data ?? []).map((row: any) => {
          const content = typeof row.content === 'object' && row.content !== null
            ? row.content
            : {};

          return {
            id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? undefined,
            scale_type: content.scale_type ?? 'glasgow',
            scores: typeof content.scores === 'object' ? content.scores : {},
            total: content.total ?? 0,
            gcs_string: content.gcs_string ?? null,
            notes: content.notes ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });

        const filtered = options?.scaleType
          ? mapped.filter((a) => a.scale_type === options.scaleType)
          : mapped;

        setAssessments(filtered);
      }
      setLoading(false);
    }

    fetchAssessments();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.scaleType, options?.limit, refreshKey]);

  // ── Create assessment ─────────────────────────────────────────
  const createAssessment = useCallback(
    async (data: CreateNeurologyAssessment): Promise<NeurologyAssessment | null> => {
      const content = {
        scale_type: data.scale_type,
        scores: data.scores,
        total: data.total,
        gcs_string: data.gcs_string ?? null,
        notes: data.notes ?? null,
      };

      const scaleLabels: Record<NeurologyScaleType, string> = {
        glasgow: 'Escala de Glasgow',
        nihss: 'NIHSS',
        rankin: 'Rankin Modificada',
        mmse: 'Mini-Mental (MMSE)',
      };

      const { data: row, error: insertError } = await supabase
        .from('clinical_templates')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          type: 'neurology_scale',
          name: `${scaleLabels[data.scale_type]} — ${data.total} pts`,
          content,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as NeurologyAssessment;
    },
    [doctorId, refresh],
  );

  // ── Update assessment ─────────────────────────────────────────
  const updateAssessment = useCallback(
    async (id: string, data: Partial<CreateNeurologyAssessment>): Promise<boolean> => {
      const { data: current, error: readError } = await supabase
        .from('clinical_templates')
        .select('content')
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .single();

      if (readError) {
        setError(readError.message);
        return false;
      }

      const content = typeof current.content === 'object' && current.content !== null
        ? { ...current.content as Record<string, unknown> }
        : {};

      if (data.scores !== undefined) content.scores = data.scores;
      if (data.total !== undefined) content.total = data.total;
      if (data.gcs_string !== undefined) content.gcs_string = data.gcs_string;
      if (data.notes !== undefined) content.notes = data.notes;

      const { error: updateError } = await supabase
        .from('clinical_templates')
        .update({ content })
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

  // ── Remove assessment ─────────────────────────────────────────
  const removeAssessment = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('clinical_templates')
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

  return { assessments, loading, error, createAssessment, updateAssessment, removeAssessment, refresh };
}
