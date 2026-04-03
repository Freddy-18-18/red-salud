'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExchangeRates {
  dolar: { oficial: number; paralelo: number; fechaOficial: string; fechaParalelo: string };
  euro: { oficial: number; paralelo: number; fechaOficial: string; fechaParalelo: string };
  timestamp: string;
  stale?: boolean;
}

interface UseExchangeRatesReturn {
  rates: ExchangeRates | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // Conversion helpers
  usdToBs: (usd: number, source?: 'oficial' | 'paralelo') => number;
  bsToUsd: (bs: number, source?: 'oficial' | 'paralelo') => number;
  eurToBs: (eur: number, source?: 'oficial' | 'paralelo') => number;
  bsToEur: (bs: number, source?: 'oficial' | 'paralelo') => number;
  formatBs: (amount: number) => string;
  formatUsd: (amount: number) => string;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/exchange-rates');
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();
      setRates(data);
    } catch (err) {
      setError('Error al obtener tasas de cambio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchRates, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const usdToBs = useCallback(
    (usd: number, source: 'oficial' | 'paralelo' = 'oficial') => {
      if (!rates) return 0;
      return usd * rates.dolar[source];
    },
    [rates]
  );

  const bsToUsd = useCallback(
    (bs: number, source: 'oficial' | 'paralelo' = 'oficial') => {
      if (!rates || rates.dolar[source] === 0) return 0;
      return bs / rates.dolar[source];
    },
    [rates]
  );

  const eurToBs = useCallback(
    (eur: number, source: 'oficial' | 'paralelo' = 'oficial') => {
      if (!rates) return 0;
      return eur * rates.euro[source];
    },
    [rates]
  );

  const bsToEur = useCallback(
    (bs: number, source: 'oficial' | 'paralelo' = 'oficial') => {
      if (!rates || rates.euro[source] === 0) return 0;
      return bs / rates.euro[source];
    },
    [rates]
  );

  const formatBs = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const formatUsd = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  return {
    rates,
    loading,
    error,
    refresh: fetchRates,
    usdToBs,
    bsToUsd,
    eurToBs,
    bsToEur,
    formatBs,
    formatUsd,
  };
}
