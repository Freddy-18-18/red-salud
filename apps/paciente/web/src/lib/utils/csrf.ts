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
 */
export function checkCsrf(request: NextRequest): NextResponse | null {
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null; // safe methods, skip check
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Check origin header first (most reliable)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`[CSRF] Blocked request from origin: ${origin}`);
    return NextResponse.json(
      { error: 'Solicitud no autorizada.' },
      { status: 403 },
    );
  }

  // If no origin header, check referer
  if (!origin && referer) {
    const refererOrigin = new URL(referer).origin;
    if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
      console.warn(`[CSRF] Blocked request from referer: ${referer}`);
      return NextResponse.json(
        { error: 'Solicitud no autorizada.' },
        { status: 403 },
      );
    }
  }

  return null; // allowed
}
