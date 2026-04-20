import { NextRequest, NextResponse } from "next/server";

// -------------------------------------------------------------------
// Sliding Window Rate Limiter with LRU Eviction
// -------------------------------------------------------------------
// In-memory implementation suitable for single-instance deployments.
// For production clustering, replace with Redis/Upstash.
// -------------------------------------------------------------------

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// --- Predefined tiers ---

export const RATE_LIMITS = {
  /** 100/min — public endpoints (doctor search, specialties, etc.) */
  public: { windowMs: 60_000, maxRequests: 100 },
  /** 60/min — authenticated GET endpoints */
  authenticated: { windowMs: 60_000, maxRequests: 60 },
  /** 20/min — mutations (POST/PATCH/PUT/DELETE) */
  mutation: { windowMs: 60_000, maxRequests: 20 },
  /** 30/min — search endpoints */
  search: { windowMs: 60_000, maxRequests: 30 },
  /** 5/min — sensitive operations (cedula verification, etc.) */
  sensitive: { windowMs: 60_000, maxRequests: 5 },
} as const;

// --- Internal state ---

const store = new Map<string, { timestamps: number[] }>();
const MAX_STORE_SIZE = 10_000;

/**
 * Evict the oldest 20% of entries when the store exceeds MAX_STORE_SIZE.
 * Entries are sorted by their most recent timestamp (LRU).
 */
function evictIfNeeded(): void {
  if (store.size <= MAX_STORE_SIZE) return;

  const entries = Array.from(store.entries())
    .map(([key, value]) => ({
      key,
      lastAccess: value.timestamps.length > 0
        ? value.timestamps[value.timestamps.length - 1]
        : 0,
    }))
    .sort((a, b) => a.lastAccess - b.lastAccess);

  const evictCount = Math.ceil(store.size * 0.2);
  for (let i = 0; i < evictCount; i++) {
    store.delete(entries[i].key);
  }
}

/**
 * Core sliding window rate limiter.
 *
 * @param key    - Unique identifier (e.g., IP or user ID + route)
 * @param config - Window size and max requests
 * @returns      - Whether the request is allowed, remaining quota, and reset timestamp
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);

  if (!entry) {
    evictIfNeeded();
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    // Rate limited — calculate when the oldest request in the window expires
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow + config.windowMs;

    return {
      success: false,
      remaining: 0,
      resetAt,
    };
  }

  // Allow the request
  entry.timestamps.push(now);

  return {
    success: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetAt: now + config.windowMs,
  };
}

/**
 * Extract a client identifier from a Next.js request.
 * Prefers x-forwarded-for, then request.ip, then a generic fallback.
 */
function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; take the first (client IP)
    return forwarded.split(",")[0].trim();
  }

  // NextRequest.ip was removed in Next 15; x-real-ip is the common fallback
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "anonymous";
}

/**
 * Helper for Next.js API routes.
 *
 * Returns `null` if the request is within limits (proceed normally),
 * or a 429 `NextResponse` if the client has exceeded their quota.
 *
 * @param request    - The incoming Next.js request
 * @param tier       - One of the predefined rate limit tiers
 * @param identifier - Optional override for the client identifier
 */
export function checkRateLimit(
  request: NextRequest,
  tier: keyof typeof RATE_LIMITS,
  identifier?: string,
): NextResponse | null {
  const config = RATE_LIMITS[tier];
  const id = identifier ?? getIdentifier(request);

  // Include the pathname in the key so different routes have independent limits
  const pathname = new URL(request.url).pathname;
  const key = `${tier}:${id}:${pathname}`;

  const result = rateLimit(key, config);

  if (result.success) {
    return null;
  }

  const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: `Demasiadas solicitudes. Intenta de nuevo en ${retryAfterSeconds} segundo${retryAfterSeconds !== 1 ? "s" : ""}.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
