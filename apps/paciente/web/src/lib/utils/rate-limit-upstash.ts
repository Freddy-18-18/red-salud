/**
 * Upstash Redis rate-limit strategy — multi-instance safe.
 *
 * Wraps `@upstash/ratelimit` so the per-tier sliding-window counter lives in
 * Redis and is shared across every Vercel serverless instance. We cache one
 * Ratelimit instance per (windowMs, maxRequests) pair to amortize the script
 * registration cost.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitStrategy,
} from './rate-limit-types';

interface UpstashConfig {
  url: string;
  token: string;
}

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1];

function msToDuration(windowMs: number): Duration {
  // @upstash/ratelimit accepts strings like '60 s', '1 m', '1 h', '1 d'.
  if (windowMs % (24 * 60 * 60_000) === 0) {
    return `${windowMs / (24 * 60 * 60_000)} d` as Duration;
  }
  if (windowMs % (60 * 60_000) === 0) {
    return `${windowMs / (60 * 60_000)} h` as Duration;
  }
  if (windowMs % 60_000 === 0) {
    return `${windowMs / 60_000} m` as Duration;
  }
  if (windowMs % 1000 === 0) {
    return `${windowMs / 1000} s` as Duration;
  }
  return `${windowMs} ms` as Duration;
}

export function createUpstashStrategy(config: UpstashConfig): RateLimitStrategy {
  const redis = new Redis({ url: config.url, token: config.token });
  const cache = new Map<string, Ratelimit>();

  function getLimiter(rlc: RateLimitConfig): Ratelimit {
    const cacheKey = `${rlc.windowMs}:${rlc.maxRequests}`;
    let limiter = cache.get(cacheKey);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(rlc.maxRequests, msToDuration(rlc.windowMs)),
        prefix: 'rs-paciente-rl',
        analytics: false,
      });
      cache.set(cacheKey, limiter);
    }
    return limiter;
  }

  return {
    async check(key: string, rlc: RateLimitConfig): Promise<RateLimitResult> {
      try {
        const limiter = getLimiter(rlc);
        const result = await limiter.limit(key);
        return {
          success: result.success,
          remaining: result.remaining,
          resetAt: result.reset,
        };
      } catch (err) {
        // If Upstash is unreachable, fail OPEN — better to serve a request than
        // 500 the entire API. Log loudly so the issue is visible in monitoring.
        console.error('[rate-limit-upstash] Upstash unreachable, allowing request:', err);
        return {
          success: true,
          remaining: rlc.maxRequests,
          resetAt: Date.now() + rlc.windowMs,
        };
      }
    },
  };
}
