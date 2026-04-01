import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// GET /api/bcv — Obtener la tasa de cambio BCV mas reciente
// ============================================================================
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exchange_rates")
      .select("id, currency_pair, rate, valid_date, source, created_at")
      .eq("currency_pair", "USD/VES")
      .order("valid_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Error al consultar la tasa de cambio", details: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No se encontro tasa de cambio registrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      rate: data.rate,
      validDate: data.valid_date,
      source: data.source,
      updatedAt: data.created_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/bcv — Obtener tasa BCV desde API externa y guardarla
// ============================================================================

interface PydolarMonitor {
  price: number;
  last_update: string;
}

interface PydolarResponse {
  monitors?: Record<string, PydolarMonitor>;
}

interface DolarApiResponse {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

/**
 * Intenta obtener la tasa BCV desde pydolarve.org.
 * Retorna { rate, date } o null si falla.
 */
async function fetchFromPydolar(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch("https://pydolarve.org/api/v2/dollar?page=bcv", {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as PydolarResponse;

    // La estructura de pydolarve: monitors.usd.price
    const usdMonitor = json?.monitors?.usd;
    if (!usdMonitor?.price || usdMonitor.price <= 0) return null;

    return {
      rate: usdMonitor.price,
      date: usdMonitor.last_update || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Fallback: intenta obtener la tasa desde ve.dolarapi.com.
 */
async function fetchFromDolarApi(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as DolarApiResponse;

    // dolarapi retorna { compra, venta, fechaActualizacion }
    const rate = json?.venta ?? json?.compra;
    if (!rate || rate <= 0) return null;

    return {
      rate,
      date: json.fechaActualizacion || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    // Intentar fuente principal: pydolarve.org
    let result = await fetchFromPydolar();

    // Fallback: ve.dolarapi.com
    if (!result) {
      result = await fetchFromDolarApi();
    }

    if (!result) {
      return NextResponse.json(
        {
          error: "No se pudo obtener la tasa BCV",
          details:
            "Ambas fuentes externas fallaron (pydolarve.org y ve.dolarapi.com). Intente de nuevo mas tarde.",
        },
        { status: 502 },
      );
    }

    // Guardar en la tabla exchange_rates
    const supabase = await createClient();

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("exchange_rates")
      .upsert(
        {
          currency_pair: "USD/VES",
          rate: result.rate,
          valid_date: today,
          source: "BCV",
        },
        {
          onConflict: "currency_pair,valid_date",
        },
      )
      .select("id, currency_pair, rate, valid_date, source, created_at")
      .single();

    if (error) {
      // Si falla el upsert (ej: no existe unique constraint), intentar insert simple
      const { data: insertData, error: insertError } = await supabase
        .from("exchange_rates")
        .insert({
          currency_pair: "USD/VES",
          rate: result.rate,
          valid_date: today,
          source: "BCV",
        })
        .select("id, currency_pair, rate, valid_date, source, created_at")
        .single();

      if (insertError) {
        return NextResponse.json(
          {
            error: "Tasa obtenida pero no se pudo guardar",
            rate: result.rate,
            details: insertError.message,
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        rate: insertData!.rate,
        validDate: insertData!.valid_date,
        source: insertData!.source,
        updatedAt: insertData!.created_at,
      });
    }

    return NextResponse.json({
      rate: data.rate,
      validDate: data.valid_date,
      source: data.source,
      updatedAt: data.created_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
