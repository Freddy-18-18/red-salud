import { describe, expect, it, vi } from 'vitest';
import {
  computeCacheKey,
  computeCacheTag,
  createInMemoryStore,
  withCache,
} from '../cache';
import type { ResolverResult } from '../types';

function fixedResult(label: string): ResolverResult {
  return {
    navGroups: [],
    pinnedModules: [],
    verificationPending: false,
    capabilities: { specialty: label, postgrados: [], certs: [], plan: 'starter' },
    resolvedAt: '2026-05-13T00:00:00.000Z',
  };
}

describe('cache helpers (spec R7)', () => {
  describe('computeCacheKey', () => {
    it('joins parts with a stable separator', () => {
      expect(computeCacheKey('doc-1', 'abc123', 'v5')).toBe('caps:doc-1:abc123:v5');
    });

    it('differs when any input differs', () => {
      const a = computeCacheKey('doc-1', 'abc', 'v1');
      const b = computeCacheKey('doc-1', 'abc', 'v2');
      expect(a).not.toBe(b);
    });
  });

  describe('computeCacheTag', () => {
    it('produces a per-doctor invalidation tag', () => {
      expect(computeCacheTag('doc-1')).toBe('caps:doc-1');
    });
  });

  describe('withCache (in-memory store)', () => {
    it('R7-A: cache hit within TTL returns cached value without re-fetching', async () => {
      const store = createInMemoryStore<ResolverResult>();
      const fetcher = vi.fn(async () => fixedResult('first'));
      const cached = withCache<ResolverResult>(fetcher, store, { ttlSeconds: 300, clock: () => 1_000 });

      const first = await cached('caps:doc-1:hash:v1', 'caps:doc-1');
      const second = await cached('caps:doc-1:hash:v1', 'caps:doc-1');

      expect(first.capabilities.specialty).toBe('first');
      expect(second.capabilities.specialty).toBe('first');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('R7-B: cache miss after TTL → fetcher is called again', async () => {
      const store = createInMemoryStore<ResolverResult>();
      const fetcher = vi.fn(async () => fixedResult('refetched'));
      let now = 1_000;
      const cached = withCache<ResolverResult>(fetcher, store, { ttlSeconds: 300, clock: () => now });

      await cached('key1', 'tag1');
      now = 400_000;
      await cached('key1', 'tag1');

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('R7-C: invalidateTag forces next call to re-fetch', async () => {
      const store = createInMemoryStore<ResolverResult>();
      const fetcher = vi.fn(async () => fixedResult('v1'));
      const cached = withCache<ResolverResult>(fetcher, store, { ttlSeconds: 300, clock: () => 1_000 });

      await cached('caps:doc-1:hash:v1', 'caps:doc-1');
      expect(fetcher).toHaveBeenCalledTimes(1);

      store.invalidateTag('caps:doc-1');
      await cached('caps:doc-1:hash:v1', 'caps:doc-1');

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('R7-D: different keys are cached independently', async () => {
      const store = createInMemoryStore<ResolverResult>();
      const fetcher = vi.fn(async (key: string) => fixedResult(key));
      const cached = withCache<ResolverResult>(
        (k: string, _tag: string) => fetcher(k),
        store,
        { ttlSeconds: 300, clock: () => 1_000 },
      );

      const a = await cached('key-a', 'tag-a');
      const b = await cached('key-b', 'tag-b');

      expect(a.capabilities.specialty).toBe('key-a');
      expect(b.capabilities.specialty).toBe('key-b');
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('R7-E: invalidateTag for a tag with no entries does NOT throw', () => {
      const store = createInMemoryStore();
      expect(() => store.invalidateTag('caps:unknown')).not.toThrow();
    });
  });
});
