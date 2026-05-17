'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createInvitedPatient,
  type ServiceError,
} from '@/lib/supabase/services/patients-service';
import { supabase } from '@/lib/supabase/client';
import type {
  InvitedPatientCreateInput,
  InvitedPatientCreateResult,
} from '@red-salud/types';

interface UseCreateInvitedPatientResult {
  mutate: (input: InvitedPatientCreateInput) => void;
  mutateAsync: (input: InvitedPatientCreateInput) => Promise<InvitedPatientCreateResult>;
  isPending: boolean;
  error: ServiceError | null;
  reset: () => void;
}

/**
 * Mutation hook backing the "Crear paciente con invitación" flow (T-3-05).
 *
 * Same invalidation policy as `useCreateOfflinePatient`: bust every
 * `['patients', ...]` cache on success. The returned `invite_token` is what
 * the dialog uses to build the share-link the doctor copies to clipboard.
 *
 * The actual mail-out (sending the invite via email) is deferred — Phase 3
 * keeps it manual (copy + share). When the in-house mailer ships, the hook
 * gains an optional `onSettled` to queue the send.
 */
export function useCreateInvitedPatient(): UseCreateInvitedPatientResult {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    InvitedPatientCreateResult,
    ServiceError,
    InvitedPatientCreateInput
  >({
    mutationFn: async (input) => {
      const result = await createInvitedPatient(supabase, input);
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
