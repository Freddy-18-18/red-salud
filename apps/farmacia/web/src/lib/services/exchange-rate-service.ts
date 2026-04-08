import { createClient } from "@/lib/supabase/server";
import type { ExchangeRate } from "./exchange-rate-client";
import {
  CURRENCY_PAIRS,
  LEGACY_USD_PAIR,
} from "./exchange-rate-client";

// Re-export shared types and utilities so existing server-side consumers
// (e.g. layout.tsx, dashboard page.tsx) can still import from this module.
export type { ExchangeRate } from "./exchange-rate-client";
export {
  formatUsd,
  formatEur,
  formatBs,
  formatDualCurrency,
  formatParallelRate,
  usdToBs,
  euroToBs,
  formatRelativeTime,
  CURRENCY_PAIRS,
  CURRENCY_PAIR_LABELS,
  LEGACY_USD_PAIR,
} from "./exchange-rate-client";

/**
 * Fetch the latest BCV exchange rate from the exchange_rates table.
 * SERVER ONLY — uses next/headers via the server Supabase client.
 * Falls back to a default rate if no data is available.
 * Backwards compatible — returns USD/VES official rate.
 */
export async function getLatestExchangeRate(
  fallbackRate = 36.0,
): Promise<ExchangeRate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("id, currency_pair, rate, valid_date, source")
    .in("currency_pair", [CURRENCY_PAIRS.USD_OFICIAL, LEGACY_USD_PAIR])
    .order("valid_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      id: "fallback",
      currencyPair: CURRENCY_PAIRS.USD_OFICIAL,
      rate: fallbackRate,
      validDate: new Date().toISOString(),
      source: "fallback",
    };
  }

  return {
    id: data.id,
    currencyPair: data.currency_pair,
    rate: data.rate ?? fallbackRate,
    validDate: data.valid_date,
    source: data.source || "BCV",
  };
}

/**
 * Fetch the latest rate for a specific currency pair.
 * SERVER ONLY.
 */
export async function getRate(pair: string): Promise<ExchangeRate | null> {
  const supabase = await createClient();

  // Also match the legacy pair name when querying official USD
  const pairsToMatch =
    pair === CURRENCY_PAIRS.USD_OFICIAL
      ? [CURRENCY_PAIRS.USD_OFICIAL, LEGACY_USD_PAIR]
      : [pair];

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("id, currency_pair, rate, valid_date, source")
    .in("currency_pair", pairsToMatch)
    .order("valid_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    currencyPair: pair,
    rate: data.rate ?? 0,
    validDate: data.valid_date,
    source: data.source || "BCV",
  };
}

/**
 * Fetch the latest rate for ALL currency pairs.
 * Returns one ExchangeRate per pair, newest first.
 * SERVER ONLY.
 */
export async function getLatestRates(): Promise<ExchangeRate[]> {
  const supabase = await createClient();

  const pairs = Object.values(CURRENCY_PAIRS);

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("id, currency_pair, rate, valid_date, source")
    .in("currency_pair", [...pairs, LEGACY_USD_PAIR])
    .order("valid_date", { ascending: false });

  if (error || !data) return [];

  // De-duplicate: keep only the most recent row per currency_pair
  const seen = new Set<string>();
  const unique: ExchangeRate[] = [];
  for (const row of data) {
    const key =
      row.currency_pair === LEGACY_USD_PAIR
        ? CURRENCY_PAIRS.USD_OFICIAL
        : row.currency_pair;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        id: row.id,
        currencyPair: key,
        rate: row.rate ?? 0,
        validDate: row.valid_date,
        source: row.source || "BCV",
      });
    }
  }

  return unique;
}

/**
 * Get exchange rate history for a date range.
 * SERVER ONLY — uses next/headers via the server Supabase client.
 */
export async function getExchangeRateHistory(
  dateFrom: string,
  dateTo: string,
): Promise<ExchangeRate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("id, currency_pair, rate, valid_date, source")
    .in("currency_pair", [CURRENCY_PAIRS.USD_OFICIAL, LEGACY_USD_PAIR])
    .gte("valid_date", dateFrom)
    .lte("valid_date", dateTo)
    .order("valid_date", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    currencyPair: row.currency_pair,
    rate: row.rate ?? 0,
    validDate: row.valid_date,
    source: row.source || "BCV",
  }));
}
