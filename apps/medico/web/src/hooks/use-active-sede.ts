'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

/**
 * @file use-active-sede.ts
 * @description Active sede precedence + persistence hook (R5).
 *
 * Resolution order:
 *   1. `?sede=<id>` URL search-param (server-shareable links)
 *   2. `active_sede_id` cookie (30-day persistence)
 *   3. `null` (caller picks a default from a fetched list)
 *
 * The cookie is the truth — URL param wins for the current view but the
 * cookie still drives middleware + server components. `setSede(id)` writes
 * BOTH the cookie and the in-memory state, but does NOT modify the URL; the
 * URL is treated as an explicit override the user opted into.
 *
 * React Query invalidation is best-effort: the hook calls `useQueryClient()`
 * via a try/catch wrapper so the hook degrades cleanly when no provider is
 * mounted (medico/web does not currently install `QueryClientProvider`).
 * When a provider is present, `setSede` invalidates the `['appointments']`
 * query family so consumers refetch against the new sede.
 *
 * Cookie attributes: `path=/`, `SameSite=Lax`, `max-age=2592000` (30 days).
 *
 * Individual doctor practice ONLY — no clinic / multi-org concepts.
 */

const COOKIE_NAME = 'active_sede_id';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const raw of parts) {
    const eq = raw.indexOf('=');
    if (eq === -1) continue;
    const key = raw.substring(0, eq);
    if (key === name) {
      return decodeURIComponent(raw.substring(eq + 1));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

/**
 * `useQueryClient` throws synchronously when no `QueryClientProvider` is
 * mounted. Medico/web does not currently install the provider at the root,
 * so we wrap the hook in a try/catch and return null when it throws — that
 * keeps `useActiveSede` mountable in pages that don't yet wire React Query.
 *
 * When a provider IS present (e.g. tests or future medico pages), the real
 * client is returned and `setSede` invalidates the `['appointments']` family.
 */
function useOptionalQueryClient(): QueryClient | null {
  try {
    return useQueryClient();
  } catch {
    return null;
  }
}

export interface UseActiveSedeReturn {
  /** Currently active sede id (URL → cookie → null). */
  activeSedeId: string | null;
  /** Writes the cookie + memoized state; invalidates `['appointments']`. */
  setSede: (id: string) => void;
}

export function useActiveSede(): UseActiveSedeReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSede = searchParams?.get('sede') ?? null;

  // Cookie-derived state. Initialized null on the server (cookie inaccessible
  // pre-hydration) and synced on mount.
  const [cookieSede, setCookieSede] = useState<string | null>(null);

  useEffect(() => {
    setCookieSede(readCookie(COOKIE_NAME));
  }, []);

  const queryClient = useOptionalQueryClient();

  const setSede = useCallback(
    (id: string) => {
      writeCookie(COOKIE_NAME, id, COOKIE_MAX_AGE_SECONDS);
      setCookieSede(id);
      // Refresh anything scoped to the active sede. The minimal invalidation
      // surface is appointments — every other sede-aware query SHOULD include
      // 'appointments' or live on its own key family. When no provider is
      // mounted (queryClient === null), the invalidation is a no-op.
      if (queryClient) {
        void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      }
      // Re-run server components so the dashboard layout re-reads the cookie
      // and re-hydrates the header (sede name, primary-star, etc.) without a
      // hard page reload. Without this the switch APPEARS broken — the cookie
      // is written but nothing visible changes until the user refreshes.
      router.refresh();
    },
    [queryClient, router],
  );

  const activeSedeId = urlSede ?? cookieSede;

  return { activeSedeId, setSede };
}
