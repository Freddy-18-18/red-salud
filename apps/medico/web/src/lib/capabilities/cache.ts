/**
 * @file cache.ts
 * @description Cache helpers for the doctor capability resolver.
 *
 * Spec R7 (doctor-capabilities):
 *   - 5-minute TTL keyed by (doctorId, sacs_hash, prefs_version).
 *   - Tag-based invalidation on `doctor_module_preferences` write or SACS re-verify.
 *
 * Pure, in-memory store for unit testing + local dev. Production path SHOULD
 * delegate to Next.js `unstable_cache` + `revalidateTag` (see app/dashboard/
 * layout.tsx wiring). The contract here matches the boundary so swapping is
 * mechanical.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tag: string;
}

export interface CacheStore<T = unknown> {
  get(key: string): CacheEntry<T> | undefined;
  set(key: string, value: T, ttlMs: number, tag: string, now: number): void;
  invalidateTag(tag: string): void;
}

export function computeCacheKey(
  doctorId: string,
  sacsHash: string,
  prefsVersion: string,
): string {
  return `caps:${doctorId}:${sacsHash}:${prefsVersion}`;
}

export function computeCacheTag(doctorId: string): string {
  return `caps:${doctorId}`;
}

export function createInMemoryStore<T = unknown>(): CacheStore<T> {
  const entries = new Map<string, CacheEntry<T>>();

  return {
    get(key) {
      return entries.get(key);
    },
    set(key, value, ttlMs, tag, now) {
      entries.set(key, { value, expiresAt: now + ttlMs, tag });
    },
    invalidateTag(tag) {
      for (const [key, entry] of entries) {
        if (entry.tag === tag) entries.delete(key);
      }
    },
  };
}

export interface WithCacheOptions {
  ttlSeconds?: number;
  clock?: () => number;
}

/**
 * Wraps a `(key, tag) → Promise<T>` fetcher with cache lookup.
 *
 * Lookup order:
 *   1. If cached entry exists AND `now < expiresAt` → return cached value.
 *   2. Otherwise → fetch fresh, store with `now + ttl`, return.
 *
 * `invalidateTag(tag)` on the store evicts all entries with that tag — next
 * call re-fetches.
 */
export function withCache<T>(
  fetcher: (key: string, tag: string) => Promise<T>,
  store: CacheStore<T>,
  options: WithCacheOptions = {},
): (key: string, tag: string) => Promise<T> {
  const ttlMs = (options.ttlSeconds ?? 300) * 1000;
  const clock = options.clock ?? Date.now;

  return async (key, tag) => {
    const now = clock();
    const entry = store.get(key);
    if (entry && now < entry.expiresAt) {
      return entry.value;
    }
    const fresh = await fetcher(key, tag);
    store.set(key, fresh, ttlMs, tag, now);
    return fresh;
  };
}
