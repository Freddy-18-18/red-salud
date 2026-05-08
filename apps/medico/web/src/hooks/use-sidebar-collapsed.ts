'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * @file use-sidebar-collapsed.ts
 * @description SSR-safe persistence hook for the desktop sidebar collapse state.
 *
 * Server renders with `collapsed=false` (avoids hydration mismatch), then on
 * mount the client reads `localStorage['medico:sidebar-collapsed']` and snaps
 * to the persisted value. `toggle()` flips state and writes back.
 *
 * When localStorage is unavailable (e.g. Safari private mode → SecurityError,
 * disabled cookies), the hook degrades gracefully: state lives in memory only,
 * no error propagates. This satisfies FR-3 of the medico-shell-sanvia spec.
 */

const STORAGE_KEY = 'medico:sidebar-collapsed';

/**
 * Reads the persisted collapse flag. Returns `false` when storage is empty,
 * unavailable, or holds a non-`'true'` value.
 */
function readPersisted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // SecurityError, QuotaExceededError, etc. — treat as no preference.
    return false;
  }
}

/**
 * Best-effort persistence. Swallows storage errors so the UI never crashes.
 */
function writePersisted(next: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // localStorage unavailable — keep state in memory only.
  }
}

export interface UseSidebarCollapsedReturn {
  collapsed: boolean;
  toggle: () => void;
}

export function useSidebarCollapsed(): UseSidebarCollapsedReturn {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Hydrate from storage on mount. Running in `useEffect` keeps the initial
  // server render deterministic (always `false`) and avoids a flash of
  // mismatched markup. The `set-state-in-effect` warning is acknowledged: the
  // single-frame snap is intentional and matches FR-3 ("starts collapsed
  // without flash" is documented as Fase 2 cookie-based optimization).
  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
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
