'use client';

import { useQuery } from '@tanstack/react-query';
import {
  listPatientsForDoctor,
  type ServiceError,
} from '@/lib/supabase/services/patients-service';
import { supabase } from '@/lib/supabase/client';
import type { PatientSummary } from '@red-salud/types';

interface UsePatientRosterOptions {
  doctorId: string | null;
  locationId?: string | null;
  search?: string;
}

interface UsePatientRosterResult {
  patients: PatientSummary[];
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

export function usePatientRoster({
  doctorId,
  locationId = null,
  search = '',
}: UsePatientRosterOptions): UsePatientRosterResult {
  const enabled = Boolean(doctorId);

  const query = useQuery({
    queryKey: ['patients', 'roster', doctorId ?? '', locationId ?? '', search],
    queryFn: async () => {
      const result = await listPatientsForDoctor(supabase, {
        doctorId: doctorId as string,
        locationId,
        search,
      });
      if (result.error) {
        // Throw the structured ServiceError so React Query routes it to `error`.
        throw result.error;
      }
      return result.data;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  return {
    patients: query.data ?? [],
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
