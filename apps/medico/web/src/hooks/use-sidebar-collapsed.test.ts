/**
 * @file use-sidebar-collapsed.test.ts
 * @description Behavior tests for the SSR-safe sidebar persistence hook.
 *
 * Contract under test:
 * - Initial render returns `collapsed: false` (SSR-safe).
 * - On mount, hydrate from `localStorage['medico:sidebar-collapsed']`.
 * - `toggle()` flips the boolean and writes the new value to localStorage.
 * - SecurityError on storage MUST NOT crash the app — fall back to in-memory.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSidebarCollapsed } from './use-sidebar-collapsed';

const STORAGE_KEY = 'medico:sidebar-collapsed';

describe('useSidebarCollapsed', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('defaults to collapsed=false when localStorage is empty', () => {
    const { result } = renderHook(() => useSidebarCollapsed());

    expect(result.current.collapsed).toBe(false);
    expect(typeof result.current.toggle).toBe('function');
  });

  it('hydrates collapsed=true when localStorage has "true"', () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');

    const { result } = renderHook(() => useSidebarCollapsed());

    expect(result.current.collapsed).toBe(true);
  });

  it('toggle() flips the boolean and persists the new value', () => {
    const { result } = renderHook(() => useSidebarCollapsed());
    expect(result.current.collapsed).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('treats non-"true" values in storage as collapsed=false', () => {
    window.localStorage.setItem(STORAGE_KEY, 'garbage');

    const { result } = renderHook(() => useSidebarCollapsed());

    expect(result.current.collapsed).toBe(false);
  });

  it('does not throw when localStorage.getItem rejects with SecurityError', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const { result } = renderHook(() => useSidebarCollapsed());

    expect(result.current.collapsed).toBe(false);
  });

  it('does not throw when localStorage.setItem rejects with SecurityError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const { result } = renderHook(() => useSidebarCollapsed());

    expect(() => {
      act(() => {
        result.current.toggle();
      });
    }).not.toThrow();

    // In-memory state still flips even when persistence is unavailable.
    expect(result.current.collapsed).toBe(true);
  });
});
