'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  type Sex,
  type ChartType,
  getGrowthStandard,
  estimatePercentile,
  detectPercentileCrossing,
} from './growth-standards';

// ============================================================================
// TYPES
// ============================================================================

export interface GrowthMeasurement {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  age_months: number;
  weight_kg: number | null;
  height_cm: number | null;
  head_circumference_cm: number | null;
  bmi: number | null;
  notes: string | null;
  created_at: string;
}

export interface CreateGrowthMeasurement {
  patient_id: string;
  date: string;
  age_months: number;
  weight_kg?: number | null;
  height_cm?: number | null;
  head_circumference_cm?: number | null;
  notes?: string | null;
}

export interface PercentileResult {
  weight?: number | null;
  height?: number | null;
  headCircumference?: number | null;
  bmi?: number | null;
}

export interface GrowthAlert {
  type: 'weight' | 'height' | 'head_circumference' | 'bmi';
  label: string;
  severity: 'mild' | 'moderate' | 'severe';
  message: string;
}

interface UseGrowthDataOptions {
  patientId?: string;
  patientDob?: string;
  patientSex?: Sex;
}

interface UseGrowthDataReturn {
  measurements: GrowthMeasurement[];
  loading: boolean;
  error: string | null;
  addMeasurement: (data: CreateGrowthMeasurement) => Promise<GrowthMeasurement | null>;
  updateMeasurement: (id: string, data: Partial<CreateGrowthMeasurement>) => Promise<boolean>;
  deleteMeasurement: (id: string) => Promise<boolean>;
  getPercentiles: (measurement: GrowthMeasurement) => PercentileResult;
  alerts: GrowthAlert[];
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useGrowthData(
  doctorId: string,
  options?: UseGrowthDataOptions,
): UseGrowthDataReturn {
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Fetch ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchMeasurements() {
      let query = supabase
        .from('pediatrics_growth')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: true });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setMeasurements([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setMeasurements([]);
      } else {
        const mapped: GrowthMeasurement[] = (data ?? []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          patient_id: row.patient_id as string,
          doctor_id: row.doctor_id as string,
          date: row.date as string,
          age_months: (row.age_months as number) ?? 0,
          weight_kg: (row.weight_kg as number) ?? null,
          height_cm: (row.height_cm as number) ?? null,
          head_circumference_cm: (row.head_circumference_cm as number) ?? null,
          bmi: calculateBmi(row.weight_kg as number | null, row.height_cm as number | null),
          notes: (row.notes as string) ?? null,
          created_at: row.created_at as string,
        }));
        setMeasurements(mapped);
      }
      setLoading(false);
    }

    fetchMeasurements();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, refreshKey]);

  // ── Create ──────────────────────────────────────────────────────────────

  const addMeasurement = useCallback(
    async (data: CreateGrowthMeasurement): Promise<GrowthMeasurement | null> => {
      const bmi = calculateBmi(data.weight_kg ?? null, data.height_cm ?? null);

      const { data: row, error: insertError } = await supabase
        .from('pediatrics_growth')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id,
          date: data.date,
          age_months: data.age_months,
          weight_kg: data.weight_kg ?? null,
          height_cm: data.height_cm ?? null,
          head_circumference_cm: data.head_circumference_cm ?? null,
          bmi,
          notes: data.notes ?? null,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as GrowthMeasurement;
    },
    [doctorId, refresh],
  );

  // ── Update ──────────────────────────────────────────────────────────────

  const updateMeasurement = useCallback(
    async (id: string, data: Partial<CreateGrowthMeasurement>): Promise<boolean> => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.weight_kg !== undefined || data.height_cm !== undefined) {
        // Recalculate BMI if weight or height changed
        const existing = measurements.find((m) => m.id === id);
        const weight = data.weight_kg ?? existing?.weight_kg ?? null;
        const height = data.height_cm ?? existing?.height_cm ?? null;
        updateData.bmi = calculateBmi(weight, height);
      }

      const { error: updateError } = await supabase
        .from('pediatrics_growth')
        .update(updateData)
        .eq('id', id)
        .eq('doctor_id', doctorId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [doctorId, measurements, refresh],
  );

  // ── Delete ──────────────────────────────────────────────────────────────

  const deleteMeasurement = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('pediatrics_growth')
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

  // ── Percentiles ─────────────────────────────────────────────────────────

  const getPercentiles = useCallback(
    (measurement: GrowthMeasurement): PercentileResult => {
      const sex = options?.patientSex ?? 'male';
      const age = measurement.age_months;
      const result: PercentileResult = {};

      if (measurement.weight_kg != null) {
        const std = getGrowthStandard('weight-for-age', sex);
        result.weight = std ? estimatePercentile(std, age, measurement.weight_kg) : null;
      }

      if (measurement.height_cm != null) {
        const std = getGrowthStandard('height-for-age', sex);
        result.height = std ? estimatePercentile(std, age, measurement.height_cm) : null;
      }

      if (measurement.head_circumference_cm != null && age <= 36) {
        const std = getGrowthStandard('head-circumference-for-age', sex);
        result.headCircumference = std
          ? estimatePercentile(std, age, measurement.head_circumference_cm)
          : null;
      }

      if (measurement.bmi != null) {
        const std = getGrowthStandard('bmi-for-age', sex);
        result.bmi = std ? estimatePercentile(std, age, measurement.bmi) : null;
      }

      return result;
    },
    [options?.patientSex],
  );

  // ── Alerts (percentile crossing detection) ──────────────────────────────

  const alerts = useMemo<GrowthAlert[]>(() => {
    if (measurements.length < 2 || !options?.patientSex) return [];

    const sex = options.patientSex;
    const last = measurements[measurements.length - 1];
    const prev = measurements[measurements.length - 2];
    const result: GrowthAlert[] = [];

    const checks: Array<{
      type: GrowthAlert['type'];
      label: string;
      chartType: ChartType;
      prevValue: number | null;
      currValue: number | null;
    }> = [
      {
        type: 'weight',
        label: 'Peso',
        chartType: 'weight-for-age',
        prevValue: prev.weight_kg,
        currValue: last.weight_kg,
      },
      {
        type: 'height',
        label: 'Talla',
        chartType: 'height-for-age',
        prevValue: prev.height_cm,
        currValue: last.height_cm,
      },
      {
        type: 'head_circumference',
        label: 'Perímetro cefálico',
        chartType: 'head-circumference-for-age',
        prevValue: prev.head_circumference_cm,
        currValue: last.head_circumference_cm,
      },
    ];

    for (const check of checks) {
      if (check.prevValue == null || check.currValue == null) continue;

      const std = getGrowthStandard(check.chartType, sex);
      if (!std) continue;

      const { shift, severity } = detectPercentileCrossing(
        std,
        prev.age_months,
        check.prevValue,
        last.age_months,
        check.currValue,
      );

      if (severity !== 'none') {
        const direction = shift < 0 ? 'descendió' : 'ascendió';
        result.push({
          type: check.type,
          label: check.label,
          severity,
          message: `${check.label} ${direction} ${Math.abs(shift)} ${
            Math.abs(shift) === 1 ? 'banda' : 'bandas'
          } de percentil`,
        });
      }
    }

    return result;
  }, [measurements, options?.patientSex]);

  return {
    measurements,
    loading,
    error,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getPercentiles,
    alerts,
    refresh,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (weightKg == null || heightCm == null || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

/**
 * Calculate age in months from DOB to a given date.
 */
export function calculateAgeMonths(dob: string, date: string): number {
  const d1 = new Date(dob);
  const d2 = new Date(date);
  const years = d2.getFullYear() - d1.getFullYear();
  const months = d2.getMonth() - d1.getMonth();
  const days = d2.getDate() - d1.getDate();
  let total = years * 12 + months;
  if (days < 0) total -= 1;
  return Math.max(0, total);
}
