/**
 * Public types for the rate-limit subsystem.
 *
 * Kept in a separate file so test mocks and alternative strategies can import
 * without dragging in the Next.js NextRequest/NextResponse from the main entry.
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitStrategy {
  check(key: string, config: RateLimitConfig): Promise<RateLimitResult>;
}
