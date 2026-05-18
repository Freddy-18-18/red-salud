import { NextRequest, NextResponse } from 'next/server';

// Override via SACS_BACKEND_URL env. Defaults to the Railway-hosted prod
// service. For local dev against a self-hosted instance, set
// SACS_BACKEND_URL=http://127.0.0.1:3010 in apps/medico/web/.env.local.
const SACS_BACKEND_URL =
  process.env.SACS_BACKEND_URL ??
  'https://sacs-verification-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const { cedula, tipo_documento = 'V' } = await request.json();

    if (!cedula) {
      return NextResponse.json({ success: false, error: 'Cédula es requerida' }, { status: 400 });
    }

    const cleanCedula = cedula.replace(/^[VvEe]-?/, '');
    const tipoDoc = cedula.match(/^[Ee]/) ? 'E' : tipo_documento;

    const response = await fetch(`${SACS_BACKEND_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula: cleanCedula, tipo_documento: tipoDoc }),
      signal: AbortSignal.timeout(150_000),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SACS verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar con SACS. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
