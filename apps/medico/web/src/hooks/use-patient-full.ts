'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getPatientFullById,
  type ServiceError,
} from '@/lib/supabase/services/patients-service';
import { supabase } from '@/lib/supabase/client';
import type { PatientFull } from '@red-salud/types';

interface UsePatientFullOptions {
  patientId: string | null;
}

interface UsePatientFullResult {
  patient: PatientFull | null;
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

export function usePatientFull({
  patientId,
}: UsePatientFullOptions): UsePatientFullResult {
  const enabled = Boolean(patientId);

  const query = useQuery({
    queryKey: ['patients', 'detail', patientId ?? ''],
    queryFn: async () => {
      const result = await getPatientFullById(supabase, patientId as string);
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  return {
    patient: query.data ?? null,
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
