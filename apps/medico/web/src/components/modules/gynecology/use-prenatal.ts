'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface Pregnancy {
  id: string;
  patient_id: string;
  doctor_id: string;
  lmp_date: string; // Last menstrual period
  edd: string; // Estimated due date (FPP)
  gravida: number;
  para: number;
  abortos: number;
  cesareas: number;
  vivos: number;
  blood_type: string | null;
  rh_factor: string | null;
  risk_level: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'loss';
  notes: string | null;
  created_at: string;
}

export interface PrenatalVisit {
  id: string;
  pregnancy_id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  visit_type: 'routine' | 'urgent' | 'high_risk' | 'postpartum';
  gestational_weeks: number;
  gestational_days: number;
  // Maternal vitals
  weight_kg: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  fundal_height_cm: number | null;
  // Fetal assessment
  fetal_heart_rate: number | null;
  fetal_presentation: string | null;
  fetal_movements: string | null;
  amniotic_fluid: string | null;
  // Labs summary
  hemoglobin: number | null;
  hematocrit: number | null;
  glucose: number | null;
  urine_protein: string | null;
  // Ultrasound summary
  ultrasound_notes: string | null;
  // Risk factors
  risk_factors: string[];
  // Supplements
  supplements: string[];
  // Plan
  plan: string | null;
  next_visit_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreatePregnancy {
  patient_id: string;
  lmp_date: string;
  gravida: number;
  para: number;
  abortos: number;
  cesareas: number;
  vivos: number;
  blood_type?: string | null;
  rh_factor?: string | null;
  risk_level?: 'low' | 'medium' | 'high';
  notes?: string | null;
}

export interface CreatePrenatalVisit {
  pregnancy_id: string;
  patient_id: string;
  visit_date: string;
  visit_type: 'routine' | 'urgent' | 'high_risk' | 'postpartum';
  gestational_weeks: number;
  gestational_days: number;
  weight_kg?: number | null;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  fundal_height_cm?: number | null;
  fetal_heart_rate?: number | null;
  fetal_presentation?: string | null;
  fetal_movements?: string | null;
  amniotic_fluid?: string | null;
  hemoglobin?: number | null;
  hematocrit?: number | null;
  glucose?: number | null;
  urine_protein?: string | null;
  ultrasound_notes?: string | null;
  risk_factors?: string[];
  supplements?: string[];
  plan?: string | null;
  next_visit_date?: string | null;
  notes?: string | null;
}

export interface PrenatalAlert {
  type: 'blood_pressure' | 'fetal_heart_rate' | 'fundal_height' | 'weight_gain';
  label: string;
  severity: 'mild' | 'moderate' | 'severe';
  message: string;
}

interface UsePrenatalOptions {
  patientId?: string;
  pregnancyId?: string;
}

interface UsePrenatalReturn {
  pregnancies: Pregnancy[];
  activePregnancy: Pregnancy | null;
  visits: PrenatalVisit[];
  loading: boolean;
  error: string | null;
  alerts: PrenatalAlert[];
  // Pregnancy CRUD
  createPregnancy: (data: CreatePregnancy) => Promise<Pregnancy | null>;
  updatePregnancy: (id: string, data: Partial<CreatePregnancy>) => Promise<boolean>;
  // Visit CRUD
  addVisit: (data: CreatePrenatalVisit) => Promise<PrenatalVisit | null>;
  updateVisit: (id: string, data: Partial<CreatePrenatalVisit>) => Promise<boolean>;
  deleteVisit: (id: string) => Promise<boolean>;
  // Utilities
  gestationalAge: GestationalAge | null;
  daysToEdd: number | null;
  refresh: () => void;
}

export interface GestationalAge {
  weeks: number;
  days: number;
  totalDays: number;
}

// ============================================================================
// GESTATIONAL AGE HELPERS
// ============================================================================

/**
 * Calculate gestational age from LMP date to a reference date.
 */
export function calculateGestationalAge(
  lmpDate: string,
  referenceDate: string = new Date().toISOString().split('T')[0],
): GestationalAge {
  const lmp = new Date(lmpDate);
  const ref = new Date(referenceDate);
  const diffMs = ref.getTime() - lmp.getTime();
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    totalDays,
  };
}

/**
 * Calculate estimated due date from LMP (Naegele's rule: +280 days).
 */
export function calculateEDD(lmpDate: string): string {
  const lmp = new Date(lmpDate);
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd.toISOString().split('T')[0];
}

