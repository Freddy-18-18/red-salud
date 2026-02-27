// ============================================
// MOTHERDUCK REACT HOOKS
// React hooks for MotherDuck analytics
// ============================================

"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMotherDuckService, type KPIFilters, type KPISet } from '@/lib/services/motherduck-service';

/**
 * Hook for fetching doctor KPIs from MotherDuck
 *
 * @example
 * ```tsx
 * const { kpis, isLoading, error, refresh } = useDoctorKPIs({
 *   doctorId: '123',
 *   dateFrom: '2025-01-01',
 * });
 * ```
 */
export function useDoctorKPIs(filters: KPIFilters) {
  const [kpis, setKpis] = useState<KPISet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKPIs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = getMotherDuckService();
      const data = await service.getDoctorKPIs(filters);
      setKpis(data);
    } catch (err) {
      setError(err as Error);
      console.error('[useDoctorKPIs] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  return {
    kpis,
    isLoading,
    error,
    refresh: fetchKPIs,
  };
}

/**
 * Hook for fetching no-show rate
 */
export function useNoShowRate(filters: KPIFilters) {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = getMotherDuckService();
      const data = await service.getNoShowRate(filters);
      setRate(data);
    } catch (err) {
      console.error('[useNoShowRate] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return { rate, isLoading, refresh: fetchRate };
}

/**
 * Hook for fetching case acceptance rate (dental)
 */
export function useCaseAcceptanceRate(filters: KPIFilters) {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = getMotherDuckService();
      const data = await service.getCaseAcceptanceRate(filters);
      setRate(data);
    } catch (err) {
      console.error('[useCaseAcceptanceRate] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return { rate, isLoading, refresh: fetchRate };
}

/**
 * Hook for production/revenue metrics
 */
export function useProductionMetrics(filters: KPIFilters) {
  const [metrics, setMetrics] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
    avgTicket: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = getMotherDuckService();
      const data = await service.getProductionMetrics(filters);
      setMetrics(data);
    } catch (err) {
      console.error('[useProductionMetrics] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, refresh: fetchMetrics };
}

/**
 * Hook for MotherDuck connection status
 */
export function useMotherDuckConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const service = getMotherDuckService();
        const connected = await service.testConnection();
        setIsConnected(connected);

        if (connected) {
          const dbs = await service.listDatabases();
          setDatabases(dbs);
        }
      } catch (err) {
        console.error('[useMotherDuckConnection] Error:', err);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    databases,
  };
}

/**
 * Hook for real-time dashboard data (combines multiple KPIs)
 */
export function useRealtimeDashboardData(filters: KPIFilters) {
  const kpis = useDoctorKPIs(filters);
  const production = useProductionMetrics(filters);

  return {
    ...kpis,
    productionMetrics: production.metrics,
    isLoading: kpis.isLoading || production.isLoading,
    refresh: () => {
      kpis.refresh();
      production.refresh();
    },
  };
}

/**
 * Type-safe KPI formatter
 */
export function formatKPIValue(
  value: number | undefined | null,
  format: 'percentage' | 'currency' | 'number' | 'duration'
): string {
  if (value === undefined || value === null) return '-';

  switch (format) {
    case 'percentage':
      return `${Math.round(value * 100)}%`;
    case 'currency':
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    case 'number':
      return new Intl.NumberFormat('es-VE').format(value);
    case 'duration':
      return `${Math.round(value)} min`;
    default:
      return String(value);
  }
}

/**
 * KPI goal checker - returns if KPI meets goal
 */
export function checkKPIGoal(
  value: number | undefined | null,
  goal: number | undefined,
  direction: 'higher_is_better' | 'lower_is_better'
): boolean {
  if (value === undefined || value === null || goal === undefined) return true;

  return direction === 'higher_is_better'
    ? value >= goal
    : value <= goal;
}

/**
 * Get KPI status (success, warning, danger) based on goal
 */
export function getKPIStatus(
  value: number | undefined | null,
  goal: number | undefined,
  direction: 'higher_is_better' | 'lower_is_better'
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (value === undefined || value === null || goal === undefined) return 'neutral';

  const meetsGoal = checkKPIGoal(value, goal, direction);

  if (meetsGoal) return 'success';

  // Check if close to goal (within 20%)
  const percentOfGoal = value / goal;
  const isClose = direction === 'higher_is_better'
    ? percentOfGoal >= 0.8
    : percentOfGoal <= 1.2;

  return isClose ? 'warning' : 'danger';
}
