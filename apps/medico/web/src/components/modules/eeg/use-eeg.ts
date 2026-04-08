'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type {
  ElectrodeActivity,
  RecordingState,
  ActivationProcedure,
  EegImpressionSeverity,
} from './eeg-montages-data';

// ============================================================================
// TYPES
// ============================================================================

export type EegStatus = 'pending' | 'interpreted' | 'reviewed' | 'amended';

/** Electrode activity markings on the scalp map */
export type ElectrodeMarkings = Record<string, ElectrodeActivity>;

/** Background activity assessment */
export interface EegBackgroundActivity {
  dominant_rhythm_frequency: number | null;
  dominant_rhythm_amplitude: number | null;
  symmetry: 'symmetric' | 'asymmetric' | null;
  reactivity: 'reactive' | 'non_reactive' | null;
  ap_gradient: 'preserved' | 'disrupted' | null;
  background_grade: string | null;
}

/** Abnormality finding */
export interface EegAbnormality {
  id: string;
  type: 'focal_slowing' | 'generalized_slowing' | 'epileptiform' | 'periodic' | 'other';
  pattern_id: string | null;
  location: string[];
  morphology: string;
  frequency: string;
  activation_state: RecordingState | null;
  notes: string;
}

/** Event with EEG correlate */
export interface EegEvent {
  id: string;
  time: string;
  clinical_description: string;
  eeg_correlate: string;
  duration_seconds: number | null;
}

/** Seizure record */
export interface EegSeizure {
  id: string;
  type: 'electrographic' | 'electroclinical';
  onset_location: string[];
  duration_seconds: number | null;
  morphology: string;
  clinical_semiology: string;
}

/** Full EEG interpretation */
export interface EegInterpretation {
  recording_state: RecordingState | null;
  recording_duration_minutes: number | null;
  activation_procedures: ActivationProcedure[];
  background_activity: EegBackgroundActivity | null;
  electrode_markings: ElectrodeMarkings;
  abnormalities: EegAbnormality[];
  events: EegEvent[];
  seizures: EegSeizure[];
  impression_severity: EegImpressionSeverity | null;
  impression_text: string;
  clinical_correlation: string;
  comparison_notes: string;
}

export interface EegRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  recording_date: string;
  study_type: 'eeg';
  status: EegStatus;
  interpretation: EegInterpretation | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEegRecord {
  patient_id?: string | null;
  recording_date?: string;
  status?: EegStatus;
  interpretation?: EegInterpretation | null;
  image_url?: string | null;
  notes?: string | null;
}

interface UseEegOptions {
  patientId?: string;
  status?: EegStatus;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

interface UseEegReturn {
  records: EegRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateEegRecord) => Promise<EegRecord | null>;
  update: (id: string, data: Partial<CreateEegRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// EMPTY INTERPRETATION FACTORY
// ============================================================================

export function createEmptyInterpretation(): EegInterpretation {
  return {
    recording_state: null,
    recording_duration_minutes: null,
    activation_procedures: [],
    background_activity: null,
    electrode_markings: {},
    abnormalities: [],
    events: [],
    seizures: [],
    impression_severity: null,
    impression_text: '',
    clinical_correlation: '',
    comparison_notes: '',
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useEeg(
  doctorId: string,
  options?: UseEegOptions,
): UseEegReturn {
  const [records, setRecords] = useState<EegRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch EEG records from diagnostic_imaging where study_type = 'eeg'
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchRecords() {
      let query = supabase
        .from('diagnostic_imaging')
        .select('*, profiles!diagnostic_imaging_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .eq('study_type', 'eeg')
        .order('recording_date', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.dateFrom) {
        query = query.gte('recording_date', options.dateFrom);
      }
      if (options?.dateTo) {
        query = query.lte('recording_date', options.dateTo);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet -- treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setRecords([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setRecords([]);
      } else {
        const mapped: EegRecord[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          patient_name: row.profiles?.full_name ?? undefined,
          recording_date: row.recording_date ?? row.created_at,
          study_type: 'eeg',
          status: row.status ?? 'pending',
          interpretation: row.interpretation ?? null,
          image_url: row.image_url ?? null,
          notes: row.notes ?? null,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setRecords(mapped);
      }
      setLoading(false);
    }

    fetchRecords();
    return () => { cancelled = true; };
  }, [
    doctorId,
    options?.patientId,
    options?.status,
    options?.dateFrom,
    options?.dateTo,
    options?.limit,
    refreshKey,
  ]);

  // Create record
  const create = useCallback(
    async (data: CreateEegRecord): Promise<EegRecord | null> => {
      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          study_type: 'eeg',
          recording_date: data.recording_date ?? new Date().toISOString(),
          status: data.status ?? 'pending',
          ...data,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as EegRecord;
    },
    [doctorId, refresh],
  );

  // Update record
  const update = useCallback(
    async (id: string, data: Partial<CreateEegRecord>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('diagnostic_imaging')
        .update(data)
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

  // Delete record
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
