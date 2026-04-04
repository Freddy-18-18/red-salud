'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

/** Tooth surface codes (FDI notation) */
export type ToothSurface = 'M' | 'D' | 'O' | 'B' | 'L';

export const TOOTH_SURFACES: ToothSurface[] = ['M', 'D', 'O', 'B', 'L'];

export const SURFACE_LABELS: Record<ToothSurface, string> = {
  M: 'Mesial',
  D: 'Distal',
  O: 'Oclusal/Incisal',
  B: 'Bucal/Vestibular',
  L: 'Lingual/Palatino',
};

/** Condition per surface */
export type SurfaceCondition =
  | 'healthy'
  | 'caries'
  | 'restoration'
  | 'fracture'
  | 'sealant';

/** Overall tooth status */
export type ToothStatus =
  | 'present'
  | 'missing'
  | 'impacted'
  | 'supernumerary'
  | 'deciduous'
  | 'root_remnant';

/** Material of existing restoration */
export type RestorationMaterial =
  | 'amalgam'
  | 'composite'
  | 'ceramic'
  | 'gold_crown'
  | 'pfm'
  | 'implant'
  | 'bridge_pontic'
  | 'temporary'
  | 'none';

/** Severity of clinical finding */
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

// ── Clinical Finding (from DB) ──────────────────────────────────────────────

export interface ClinicalFinding {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  finding_type: string;
  severity: FindingSeverity;
  tooth_code: string | null;
  surface_code: string | null;
  source: 'manual' | 'ai';
  validation_status: 'pending_validation' | 'validated' | 'rejected';
  notes: string | null;
  metadata: Record<string, unknown>;
  observed_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClinicalFinding {
  patient_id: string;
  appointment_id?: string | null;
  finding_type: string;
  severity?: FindingSeverity;
  tooth_code?: string | null;
  surface_code?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

// ── Aggregated tooth state for the chart ────────────────────────────────────

export interface OdontogramTooth {
  code: string;
  status: ToothStatus;
  surfaces: Record<ToothSurface, SurfaceCondition>;
  material: RestorationMaterial;
  findings: ClinicalFinding[];
  notes: string;
}

// ── Finding type presets ────────────────────────────────────────────────────

export const FINDING_TYPES: Array<{ value: string; label: string; color: string }> = [
  { value: 'caries', label: 'Caries', color: '#EF4444' },
  { value: 'restoration', label: 'Restauraci\u00f3n', color: '#3B82F6' },
  { value: 'fracture', label: 'Fractura', color: '#F97316' },
  { value: 'abscess', label: 'Absceso', color: '#DC2626' },
  { value: 'root_canal', label: 'Endodoncia', color: '#8B5CF6' },
  { value: 'crown', label: 'Corona', color: '#0EA5E9' },
  { value: 'bridge', label: 'Puente', color: '#06B6D4' },
  { value: 'implant', label: 'Implante', color: '#14B8A6' },
  { value: 'sealant', label: 'Sellante', color: '#22C55E' },
  { value: 'gingivitis', label: 'Gingivitis', color: '#F59E0B' },
  { value: 'periodontitis', label: 'Periodontitis', color: '#EF4444' },
  { value: 'erosion', label: 'Erosi\u00f3n', color: '#F97316' },
  { value: 'mobility', label: 'Movilidad', color: '#A855F7' },
  { value: 'missing', label: 'Ausente', color: '#6B7280' },
  { value: 'impacted', label: 'Impactado', color: '#9CA3AF' },
  { value: 'other', label: 'Otro', color: '#64748B' },
];

/** Surface condition color map */
export const SURFACE_CONDITION_COLORS: Record<SurfaceCondition, string> = {
  healthy: '#E5E7EB',
  caries: '#EF4444',
  restoration: '#3B82F6',
  fracture: '#F97316',
  sealant: '#22C55E',
};

/** Tooth status display labels */
export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  present: 'Presente',
  missing: 'Ausente',
  impacted: 'Impactado',
  supernumerary: 'Supernumerario',
  deciduous: 'Temporal',
  root_remnant: 'Resto radicular',
};

// ============================================================================
// HELPERS
// ============================================================================

/** FDI tooth numbers — adult */
export const ADULT_TEETH: string[] = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '38', '37', '36', '35', '34', '33', '32', '31',
  '41', '42', '43', '44', '45', '46', '47', '48',
];

export const PEDIATRIC_TEETH: string[] = [
  '55', '54', '53', '52', '51',
  '61', '62', '63', '64', '65',
  '75', '74', '73', '72', '71',
  '81', '82', '83', '84', '85',
];

