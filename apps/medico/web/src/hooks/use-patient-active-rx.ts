'use client';

import { useQuery } from '@tanstack/react-query';
import {
  listActivePrescriptions,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import { supabase } from '@/lib/supabase/client';
import type { PatientActivePrescription } from '@red-salud/types';

interface UsePatientActiveRxOptions {
  patientId: string | null;
}

interface UsePatientActiveRxResult {
  prescriptions: PatientActivePrescription[];
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

/**
 * Active prescriptions for the patient detail Recetas tab and the alert
 * engine. `days_until_expiration` / `is_expiring_soon` / `is_expired` are
 * pre-computed by the service so consumers don't re-derive them.
 *
 * StaleTime mirrors the overview hook (30s) — the doctor expects the list
 * to refresh quickly after issuing a new prescription via the Rx flow.
 */
export function usePatientActiveRx({
  patientId,
}: UsePatientActiveRxOptions): UsePatientActiveRxResult {
  const enabled = Boolean(patientId);

  const query = useQuery({
    queryKey: ['patients', 'active-rx', patientId ?? ''],
    queryFn: async () => {
      const result = await listActivePrescriptions(supabase, patientId as string);
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  return {
    prescriptions: query.data ?? [],
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
