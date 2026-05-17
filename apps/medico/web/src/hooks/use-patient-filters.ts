'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_ROSTER_FILTERS,
  type LastVisitWindow,
  type RosterFilters,
} from '@red-salud/types';

interface UsePatientFiltersResult {
  filters: RosterFilters;
  isDirty: boolean;
  setSearch: (search: string) => void;
  toggleChronicTag: (slug: string) => void;
  setAgeRange: (min: number | null, max: number | null) => void;
  setLastVisitWindow: (window: LastVisitWindow | null) => void;
  setSedeId: (id: string | null) => void;
  toggleHasFollowup: () => void;
  toggleAlertsOnly: () => void;
  reset: () => void;
  setFilters: (partial: Partial<RosterFilters>) => void;
}

/**
 * Pure state hook for the roster filter chips (T-3-08).
 *
 * Why local state and NOT URL params:
 * - The roster page already wraps the filter strip in a client component.
 *   URL persistence is desirable but adds `useSearchParams` + Suspense
 *   boundary churn that breaks streaming SSR on the parent page. The chip
 *   strip stays in-memory for the first cut.
 *
 * TODO(P3-batch2): persist `filters` to URL via `useSearchParams` +
 *   `router.replace(?...)` so deep-linking a filtered roster works. The
 *   challenge is two-way binding without a full reload — needs a debounced
 *   write to avoid spamming history entries while the doctor types in the
 *   search box.
 *
 * Equality semantics for `isDirty`: shallow compare against
 * `DEFAULT_ROSTER_FILTERS`. Arrays compare by reference, so toggling and
 * untoggling the same tag returns a fresh empty array but still reads dirty
 * — that's fine for the UX (you DID interact with the filter).
 */
export function usePatientFilters(): UsePatientFiltersResult {
  const [filters, setState] = useState<RosterFilters>(DEFAULT_ROSTER_FILTERS);

  const setSearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, search }));
  }, []);

  const toggleChronicTag = useCallback((slug: string) => {
    setState((prev) => {
      const tags = prev.chronic_tags;
      const next = tags.includes(slug)
        ? tags.filter((t) => t !== slug)
        : [...tags, slug];
      return { ...prev, chronic_tags: next };
    });
  }, []);

  const setAgeRange = useCallback((min: number | null, max: number | null) => {
    setState((prev) => ({ ...prev, age_min: min, age_max: max }));
  }, []);

  const setLastVisitWindow = useCallback((window: LastVisitWindow | null) => {
    setState((prev) => ({ ...prev, last_visit_window: window }));
  }, []);

  const setSedeId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, sede_id: id }));
  }, []);

  const toggleHasFollowup = useCallback(() => {
    setState((prev) => ({ ...prev, has_followup: !prev.has_followup }));
  }, []);

  const toggleAlertsOnly = useCallback(() => {
    setState((prev) => ({ ...prev, alerts_only: !prev.alerts_only }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_ROSTER_FILTERS);
  }, []);

  const setFilters = useCallback((partial: Partial<RosterFilters>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const isDirty = useMemo(() => {
    if (filters.search.trim().length > 0) return true;
    if (filters.chronic_tags.length > 0) return true;
    if (filters.age_min != null) return true;
    if (filters.age_max != null) return true;
    if (filters.last_visit_window != null) return true;
    if (filters.sede_id != null) return true;
    if (filters.has_followup) return true;
    if (filters.alerts_only) return true;
    return false;
  }, [filters]);

  return {
    filters,
    isDirty,
    setSearch,
    toggleChronicTag,
    setAgeRange,
    setLastVisitWindow,
    setSedeId,
    toggleHasFollowup,
    toggleAlertsOnly,
    reset,
    setFilters,
  };
}
