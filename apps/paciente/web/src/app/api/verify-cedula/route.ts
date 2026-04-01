import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// -------------------------------------------------------------------
// CNE Cedula Verification API Route
// -------------------------------------------------------------------
// Server-side only. Credentials are stored in env vars (NOT NEXT_PUBLIC).
// Rate-limited to 5 verification attempts per user per calendar day.
// -------------------------------------------------------------------

interface CneApiResponse {
  error: boolean;
  message?: string;
  data?: {
    nacionalidad: string;
    cedula: number;
    rif: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    cne: {
      estado: string;
      municipio: string;
      parroquia: string;
      centro_electoral: string;
    };
  };
}

interface VerifyCedulaBody {
  nacionalidad: "V" | "E";
  cedula: string;
}

// Simple in-memory rate limiter (keyed by userId, resets per calendar day)
const rateLimitMap = new Map<string, { count: number; date: string }>();
const DAILY_LIMIT = 5;

function isRateLimited(userId: string): boolean {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const entry = rateLimitMap.get(userId);

  if (!entry || entry.date !== today) {
    rateLimitMap.set(userId, { count: 1, date: today });
    return false;
  }

  if (entry.count >= DAILY_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    // 2. Rate limit check
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        {
          error: true,
          message:
            "Has alcanzado el limite de 5 verificaciones por dia. Intenta manana.",
        },
        { status: 429 },
      );
    }

    // 3. Validate request body
    const body = (await request.json()) as VerifyCedulaBody;

    if (!body.nacionalidad || !["V", "E"].includes(body.nacionalidad)) {
      return NextResponse.json(
        { error: true, message: "Nacionalidad invalida. Debe ser V o E." },
        { status: 400 },
      );
    }

    const cedulaClean = body.cedula?.replace(/\D/g, "");
    if (!cedulaClean || cedulaClean.length < 6 || cedulaClean.length > 9) {
      return NextResponse.json(
        {
          error: true,
          message: "Numero de cedula invalido. Debe tener entre 6 y 9 digitos.",
        },
        { status: 400 },
      );
    }

    // 4. Validate env vars
    const appId = process.env.CNE_APP_ID;
    const token = process.env.CNE_ACCESS_TOKEN;

    if (!appId || !token) {
      return NextResponse.json(
        {
          error: true,
          message: "Servicio de verificacion no configurado. Contacta soporte.",
        },
        { status: 503 },
      );
    }

    // 5. Call CNE API
    const cneUrl = new URL("https://api.cedula.com.ve/api/v1");
    cneUrl.searchParams.set("app_id", appId);
    cneUrl.searchParams.set("token", token);
    cneUrl.searchParams.set("nacionalidad", body.nacionalidad);
    cneUrl.searchParams.set("cedula", cedulaClean);

    const cneResponse = await fetch(cneUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    if (!cneResponse.ok) {
      return NextResponse.json(
        {
          error: true,
          message: "El servicio del CNE no esta disponible. Intenta mas tarde.",
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
            "No se encontraron datos para esa cedula. Verifica el numero.",
        },
        { status: 404 },
      );
    }

    // 6. Return person data for user confirmation
    const { data } = cneData;
    return NextResponse.json({
      error: false,
      data: {
        nacionalidad: data.nacionalidad,
        cedula: String(data.cedula),
        primer_nombre: data.primer_nombre,
        segundo_nombre: data.segundo_nombre,
        primer_apellido: data.primer_apellido,
        segundo_apellido: data.segundo_apellido,
        cne_estado: data.cne?.estado ?? null,
        cne_municipio: data.cne?.municipio ?? null,
        cne_parroquia: data.cne?.parroquia ?? null,
      },
    });
  } catch (error) {
    // Distinguish network/timeout errors from unexpected errors
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          error: true,
          message:
            "La consulta al CNE tardo demasiado. Intenta nuevamente.",
        },
        { status: 504 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: true, message: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: true, message: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
