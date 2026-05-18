import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/cne/verify-cedula
 *
 * Server-side proxy to the cedula.com.ve CNE registry. The APP-ID and access
 * token live in env vars (CNE_APP_ID / CNE_ACCESS_TOKEN) and are NEVER
 * exposed to the browser. Only authenticated doctors can call this.
 *
 * Body: { nacionalidad: 'V'|'E', cedula: string }
 * Response (success): { error: false, data: { nacionalidad, cedula, primer_nombre, ... } }
 * Response (not found): { error: true, message } with status 404
 */

interface CneApiResponse {
  error: boolean;
  message?: string;
  data?: {
    nacionalidad: string;
    cedula: number;
    rif?: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    cne?: {
      estado: string;
      municipio: string;
      parroquia: string;
      centro_electoral: string;
    };
  };
}

interface VerifyCedulaBody {
  nacionalidad: 'V' | 'E';
  cedula: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth — must be a logged-in doctor.
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: 'No autenticado. Iniciá sesión para continuar.' },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'medico') {
      return NextResponse.json(
        { error: true, message: 'Solo los médicos pueden consultar el CNE.' },
        { status: 403 },
      );
    }

    // 2. Validate body.
    let body: VerifyCedulaBody;
    try {
      body = (await request.json()) as VerifyCedulaBody;
    } catch {
      return NextResponse.json(
        { error: true, message: 'Solicitud inválida.' },
        { status: 400 },
      );
    }

    if (!body.nacionalidad || !['V', 'E'].includes(body.nacionalidad)) {
      return NextResponse.json(
        { error: true, message: 'Nacionalidad inválida. Debe ser V o E.' },
        { status: 400 },
      );
    }

    const cedulaClean = (body.cedula ?? '').toString().replace(/\D/g, '');
    if (!cedulaClean || cedulaClean.length < 6 || cedulaClean.length > 9) {
      return NextResponse.json(
        {
          error: true,
          message: 'Número de cédula inválido. Debe tener entre 6 y 9 dígitos.',
        },
        { status: 400 },
      );
    }

    // 3. Credentials — server-only env vars. Never hardcoded.
    // Set CNE_APP_ID and CNE_ACCESS_TOKEN in apps/medico/web/.env.local
    // (gitignored). Restart the dev server after editing — Next.js only reads
    // env vars at startup.
    const appId = process.env.CNE_APP_ID;
    const token = process.env.CNE_ACCESS_TOKEN;

    if (!appId || !token) {
      // Log to server console — visible in `pnpm dev` terminal for diagnosis.
      // eslint-disable-next-line no-console
      console.error(
        '[cne/verify-cedula] Missing env vars',
        {
          has_app_id: !!appId,
          has_token: !!token,
          hint: 'Add CNE_APP_ID and CNE_ACCESS_TOKEN to apps/medico/web/.env.local and RESTART the dev server.',
        },
      );
      return NextResponse.json(
        {
          error: true,
          message:
            'Servicio CNE no configurado. Verificá que CNE_APP_ID y CNE_ACCESS_TOKEN estén en apps/medico/web/.env.local y REINICIASTE el dev server (Ctrl+C y arrancar de nuevo). Next.js solo lee env vars al startup.',
          debug: {
            has_app_id: !!appId,
            has_token: !!token,
          },
        },
        { status: 503 },
      );
    }

    // 4. Call CNE API.
    const cneUrl = new URL('https://api.cedula.com.ve/api/v1');
    cneUrl.searchParams.set('app_id', appId);
    cneUrl.searchParams.set('token', token);
    cneUrl.searchParams.set('nacionalidad', body.nacionalidad);
    cneUrl.searchParams.set('cedula', cedulaClean);

    const cneResponse = await fetch(cneUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (!cneResponse.ok) {
      return NextResponse.json(
        {
          error: true,
          message: 'El servicio del CNE no está disponible. Intentá más tarde.',
        },
        { status: 502 },
      );
    }

    const cneData = (await cneResponse.json()) as CneApiResponse;

    if (cneData.error || !cneData.data) {
      return NextResponse.json(
        {
          error: true,
          message:
            cneData.message ||
            'No se encontraron datos para esa cédula. Verificá el número.',
        },
        { status: 404 },
      );
    }

    // 5. Return person data.
    const { data } = cneData;
    const fullName = [
      data.primer_nombre,
      data.segundo_nombre,
      data.primer_apellido,
      data.segundo_apellido,
    ]
      .filter((s) => s && s.trim().length > 0)
      .join(' ');

    return NextResponse.json({
      error: false,
      data: {
        nacionalidad: data.nacionalidad,
        cedula: String(data.cedula),
        primer_nombre: data.primer_nombre,
        segundo_nombre: data.segundo_nombre,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
        full_name: fullName,
        // RIF derivado de la cédula (útil para facturación legal).
        rif: data.rif ?? null,
        cne_estado: data.cne?.estado ?? null,
        cne_municipio: data.cne?.municipio ?? null,
        cne_parroquia: data.cne?.parroquia ?? null,
        // Centro electoral — usable como referencia de domicilio aproximado
        // del paciente cuando no tenemos dirección registrada.
        cne_centro_electoral: data.cne?.centro_electoral ?? null,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          error: true,
          message: 'La consulta al CNE tardó demasiado. Reintentá.',
        },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: true, message: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
