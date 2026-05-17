'use client';

import { useQuery } from '@tanstack/react-query';
import {
  listVitalsTrend,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import { supabase } from '@/lib/supabase/client';
import type { PatientVitalsTrendPoint } from '@red-salud/types';

interface UsePatientVitalsTrendOptions {
  patientId: string | null;
  /** Window in days. Defaults to 30. */
  days?: 30 | 90 | 365;
  /**
   * Optional metric-type filter. Useful when a vital chart only renders one
   * series (e.g. weight only) — limits the payload Postgres returns.
   */
  metricTypeIds?: string[];
}

interface UsePatientVitalsTrendResult {
  vitals: PatientVitalsTrendPoint[];
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

/**
 * Vitals trend backing the chart on the Resumen / Vitales tabs.
 *
 * Longer staleTime (60s) than the overview because the trend chart re-renders
 * are expensive (recharts) and the underlying data only changes when the
 * patient or doctor logs a new measurement. gcTime is generous (10min) so
 * switching between days windows (30 ⇄ 90 ⇄ 365) reuses cache when the user
 * navigates back.
 */
export function usePatientVitalsTrend({
  patientId,
  days = 30,
  metricTypeIds,
}: UsePatientVitalsTrendOptions): UsePatientVitalsTrendResult {
  const enabled = Boolean(patientId);

  // Sort the metric-type filter so its serialized form is stable — otherwise
  // re-rendering with the same array in a new reference would bust the cache.
  const metricKey = metricTypeIds ? [...metricTypeIds].sort().join(',') : '';

  const query = useQuery({
    queryKey: ['patients', 'vitals-trend', patientId ?? '', days, metricKey],
    queryFn: async () => {
      const result = await listVitalsTrend(supabase, patientId as string, {
        days,
        metricTypeIds,
      });
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
    vitals: query.data ?? [],
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
