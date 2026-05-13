'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * @file use-sidebar-collapsed.ts
 * @description SSR-safe persistence hook for the desktop sidebar collapse state.
 *
 * Server renders with the legacy-or-new-shell default (`false` / `true`) and
 * on mount the client reads `localStorage` for the persisted preference, then
 * snaps to it. `toggle()` flips state and writes back.
 *
 * When localStorage is unavailable (e.g. Safari private mode → SecurityError,
 * disabled cookies), the hook degrades gracefully: state lives in memory only,
 * no error propagates. This satisfies FR-3 of the medico-shell-sanvia spec.
 *
 * ## medico-shell-supabase-style (Phase 1)
 * When `NEXT_PUBLIC_FEATURE_NEW_SHELL === 'true'`:
 *   - Storage key is `medico:sidebar-collapsed-v2` (separate from legacy).
 *   - Default `collapsed = true` (Supabase-style icon-rail).
 * Otherwise the legacy contract stands: key `medico:sidebar-collapsed`, default
 * `false`. Keeping the keys disjoint means flipping the flag never inherits a
 * stale preference from the other mode.
 */

const LEGACY_STORAGE_KEY = 'medico:sidebar-collapsed';
const V2_STORAGE_KEY = 'medico:sidebar-collapsed-v2';

function isNewShellEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_NEW_SHELL === 'true';
}

function activeStorageKey(): string {
  return isNewShellEnabled() ? V2_STORAGE_KEY : LEGACY_STORAGE_KEY;
}

function defaultCollapsed(): boolean {
  return isNewShellEnabled();
}

/**
 * Reads the persisted collapse flag. Returns the mode-appropriate default when
 * storage is empty, unavailable, or holds a non-boolean value.
 *
 * Honors stored "true" / "false" strings. If anything else is stored, returns
 * the default for the current mode — never throws.
 */
function readPersisted(): boolean {
  if (typeof window === 'undefined') return defaultCollapsed();
  try {
    const stored = window.localStorage.getItem(activeStorageKey());
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return defaultCollapsed();
  } catch {
    // SecurityError, QuotaExceededError, etc. — treat as no preference.
    return defaultCollapsed();
  }
}

/**
 * Best-effort persistence. Swallows storage errors so the UI never crashes.
 */
function writePersisted(next: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(activeStorageKey(), String(next));
  } catch {
    // localStorage unavailable — keep state in memory only.
  }
}

export interface UseSidebarCollapsedReturn {
  collapsed: boolean;
  toggle: () => void;
}

export function useSidebarCollapsed(): UseSidebarCollapsedReturn {
  // Initial state must match the SSR render to avoid hydration warnings.
  // For NEW_SHELL=true the SSR default is collapsed=true; for legacy it's false.
  // (process.env.NEXT_PUBLIC_* is inlined at build time so both server + client
  // see the same value.)
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed());

  // Hydrate from storage on mount. Running in `useEffect` keeps the initial
  // server render deterministic (matches `defaultCollapsed()`) and lets the
  // client snap to the persisted preference if any.
  useEffect(() => {
    const persisted = readPersisted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(persisted);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writePersisted(next);
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
