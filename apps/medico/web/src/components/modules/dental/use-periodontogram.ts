'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

/** Six probing sites per tooth: MB, B, DB, ML, L, DL */
export type ProbingSite = 'MB' | 'B' | 'DB' | 'ML' | 'L' | 'DL';

export const PROBING_SITES: ProbingSite[] = ['MB', 'B', 'DB', 'ML', 'L', 'DL'];

export const PROBING_SITE_LABELS: Record<ProbingSite, string> = {
  MB: 'Mesiobucal',
  B: 'Bucal',
  DB: 'Distobucal',
  ML: 'Mesiolingual',
  L: 'Lingual',
  DL: 'Distolingual',
};

/** Per-tooth periodontal data stored in the JSONB `teeth` column */
export interface ToothPerioData {
  probing_depth: number[];  // 6 values, one per site
  recession: number[];      // 6 values
  bleeding: boolean[];      // 6 values
  suppuration: boolean[];   // 6 values
  plaque: boolean[];        // 6 values
  mobility: number;         // 0-3
  furcation: number;        // 0-3
  missing: boolean;
}

export interface PerioExam {
  id: string;
  patient_id: string;
  doctor_id: string;
  exam_date: string;
  notes: string;
  teeth: Record<string, ToothPerioData>;
  created_at: string;
  updated_at: string;
}

export interface CreatePerioExam {
  patient_id: string;
  exam_date?: string;
  notes?: string;
  teeth: Record<string, ToothPerioData>;
}

/** Summary statistics computed from exam data */
export interface PerioSummary {
  totalSites: number;
  bopCount: number;
  bopPercentage: number;
  avgProbingDepth: number;
  pocketsOver4mm: number;
  pocketsOver4mmPercentage: number;
  pocketsOver6mm: number;
  pocketsOver6mmPercentage: number;
  missingTeeth: number;
  teethWithMobility: number;
}

interface UsePerioOptions {
  patientId?: string;
  limit?: number;
}

