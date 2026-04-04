'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type TreatmentPlanStatus =
  | 'draft'
  | 'proposed'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface TreatmentPlanItem {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  phase: number;
  estimated_cost: number | null;
  actual_cost: number | null;
  duration_days: number | null;
  tooth_numbers: string | null;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  sort_order: number;
  created_at: string;
}

export interface TreatmentPlan {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  title: string;
  description: string | null;
  diagnosis: string | null;
  diagnosis_code: string | null;
  status: TreatmentPlanStatus;
  estimated_cost: number | null;
  actual_cost: number | null;
  insurance_coverage: number | null;
  patient_name?: string;
  items: TreatmentPlanItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateTreatmentPlan {
  patient_id?: string | null;
  title: string;
  description?: string | null;
  diagnosis?: string | null;
  diagnosis_code?: string | null;
  estimated_cost?: number | null;
  insurance_coverage?: number | null;
  items?: Array<{
    title: string;
    description?: string | null;
    phase?: number;
    estimated_cost?: number | null;
    duration_days?: number | null;
    tooth_numbers?: string | null;
    sort_order?: number;
  }>;
}

interface UseTreatmentPlansOptions {
  patientId?: string;
  status?: string;
  limit?: number;
}

interface UseTreatmentPlansReturn {
  plans: TreatmentPlan[];
  loading: boolean;
  error: string | null;
  createPlan: (data: CreateTreatmentPlan) => Promise<TreatmentPlan | null>;
  updatePlan: (id: string, data: Partial<CreateTreatmentPlan>) => Promise<boolean>;
  updatePlanStatus: (id: string, status: TreatmentPlanStatus) => Promise<boolean>;
  removePlan: (id: string) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useTreatmentPlans(
  doctorId: string,
  options?: UseTreatmentPlansOptions,
): UseTreatmentPlansReturn {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch plans
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchPlans() {
      let query = supabase
        .from('treatment_plans')
        .select(`
          *,
          profiles!treatment_plans_patient_id_fkey(full_name),
          treatment_plan_items(*)
        `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setPlans([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setPlans([]);
      } else {
        const mapped: TreatmentPlan[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          title: row.title ?? 'Sin título',
          description: row.description,
          diagnosis: row.diagnosis,
          diagnosis_code: row.diagnosis_code,
          status: row.status ?? 'draft',
          estimated_cost: row.estimated_cost,
          actual_cost: row.actual_cost,
          insurance_coverage: row.insurance_coverage,
          patient_name: row.profiles?.full_name ?? undefined,
          items: (row.treatment_plan_items ?? [])
            .map((item: any) => ({
              id: item.id,
              plan_id: item.plan_id,
              title: item.title,
              description: item.description,
              phase: item.phase ?? 1,
              estimated_cost: item.estimated_cost,
              actual_cost: item.actual_cost,
              duration_days: item.duration_days,
              tooth_numbers: item.tooth_numbers,
              status: item.status ?? 'pending',
              sort_order: item.sort_order ?? 0,
              created_at: item.created_at,
            }))
            .sort((a: TreatmentPlanItem, b: TreatmentPlanItem) => a.sort_order - b.sort_order),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setPlans(mapped);
      }
      setLoading(false);
    }

    fetchPlans();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.status, options?.limit, refreshKey]);

  // Create plan with items
  const createPlan = useCallback(
    async (data: CreateTreatmentPlan): Promise<TreatmentPlan | null> => {
      const { items, ...planData } = data;

      const { data: planRow, error: planError } = await supabase
        .from('treatment_plans')
        .insert({
          doctor_id: doctorId,
          ...planData,
          status: 'draft',
        })
        .select()
        .single();

      if (planError) {
        setError(planError.message);
        return null;
      }

      // Insert items
      if (items && items.length > 0) {
        const itemRows = items.map((item, idx) => ({
          plan_id: planRow.id,
          ...item,
          phase: item.phase ?? 1,
          sort_order: item.sort_order ?? idx,
          status: 'pending',
        }));

        const { error: itemsError } = await supabase
          .from('treatment_plan_items')
          .insert(itemRows);

        if (itemsError) {
          console.error('[TreatmentPlans] Failed to insert items:', itemsError);
        }
      }

      refresh();
      return planRow as TreatmentPlan;
    },
    [doctorId, refresh],
  );

  // Update plan
  const updatePlan = useCallback(
    async (id: string, data: Partial<CreateTreatmentPlan>): Promise<boolean> => {
      const { items, ...planData } = data;

      const { error: updateError } = await supabase
        .from('treatment_plans')
        .update(planData)
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

  // Update plan status
  const updatePlanStatus = useCallback(
    async (id: string, status: TreatmentPlanStatus): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('treatment_plans')
        .update({ status })
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

  // Delete plan
  const removePlan = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: deleteError } = await supabase
        .from('treatment_plans')
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

  return { plans, loading, error, createPlan, updatePlan, updatePlanStatus, removePlan, refresh };
}
