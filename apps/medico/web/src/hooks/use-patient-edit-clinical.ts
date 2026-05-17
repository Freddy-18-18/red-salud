'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateClinicalFields,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import { supabase } from '@/lib/supabase/client';
import type { ClinicalFieldEdit, PatientDetailsRow } from '@red-salud/types';

interface UsePatientEditClinicalResult {
  mutate: (edit: ClinicalFieldEdit) => void;
  mutateAsync: (edit: ClinicalFieldEdit) => Promise<PatientDetailsRow>;
  isPending: boolean;
  error: ServiceError | null;
  reset: () => void;
}

/**
 * Mutation hook backing the inline-edit dialog for clinical fields
 * (allergies, chronic conditions, weight, height, blood type, notes).
 *
 * Cache invalidation strategy on success:
 * - `['patients', 'clinical-overview', patientId]` → the Resumen tab
 *   immediately re-fetches with the new values (BMI recomputes server-side
 *   via `calculateBMI()` in `getClinicalOverview`).
 * - `['patients', 'detail', patientId]` → the demographic + patient_details
 *   join in `usePatientFull` also refreshes (the joined `patient_details`
 *   chunk now matches the upserted row).
 *
 * Why no toast / sonner call here: the dialog component owns the UX (saving
 * spinner, success toast, error inline message). Hooks stay pure so they
 * can be reused from tests without DOM side effects.
 */
export function usePatientEditClinical(): UsePatientEditClinicalResult {
  const queryClient = useQueryClient();

  const mutation = useMutation<PatientDetailsRow, ServiceError, ClinicalFieldEdit>({
    mutationFn: async (edit) => {
      const result = await updateClinicalFields(supabase, edit);
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: (_data, variables) => {
      const patientId = variables.patient_id;
      void queryClient.invalidateQueries({
        queryKey: ['patients', 'clinical-overview', patientId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['patients', 'detail', patientId],
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: (mutation.error as ServiceError | null) ?? null,
    reset: mutation.reset,
  };
}
