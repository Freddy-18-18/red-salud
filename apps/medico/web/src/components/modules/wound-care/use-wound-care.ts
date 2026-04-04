'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type WoundType =
  | 'surgical'
  | 'traumatic'
  | 'pressure_i'
  | 'pressure_ii'
  | 'pressure_iii'
  | 'pressure_iv'
  | 'diabetic'
  | 'venous'
  | 'arterial'
  | 'burn_first'
  | 'burn_second'
  | 'burn_third';

export type WoundStatus = 'active' | 'healing' | 'healed' | 'chronic' | 'infected';

export type ExudateAmount = 'none' | 'scant' | 'moderate' | 'copious';
export type ExudateType = 'serous' | 'sanguineous' | 'serosanguineous' | 'purulent';

export type SurroundingSkin =
  | 'normal'
  | 'erythema'
  | 'macerated'
  | 'indurated'
  | 'edema'
  | 'callused';

export type EdgeType =
  | 'attached'
  | 'unattached'
  | 'rolled'
  | 'undermining';

export interface WoundMeasurement {
  length_cm: number;
  width_cm: number;
  depth_cm: number;
  area_cm2: number;
}

export interface WoundBed {
  granulation_pct: number;
  slough_pct: number;
  necrotic_pct: number;
  epithelialization_pct: number;
}

export interface WoundEdge {
  type: EdgeType;
  undermining_positions?: string; // clock positions e.g. "2-5 o'clock"
}

export interface WoundAssessment {
  id: string;
  wound_id: string;
  doctor_id: string;
  date: string;
  measurement: WoundMeasurement;
  wound_bed: WoundBed;
  edges: WoundEdge;
  exudate_amount: ExudateAmount;
  exudate_type: ExudateType | null;
  surrounding_skin: SurroundingSkin;
  pain_level: number; // 0-10 NRS
  photo_urls: string[];
  treatment: string;
  push_score: number;
  notes: string | null;
  created_at: string;
}

export interface WoundRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  wound_type: WoundType;
  location_text: string;
  body_region: string;
  status: WoundStatus;
  onset_date: string | null;
  assessments: WoundAssessment[];
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateWoundRecord {
  patient_id?: string | null;
  wound_type: WoundType;
  location_text: string;
  body_region: string;
  status?: WoundStatus;
  onset_date?: string | null;
}

export interface CreateWoundAssessment {
  wound_id: string;
  measurement: WoundMeasurement;
  wound_bed: WoundBed;
  edges: WoundEdge;
  exudate_amount: ExudateAmount;
  exudate_type: ExudateType | null;
  surrounding_skin: SurroundingSkin;
  pain_level: number;
  photo_urls?: string[];
  treatment: string;
  push_score: number;
  notes?: string | null;
}

// ============================================================================
// PUSH SCORE CALCULATION
// ============================================================================

/**
 * PUSH Tool 3.0 — Pressure Ulcer Scale for Healing.
 * Score range 0-17 (lower = better healing).
 */
export function calculatePushScore(
  area: number,
  exudateAmount: ExudateAmount,
  woundBed: WoundBed,
): number {
  // Length x Width score (0-10)
  let sizeScore = 0;
  if (area === 0) sizeScore = 0;
  else if (area < 0.3) sizeScore = 1;
  else if (area < 0.7) sizeScore = 2;
  else if (area < 1.0) sizeScore = 3;
  else if (area < 2.0) sizeScore = 4;
  else if (area < 3.0) sizeScore = 5;
  else if (area < 4.0) sizeScore = 6;
  else if (area < 8.0) sizeScore = 7;
  else if (area < 12.0) sizeScore = 8;
  else if (area < 24.0) sizeScore = 9;
  else sizeScore = 10;

  // Exudate amount score (0-3)
  const exudateScoreMap: Record<ExudateAmount, number> = {
    none: 0,
    scant: 1,
    moderate: 2,
    copious: 3,
  };
  const exudateScore = exudateScoreMap[exudateAmount];

  // Tissue type score (0-4) — worst tissue present
  let tissueScore = 0;
  if (woundBed.necrotic_pct > 0) tissueScore = 4;
  else if (woundBed.slough_pct > 0) tissueScore = 3;
  else if (woundBed.granulation_pct > 0) tissueScore = 2;
  else if (woundBed.epithelialization_pct > 0) tissueScore = 1;

  return sizeScore + exudateScore + tissueScore;
}

// ============================================================================
// WOUND TYPE LABELS
// ============================================================================

