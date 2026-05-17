'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  listPatientsPaginated,
  type ServiceError,
} from '@/lib/supabase/services/patients-service';
import { supabase } from '@/lib/supabase/client';
import type { PatientSummary, RosterFilters } from '@red-salud/types';

interface UsePatientRosterPaginatedOptions {
  doctorId: string | null;
  /** Partial filters; missing fields fall back to the field's default. */
  filters?: Partial<RosterFilters>;
  /** Override the default page size of 25. */
  limit?: number;
}

interface UsePatientRosterPaginatedResult {
  /** Flattened rows across all loaded pages. */
  patients: PatientSummary[];
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<unknown>;
}

/**
 * Cursor-paginated roster hook backing the redesigned `/dashboard/pacientes`
 * list (T-3-08).
 *
 * Why `useInfiniteQuery`:
 * - The roster page supports "Cargar más" + virtual scrolling. The infinite
 *   variant gives us `getNextPageParam` so the hook itself drives cursor
 *   forwarding, and `pages` keeps each batch isolated for hot-reload safety.
 *
 * Cache keying:
 * - Includes the doctorId AND the (stringified) filters so changing any
 *   filter chip forces a fresh first page. We don't try to be clever with
 *   structural sharing — the data volume per page is tiny.
 *
 * staleTime: 30s mirrors the simpler `usePatientRoster` baseline. Long enough
 * that scrolling back-and-forth doesn't re-hit the network, short enough
 * that creating a patient in another tab refreshes the list on focus.
 */
export function usePatientRosterPaginated({
  doctorId,
  filters = {},
  limit = 25,
}: UsePatientRosterPaginatedOptions): UsePatientRosterPaginatedResult {
  const enabled = Boolean(doctorId);

  const query = useInfiniteQuery({
    queryKey: ['patients', 'roster-paginated', doctorId ?? '', filters, limit] as const,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const result = await listPatientsPaginated(supabase, {
        doctorId: doctorId as string,
        cursor: pageParam,
        limit,
        filters,
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // Flatten pages → a single PatientSummary[] for UI consumption.
  const patients = (query.data?.pages ?? []).flatMap((p) => p.rows);

  return {
    patients,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: enabled && query.isLoading,
    error: (query.error as ServiceError | null) ?? null,
    refetch: query.refetch,
  };
}
