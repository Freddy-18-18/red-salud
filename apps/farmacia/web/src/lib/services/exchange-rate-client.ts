import { createClient } from "@/lib/supabase/client";

// ---------- Shared types ----------

export interface ExchangeRate {
  id: string;
  currencyPair: string;
  rate: number;
  validDate: string;
  source: string;
}

// ---------- Well-known currency pairs ----------

export const CURRENCY_PAIRS = {
  USD_OFICIAL: "USD/VES-oficial",
  USD_PARALELO: "USD/VES-paralelo",
  EUR_OFICIAL: "EUR/VES-oficial",
  EUR_PARALELO: "EUR/VES-paralelo",
} as const;

export type CurrencyPair = (typeof CURRENCY_PAIRS)[keyof typeof CURRENCY_PAIRS];

/** Human-readable labels for each pair. */
export const CURRENCY_PAIR_LABELS: Record<CurrencyPair, string> = {
  "USD/VES-oficial": "Dolar BCV Oficial",
  "USD/VES-paralelo": "Dolar Paralelo",
  "EUR/VES-oficial": "Euro BCV Oficial",
  "EUR/VES-paralelo": "Euro Paralelo",
};

/**
 * Legacy pair value used before multi-currency support.
 * Rows stored with this pair are treated as USD/VES-oficial.
 */
export const LEGACY_USD_PAIR = "USD/VES";

// ---------- Currency formatting utilities ----------

/**
 * Convert USD to Bs using the given rate.
 */
export function usdToBs(usd: number, rate: number): number {
  return usd * rate;
}

/**
 * Convert EUR to Bs using the given rate.
 */
export function euroToBs(eur: number, rate: number): number {
  return eur * rate;
}

/**
 * Format a monetary amount in USD.
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a monetary amount in EUR.
 */
export function formatEur(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a monetary amount in Bs.
 */
export function formatBs(amount: number): string {
  return `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/**
 * Format both USD and Bs amounts together.
 */
export function formatDualCurrency(usd: number, bs: number): string {
  return `${formatUsd(usd)} / ${formatBs(bs)}`;
}

/**
 * Format a rate with its human-readable label.
 * Example: "Paralelo: Bs. 52.30"
 */
export function formatParallelRate(rate: ExchangeRate): string {
  const label =
    CURRENCY_PAIR_LABELS[rate.currencyPair as CurrencyPair] ??
    rate.currencyPair;
  return `${label}: ${formatBs(rate.rate)}`;
}

/**
 * Format a relative time string in Venezuelan Spanish.
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Justo ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  return date.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
}

// ---------- Client-side data fetching ----------

/**
 * Client-side fetch of the latest BCV exchange rate (USD/VES official).
 * Mirrors getLatestExchangeRate but uses the browser Supabase client.
 * Backwards compatible — returns the USD/VES official rate.
 */
export async function getLatestExchangeRateClient(
  fallbackRate = 36.0,
): Promise<ExchangeRate> {
  const supabase = createClient();

  // Query both the new pair name and the legacy one for backwards compat
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
 * Client-side fetch of ALL latest exchange rates (one per currency pair).
 * Fetches from the API route to get the most recent data.
 */
export async function getAllRatesClient(): Promise<ExchangeRate[]> {
  try {
    const res = await fetch("/api/bcv?all=true");
    if (!res.ok) return [];
    const json = await res.json();
    return (json.rates ?? []) as ExchangeRate[];
  } catch {
    // Fallback: query Supabase directly
    return getAllRatesFromSupabase();
  }
}

/**
 * Direct Supabase query fallback — returns the latest rate per pair.
 */
async function getAllRatesFromSupabase(): Promise<ExchangeRate[]> {
  const supabase = createClient();

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
    const key = row.currency_pair === LEGACY_USD_PAIR
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
