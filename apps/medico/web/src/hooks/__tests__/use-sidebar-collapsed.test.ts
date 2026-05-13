/**
 * @file __tests__/use-sidebar-collapsed.test.ts
 * @description Phase-1 (Supabase-style) tests for the v2 storage key + new defaults.
 *
 * Contract under test:
 * - When `NEXT_PUBLIC_FEATURE_NEW_SHELL=true`, the hook SHALL:
 *     * Default to `collapsed = true` on first paint (Supabase-style icon rail).
 *     * Persist + read state under the new key `medico:sidebar-collapsed-v2`.
 *     * NOT spill state into the legacy `medico:sidebar-collapsed` key.
 * - When the flag is off or missing, the legacy contract stands:
 *     * Default `collapsed = false`, key `medico:sidebar-collapsed`.
 * - Hydration: a stored `"false"` under v2 keeps the hook expanded even when
 *   the flag says default-collapsed.
 *
 * Legacy behavior is regression-tested by the co-located
 * `apps/medico/web/src/hooks/use-sidebar-collapsed.test.ts`. This file owns
 * only the v2 / FEATURE_NEW_SHELL branch.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSidebarCollapsed } from '../use-sidebar-collapsed';

const LEGACY_KEY = 'medico:sidebar-collapsed';
const V2_KEY = 'medico:sidebar-collapsed-v2';

describe('useSidebarCollapsed — FEATURE_NEW_SHELL=true', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('defaults to collapsed=true with an empty localStorage', () => {
    const { result } = renderHook(() => useSidebarCollapsed());
    expect(result.current.collapsed).toBe(true);
  });

  it('persists toggle output under the v2 key, NOT the legacy key', () => {
    const { result } = renderHook(() => useSidebarCollapsed());

    // Start collapsed; flip to expanded.
    act(() => {
      result.current.toggle();
    });
    expect(result.current.collapsed).toBe(false);
    expect(window.localStorage.getItem(V2_KEY)).toBe('false');
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();

    // Flip back.
    act(() => {
      result.current.toggle();
    });
    expect(result.current.collapsed).toBe(true);
    expect(window.localStorage.getItem(V2_KEY)).toBe('true');
    expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it('hydrates from v2 storage when present (expanded preference wins over default)', () => {
    window.localStorage.setItem(V2_KEY, 'false');

    const { result } = renderHook(() => useSidebarCollapsed());
    // Stored "false" → keep expanded even though default is collapsed.
    expect(result.current.collapsed).toBe(false);
  });

  it('hydrates from v2 storage with stored "true" → collapsed', () => {
    window.localStorage.setItem(V2_KEY, 'true');
    const { result } = renderHook(() => useSidebarCollapsed());
    expect(result.current.collapsed).toBe(true);
  });

  it('ignores legacy key when flag is on (no state pollution between modes)', () => {
    window.localStorage.setItem(LEGACY_KEY, 'false');

    const { result } = renderHook(() => useSidebarCollapsed());
    // Legacy "false" MUST NOT downgrade new-shell default of true.
    expect(result.current.collapsed).toBe(true);
  });
});

describe('useSidebarCollapsed — FEATURE_NEW_SHELL=false (legacy contract)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
  });

  it('defaults to collapsed=false', () => {
    const { result } = renderHook(() => useSidebarCollapsed());
    expect(result.current.collapsed).toBe(false);
  });

  it('writes under the legacy key, not v2', () => {
    const { result } = renderHook(() => useSidebarCollapsed());
    act(() => {
      result.current.toggle();
    });
    expect(window.localStorage.getItem(LEGACY_KEY)).toBe('true');
    expect(window.localStorage.getItem(V2_KEY)).toBeNull();
  });
});
