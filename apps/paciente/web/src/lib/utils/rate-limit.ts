import { NextRequest, NextResponse } from "next/server";

import { MemoryStrategy } from "./rate-limit-memory";
import { createUpstashStrategy } from "./rate-limit-upstash";
import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitStrategy,
} from "./rate-limit-types";

// -------------------------------------------------------------------
// Rate limiter — pluggable strategy
// -------------------------------------------------------------------
// `RATE_LIMIT_BACKEND=memory|upstash` selects the backend at startup.
// Memory: dev only — counters reset per process, useless on Vercel.
// Upstash: multi-instance safe — counters in Redis via @upstash/ratelimit.
// -------------------------------------------------------------------

export type Tier = keyof typeof RATE_LIMITS;

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
} as const satisfies Record<string, RateLimitConfig>;

// --- Strategy selection (lazy, single-instance per process) ---

let strategy: RateLimitStrategy | null = null;

function buildStrategy(): RateLimitStrategy {
  const backend = process.env.RATE_LIMIT_BACKEND ?? "memory";

  if (backend === "upstash") {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      console.warn(
        "[rate-limit] RATE_LIMIT_BACKEND=upstash but UPSTASH_REDIS_REST_URL/_TOKEN are missing. Falling back to in-memory limiter — this is broken on multi-instance deploys.",
      );
      return new MemoryStrategy();
    }
    return createUpstashStrategy({ url, token });
  }

  if (backend === "memory" && process.env.NODE_ENV === "production") {
    console.warn(
      "[rate-limit] WARNING: in-memory rate limiter active in production. Each Vercel instance gets its own counter, so a client can multiply their quota by hitting different instances. Set RATE_LIMIT_BACKEND=upstash + UPSTASH_REDIS_REST_URL/_TOKEN.",
    );
  }

  return new MemoryStrategy();
}

function getStrategy(): RateLimitStrategy {
  if (!strategy) strategy = buildStrategy();
  return strategy;
}

/** Test seam — reset the cached strategy so env changes are picked up. */
export function _resetRateLimitStrategy(): void {
  strategy = null;
}

/**
 * Core sliding window rate limiter.
 * @param key    - Unique identifier (e.g., IP or user ID + route)
 * @param config - Window size and max requests
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  return getStrategy().check(key, config);
}

/**
 * Extract a client identifier from a Next.js request.
 * Prefers x-forwarded-for, then x-real-ip, then a generic fallback.
 */
function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}

/**
 * Helper for Next.js API routes. Returns null when the request is allowed,
 * or a 429 NextResponse when the client has exceeded their quota.
 */
export async function checkRateLimit(
  request: NextRequest,
  tier: Tier,
  identifier?: string,
): Promise<NextResponse | null> {
  const config = RATE_LIMITS[tier];
  const id = identifier ?? getIdentifier(request);
  const pathname = new URL(request.url).pathname;
  const key = `${tier}:${id}:${pathname}`;

  const result = await rateLimit(key, config);

  if (result.success) return null;

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
