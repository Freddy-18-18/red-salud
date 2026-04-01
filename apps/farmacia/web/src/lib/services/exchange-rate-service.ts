import { createClient } from "@/lib/supabase/server";

export interface ExchangeRate {
  id: string;
  currencyPair: string;
  rate: number;
  validDate: string;
  source: string;
}

/**
 * Fetch the latest BCV exchange rate from the exchange_rates table.
 * Falls back to a default rate if no data is available.
 */
export async function getLatestExchangeRate(
  fallbackRate = 36.0,
): Promise<ExchangeRate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("id, currency_pair, rate, valid_date, source")
    .eq("currency_pair", "USD/VES")
    .order("valid_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      id: "fallback",
      currencyPair: "USD/VES",
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
 * Get exchange rate history for a date range.
 */
export async function getExchangeRateHistory(
  dateFrom: string,
  dateTo: string,
): Promise<ExchangeRate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("id, currency_pair, rate, valid_date, source")
    .eq("currency_pair", "USD/VES")
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

// ---------- Currency formatting utilities ----------

/**
 * Convert USD to Bs using the given rate.
 */
export function usdToBs(usd: number, rate: number): number {
  return usd * rate;
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
