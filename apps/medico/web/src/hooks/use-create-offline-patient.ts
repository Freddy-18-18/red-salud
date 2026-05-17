'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOfflinePatient,
  type ServiceError,
} from '@/lib/supabase/services/patients-service';
import { supabase } from '@/lib/supabase/client';
import type { OfflinePatientCreateInput } from '@red-salud/types';

interface UseCreateOfflinePatientResult {
  mutate: (input: OfflinePatientCreateInput) => void;
  mutateAsync: (input: OfflinePatientCreateInput) => Promise<{ patient_id: string }>;
  isPending: boolean;
  error: ServiceError | null;
  reset: () => void;
}

/**
 * Mutation hook backing the "Crear paciente offline" flow (T-3-04).
 *
 * On success, invalidates every cached `['patients', ...]` query so the
 * roster, KPI strip, and any patient-detail view fetched in this session
 * picks up the newly created row on next render. The broad key match is
 * intentional — Phase 3 introduces several derived caches and we'd rather
 * over-invalidate than risk a stale roster after creation.
 *
 * UX ownership note: this hook never toasts or navigates. The dialog
 * component owns the success affordance (toast + push to detail page) and
 * the error inline-display. Hooks stay pure to keep tests DOM-free.
 */
export function useCreateOfflinePatient(): UseCreateOfflinePatientResult {
  const queryClient = useQueryClient();

  const mutation = useMutation<{ patient_id: string }, ServiceError, OfflinePatientCreateInput>({
    mutationFn: async (input) => {
      const result = await createOfflinePatient(supabase, input);
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
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
