import { createClient } from "@/lib/supabase/client";

export interface ExchangeRate {
  id: string;
  currency_pair: string;
  rate: number;
  valid_date: string;
  source: string;
}

/**
 * Get the latest BCV exchange rate for USD/VES.
 * Falls back to the provided default if no rate is found.
 */
export async function getLatestExchangeRate(
  fallbackRate = 36.0
): Promise<ExchangeRate> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .eq("currency_pair", "USD/VES")
    .order("valid_date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      id: "fallback",
      currency_pair: "USD/VES",
      rate: fallbackRate,
      valid_date: new Date().toISOString(),
      source: "fallback",
    };
  }

  return data as ExchangeRate;
}

/**
 * Get exchange rate history for a date range
 */
export async function getExchangeRateHistory(
  dateFrom: string,
  dateTo: string
): Promise<ExchangeRate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .eq("currency_pair", "USD/VES")
    .gte("valid_date", dateFrom)
    .lte("valid_date", dateTo)
    .order("valid_date", { ascending: false });

  if (error) {
    console.error("Error fetching exchange rate history:", error);
    return [];
  }

  return (data || []) as ExchangeRate[];
}
