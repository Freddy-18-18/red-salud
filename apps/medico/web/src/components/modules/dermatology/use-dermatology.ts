'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type MalignancyRisk = 'low' | 'moderate' | 'high' | 'confirmed';
export type LesionStatus = 'active' | 'monitoring' | 'resolved' | 'biopsied' | 'excised';
export type BodyView = 'front' | 'back';

export type LesionType =
  | 'macula'
  | 'papula'
  | 'placa'
  | 'nodulo'
  | 'tumor'
  | 'vesicula'
  | 'ampolla'
  | 'pustula'
  | 'roncha'
  | 'quiste'
  | 'erosion'
  | 'ulcera'
  | 'fisura'
  | 'costra'
  | 'escama'
  | 'cicatriz'
  | 'atrofia'
  | 'comedón';

export const LESION_TYPE_LABELS: Record<LesionType, string> = {
  macula: 'Mácula',
  papula: 'Pápula',
  placa: 'Placa',
  nodulo: 'Nódulo',
  tumor: 'Tumor',
  vesicula: 'Vesícula',
  ampolla: 'Ampolla',
  pustula: 'Pústula',
  roncha: 'Roncha',
  quiste: 'Quiste',
  erosion: 'Erosión',
  ulcera: 'Úlcera',
  fisura: 'Fisura',
  costra: 'Costra',
  escama: 'Escama',
  cicatriz: 'Cicatriz',
  atrofia: 'Atrofia',
  comedón: 'Comedón',
};

export type BodyRegion =
  | 'head'
  | 'face'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'upper_back'
  | 'lower_back'
  | 'left_arm'
  | 'right_arm'
  | 'left_hand'
  | 'right_hand'
  | 'left_leg'
  | 'right_leg'
  | 'left_foot'
  | 'right_foot'
  | 'genitals';

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Cabeza',
  face: 'Cara',
  neck: 'Cuello',
  chest: 'Tórax anterior',
  abdomen: 'Abdomen',
  upper_back: 'Espalda superior',
  lower_back: 'Espalda inferior',
  left_arm: 'Brazo izquierdo',
  right_arm: 'Brazo derecho',
  left_hand: 'Mano izquierda',
  right_hand: 'Mano derecha',
  left_leg: 'Pierna izquierda',
  right_leg: 'Pierna derecha',
  left_foot: 'Pie izquierdo',
  right_foot: 'Pie derecho',
  genitals: 'Región genital',
};

export interface AbcdeChecklist {
  asymmetry: boolean;
  border_irregular: boolean;
  color_variation: boolean;
  diameter_over_6mm: boolean;
  evolution: boolean;
}

