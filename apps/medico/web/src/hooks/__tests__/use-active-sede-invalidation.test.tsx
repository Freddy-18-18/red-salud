/**
 * @file __tests__/use-active-sede-invalidation.test.tsx
 * @description Verifies that `useActiveSede.setSede` invalidates the
 * `['appointments']` React Query family when a `QueryClientProvider` is
 * mounted. When no provider is mounted the invalidation is a no-op (see
 * `use-active-sede.test.ts` for the unprovided cases).
 */

import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';

let stubSede: string | null = null;
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'sede' ? stubSede : null),
  }),
}));

import { useActiveSede } from '../use-active-sede';

function clearCookies() {
  const parts = document.cookie.split(';');
  for (const raw of parts) {
    const eq = raw.indexOf('=');
    const name = (eq > -1 ? raw.substring(0, eq) : raw).trim();
    if (!name) continue;
    document.cookie = `${name}=; path=/; max-age=0`;
  }
}

describe('useActiveSede — React Query invalidation', () => {
  beforeEach(() => {
    stubSede = null;
    clearCookies();
  });

  afterEach(() => {
    clearCookies();
  });

  it('invalidates the ["appointments"] query family on setSede()', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useActiveSede(), { wrapper });

    act(() => {
      result.current.setSede('sede-new');
    });

    // The hook MAY invalidate multiple times across renders; we only require
    // that at least one call targeted the `['appointments']` queryKey family.
    const matching = invalidateSpy.mock.calls.filter((call) => {
      const arg = call[0] as { queryKey?: unknown } | undefined;
      const key = arg?.queryKey;
      return Array.isArray(key) && key[0] === 'appointments';
    });

    expect(matching.length).toBeGreaterThanOrEqual(1);
  });
});
