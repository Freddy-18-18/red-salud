import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3003',
  'https://paciente.redsalud.ve',
  'https://redsalud.ve',
];

/**
 * Validates request origin for mutation endpoints.
 * Returns null if valid, NextResponse(403) if CSRF detected.
 * Only checks POST/PATCH/PUT/DELETE — GET is always allowed.
 *
 * In development the same allowlist applies. The previous early-return for
 * NODE_ENV=development meant that any local browser tab could POST to the API
 * without origin validation — that bypass is gone. To exercise the API from a
 * tool that does NOT send an Origin header (curl, Postman, integration tests),
 * set ALLOW_LOCALHOST_CSRF=true in the local env: missing-header requests
 * pass, but a hostile origin still returns 403.
 */
export function checkCsrf(request: NextRequest): NextResponse | null {
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null; // safe methods, skip check
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Check origin header first (most reliable)
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) return null;
    console.warn(`[CSRF] Blocked request from origin: ${origin}`);
    return NextResponse.json(
      { error: 'Solicitud no autorizada.' },
      { status: 403 },
    );
  }

  // Fallback to referer when origin is missing
  if (referer) {
    let refererOrigin: string;
    try {
      refererOrigin = new URL(referer).origin;
    } catch {
      console.warn(`[CSRF] Blocked request with invalid referer: ${referer}`);
      return NextResponse.json(
        { error: 'Solicitud no autorizada.' },
        { status: 403 },
      );
    }
    if (ALLOWED_ORIGINS.includes(refererOrigin)) return null;
    console.warn(`[CSRF] Blocked request from referer: ${referer}`);
    return NextResponse.json(
      { error: 'Solicitud no autorizada.' },
      { status: 403 },
    );
  }

  // Neither origin nor referer present — opt-in dev escape hatch for curl/etc.
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_LOCALHOST_CSRF === 'true'
  ) {
    return null;
  }

  console.warn('[CSRF] Blocked request with no origin or referer header');
  return NextResponse.json(
    { error: 'Solicitud no autorizada.' },
    { status: 403 },
  );
}