export const WOUND_TYPE_OPTIONS: Array<{ value: WoundType; label: string; group: string }> = [
  { value: 'surgical', label: 'Quirúrgica', group: 'General' },
  { value: 'traumatic', label: 'Traumática', group: 'General' },
  { value: 'diabetic', label: 'Pie diabético', group: 'Vascular' },
  { value: 'venous', label: 'Venosa', group: 'Vascular' },
  { value: 'arterial', label: 'Arterial', group: 'Vascular' },
  { value: 'pressure_i', label: 'Úlcera por presión — Estadio I', group: 'Presión' },
  { value: 'pressure_ii', label: 'Úlcera por presión — Estadio II', group: 'Presión' },
  { value: 'pressure_iii', label: 'Úlcera por presión — Estadio III', group: 'Presión' },
  { value: 'pressure_iv', label: 'Úlcera por presión — Estadio IV', group: 'Presión' },
  { value: 'burn_first', label: 'Quemadura — 1er grado', group: 'Quemadura' },
  { value: 'burn_second', label: 'Quemadura — 2do grado', group: 'Quemadura' },
  { value: 'burn_third', label: 'Quemadura — 3er grado', group: 'Quemadura' },
];

export const WOUND_STATUS_OPTIONS: Array<{ value: WoundStatus; label: string }> = [
  { value: 'active', label: 'Activa' },
  { value: 'healing', label: 'En cicatrización' },
  { value: 'healed', label: 'Cicatrizada' },
  { value: 'chronic', label: 'Crónica' },
  { value: 'infected', label: 'Infectada' },
];

export const BODY_REGION_OPTIONS = [
  'Cabeza', 'Cuello', 'Tórax anterior', 'Tórax posterior', 'Abdomen',
  'Espalda superior', 'Espalda inferior', 'Sacro/Cóccix', 'Glúteo derecho',
  'Glúteo izquierdo', 'Hombro derecho', 'Hombro izquierdo', 'Brazo derecho',
  'Brazo izquierdo', 'Codo derecho', 'Codo izquierdo', 'Antebrazo derecho',
  'Antebrazo izquierdo', 'Mano derecha', 'Mano izquierda', 'Muslo derecho',
  'Muslo izquierdo', 'Rodilla derecha', 'Rodilla izquierda', 'Pierna derecha',
  'Pierna izquierda', 'Tobillo derecho', 'Tobillo izquierdo', 'Pie derecho',
  'Pie izquierdo', 'Talón derecho', 'Talón izquierdo',
];

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseWoundCareOptions {
  patientId?: string;
  status?: WoundStatus;
  limit?: number;
}

