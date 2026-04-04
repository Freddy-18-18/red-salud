'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type EcgClassification = 'normal' | 'borderline' | 'abnormal' | 'critical';
export type EcgStatus = 'pending' | 'interpreted' | 'reviewed' | 'amended';
export type RhythmType = 'sinus' | 'non_sinus';
export type RhythmRegularity = 'regular' | 'irregular';
export type AxisDeviation = 'normal' | 'left' | 'right' | 'extreme';

export interface EcgMorphologyFindings {
  st_elevation: string[];
  st_depression: string[];
  t_wave_inversion: string[];
  q_waves: string[];
  bundle_branch_block: 'none' | 'lbbb' | 'rbbb' | null;
  lvh: boolean;
  rvh: boolean;
  atrial_enlargement: 'none' | 'left' | 'right' | 'bilateral' | null;
}

export interface EcgInterpretation {
  heart_rate: number | null;
  rhythm_type: RhythmType | null;
  rhythm_regularity: RhythmRegularity | null;
  pr_interval: number | null;
  qrs_duration: number | null;
  qt_interval: number | null;
  qtc_interval: number | null;
  axis: AxisDeviation | null;
  morphology: EcgMorphologyFindings | null;
  interpretation_text: string;
  classification: EcgClassification;
  comparison_notes: string;
}

/** Raw 12-lead waveform data: lead name -> array of voltage samples (mV) */
export type EcgWaveformData = Record<string, number[]>;

export interface EcgRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  recording_date: string;
  status: EcgStatus;
  classification: EcgClassification | null;
  waveform_data: EcgWaveformData | null;
  image_url: string | null;
  interpretation: EcgInterpretation | null;
  sample_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEcgRecord {
  patient_id?: string | null;
  recording_date?: string;
  status?: EcgStatus;
  classification?: EcgClassification | null;
  waveform_data?: EcgWaveformData | null;
  image_url?: string | null;
  interpretation?: EcgInterpretation | null;
  sample_rate?: number | null;
  notes?: string | null;
}

interface UseEcgOptions {
  patientId?: string;
  status?: EcgStatus;
  classification?: EcgClassification;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

interface UseEcgReturn {
  records: EcgRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateEcgRecord) => Promise<EcgRecord | null>;
  update: (id: string, data: Partial<CreateEcgRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEcg(
  doctorId: string,
  options?: UseEcgOptions,
): UseEcgReturn {
  const [records, setRecords] = useState<EcgRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch ECG records
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchRecords() {
      let query = supabase
        .from('cardiology_ecg')
        .select('*, profiles!cardiology_ecg_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .order('recording_date', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.classification) {
        query = query.eq('classification', options.classification);
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
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setRecords([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setRecords([]);
      } else {
        const mapped: EcgRecord[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          patient_name: row.profiles?.full_name ?? undefined,
          recording_date: row.recording_date ?? row.created_at,
          status: row.status ?? 'pending',
          classification: row.classification ?? null,
          waveform_data: row.waveform_data ?? null,
          image_url: row.image_url ?? null,
          interpretation: row.interpretation ?? null,
          sample_rate: row.sample_rate ?? null,
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
    options?.classification,
    options?.dateFrom,
    options?.dateTo,
    options?.limit,
    refreshKey,
  ]);

  // Create record
  const create = useCallback(
    async (data: CreateEcgRecord): Promise<EcgRecord | null> => {
      const { data: row, error: insertError } = await supabase
        .from('cardiology_ecg')
        .insert({
          doctor_id: doctorId,
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
      return row as EcgRecord;
    },
    [doctorId, refresh],
  );

  // Update record
  const update = useCallback(
    async (id: string, data: Partial<CreateEcgRecord>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('cardiology_ecg')
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
        .from('cardiology_ecg')
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