export interface LesionRecord {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  patient_name?: string;
  body_region: BodyRegion;
  body_view: BodyView;
  position_x: number;
  position_y: number;
  lesion_type: LesionType;
  malignancy_risk: MalignancyRisk;
  status: LesionStatus;
  abcde: AbcdeChecklist | null;
  size_mm: number | null;
  color: string | null;
  border_description: string | null;
  symmetry: string | null;
  elevation: string | null;
  texture: string | null;
  dermoscopy_findings: string | null;
  clinical_image_url: string | null;
  dermoscopy_image_url: string | null;
  diagnosis: string | null;
  diagnosis_icd11: string | null;
  treatment_plan: string | null;
  biopsy_recommended: boolean;
  follow_up_weeks: number | null;
  linked_lesion_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLesionRecord {
  patient_id?: string | null;
  body_region: BodyRegion;
  body_view: BodyView;
  position_x: number;
  position_y: number;
  lesion_type: LesionType;
  malignancy_risk?: MalignancyRisk;
  status?: LesionStatus;
  abcde?: AbcdeChecklist | null;
  size_mm?: number | null;
  color?: string | null;
  border_description?: string | null;
  symmetry?: string | null;
  elevation?: string | null;
  texture?: string | null;
  dermoscopy_findings?: string | null;
  clinical_image_url?: string | null;
  dermoscopy_image_url?: string | null;
  diagnosis?: string | null;
  diagnosis_icd11?: string | null;
  treatment_plan?: string | null;
  biopsy_recommended?: boolean;
  follow_up_weeks?: number | null;
  linked_lesion_id?: string | null;
  notes?: string | null;
}

interface UseDermatologyOptions {
  patientId?: string;
  bodyRegion?: BodyRegion;
  status?: LesionStatus;
  malignancyRisk?: MalignancyRisk;
  limit?: number;
}

interface UseDermatologyReturn {
  lesions: LesionRecord[];
  loading: boolean;
  error: string | null;
  create: (data: CreateLesionRecord) => Promise<LesionRecord | null>;
  update: (id: string, data: Partial<CreateLesionRecord>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  getTimeline: (lesionId: string) => Promise<LesionRecord[]>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useDermatology(
  doctorId: string,
  options?: UseDermatologyOptions,
): UseDermatologyReturn {
  const [lesions, setLesions] = useState<LesionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch lesions
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchLesions() {
      let query = supabase
        .from('dermatology_lesions')
        .select('*, profiles!dermatology_lesions_patient_id_fkey(full_name)')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.bodyRegion) {
        query = query.eq('body_region', options.bodyRegion);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.malignancyRisk) {
        query = query.eq('malignancy_risk', options.malignancyRisk);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setLesions([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setLesions([]);
      } else {
        const mapped: LesionRecord[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          patient_name: row.profiles?.full_name ?? undefined,
          body_region: row.body_region,
          body_view: row.body_view ?? 'front',
          position_x: row.position_x ?? 0,
          position_y: row.position_y ?? 0,
          lesion_type: row.lesion_type,
          malignancy_risk: row.malignancy_risk ?? 'low',
          status: row.status ?? 'active',
          abcde: row.abcde ?? null,
          size_mm: row.size_mm ?? null,
          color: row.color ?? null,
          border_description: row.border_description ?? null,
          symmetry: row.symmetry ?? null,
          elevation: row.elevation ?? null,
          texture: row.texture ?? null,
          dermoscopy_findings: row.dermoscopy_findings ?? null,
          clinical_image_url: row.clinical_image_url ?? null,
          dermoscopy_image_url: row.dermoscopy_image_url ?? null,
          diagnosis: row.diagnosis ?? null,
          diagnosis_icd11: row.diagnosis_icd11 ?? null,
          treatment_plan: row.treatment_plan ?? null,
          biopsy_recommended: row.biopsy_recommended ?? false,
          follow_up_weeks: row.follow_up_weeks ?? null,
          linked_lesion_id: row.linked_lesion_id ?? null,
          notes: row.notes ?? null,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setLesions(mapped);
      }
      setLoading(false);
    }

    fetchLesions();
    return () => { cancelled = true; };
  }, [
    doctorId,
    options?.patientId,
    options?.bodyRegion,
    options?.status,
    options?.malignancyRisk,
    options?.limit,
    refreshKey,
  ]);

  // Create lesion
  const create = useCallback(
    async (data: CreateLesionRecord): Promise<LesionRecord | null> => {
      const { data: row, error: insertError } = await supabase
        .from('dermatology_lesions')
        .insert({
          doctor_id: doctorId,
          status: 'active',
          malignancy_risk: 'low',
          biopsy_recommended: false,
          ...data,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as LesionRecord;
    },
    [doctorId, refresh],
  );

  // Update lesion
  const update = useCallback(
    async (id: string, data: Partial<CreateLesionRecord>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('dermatology_lesions')
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

  // Delete lesion
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('dermatology_lesions')
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

  // Get linked lesion timeline (same location, previous visits)
  const getTimeline = useCallback(
    async (lesionId: string): Promise<LesionRecord[]> => {
      // Walk the linked_lesion_id chain backwards
      const timeline: LesionRecord[] = [];
      let currentId: string | null = lesionId;

      while (currentId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- break circular type inference in while loop
        const result: { data: Record<string, any> | null; error: any } = await supabase
          .from('dermatology_lesions')
          .select('*, profiles!dermatology_lesions_patient_id_fkey(full_name)')
          .eq('id', currentId)
          .eq('doctor_id', doctorId)
          .single();

        const { data, error: fetchError } = result;

        if (fetchError || !data) break;

        const record: LesionRecord = {
          id: data.id,
          doctor_id: data.doctor_id,
          patient_id: data.patient_id,
          patient_name: data.profiles?.full_name ?? undefined,
          body_region: data.body_region,
          body_view: data.body_view ?? 'front',
          position_x: data.position_x ?? 0,
          position_y: data.position_y ?? 0,
          lesion_type: data.lesion_type,
          malignancy_risk: data.malignancy_risk ?? 'low',
          status: data.status ?? 'active',
          abcde: data.abcde ?? null,
          size_mm: data.size_mm ?? null,
          color: data.color ?? null,
          border_description: data.border_description ?? null,
          symmetry: data.symmetry ?? null,
          elevation: data.elevation ?? null,
          texture: data.texture ?? null,
          dermoscopy_findings: data.dermoscopy_findings ?? null,
          clinical_image_url: data.clinical_image_url ?? null,
          dermoscopy_image_url: data.dermoscopy_image_url ?? null,
          diagnosis: data.diagnosis ?? null,
          diagnosis_icd11: data.diagnosis_icd11 ?? null,
          treatment_plan: data.treatment_plan ?? null,
          biopsy_recommended: data.biopsy_recommended ?? false,
          follow_up_weeks: data.follow_up_weeks ?? null,
          linked_lesion_id: data.linked_lesion_id ?? null,
          notes: data.notes ?? null,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        timeline.push(record);
        currentId = data.linked_lesion_id;

        // Safety: max 50 entries to prevent infinite loops
        if (timeline.length >= 50) break;
      }

      // Also find forward-linked records (lesions that reference this one)
      const { data: forwardData } = await supabase
        .from('dermatology_lesions')
        .select('*, profiles!dermatology_lesions_patient_id_fkey(full_name)')
        .eq('linked_lesion_id', lesionId)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: true });

      if (forwardData) {
        for (const data of forwardData) {
          if (timeline.some((t) => t.id === data.id)) continue;
          timeline.unshift({
            id: data.id,
            doctor_id: data.doctor_id,
            patient_id: data.patient_id,
            patient_name: data.profiles?.full_name ?? undefined,
            body_region: data.body_region,
            body_view: data.body_view ?? 'front',
            position_x: data.position_x ?? 0,
            position_y: data.position_y ?? 0,
            lesion_type: data.lesion_type,
            malignancy_risk: data.malignancy_risk ?? 'low',
            status: data.status ?? 'active',
            abcde: data.abcde ?? null,
            size_mm: data.size_mm ?? null,
            color: data.color ?? null,
            border_description: data.border_description ?? null,
            symmetry: data.symmetry ?? null,
            elevation: data.elevation ?? null,
            texture: data.texture ?? null,
            dermoscopy_findings: data.dermoscopy_findings ?? null,
            clinical_image_url: data.clinical_image_url ?? null,
            dermoscopy_image_url: data.dermoscopy_image_url ?? null,
            diagnosis: data.diagnosis ?? null,
            diagnosis_icd11: data.diagnosis_icd11 ?? null,
            treatment_plan: data.treatment_plan ?? null,
            biopsy_recommended: data.biopsy_recommended ?? false,
            follow_up_weeks: data.follow_up_weeks ?? null,
            linked_lesion_id: data.linked_lesion_id ?? null,
            notes: data.notes ?? null,
            created_at: data.created_at,
            updated_at: data.updated_at,
          });
        }
      }

      // Sort by date ascending (oldest first)
      timeline.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      return timeline;
    },
    [doctorId],
  );

  return { lesions, loading, error, create, update, remove, getTimeline, refresh };
}