/**
 * Calculate days remaining until EDD.
 */
function calculateDaysToEdd(eddDate: string): number {
  const edd = new Date(eddDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = edd.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================================================
// NORMAL RANGE REFERENCES
// ============================================================================

/**
 * Expected fundal height range for a given gestational week (20-36 weeks).
 * Normal: gestational weeks in cm +/- 2cm.
 */
export function expectedFundalHeight(weeks: number): { min: number; max: number } | null {
  if (weeks < 20 || weeks > 42) return null;
  return { min: weeks - 2, max: weeks + 2 };
}

/**
 * Normal FHR range: 120-160 bpm.
 */
export const NORMAL_FHR = { min: 120, max: 160 };

/**
 * Blood pressure alert thresholds.
 */
export const BP_ALERT = { systolic: 140, diastolic: 90 };

// ============================================================================
// HOOK
// ============================================================================

export function usePrenatal(
  doctorId: string,
  options?: UsePrenatalOptions,
): UsePrenatalReturn {
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [visits, setVisits] = useState<PrenatalVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Fetch pregnancies ──────────────────────────────────────────────────

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      // Fetch pregnancies
      let pregQuery = supabase
        .from('gynecology_pregnancies')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        pregQuery = pregQuery.eq('patient_id', options.patientId);
      }

      const { data: pregData, error: pregError } = await pregQuery;

      if (cancelled) return;

      if (pregError) {
        if (pregError.code === '42P01' || pregError.message?.includes('does not exist')) {
          setPregnancies([]);
          setVisits([]);
          setLoading(false);
          return;
        }
        setError(pregError.message);
        setPregnancies([]);
        setVisits([]);
        setLoading(false);
        return;
      }

      const mappedPregnancies: Pregnancy[] = (pregData ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        patient_id: row.patient_id as string,
        doctor_id: row.doctor_id as string,
        lmp_date: row.lmp_date as string,
        edd: (row.edd as string) ?? calculateEDD(row.lmp_date as string),
        gravida: (row.gravida as number) ?? 0,
        para: (row.para as number) ?? 0,
        abortos: (row.abortos as number) ?? 0,
        cesareas: (row.cesareas as number) ?? 0,
        vivos: (row.vivos as number) ?? 0,
        blood_type: (row.blood_type as string) ?? null,
        rh_factor: (row.rh_factor as string) ?? null,
        risk_level: (row.risk_level as Pregnancy['risk_level']) ?? 'low',
        status: (row.status as Pregnancy['status']) ?? 'active',
        notes: (row.notes as string) ?? null,
        created_at: row.created_at as string,
      }));

      setPregnancies(mappedPregnancies);

      // Fetch visits for active/selected pregnancy
      const targetPregnancyId =
        options?.pregnancyId ??
        mappedPregnancies.find((p) => p.status === 'active')?.id;

      if (targetPregnancyId) {
        const { data: visitData, error: visitError } = await supabase
          .from('gynecology_prenatal')
          .select('*')
          .eq('pregnancy_id', targetPregnancyId)
          .eq('doctor_id', doctorId)
          .order('visit_date', { ascending: true });

        if (cancelled) return;

        if (visitError) {
          if (visitError.code !== '42P01' && !visitError.message?.includes('does not exist')) {
            setError(visitError.message);
          }
          setVisits([]);
        } else {
          const mappedVisits: PrenatalVisit[] = (visitData ?? []).map(
            (row: Record<string, unknown>) => ({
              id: row.id as string,
              pregnancy_id: row.pregnancy_id as string,
              patient_id: row.patient_id as string,
              doctor_id: row.doctor_id as string,
              visit_date: row.visit_date as string,
              visit_type: (row.visit_type as PrenatalVisit['visit_type']) ?? 'routine',
              gestational_weeks: (row.gestational_weeks as number) ?? 0,
              gestational_days: (row.gestational_days as number) ?? 0,
              weight_kg: (row.weight_kg as number) ?? null,
              blood_pressure_systolic: (row.blood_pressure_systolic as number) ?? null,
              blood_pressure_diastolic: (row.blood_pressure_diastolic as number) ?? null,
              fundal_height_cm: (row.fundal_height_cm as number) ?? null,
              fetal_heart_rate: (row.fetal_heart_rate as number) ?? null,
              fetal_presentation: (row.fetal_presentation as string) ?? null,
              fetal_movements: (row.fetal_movements as string) ?? null,
              amniotic_fluid: (row.amniotic_fluid as string) ?? null,
              hemoglobin: (row.hemoglobin as number) ?? null,
              hematocrit: (row.hematocrit as number) ?? null,
              glucose: (row.glucose as number) ?? null,
              urine_protein: (row.urine_protein as string) ?? null,
              ultrasound_notes: (row.ultrasound_notes as string) ?? null,
              risk_factors: (row.risk_factors as string[]) ?? [],
              supplements: (row.supplements as string[]) ?? [],
              plan: (row.plan as string) ?? null,
              next_visit_date: (row.next_visit_date as string) ?? null,
              notes: (row.notes as string) ?? null,
              created_at: row.created_at as string,
            }),
          );
          setVisits(mappedVisits);
        }
      } else {
        setVisits([]);
      }

      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [doctorId, options?.patientId, options?.pregnancyId, refreshKey]);

  // ── Active pregnancy ─────────────────────────────────────────────────

  const activePregnancy = useMemo(() => {
    if (options?.pregnancyId) {
      return pregnancies.find((p) => p.id === options.pregnancyId) ?? null;
    }
    return pregnancies.find((p) => p.status === 'active') ?? null;
  }, [pregnancies, options?.pregnancyId]);

  // ── Current gestational age ──────────────────────────────────────────

  const gestationalAge = useMemo(() => {
    if (!activePregnancy) return null;
    return calculateGestationalAge(activePregnancy.lmp_date);
  }, [activePregnancy]);

  // ── Days to EDD ──────────────────────────────────────────────────────

  const daysToEdd = useMemo(() => {
    if (!activePregnancy) return null;
    return calculateDaysToEdd(activePregnancy.edd);
  }, [activePregnancy]);

  // ── Alerts ───────────────────────────────────────────────────────────

  const alerts = useMemo<PrenatalAlert[]>(() => {
    if (visits.length === 0) return [];

    const last = visits[visits.length - 1];
    const result: PrenatalAlert[] = [];

    // Blood pressure alert
    if (
      (last.blood_pressure_systolic != null && last.blood_pressure_systolic >= BP_ALERT.systolic) ||
      (last.blood_pressure_diastolic != null && last.blood_pressure_diastolic >= BP_ALERT.diastolic)
    ) {
      const sys = last.blood_pressure_systolic ?? 0;
      const dia = last.blood_pressure_diastolic ?? 0;
      const severe = sys >= 160 || dia >= 110;
      result.push({
        type: 'blood_pressure',
        label: 'Tensión Arterial Elevada',
        severity: severe ? 'severe' : 'moderate',
        message: severe
          ? `TA ${sys}/${dia} mmHg — sospecha de preeclampsia severa`
          : `TA ${sys}/${dia} mmHg — evaluar preeclampsia`,
      });
    }

    // FHR alert
    if (last.fetal_heart_rate != null) {
      if (last.fetal_heart_rate < NORMAL_FHR.min) {
        result.push({
          type: 'fetal_heart_rate',
          label: 'Bradicardia Fetal',
          severity: last.fetal_heart_rate < 110 ? 'severe' : 'moderate',
          message: `FCF ${last.fetal_heart_rate} lpm — por debajo del rango normal (120-160)`,
        });
      } else if (last.fetal_heart_rate > NORMAL_FHR.max) {
        result.push({
          type: 'fetal_heart_rate',
          label: 'Taquicardia Fetal',
          severity: last.fetal_heart_rate > 180 ? 'severe' : 'moderate',
          message: `FCF ${last.fetal_heart_rate} lpm — por encima del rango normal (120-160)`,
        });
      }
    }

    // Fundal height alert (from week 20)
    if (last.fundal_height_cm != null && last.gestational_weeks >= 20) {
      const expected = expectedFundalHeight(last.gestational_weeks);
      if (expected) {
        if (last.fundal_height_cm < expected.min) {
          result.push({
            type: 'fundal_height',
            label: 'Altura Uterina Baja',
            severity: last.fundal_height_cm < expected.min - 2 ? 'severe' : 'moderate',
            message: `AU ${last.fundal_height_cm} cm a las ${last.gestational_weeks} sem — posible RCIU`,
          });
        } else if (last.fundal_height_cm > expected.max) {
          result.push({
            type: 'fundal_height',
            label: 'Altura Uterina Alta',
            severity: last.fundal_height_cm > expected.max + 2 ? 'moderate' : 'mild',
            message: `AU ${last.fundal_height_cm} cm a las ${last.gestational_weeks} sem — posible macrosomia o polihidramnios`,
          });
        }
      }
    }

    // Weight gain alert (compare last two visits)
    if (visits.length >= 2) {
      const prev = visits[visits.length - 2];
      if (prev.weight_kg != null && last.weight_kg != null) {
        const weeksDiff = last.gestational_weeks - prev.gestational_weeks;
        if (weeksDiff > 0) {
          const weeklyGain = (last.weight_kg - prev.weight_kg) / weeksDiff;
          // In 2nd/3rd trimester, >1 kg/week is concerning
          if (last.gestational_weeks >= 14 && weeklyGain > 1.0) {
            result.push({
              type: 'weight_gain',
              label: 'Ganancia de Peso Excesiva',
              severity: weeklyGain > 1.5 ? 'moderate' : 'mild',
              message: `Ganancia de ${weeklyGain.toFixed(1)} kg/sem — evaluar retención hídrica`,
            });
          }
        }
      }
    }

    return result;
  }, [visits]);

  // ── Create pregnancy ─────────────────────────────────────────────────

  const createPregnancy = useCallback(
    async (data: CreatePregnancy): Promise<Pregnancy | null> => {
      const edd = calculateEDD(data.lmp_date);

      const { data: row, error: insertError } = await supabase
        .from('gynecology_pregnancies')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id,
          lmp_date: data.lmp_date,
          edd,
          gravida: data.gravida,
          para: data.para,
          abortos: data.abortos,
          cesareas: data.cesareas,
          vivos: data.vivos,
          blood_type: data.blood_type ?? null,
          rh_factor: data.rh_factor ?? null,
          risk_level: data.risk_level ?? 'low',
          status: 'active',
          notes: data.notes ?? null,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as Pregnancy;
    },
    [doctorId, refresh],
  );

  // ── Update pregnancy ─────────────────────────────────────────────────

  const updatePregnancy = useCallback(
    async (id: string, data: Partial<CreatePregnancy>): Promise<boolean> => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.lmp_date) {
        updateData.edd = calculateEDD(data.lmp_date);
      }

      const { error: updateError } = await supabase
        .from('gynecology_pregnancies')
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
    [doctorId, refresh],
  );

  // ── Add visit ────────────────────────────────────────────────────────

  const addVisit = useCallback(
    async (data: CreatePrenatalVisit): Promise<PrenatalVisit | null> => {
      const { data: row, error: insertError } = await supabase
        .from('gynecology_prenatal')
        .insert({
          doctor_id: doctorId,
          pregnancy_id: data.pregnancy_id,
          patient_id: data.patient_id,
          visit_date: data.visit_date,
          visit_type: data.visit_type,
          gestational_weeks: data.gestational_weeks,
          gestational_days: data.gestational_days,
          weight_kg: data.weight_kg ?? null,
          blood_pressure_systolic: data.blood_pressure_systolic ?? null,
          blood_pressure_diastolic: data.blood_pressure_diastolic ?? null,
          fundal_height_cm: data.fundal_height_cm ?? null,
          fetal_heart_rate: data.fetal_heart_rate ?? null,
          fetal_presentation: data.fetal_presentation ?? null,
          fetal_movements: data.fetal_movements ?? null,
          amniotic_fluid: data.amniotic_fluid ?? null,
          hemoglobin: data.hemoglobin ?? null,
          hematocrit: data.hematocrit ?? null,
          glucose: data.glucose ?? null,
          urine_protein: data.urine_protein ?? null,
          ultrasound_notes: data.ultrasound_notes ?? null,
          risk_factors: data.risk_factors ?? [],
          supplements: data.supplements ?? [],
          plan: data.plan ?? null,
          next_visit_date: data.next_visit_date ?? null,
          notes: data.notes ?? null,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      refresh();
      return row as unknown as PrenatalVisit;
    },
    [doctorId, refresh],
  );

  // ── Update visit ─────────────────────────────────────────────────────

  const updateVisit = useCallback(
    async (id: string, data: Partial<CreatePrenatalVisit>): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('gynecology_prenatal')
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

  // ── Delete visit ─────────────────────────────────────────────────────

  const deleteVisit = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('gynecology_prenatal')
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
    pregnancies,
    activePregnancy,
    visits,
    loading,
    error,
    alerts,
    createPregnancy,
    updatePregnancy,
    addVisit,
    updateVisit,
    deleteVisit,
    gestationalAge,
    daysToEdd,
    refresh,
  };
}
