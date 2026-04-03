"use client";

import { useCallback, useEffect, useState } from "react";

import {
  type CurrencyConversion,
  type ExchangeRate,
  type HistoricalRate,
  convertCurrency,
  getAllRates,
  getDollarHistory,
  getOfficialDollar,
  getParallelDollar,
} from "@/lib/services/currency-service";

// ─── Types ───────────────────────────────────────────────────────────

interface UseCurrencyRatesReturn {
  rates: ExchangeRate[];
  officialDollar: ExchangeRate | null;
  parallelDollar: ExchangeRate | null;
  history: HistoricalRate[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => void;
  convert: (
    amount: number,
    from: "USD" | "EUR" | "BS",
    to: "USD" | "EUR" | "BS",
    useParallel?: boolean
  ) => Promise<CurrencyConversion>;
}

interface UseDollarRateReturn {
  rate: ExchangeRate | null;
  loading: boolean;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const REFETCH_INTERVAL_MS = 5 * 60 * 1000; // auto-refetch every 5 min

// ─── useCurrencyRates ────────────────────────────────────────────────

export function useCurrencyRates(): UseCurrencyRatesReturn {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [history, setHistory] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchRates = useCallback(async (force = false) => {
    // Skip if recently fetched (within stale time) unless forced
    if (!force && Date.now() - lastFetch < STALE_TIME_MS) return;

    setLoading(true);
    setError(null);

    try {
      const [allRates, dollarHistory] = await Promise.all([
        getAllRates(),
        getDollarHistory(),
      ]);
      setRates(allRates);
      setHistory(dollarHistory.slice(-7)); // Last 7 days
      setIsOffline(false);
      setLastFetch(Date.now());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al obtener tasas";
      setError(message);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRates(true);

    const interval = setInterval(() => {
      fetchRates(true);
    }, REFETCH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchRates]);

  const officialDollar =
    rates.find(
      (r) =>
        r.currency === "USD" &&
        (r.source === "BCV" || r.name.toLowerCase().includes("oficial"))
    ) ?? null;

  const parallelDollar =
    rates.find(
      (r) =>
        r.currency === "USD" &&
        r.source !== "BCV" &&
        !r.name.toLowerCase().includes("oficial")
    ) ?? null;

  const convert = useCallback(
    async (
      amount: number,
      from: "USD" | "EUR" | "BS",
      to: "USD" | "EUR" | "BS",
      useParallel = false
    ) => {
      return convertCurrency(amount, from, to, useParallel);
    },
    []
  );

  return {
    rates,
    officialDollar,
    parallelDollar,
    history,
    loading,
    error,
    isOffline,
    refetch: () => fetchRates(true),
    convert,
  };
}

// ─── useDollarRate ───────────────────────────────────────────────────

export function useDollarRate(
  type: "oficial" | "paralelo" = "oficial"
): UseDollarRateReturn {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          type === "oficial"
            ? await getOfficialDollar()
            : await getParallelDollar();
        if (!cancelled) setRate(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al obtener tasa"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    const interval = setInterval(fetch, REFETCH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [type]);

  return { rate, loading, error };
}