/** Create a default tooth state */
export function defaultToothState(code: string): OdontogramTooth {
  return {
    code,
    status: 'present',
    surfaces: { M: 'healthy', D: 'healthy', O: 'healthy', B: 'healthy', L: 'healthy' },
    material: 'none',
    findings: [],
    notes: '',
  };
}

/**
 * Build the aggregated odontogram state from clinical findings.
 * Merges findings into per-tooth records.
 */
export function buildOdontogramState(
  toothCodes: string[],
  findings: ClinicalFinding[],
): Record<string, OdontogramTooth> {
  const teeth: Record<string, OdontogramTooth> = {};

  for (const code of toothCodes) {
    teeth[code] = defaultToothState(code);
  }

  for (const finding of findings) {
    const code = finding.tooth_code;
    if (!code || !teeth[code]) continue;

    const tooth = teeth[code];
    tooth.findings.push(finding);

    // Apply finding effects to the tooth state
    if (finding.finding_type === 'missing') {
      tooth.status = 'missing';
    } else if (finding.finding_type === 'impacted') {
      tooth.status = 'impacted';
    }

    // Apply surface conditions from findings
    if (finding.surface_code && finding.finding_type) {
      const surface = finding.surface_code as ToothSurface;
      if (TOOTH_SURFACES.includes(surface)) {
        if (finding.finding_type === 'caries') {
          tooth.surfaces[surface] = 'caries';
        } else if (finding.finding_type === 'restoration' || finding.finding_type === 'crown') {
          tooth.surfaces[surface] = 'restoration';
        } else if (finding.finding_type === 'fracture') {
          tooth.surfaces[surface] = 'fracture';
        } else if (finding.finding_type === 'sealant') {
          tooth.surfaces[surface] = 'sealant';
        }
      }
    }

    // Material from metadata
    const material = finding.metadata?.material as RestorationMaterial | undefined;
    if (material) {
      tooth.material = material;
    }
  }

  return teeth;
}

// ============================================================================
// HOOK
// ============================================================================

interface UseOdontogramOptions {
  patientId?: string;
  appointmentId?: string;
}

interface UseOdontogramReturn {
  findings: ClinicalFinding[];
  teeth: Record<string, OdontogramTooth>;
  loading: boolean;
  error: string | null;
  isPediatric: boolean;
  setIsPediatric: (v: boolean) => void;
  createFinding: (data: CreateClinicalFinding) => Promise<ClinicalFinding | null>;
  updateFinding: (id: string, data: Partial<CreateClinicalFinding>) => Promise<boolean>;
  removeFinding: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function useOdontogram(
  doctorId: string,
  options?: UseOdontogramOptions,
): UseOdontogramReturn {
  const [findings, setFindings] = useState<ClinicalFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPediatric, setIsPediatric] = useState(false);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const toothCodes = isPediatric ? PEDIATRIC_TEETH : ADULT_TEETH;

  // Fetch findings
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchFindings() {
      let query = supabase
        .from('dental_clinical_findings')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('observed_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.appointmentId) {
        query = query.eq('appointment_id', options.appointmentId);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setFindings([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setFindings([]);
      } else {
        const mapped: ClinicalFinding[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          appointment_id: row.appointment_id,
          finding_type: row.finding_type ?? '',
          severity: row.severity ?? 'medium',
          tooth_code: row.tooth_code,
          surface_code: row.surface_code,
          source: row.source ?? 'manual',
          validation_status: row.validation_status ?? 'validated',
          notes: row.notes,
          metadata: row.metadata ?? {},
          observed_at: row.observed_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setFindings(mapped);
      }
      setLoading(false);
    }

    fetchFindings();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.appointmentId, refreshKey]);

  // Build aggregated tooth state
  const teeth = buildOdontogramState(toothCodes, findings);

  // Create finding
  const createFinding = useCallback(
    async (data: CreateClinicalFinding): Promise<ClinicalFinding | null> => {
      const { data: row, error: insertError } = await supabase
        .from('dental_clinical_findings')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id,
          appointment_id: data.appointment_id ?? null,
          finding_type: data.finding_type,
          severity: data.severity ?? 'medium',
          tooth_code: data.tooth_code ?? null,
          surface_code: data.surface_code ?? null,
          source: 'manual',
          validation_status: 'validated',
          notes: data.notes ?? null,
          metadata: data.metadata ?? {},
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as ClinicalFinding;
    },
    [doctorId, refresh],
  );

  // Update finding
  const updateFinding = useCallback(
    async (id: string, data: Partial<CreateClinicalFinding>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('dental_clinical_findings')
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

  // Remove finding
  const removeFinding = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('dental_clinical_findings')
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

  return {
    findings,
    teeth,
    loading,
    error,
    isPediatric,
    setIsPediatric,
    createFinding,
    updateFinding,
    removeFinding,
    refresh,
  };
}
