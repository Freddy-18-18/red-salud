/**
 * @file __tests__/use-patient-filters.test.ts
 * @description Behavior tests for the pure state hook `usePatientFilters`
 * (Phase 3 / T-3-08).
 *
 * Contract:
 * - Initializes with `DEFAULT_ROSTER_FILTERS` and isDirty=false.
 * - `setSearch(non-empty)` flips isDirty=true and updates `filters.search`.
 * - `toggleChronicTag(slug)` adds-then-removes the slug on repeat call.
 * - `setAgeRange(min, max)` updates `age_min` and `age_max` atomically.
 * - `setLastVisitWindow(value)` updates; passing same value again does NOT
 *   toggle (the toggle responsibility lives in the UI component); passing
 *   `null` clears it.
 * - `reset()` returns to DEFAULT_ROSTER_FILTERS and isDirty=false.
 *
 * No DOM is touched — pure state hook, so `renderHook` from RTL plus `act`
 * to wrap the setter calls is enough.
 */

import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { DEFAULT_ROSTER_FILTERS } from '@red-salud/types';

import { usePatientFilters } from '../use-patient-filters';

describe('usePatientFilters', () => {
  it('initializes with DEFAULT_ROSTER_FILTERS and isDirty=false', () => {
    const { result } = renderHook(() => usePatientFilters());

    expect(result.current.filters).toEqual(DEFAULT_ROSTER_FILTERS);
    expect(result.current.isDirty).toBe(false);
  });

  it('setSearch updates filters.search and flips isDirty', () => {
    const { result } = renderHook(() => usePatientFilters());

    act(() => {
      result.current.setSearch('maria');
    });

    expect(result.current.filters.search).toBe('maria');
    expect(result.current.isDirty).toBe(true);
  });

  it('toggleChronicTag adds slug on first call and removes it on second', () => {
    const { result } = renderHook(() => usePatientFilters());

    act(() => {
      result.current.toggleChronicTag('HTA');
    });
    expect(result.current.filters.chronic_tags).toEqual(['HTA']);
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.toggleChronicTag('HTA');
    });
    expect(result.current.filters.chronic_tags).toEqual([]);
    // NB: filter list returned to empty, but the hook still treats the state
    // as "interacted with" — equality check in the source is value-based for
    // primitives; empty array reads non-dirty since `chronic_tags.length === 0`.
    expect(result.current.isDirty).toBe(false);
  });

  it('setAgeRange updates min and max atomically', () => {
    const { result } = renderHook(() => usePatientFilters());

    act(() => {
      result.current.setAgeRange(20, 65);
    });

    expect(result.current.filters.age_min).toBe(20);
    expect(result.current.filters.age_max).toBe(65);
    expect(result.current.isDirty).toBe(true);
  });

  it('setLastVisitWindow updates the window; passing null clears it', () => {
    const { result } = renderHook(() => usePatientFilters());

    act(() => {
      result.current.setLastVisitWindow('lt_30d');
    });
    expect(result.current.filters.last_visit_window).toBe('lt_30d');
    expect(result.current.isDirty).toBe(true);

    // Setting the same value again leaves the state set (the toggle behavior
    // lives in the consumer component — see roster-filters.tsx which
    // computes `isActive ? null : window.value`). The hook itself just
    // accepts whatever the caller hands it.
    act(() => {
      result.current.setLastVisitWindow('lt_30d');
    });
    expect(result.current.filters.last_visit_window).toBe('lt_30d');

    // Passing null clears it (UI calls this when the user clicks an active chip).
    act(() => {
      result.current.setLastVisitWindow(null);
    });
    expect(result.current.filters.last_visit_window).toBeNull();
    expect(result.current.isDirty).toBe(false);
  });

  it('reset returns to DEFAULT_ROSTER_FILTERS and isDirty becomes false', () => {
    const { result } = renderHook(() => usePatientFilters());

    act(() => {
      result.current.setSearch('algo');
      result.current.toggleChronicTag('DM2');
      result.current.setAgeRange(30, 50);
      result.current.setLastVisitWindow('lt_7d');
      result.current.toggleHasFollowup();
      result.current.toggleAlertsOnly();
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.filters).toEqual(DEFAULT_ROSTER_FILTERS);
    expect(result.current.isDirty).toBe(false);
  });
});
