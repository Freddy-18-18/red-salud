'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type EarSide = 'right' | 'left';
export type ConductionType = 'air' | 'bone';

export interface AudiogramThreshold {
  frequency: number; // Hz
  ear: EarSide;
  conduction: ConductionType;
  threshold: number; // dB HL
}

export interface SpeechAudiometry {
  ear: EarSide;
  srt: number | null; // Speech Recognition Threshold (dB)
  wrs: number | null; // Word Recognition Score (%)
}

export type TympanogramType = 'A' | 'As' | 'Ad' | 'B' | 'C';

export interface TympanometryResult {
  ear: EarSide;
  type: TympanogramType;
  compliance: number | null; // mL
  pressure: number | null; // daPa
  volume: number | null; // mL
}

export interface AudiometryTest {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  test_date: string;
  thresholds: AudiogramThreshold[];
  speech: SpeechAudiometry[];
  tympanometry: TympanometryResult[];
  notes: string | null;
  interpretation: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAudiometryTest {
  patient_id?: string | null;
  test_date?: string;
  thresholds: AudiogramThreshold[];
  speech?: SpeechAudiometry[];
  tympanometry?: TympanometryResult[];
  notes?: string | null;
  interpretation?: string | null;
}

interface UseAudiometryOptions {
  patientId?: string;
  limit?: number;
}

interface UseAudiometryReturn {
  tests: AudiometryTest[];
  loading: boolean;
  error: string | null;
  create: (data: CreateAudiometryTest) => Promise<AudiometryTest | null>;
  update: (id: string, data: Partial<CreateAudiometryTest>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const AUDIOGRAM_FREQUENCIES = [125, 250, 500, 1000, 2000, 4000, 8000] as const;

export const SEVERITY_BANDS = [
  { label: 'Normal', min: -10, max: 25, color: '#22c55e' },
  { label: 'Leve', min: 26, max: 40, color: '#eab308' },
  { label: 'Moderada', min: 41, max: 55, color: '#f97316' },
  { label: 'Moderada-Severa', min: 56, max: 70, color: '#ef4444' },
  { label: 'Severa', min: 71, max: 90, color: '#dc2626' },
  { label: 'Profunda', min: 91, max: 120, color: '#991b1b' },
] as const;

export const TYMPANOGRAM_DESCRIPTIONS: Record<TympanogramType, string> = {
  A: 'Normal',
  As: 'Compliance reducida (rigidez)',
  Ad: 'Compliance aumentada (flacidez)',
  B: 'Plana (efusión / perforación)',
  C: 'Presión negativa (disfunción tubárica)',
};

// ============================================================================
// HOOK
// ============================================================================

export function useAudiometry(
  doctorId: string,
  options?: UseAudiometryOptions,
): UseAudiometryReturn {
  const [tests, setTests] = useState<AudiometryTest[]>([]);
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

    async function fetchTests() {
      let query = supabase
        .from('diagnostic_imaging')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('study_type', 'audiometry')
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
          setTests([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setTests([]);
      } else {
        const mapped: AudiometryTest[] = (data ?? []).map((row: Record<string, unknown>) => {
          const parsed = tryParseJSON((row.equipment as string) ?? '{}');
          return {
            id: row.id as string,
            doctor_id: row.doctor_id as string,
            patient_id: (row.patient_id as string) ?? null,
            test_date: (row.created_at as string).slice(0, 10),
            thresholds: (parsed?.thresholds as AudiogramThreshold[]) ?? [],
            speech: (parsed?.speech as SpeechAudiometry[]) ?? [],
            tympanometry: (parsed?.tympanometry as TympanometryResult[]) ?? [],
            notes: (row.findings as string) ?? null,
            interpretation: (row.conclusion as string) ?? null,
            created_at: row.created_at as string,
            updated_at: row.updated_at as string,
          };
        });
        setTests(mapped);
      }
      setLoading(false);
    }

    fetchTests();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.limit, refreshKey]);

  // Create
  const create = useCallback(
    async (data: CreateAudiometryTest): Promise<AudiometryTest | null> => {
      const resultsPayload = JSON.stringify({
        thresholds: data.thresholds,
        speech: data.speech ?? [],
        tympanometry: data.tympanometry ?? [],
      });

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'audiometry',
          status: 'completed',
          findings: data.notes ?? null,
          conclusion: data.interpretation ?? null,
          equipment: resultsPayload,
          image_urls: [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as AudiometryTest;
    },
    [doctorId, refresh],
  );

  // Update
  const update = useCallback(
    async (id: string, data: Partial<CreateAudiometryTest>): Promise<boolean> => {
      const updatePayload: Record<string, unknown> = {};

      if (data.thresholds || data.speech || data.tympanometry) {
        const existing = tests.find((t) => t.id === id);
        updatePayload.equipment = JSON.stringify({
          thresholds: data.thresholds ?? existing?.thresholds ?? [],
          speech: data.speech ?? existing?.speech ?? [],
          tympanometry: data.tympanometry ?? existing?.tympanometry ?? [],
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
    [doctorId, tests, refresh],
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

/**
 * Calculate Pure Tone Average (PTA) for an ear.
 * Uses 500, 1000, 2000 Hz thresholds.
 */
export function calculatePTA(thresholds: AudiogramThreshold[], ear: EarSide): number | null {
  const ptaFreqs = [500, 1000, 2000];
  const values = ptaFreqs
    .map((f) => thresholds.find((t) => t.frequency === f && t.ear === ear && t.conduction === 'air'))
    .filter((t): t is AudiogramThreshold => t != null)
    .map((t) => t.threshold);

  if (values.length !== 3) return null;
  return Math.round((values[0] + values[1] + values[2]) / 3);
}

/**
 * Classify hearing loss severity from PTA.
 */
export function classifySeverity(pta: number): string {
  const band = SEVERITY_BANDS.find((b) => pta >= b.min && pta <= b.max);
  return band?.label ?? 'Profunda';
}
