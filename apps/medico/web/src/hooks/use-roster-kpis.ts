'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getRosterKPIs,
  type ServiceError,
} from '@/lib/supabase/services/patients-service';
import { supabase } from '@/lib/supabase/client';
import type { RosterKPIs } from '@red-salud/types';

interface UseRosterKPIsOptions {
  doctorId: string | null;
}

interface UseRosterKPIsResult {
  kpis: RosterKPIs | null;
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

/**
 * KPI strip backing the redesigned roster header (T-3-09).
 *
 * staleTime is intentionally longer (60s) than the roster query (30s) — the
 * counts are aggregate views and a 1-minute delay between mutations and
 * the strip update is acceptable. The hook still re-fetches on `refetch()`
 * after a create-patient mutation, so the "Activos" tile stays current.
 *
 * Failures degrade gracefully: the service maps individual sub-query
 * failures to `0` rather than failing the whole result, so `error` here
 * only fires when the wrapper itself rejects (e.g. JWT expired, network).
 */
export function useRosterKPIs({ doctorId }: UseRosterKPIsOptions): UseRosterKPIsResult {
  const enabled = Boolean(doctorId);

  const query = useQuery({
    queryKey: ['patients', 'roster-kpis', doctorId ?? ''],
    queryFn: async () => {
      const result = await getRosterKPIs(supabase, doctorId as string);
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return {
    kpis: query.data ?? null,
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
