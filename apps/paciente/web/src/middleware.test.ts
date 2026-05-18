/**
 * @vitest-environment node
 *
 * Middleware tests — covers role gating and cookie scoping for the paciente app.
 *
 * The middleware is an Edge runtime entry point that:
 *   1. Skips public paths and `/auth/*` (no Supabase call)
 *   2. Runs CSRF check on API mutations
 *   3. For `/dashboard` and other private paths, requires:
 *        - an authenticated user
 *        - a row in `profiles` for that user
 *        - that row's `role` === 'paciente'
 *
 * Anything else redirects to `/auth/login` with a specific error code so the UI
 * can explain WHY the user was bounced.
 *
 * Why `node` environment: Next 15's `NextResponse.next({ request })` checks
 * `request.headers instanceof Headers`. In jsdom the global `Headers` is the
 * jsdom impl, and Next 15 routes created via `NextRequest` produce headers
 * that fail this `instanceof` check, throwing
 * "request.headers must be an instance of Headers". Node's global Headers
 * (Node ≥ 18) matches what Next expects, so the check passes.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mock @supabase/ssr — middleware imports createServerClient directly
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();
const mockProfileEq = vi.fn(() => ({ single: mockProfileSingle }));
const mockProfileSelect = vi.fn(() => ({ eq: mockProfileEq }));
const mockFrom = vi.fn(() => ({ select: mockProfileSelect }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock('@/lib/utils/csrf', () => ({
  checkCsrf: vi.fn(() => null),
}));

// Import AFTER mocks so the module picks them up.
import { middleware } from './middleware';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(pathname: string, method: 'GET' | 'POST' = 'GET') {
  return new NextRequest(new URL(pathname, 'http://localhost:3003'), {
    method,
    headers: { origin: 'http://localhost:3003' },
  });
}

function setAuthenticated(userId: string) {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
}

function setAnonymous() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
}

function setProfile(role: string | null) {
  if (role === null) {
    mockProfileSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
  } else {
    mockProfileSingle.mockResolvedValue({ data: { role }, error: null });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

// ---------------------------------------------------------------------------
// Public paths — no Supabase call, no role check
// ---------------------------------------------------------------------------

describe('middleware — public paths', () => {
  it('skips Supabase entirely for "/"', async () => {
    const response = await middleware(makeRequest('/'));
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('skips Supabase entirely for /medicos', async () => {
    await middleware(makeRequest('/medicos'));
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('skips Supabase entirely for /auth/login', async () => {
    await middleware(makeRequest('/auth/login'));
    expect(mockGetUser).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// API routes — CSRF only, no role check
// ---------------------------------------------------------------------------

describe('middleware — API routes', () => {
  it('does not query profiles for API routes', async () => {
    setAuthenticated('user-123');
    await middleware(makeRequest('/api/appointments', 'POST'));
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Private paths — auth required
// ---------------------------------------------------------------------------

describe('middleware — auth required', () => {
  it('redirects anonymous users to /auth/login', async () => {
    setAnonymous();
    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).toBe(307); // Next redirect
    expect(response.headers.get('location')).toMatch(/\/auth\/login$/);
  });
});

// ---------------------------------------------------------------------------
// Role gating — the heart of A1
// ---------------------------------------------------------------------------

describe('middleware — role gating', () => {
  it('allows users with role=paciente through', async () => {
    setAuthenticated('user-paciente');
    setProfile('paciente');
    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockProfileSelect).toHaveBeenCalledWith('role');
    expect(mockProfileEq).toHaveBeenCalledWith('id', 'user-paciente');
  });

  it('redirects users with role=medico to /auth/login?error=role_mismatch', async () => {
    setAuthenticated('user-medico');
    setProfile('medico');
    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/auth/login');
    expect(location).toContain('error=role_mismatch');
  });

  it('redirects users with role=admin to /auth/login?error=role_mismatch', async () => {
    setAuthenticated('user-admin');
    setProfile('admin');
    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location') ?? '').toContain('error=role_mismatch');
  });

  it('redirects users without a profile row to /auth/login?error=profile_missing', async () => {
    setAuthenticated('user-orphan');
    setProfile(null);
    const response = await middleware(makeRequest('/dashboard'));
    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('/auth/login');
    expect(location).toContain('error=profile_missing');
  });
});

// ---------------------------------------------------------------------------
// Cookie scoping — paciente cookies must not collide with other apps
// ---------------------------------------------------------------------------

describe('middleware — cookie scoping', () => {
  it('configures createServerClient with the paciente-scoped cookie name', async () => {
    setAuthenticated('user-paciente');
    setProfile('paciente');
    const { createServerClient } = await import('@supabase/ssr');
    await middleware(makeRequest('/dashboard'));
    const calls = (createServerClient as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    const optionsArg = calls[calls.length - 1][2] as { cookieOptions?: { name?: string } };
    expect(optionsArg.cookieOptions?.name).toBe('sb-rs-paciente-auth-token');
  });
});
