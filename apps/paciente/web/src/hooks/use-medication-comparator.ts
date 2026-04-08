"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  comparePrescriptionPrices,
  getPriceAlerts,
  createPriceAlert,
  deletePriceAlert,
  type PharmacyComparison,
  type PriceAlert,
  type CreatePriceAlertData,
} from "@/lib/services/medication-comparator-service";

// ─── Keys ────────────────────────────────────────────────────────────

const KEYS = {
  comparison: (id: string | null) => ["comparator", "comparison", id] as const,
  alerts: ["comparator", "alerts"] as const,
};

// ─── usePrescriptionComparison ───────────────────────────────────────

export function usePrescriptionComparison(prescriptionId: string | null) {
  const query = useQuery({
    queryKey: KEYS.comparison(prescriptionId),
    queryFn: () => comparePrescriptionPrices(prescriptionId!),
    enabled: !!prescriptionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    results: (query.data ?? []) as PharmacyComparison[],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ─── usePriceAlerts ──────────────────────────────────────────────────

export function usePriceAlerts() {
  const query = useQuery({
    queryKey: KEYS.alerts,
    queryFn: getPriceAlerts,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    alerts: (query.data ?? []) as PriceAlert[],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

// ─── useCreatePriceAlert ─────────────────────────────────────────────

export function useCreatePriceAlert() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePriceAlertData) => createPriceAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.alerts });
    },
  });

  const create = useCallback(
    async (
      data: CreatePriceAlertData,
    ): Promise<{ success: boolean; alert?: PriceAlert }> => {
      try {
        const alert = await mutation.mutateAsync(data);
        return { success: true, alert };
      } catch {
        return { success: false };
      }
    },
    [mutation],
  );

  return {
    create,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

// ─── useDeletePriceAlert ─────────────────────────────────────────────

export function useDeletePriceAlert() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deletePriceAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.alerts });
    },
  });

  const remove = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await mutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [mutation],
  );

  return {
    remove,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
