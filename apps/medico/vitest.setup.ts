/**
 * Vitest Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Mock Tauri API for testing
beforeAll(() => {
  // Mock window.__TAURI__ for environment detection
  if (typeof window !== 'undefined') {
    (window as unknown as { __TAURI__: unknown }).__TAURI__ = {
      invoke: vi.fn(),
    };
  }

  // Mock IndexedDB for web storage tests
  if (typeof global !== 'undefined' && !global.indexedDB) {
    // Use fake-indexeddb if needed
    // For now, we'll rely on jsdom's IndexedDB implementation
  }
});

afterAll(() => {
  // Cleanup
  if (typeof window !== 'undefined') {
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
  }
});

// Suppress console errors during tests (optional)
// global.console = {
//   ...console,
//   error: vi.fn(),
//   warn: vi.fn(),
// };
