import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CURRENCY_PAIRS,
  LEGACY_USD_PAIR,
  type CurrencyPair,
} from "@/lib/services/exchange-rate-client";

// ============================================================================
// Types
// ============================================================================

interface PydolarMonitor {
  price: number;
  last_update: string;
}

interface PydolarResponse {
  monitors?: Record<string, PydolarMonitor>;
}

interface DolarApiQuote {
  fuente: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface RateResult {
  pair: CurrencyPair;
  rate: number;
  date: string;
  source: string;
}

// ============================================================================
// GET /api/bcv — Obtener tasas de cambio
//
// Query params:
//   ?pair=USD/VES-oficial  — single pair (default: USD/VES-oficial)
//   ?all=true              — return all latest rates
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const all = searchParams.get("all") === "true";
    const pair = searchParams.get("pair") ?? CURRENCY_PAIRS.USD_OFICIAL;

    const supabase = await createClient();

    if (all) {
      // Return the latest row for each currency pair
      const pairs = Object.values(CURRENCY_PAIRS);
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("id, currency_pair, rate, valid_date, source, created_at")
        .in("currency_pair", [...pairs, LEGACY_USD_PAIR])
        .order("valid_date", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "Error al consultar las tasas de cambio", details: error.message },
          { status: 500 },
        );
      }

      // De-duplicate: keep latest per pair
      const seen = new Set<string>();
      const rates = (data ?? [])
        .filter((row) => {
          const key =
            row.currency_pair === LEGACY_USD_PAIR
              ? CURRENCY_PAIRS.USD_OFICIAL
              : row.currency_pair;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((row) => ({
          id: row.id,
          currencyPair:
            row.currency_pair === LEGACY_USD_PAIR
              ? CURRENCY_PAIRS.USD_OFICIAL
              : row.currency_pair,
          rate: row.rate,
          validDate: row.valid_date,
          source: row.source,
          updatedAt: row.created_at,
        }));

      return NextResponse.json({ rates });
    }

    // Single pair query — backwards compatible
    const pairsToMatch =
      pair === CURRENCY_PAIRS.USD_OFICIAL
        ? [CURRENCY_PAIRS.USD_OFICIAL, LEGACY_USD_PAIR]
        : [pair];

    const { data, error } = await supabase
      .from("exchange_rates")
      .select("id, currency_pair, rate, valid_date, source, created_at")
      .in("currency_pair", pairsToMatch)
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
// External API fetchers
// ============================================================================

/**
 * Fetch USD BCV official rate from pydolarve.org (primary source).
 */
async function fetchFromPydolar(): Promise<RateResult | null> {
  try {
    const res = await fetch("https://pydolarve.org/api/v2/dollar?page=bcv", {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as PydolarResponse;
    const usdMonitor = json?.monitors?.usd;
    if (!usdMonitor?.price || usdMonitor.price <= 0) return null;

    return {
      pair: CURRENCY_PAIRS.USD_OFICIAL,
      rate: usdMonitor.price,
      date: usdMonitor.last_update || new Date().toISOString(),
      source: "BCV",
    };
  } catch {
    return null;
  }
}

/**
 * Fetch ALL quotations from ve.dolarapi.com/v1/cotizaciones.
 * Returns an array of rates for all supported pairs.
 */
async function fetchAllFromDolarApi(): Promise<RateResult[]> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/cotizaciones", {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return [];

    const quotes = (await res.json()) as DolarApiQuote[];
    if (!Array.isArray(quotes)) return [];

    const results: RateResult[] = [];

    for (const q of quotes) {
      const rate = q.venta ?? q.compra;
      if (!rate || rate <= 0) continue;

      const nombre = (q.nombre ?? "").toLowerCase();
      const fuente = (q.fuente ?? "").toLowerCase();

      // Map DolarAPI names to our currency pairs
      let pair: CurrencyPair | null = null;

      if (nombre.includes("dólar") || nombre.includes("dolar") || fuente.includes("dolar")) {
        if (fuente.includes("oficial") || nombre.includes("oficial")) {
          pair = CURRENCY_PAIRS.USD_OFICIAL;
        } else if (fuente.includes("paralelo") || nombre.includes("paralelo")) {
          pair = CURRENCY_PAIRS.USD_PARALELO;
        }
      } else if (nombre.includes("euro") || fuente.includes("euro")) {
        if (fuente.includes("oficial") || nombre.includes("oficial")) {
          pair = CURRENCY_PAIRS.EUR_OFICIAL;
        } else if (fuente.includes("paralelo") || nombre.includes("paralelo")) {
          pair = CURRENCY_PAIRS.EUR_PARALELO;
        }
      }

      if (pair) {
        results.push({
          pair,
          rate,
          date: q.fechaActualizacion || new Date().toISOString(),
          source:
            pair.includes("paralelo") ? "paralelo" : "DolarAPI",
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Fallback: fetch only USD official from DolarAPI single endpoint.
 */
async function fetchUsdOfficialFromDolarApi(): Promise<RateResult | null> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { compra: number; venta: number; fechaActualizacion: string };
    const rate = json?.venta ?? json?.compra;
    if (!rate || rate <= 0) return null;

    return {
      pair: CURRENCY_PAIRS.USD_OFICIAL,
      rate,
      date: json.fechaActualizacion || new Date().toISOString(),
      source: "DolarAPI",
    };
  } catch {
    return null;
  }
}

// ============================================================================
// POST /api/bcv — Fetch all rates from external APIs and upsert to DB
// ============================================================================

export async function POST() {
  try {
    const results: RateResult[] = [];

    // Step 1: Get USD BCV official from pydolarve (most reliable for BCV)
    const pydolarResult = await fetchFromPydolar();

    // Step 2: Get ALL rates from DolarAPI /v1/cotizaciones
    const dolarApiResults = await fetchAllFromDolarApi();

    // Merge: pydolarve wins for USD official, DolarAPI for everything else
    if (pydolarResult) {
      results.push(pydolarResult);
    }

    for (const dar of dolarApiResults) {
      // Skip USD official from DolarAPI if we already have it from pydolarve
      if (dar.pair === CURRENCY_PAIRS.USD_OFICIAL && pydolarResult) {
        continue;
      }
      results.push(dar);
    }

    // If we have nothing for USD official, try the DolarAPI single endpoint as last fallback
    const hasUsdOficial = results.some((r) => r.pair === CURRENCY_PAIRS.USD_OFICIAL);
    if (!hasUsdOficial) {
      const fallback = await fetchUsdOfficialFromDolarApi();
      if (fallback) results.push(fallback);
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: "No se pudo obtener ninguna tasa de cambio",
          details:
            "Todas las fuentes externas fallaron (pydolarve.org y ve.dolarapi.com). Intente de nuevo mas tarde.",
        },
        { status: 502 },
      );
    }

    // Step 3: Upsert all rates to the database
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const savedRates: Array<{
      currencyPair: string;
      rate: number;
      validDate: string;
      source: string;
      updatedAt: string;
    }> = [];

    for (const result of results) {
      const { data, error } = await supabase
        .from("exchange_rates")
        .upsert(
          {
            currency_pair: result.pair,
            rate: result.rate,
            valid_date: today,
            source: result.source,
          },
          {
            onConflict: "currency_pair,valid_date",
          },
        )
        .select("id, currency_pair, rate, valid_date, source, created_at")
        .single();

      if (error) {
        // Fallback: try simple insert if upsert fails
        const { data: insertData, error: insertError } = await supabase
          .from("exchange_rates")
          .insert({
            currency_pair: result.pair,
            rate: result.rate,
            valid_date: today,
            source: result.source,
          })
          .select("id, currency_pair, rate, valid_date, source, created_at")
          .single();

        if (!insertError && insertData) {
          savedRates.push({
            currencyPair: insertData.currency_pair,
            rate: insertData.rate,
            validDate: insertData.valid_date,
            source: insertData.source,
            updatedAt: insertData.created_at,
          });
        }
        continue;
      }

      if (data) {
        savedRates.push({
          currencyPair: data.currency_pair,
          rate: data.rate,
          validDate: data.valid_date,
          source: data.source,
          updatedAt: data.created_at,
        });
      }
    }

    // Return the primary USD/VES-oficial rate at top level (backwards compat)
    // plus all rates in a `rates` array
    const primary =
      savedRates.find((r) => r.currencyPair === CURRENCY_PAIRS.USD_OFICIAL) ??
      savedRates[0];

    return NextResponse.json({
      rate: primary?.rate,
      validDate: primary?.validDate,
      source: primary?.source,
      updatedAt: primary?.updatedAt,
      rates: savedRates,
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
