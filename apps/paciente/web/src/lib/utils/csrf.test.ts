/**
 * CSRF protection tests.
 *
 * Production rule: any state-changing method (POST/PATCH/PUT/DELETE) MUST come
 * from an allowlisted origin. The previous implementation bypassed the check
 * entirely in NODE_ENV=development, which let local browser tabs at any host
 * (e.g., a malicious page on `evil.local`) hit the patient API. The dev bypass
 * is now opt-in via ALLOW_LOCALHOST_CSRF=true so it cannot accidentally ship.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { checkCsrf } from './csrf';

function makeMutation(headers: Record<string, string>, method = 'POST') {
  return new NextRequest(new URL('http://localhost:3003/api/test'), {
    method,
    headers,
  });
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function setNodeEnv(value: 'development' | 'production' | 'test') {
  vi.stubEnv('NODE_ENV', value);
}

describe('checkCsrf — safe methods', () => {
  it('allows GET regardless of origin', () => {
    const req = new NextRequest(new URL('http://localhost:3003/api/test'), {
      method: 'GET',
      headers: { origin: 'http://evil.local' },
    });
    expect(checkCsrf(req)).toBeNull();
  });

  it('allows HEAD regardless of origin', () => {
    const req = new NextRequest(new URL('http://localhost:3003/api/test'), {
      method: 'HEAD',
      headers: { origin: 'http://evil.local' },
    });
    expect(checkCsrf(req)).toBeNull();
  });
});

describe('checkCsrf — production', () => {
  beforeEach(() => setNodeEnv('production'));

  it('blocks POST from a non-allowlisted origin', () => {
    const result = checkCsrf(makeMutation({ origin: 'http://evil.local' }));
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('allows POST from https://paciente.redsalud.ve', () => {
    const result = checkCsrf(makeMutation({ origin: 'https://paciente.redsalud.ve' }));
    expect(result).toBeNull();
  });

  it('blocks POST when origin is missing and referer is hostile', () => {
    const result = checkCsrf(makeMutation({ referer: 'http://evil.local/page' }));
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('allows POST when only referer is set and it is allowlisted', () => {
    const result = checkCsrf(makeMutation({ referer: 'https://redsalud.ve/some/page' }));
    expect(result).toBeNull();
  });
});

describe('checkCsrf — development (no opt-in flag)', () => {
  beforeEach(() => setNodeEnv('development'));

  it('blocks POST from a non-allowlisted origin even in dev', () => {
    const result = checkCsrf(makeMutation({ origin: 'http://evil.local' }));
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('allows POST from http://localhost:3003 because it is in the allowlist', () => {
    const result = checkCsrf(makeMutation({ origin: 'http://localhost:3003' }));
    expect(result).toBeNull();
  });
});

describe('checkCsrf — development with ALLOW_LOCALHOST_CSRF=true', () => {
  beforeEach(() => {
    setNodeEnv('development');
    process.env.ALLOW_LOCALHOST_CSRF = 'true';
  });

  it('still blocks POST from a non-allowlisted origin', () => {
    const result = checkCsrf(makeMutation({ origin: 'http://evil.local' }));
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('explicitly allows missing origin and referer (e.g., curl) only when flag set', () => {
    const result = checkCsrf(makeMutation({}));
    expect(result).toBeNull();
  });
});
