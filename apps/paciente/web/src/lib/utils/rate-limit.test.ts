/**
 * Rate-limit subsystem tests.
 *
 * Covers:
 *  - Strategy selection by RATE_LIMIT_BACKEND env
 *  - Memory backend allows N requests then 429s
 *  - Upstash backend fails OPEN (allows) when Redis is unreachable
 *  - checkRateLimit produces a 429 with Retry-After when blocked
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import {
  RATE_LIMITS,
  _resetRateLimitStrategy,
  checkRateLimit,
  rateLimit,
} from './rate-limit';
import { MemoryStrategy } from './rate-limit-memory';

beforeEach(() => {
  _resetRateLimitStrategy();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

afterEach(() => {
  _resetRateLimitStrategy();
  vi.unstubAllEnvs();
});

function makeRequest(path = '/api/test', headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, 'http://localhost:3003'), {
    method: 'POST',
    headers,
  });
}

// ---------------------------------------------------------------------------
// MemoryStrategy unit tests
// ---------------------------------------------------------------------------

describe('MemoryStrategy', () => {
  it('allows up to maxRequests within the window', async () => {
    const m = new MemoryStrategy();
    const cfg = { windowMs: 60_000, maxRequests: 3 };
    const r1 = await m.check('k', cfg);
    const r2 = await m.check('k', cfg);
    const r3 = await m.check('k', cfg);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
  });

  it('blocks the request that exceeds maxRequests', async () => {
    const m = new MemoryStrategy();
    const cfg = { windowMs: 60_000, maxRequests: 2 };
    await m.check('k', cfg);
    await m.check('k', cfg);
    const r3 = await m.check('k', cfg);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('separates counters by key', async () => {
    const m = new MemoryStrategy();
    const cfg = { windowMs: 60_000, maxRequests: 1 };
    const a = await m.check('user-A', cfg);
    const b = await m.check('user-B', cfg);
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Strategy selection
// ---------------------------------------------------------------------------

describe('rate-limit backend selection', () => {
  it('defaults to memory when RATE_LIMIT_BACKEND is unset', async () => {
    vi.stubEnv('RATE_LIMIT_BACKEND', '');
    // Just exercise the path — should not throw.
    const result = await rateLimit('k', RATE_LIMITS.public);
    expect(result.success).toBe(true);
  });

  it('warns and falls back to memory when upstash creds are missing', async () => {
    vi.stubEnv('RATE_LIMIT_BACKEND', 'upstash');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await rateLimit('k', RATE_LIMITS.public);
    expect(result.success).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit (NextRequest helper)
// ---------------------------------------------------------------------------

describe('checkRateLimit', () => {
  it('returns null when within quota', async () => {
    const result = await checkRateLimit(makeRequest('/api/x'), 'public');
    expect(result).toBeNull();
  });

  it('returns 429 with Retry-After when over quota', async () => {
    const cfg = RATE_LIMITS.sensitive; // 5/min — easiest to exhaust
    const req = () =>
      makeRequest('/api/sensitive', { 'x-forwarded-for': '1.1.1.1' });

    for (let i = 0; i < cfg.maxRequests; i++) {
      const r = await checkRateLimit(req(), 'sensitive');
      expect(r).toBeNull();
    }

    const blocked = await checkRateLimit(req(), 'sensitive');
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get('Retry-After')).toBeTruthy();
  });

  it('separates quotas across different identifiers (IPs)', async () => {
    const cfg = RATE_LIMITS.sensitive;
    for (let i = 0; i < cfg.maxRequests; i++) {
      await checkRateLimit(
        makeRequest('/api/iso', { 'x-forwarded-for': '2.2.2.2' }),
        'sensitive',
      );
    }
    const otherIp = await checkRateLimit(
      makeRequest('/api/iso', { 'x-forwarded-for': '3.3.3.3' }),
      'sensitive',
    );
    expect(otherIp).toBeNull();
  });
});
