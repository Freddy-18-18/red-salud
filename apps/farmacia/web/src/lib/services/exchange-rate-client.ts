import { createClient } from "@/lib/supabase/client";
import type { ExchangeRate } from "./exchange-rate-service";
export type { ExchangeRate } from "./exchange-rate-service";
export { formatUsd, formatBs, formatDualCurrency, usdToBs, formatRelativeTime } from "./exchange-rate-service";

/**
 * Client-side fetch of the latest BCV exchange rate.
 * Mirrors getLatestExchangeRate but uses the browser Supabase client.
 */
export async function getLatestExchangeRateClient(
  fallbackRate = 36.0,
): Promise<ExchangeRate> {
  const supabase = createClient();

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
