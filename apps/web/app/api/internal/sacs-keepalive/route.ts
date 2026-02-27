/**
 * 🏥 SACS Keepalive API Route
 *
 * Mantiene activo el servicio Railway de verificación SACS.
 * Llamado por Vercel Cron cada 5 minutos para evitar el cold start.
 *
 * Vercel Cron config en vercel.json:
 *   { "path": "/api/internal/sacs-keepalive", "schedule": "*/5 * * * *" }
 */

import { NextResponse } from 'next/server';

const SACS_BACKEND_URL =
  process.env.SACS_BACKEND_URL ||
  'https://sacs-verification-clean-20260215-production.up.railway.app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const start = Date.now();
  try {
    const res = await fetch(`${SACS_BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
    });

    const elapsed = Date.now() - start;
    const body = await res.json().catch(() => null);

    if (res.ok) {
      return NextResponse.json({
        ok: true,
        status: res.status,
        elapsed_ms: elapsed,
        service: body?.service,
        version: body?.version,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { ok: false, status: res.status, elapsed_ms: elapsed },
      { status: 502 }
    );
  } catch (err) {
    const elapsed = Date.now() - start;
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[SACS-KEEPALIVE] Error:', msg);
    return NextResponse.json(
      { ok: false, error: msg, elapsed_ms: elapsed },
      { status: 503 }
    );
  }
}

// POST para uso manual o desde webhooks
export async function POST() {
  return GET();
}