interface UseWoundCareReturn {
  wounds: WoundRecord[];
  loading: boolean;
  error: string | null;
  createWound: (data: CreateWoundRecord) => Promise<WoundRecord | null>;
  updateWound: (id: string, data: Partial<CreateWoundRecord>) => Promise<boolean>;
  removeWound: (id: string) => Promise<boolean>;
  addAssessment: (data: CreateWoundAssessment) => Promise<WoundAssessment | null>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useWoundCare(
  doctorId: string,
  options?: UseWoundCareOptions,
): UseWoundCareReturn {
  const [wounds, setWounds] = useState<WoundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Fetch wounds ─────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchWounds() {
      // Query diagnostic_imaging with study_type='wound_photo' for photo-based tracking
      // Also use a JSONB approach on clinical_notes for structured wound data
      let query = supabase
        .from('diagnostic_imaging')
        .select('*, profiles!diagnostic_imaging_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .eq('study_type', 'wound_photo')
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
          setWounds([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setWounds([]);
      } else {
        const mapped: WoundRecord[] = (data ?? []).map((row: any) => {
          // Wound metadata is stored in the findings JSONB field
          const meta = typeof row.findings === 'object' && row.findings !== null
            ? row.findings
            : {};

          return {
            id: row.id,
            doctor_id: row.doctor_id,
            patient_id: row.patient_id,
            patient_name: row.profiles?.full_name ?? undefined,
            wound_type: meta.wound_type ?? 'surgical',
            location_text: meta.location_text ?? '',
            body_region: row.body_region ?? '',
            status: meta.status ?? 'active',
            onset_date: meta.onset_date ?? null,
            assessments: Array.isArray(meta.assessments) ? meta.assessments : [],
            photo_urls: row.image_urls ?? [],
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });

        // Filter by wound status client-side (stored in JSONB)
        const filtered = options?.status
          ? mapped.filter((w) => w.status === options.status)
          : mapped;

        setWounds(filtered);
      }
      setLoading(false);
    }

    fetchWounds();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.status, options?.limit, refreshKey]);

  // ── Create wound ─────────────────────────────────────────────
  const createWound = useCallback(
    async (data: CreateWoundRecord): Promise<WoundRecord | null> => {
      const findings = {
        wound_type: data.wound_type,
        location_text: data.location_text,
        status: data.status ?? 'active',
        onset_date: data.onset_date ?? null,
        assessments: [],
      };

      const { data: row, error: insertError } = await supabase
        .from('diagnostic_imaging')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          study_type: 'wound_photo',
          body_region: data.body_region,
          status: 'in_progress',
          clinical_indication: `Seguimiento de herida: ${WOUND_TYPE_OPTIONS.find((t) => t.value === data.wound_type)?.label ?? data.wound_type}`,
          findings,
          image_urls: [],
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as WoundRecord;
    },
    [doctorId, refresh],
  );

  // ── Update wound ─────────────────────────────────────────────
  const updateWound = useCallback(
    async (id: string, data: Partial<CreateWoundRecord>): Promise<boolean> => {
      // Read current record first to merge JSONB
      const { data: current, error: readError } = await supabase
        .from('diagnostic_imaging')
        .select('findings, body_region')
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .single();

      if (readError) {
        setError(readError.message);
        return false;
      }

      const currentFindings = typeof current.findings === 'object' && current.findings !== null
        ? current.findings as Record<string, unknown>
        : {};

      const updatedFindings = { ...currentFindings };
      if (data.wound_type !== undefined) updatedFindings.wound_type = data.wound_type;
      if (data.location_text !== undefined) updatedFindings.location_text = data.location_text;
      if (data.status !== undefined) updatedFindings.status = data.status;
      if (data.onset_date !== undefined) updatedFindings.onset_date = data.onset_date;

      const updatePayload: Record<string, unknown> = { findings: updatedFindings };
      if (data.body_region !== undefined) updatePayload.body_region = data.body_region;

      // If wound is healed, mark imaging study as completed
      if (data.status === 'healed') {
        updatePayload.status = 'completed';
      }

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
    [doctorId, refresh],
  );

  // ── Delete wound ─────────────────────────────────────────────
  const removeWound = useCallback(
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

  // ── Add assessment ───────────────────────────────────────────
  const addAssessment = useCallback(
    async (data: CreateWoundAssessment): Promise<WoundAssessment | null> => {
      // Read current findings to append assessment
      const { data: current, error: readError } = await supabase
        .from('diagnostic_imaging')
        .select('findings, image_urls')
        .eq('id', data.wound_id)
        .eq('doctor_id', doctorId)
        .single();

      if (readError) {
        setError(readError.message);
        return null;
      }

      const currentFindings = typeof current.findings === 'object' && current.findings !== null
        ? current.findings as Record<string, unknown>
        : {};

      const existingAssessments = Array.isArray(currentFindings.assessments)
        ? currentFindings.assessments
        : [];

      const newAssessment: WoundAssessment = {
        id: crypto.randomUUID(),
        wound_id: data.wound_id,
        doctor_id: doctorId,
        date: new Date().toISOString(),
        measurement: data.measurement,
        wound_bed: data.wound_bed,
        edges: data.edges,
        exudate_amount: data.exudate_amount,
        exudate_type: data.exudate_type,
        surrounding_skin: data.surrounding_skin,
        pain_level: data.pain_level,
        photo_urls: data.photo_urls ?? [],
        treatment: data.treatment,
        push_score: data.push_score,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
      };

      const updatedFindings = {
        ...currentFindings,
        assessments: [...existingAssessments, newAssessment],
      };

      // Merge photo URLs into the imaging record
      const existingPhotos: string[] = Array.isArray(current.image_urls) ? current.image_urls : [];
      const newPhotos = data.photo_urls ?? [];
      const allPhotos = [...existingPhotos, ...newPhotos];

      const { error: updateError } = await supabase
        .from('diagnostic_imaging')
        .update({
          findings: updatedFindings,
          image_urls: allPhotos,
        })
        .eq('id', data.wound_id)
        .eq('doctor_id', doctorId);

      if (updateError) {
        setError(updateError.message);
        return null;
      }

      refresh();
      return newAssessment;
    },
    [doctorId, refresh],
  );

  return { wounds, loading, error, createWound, updateWound, removeWound, addAssessment, refresh };
}