interface UsePerioReturn {
  exams: PerioExam[];
  currentExam: PerioExam | null;
  loading: boolean;
  error: string | null;
  summary: PerioSummary | null;
  create: (data: CreatePerioExam) => Promise<PerioExam | null>;
  update: (id: string, data: Partial<CreatePerioExam>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  selectExam: (exam: PerioExam | null) => void;
  refresh: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Create an empty tooth data structure */
export function emptyToothData(): ToothPerioData {
  return {
    probing_depth: [0, 0, 0, 0, 0, 0],
    recession: [0, 0, 0, 0, 0, 0],
    bleeding: [false, false, false, false, false, false],
    suppuration: [false, false, false, false, false, false],
    plaque: [false, false, false, false, false, false],
    mobility: 0,
    furcation: 0,
    missing: false,
  };
}

/** FDI tooth numbers — adult (32 teeth) */
export const ADULT_TEETH: string[] = [
  // Upper right (Q1): 18..11
  '18', '17', '16', '15', '14', '13', '12', '11',
  // Upper left (Q2): 21..28
  '21', '22', '23', '24', '25', '26', '27', '28',
  // Lower left (Q3): 38..31
  '38', '37', '36', '35', '34', '33', '32', '31',
  // Lower right (Q4): 41..48
  '41', '42', '43', '44', '45', '46', '47', '48',
];

/** FDI tooth numbers — pediatric (20 teeth) */
export const PEDIATRIC_TEETH: string[] = [
  '55', '54', '53', '52', '51',
  '61', '62', '63', '64', '65',
  '75', '74', '73', '72', '71',
  '81', '82', '83', '84', '85',
];

/** Upper arch teeth (Q1 + Q2) */
export const UPPER_TEETH: string[] = ADULT_TEETH.slice(0, 16);
/** Lower arch teeth (Q3 + Q4) */
export const LOWER_TEETH: string[] = ADULT_TEETH.slice(16);

/** Molar teeth that can have furcation involvement */
export const MOLAR_TEETH = new Set([
  '18', '17', '16', '26', '27', '28',
  '38', '37', '36', '46', '47', '48',
]);

/** Compute summary statistics from teeth data */
export function computePerioSummary(teeth: Record<string, ToothPerioData>): PerioSummary {
  let totalSites = 0;
  let bopCount = 0;
  let totalDepth = 0;
  let pocketsOver4mm = 0;
  let pocketsOver6mm = 0;
  let missingTeeth = 0;
  let teethWithMobility = 0;

  for (const [, data] of Object.entries(teeth)) {
    if (data.missing) {
      missingTeeth++;
      continue;
    }

    if (data.mobility > 0) teethWithMobility++;

    for (let i = 0; i < 6; i++) {
      totalSites++;
      const depth = data.probing_depth[i] ?? 0;
      totalDepth += depth;
      if (data.bleeding[i]) bopCount++;
      if (depth >= 4) pocketsOver4mm++;
      if (depth >= 6) pocketsOver6mm++;
    }
  }

  return {
    totalSites,
    bopCount,
    bopPercentage: totalSites > 0 ? Math.round((bopCount / totalSites) * 100) : 0,
    avgProbingDepth: totalSites > 0 ? Math.round((totalDepth / totalSites) * 10) / 10 : 0,
    pocketsOver4mm,
    pocketsOver4mmPercentage: totalSites > 0 ? Math.round((pocketsOver4mm / totalSites) * 100) : 0,
    pocketsOver6mm,
    pocketsOver6mmPercentage: totalSites > 0 ? Math.round((pocketsOver6mm / totalSites) * 100) : 0,
    missingTeeth,
    teethWithMobility,
  };
}

/** Probing depth color: green (1-3), yellow (4-5), red (6+) */
export function depthColor(depth: number): string {
  if (depth <= 3) return '#22C55E'; // green
  if (depth <= 5) return '#EAB308'; // yellow
  return '#EF4444'; // red
}

// ============================================================================
// HOOK
// ============================================================================

export function usePeriodontogram(
  doctorId: string,
  options?: UsePerioOptions,
): UsePerioReturn {
  const [exams, setExams] = useState<PerioExam[]>([]);
  const [currentExam, setCurrentExam] = useState<PerioExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch exams
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchExams() {
      let query = supabase
        .from('dental_perio_exams')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('exam_date', { ascending: false });

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
          setExams([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setExams([]);
      } else {
        const mapped: PerioExam[] = (data ?? []).map((row: any) => ({
          id: row.id,
          patient_id: row.patient_id,
          doctor_id: row.doctor_id,
          exam_date: row.exam_date,
          notes: row.notes ?? '',
          teeth: row.teeth ?? {},
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setExams(mapped);
        // Auto-select the latest exam
        if (mapped.length > 0 && !currentExam) {
          setCurrentExam(mapped[0]);
        }
      }
      setLoading(false);
    }

    fetchExams();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, options?.patientId, options?.limit, refreshKey]);

  // Computed summary for current exam
  const summary = useMemo<PerioSummary | null>(() => {
    if (!currentExam) return null;
    return computePerioSummary(currentExam.teeth);
  }, [currentExam]);

  // Create exam
  const create = useCallback(
    async (data: CreatePerioExam): Promise<PerioExam | null> => {
      const { data: row, error: insertError } = await supabase
        .from('dental_perio_exams')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id,
          exam_date: data.exam_date ?? new Date().toISOString().slice(0, 10),
          notes: data.notes ?? '',
          teeth: data.teeth,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      const newExam: PerioExam = {
        id: row.id,
        patient_id: row.patient_id,
        doctor_id: row.doctor_id,
        exam_date: row.exam_date,
        notes: row.notes ?? '',
        teeth: row.teeth ?? {},
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      setCurrentExam(newExam);
      refresh();
      return newExam;
    },
    [doctorId, refresh],
  );

  // Update exam
  const update = useCallback(
    async (id: string, data: Partial<CreatePerioExam>): Promise<boolean> => {
      const updatePayload: Record<string, unknown> = {};
      if (data.notes !== undefined) updatePayload.notes = data.notes;
      if (data.teeth !== undefined) updatePayload.teeth = data.teeth;
      if (data.exam_date !== undefined) updatePayload.exam_date = data.exam_date;

      const { error: updateError } = await supabase
        .from('dental_perio_exams')
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

  // Delete exam
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('dental_perio_exams')
        .delete()
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      if (currentExam?.id === id) setCurrentExam(null);
      refresh();
      return true;
    },
    [doctorId, currentExam, refresh],
  );

  const selectExam = useCallback((exam: PerioExam | null) => {
    setCurrentExam(exam);
  }, []);

  return {
    exams,
    currentExam,
    loading,
    error,
    summary,
    create,
    update,
    remove,
    selectExam,
    refresh,
  };
}
