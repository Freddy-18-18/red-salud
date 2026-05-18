/**
 * @file __tests__/use-active-sede.test.ts
 * @description Behavior tests for the active-sede precedence + persistence hook.
 *
 * Contract under test (R5 doctor-practice-locations):
 *   - precedence: URL ?sede= overrides cookie; without either, returns null.
 *   - cookie name: `active_sede_id`.
 *   - cookie lifetime: 30 days (`max-age=2592000`).
 *   - cookie attributes: `path=/`, `SameSite=Lax`.
 *   - `setSede(id)` writes the cookie and updates the in-memory state.
 *
 * jsdom provides a writable `document.cookie`; we read it back via the
 * accessor descriptor. `next/navigation`'s `useSearchParams` is stubbed per
 * test so we can flip the URL precedence independently from the cookie.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Stub useSearchParams. The variable below is mutated per test to flip the
// active URL param without remounting the hook.
let stubSede: string | null = null;
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'sede' ? stubSede : null),
  }),
}));

import { useActiveSede } from '../use-active-sede';

const COOKIE_NAME = 'active_sede_id';

function clearCookies() {
  // Walk every cookie currently on document and expire it. jsdom keeps a
  // simple in-memory cookie jar so this is enough for isolation.
  const parts = document.cookie.split(';');
  for (const raw of parts) {
    const eq = raw.indexOf('=');
    const name = (eq > -1 ? raw.substring(0, eq) : raw).trim();
    if (!name) continue;
    document.cookie = `${name}=; path=/; max-age=0`;
  }
}

describe('useActiveSede — precedence + persistence (R5)', () => {
  beforeEach(() => {
    stubSede = null;
    clearCookies();
  });

  afterEach(() => {
    clearCookies();
  });

  it('returns activeSedeId=null when neither URL nor cookie is set', () => {
    const { result } = renderHook(() => useActiveSede());
    expect(result.current.activeSedeId).toBeNull();
    expect(typeof result.current.setSede).toBe('function');
  });

  it('returns the cookie value when URL has no ?sede param', () => {
    document.cookie = `${COOKIE_NAME}=cookie-sede-id; path=/`;
    const { result } = renderHook(() => useActiveSede());
    expect(result.current.activeSedeId).toBe('cookie-sede-id');
  });

  it('URL ?sede= overrides the cookie value', () => {
    document.cookie = `${COOKIE_NAME}=cookie-sede-id; path=/`;
    stubSede = 'url-sede-id';
    const { result } = renderHook(() => useActiveSede());
    expect(result.current.activeSedeId).toBe('url-sede-id');
  });

  it('setSede() writes a cookie with max-age=2592000 (30 days)', () => {
    // Spy on the cookie setter so we can read the raw assignment string —
    // jsdom collapses attributes when read back via `document.cookie`.
    const descriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'cookie',
    );
    const writes: string[] = [];
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => descriptor?.get?.call(document) ?? '',
      set: (value: string) => {
        writes.push(value);
        descriptor?.set?.call(document, value);
      },
    });

    try {
      const { result } = renderHook(() => useActiveSede());
      act(() => {
        result.current.setSede('new-sede-id');
      });

      const lastWrite = writes[writes.length - 1] ?? '';
      expect(lastWrite).toContain(`${COOKIE_NAME}=new-sede-id`);
      // 30 days = 60 * 60 * 24 * 30 = 2_592_000 seconds.
      expect(lastWrite).toContain('max-age=2592000');
      // Cookie MUST be scoped to / so middleware/server can read it on every
      // route under /dashboard.
      expect(lastWrite).toContain('path=/');
      expect(lastWrite.toLowerCase()).toContain('samesite=lax');
    } finally {
      if (descriptor) {
        Object.defineProperty(document, 'cookie', descriptor);
      }
    }
  });

  it('setSede() updates activeSedeId immediately (in-memory state)', () => {
    const { result } = renderHook(() => useActiveSede());
    expect(result.current.activeSedeId).toBeNull();

    act(() => {
      result.current.setSede('fresh-sede');
    });

    expect(result.current.activeSedeId).toBe('fresh-sede');
  });

  it('URL precedence remains in effect even after setSede()', () => {
    stubSede = 'url-sede';
    const { result } = renderHook(() => useActiveSede());
    expect(result.current.activeSedeId).toBe('url-sede');

    act(() => {
      // setSede writes the cookie but does NOT alter the URL — precedence
      // wins, so the active id still reflects the URL.
      result.current.setSede('cookie-only');
    });

    expect(result.current.activeSedeId).toBe('url-sede');
  });
});
