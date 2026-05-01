/**
 * In-memory sliding-window rate limit strategy.
 *
 * Suitable ONLY for single-instance deployments and local development. Each
 * Vercel serverless instance gets its own counter — that means a client can
 * race to N parallel instances and get N times the quota. Use the Upstash
 * strategy in production.
 */

import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitStrategy,
} from './rate-limit-types';

const MAX_STORE_SIZE = 10_000;

export class MemoryStrategy implements RateLimitStrategy {
  private store = new Map<string, { timestamps: number[] }>();

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entry = this.store.get(key);

    if (!entry) {
      this.evictIfNeeded();
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    if (entry.timestamps.length >= config.maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const resetAt = oldestInWindow + config.windowMs;
      return { success: false, remaining: 0, resetAt };
    }

    entry.timestamps.push(now);
    return {
      success: true,
      remaining: config.maxRequests - entry.timestamps.length,
      resetAt: now + config.windowMs,
    };
  }

  /** Drop the oldest 20% of entries when the store grows past MAX_STORE_SIZE. */
  private evictIfNeeded(): void {
    if (this.store.size <= MAX_STORE_SIZE) return;

    const entries = Array.from(this.store.entries())
      .map(([key, value]) => ({
        key,
        lastAccess:
          value.timestamps.length > 0
            ? value.timestamps[value.timestamps.length - 1]
            : 0,
      }))
      .sort((a, b) => a.lastAccess - b.lastAccess);

    const evictCount = Math.ceil(this.store.size * 0.2);
    for (let i = 0; i < evictCount; i++) {
      this.store.delete(entries[i].key);
    }
  }
}
