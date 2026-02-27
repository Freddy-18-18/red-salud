"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTreatmentPlans,
  getTreatmentPlanById,
  createTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  assignAppointmentToPlan,
  type TreatmentPlan,
  type CreateTreatmentPlanInput,
} from "@/lib/supabase/services/treatment-plan-service";

interface UseTreatmentPlansOptions {
  doctorId: string;
  status?: string;
  patientId?: string;
}

export function useTreatmentPlans({ doctorId, status, patientId }: UseTreatmentPlansOptions) {
  const [plans, setPlans]     = useState<TreatmentPlan[]>([]);
  const [selected, setSelected] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await getTreatmentPlans(doctorId, { status, patientId });
    if (err) setError(err);
    else setPlans(data ?? []);
    setLoading(false);
  }, [doctorId, status, patientId]);

  useEffect(() => { load(); }, [load]);

  const selectPlan = useCallback(async (id: string) => {
    const { data, error: err } = await getTreatmentPlanById(id);
    if (err) setError(err);
    else setSelected(data);
  }, []);

  const create = useCallback(
    async (input: CreateTreatmentPlanInput) => {
      const result = await createTreatmentPlan(doctorId, input);
      if (!result.error) load();
      return result;
    },
    [doctorId, load]
  );

  const edit = useCallback(
    async (id: string, updates: Partial<CreateTreatmentPlanInput>) => {
      const result = await updateTreatmentPlan(id, updates);
      if (!result.error) {
        setPlans((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
        setSelected((prev) => prev?.id === id ? { ...prev, ...updates } : prev);
      }
      return result;
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await deleteTreatmentPlan(id);
      if (!result.error) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        setSelected((prev) => prev?.id === id ? null : prev);
      }
      return result;
    },
    []
  );

  const assignToAppointment = useCallback(
    async (appointmentId: string, planId: string, session: number) => {
      const result = await assignAppointmentToPlan(appointmentId, planId, session);
      if (!result.error) load();
      return result;
    },
    [load]
  );

  /** Stats per plan */
  const getPlanProgress = useCallback((plan: TreatmentPlan) => ({
    pct:       plan.total_sessions > 0 ? Math.round((plan.completed_sessions / plan.total_sessions) * 100) : 0,
    remaining: plan.total_sessions - plan.completed_sessions,
    status:    plan.tps_status,
  }), []);

  return {
    plans,
    selected,
    loading,
    error,
    selectPlan,
    create,
    edit,
    remove,
    assignToAppointment,
    getPlanProgress,
    refresh: load,
  };
}
