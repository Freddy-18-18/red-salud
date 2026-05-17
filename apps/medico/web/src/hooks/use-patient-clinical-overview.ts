'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getClinicalOverview,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import { supabase } from '@/lib/supabase/client';
import type { PatientClinicalOverview } from '@red-salud/types';

interface UsePatientClinicalOverviewOptions {
  patientId: string | null;
}

interface UsePatientClinicalOverviewResult {
  overview: PatientClinicalOverview | null;
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

/**
 * Backs the Resumen tab in `/dashboard/pacientes/[patientId]`. Issues a
 * single orchestrated read (patient_details + last vitals + active Rx count
 * + next appointment) via `getClinicalOverview()`.
 *
 * StaleTime tuning: 30s matches the roster hook — the overview surface is
 * the doctor's "landing pad" and the data underneath (vitals, prescriptions)
 * changes only when the doctor explicitly writes, so refetches are cheap.
 * gcTime sits at 5min: long enough to keep the overview hot when bouncing
 * between tabs, short enough not to leak stale data across patients.
 */
export function usePatientClinicalOverview({
  patientId,
}: UsePatientClinicalOverviewOptions): UsePatientClinicalOverviewResult {
  const enabled = Boolean(patientId);

  const query = useQuery({
    queryKey: ['patients', 'clinical-overview', patientId ?? ''],
    queryFn: async () => {
      const result = await getClinicalOverview(supabase, patientId as string);
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
    overview: query.data ?? null,
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
