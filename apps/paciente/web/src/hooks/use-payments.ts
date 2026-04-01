import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  paymentsService,
  type Payment,
  type PaymentMethod,
  type PaymentStats,
  type PaymentFilters,
  type CreatePaymentMethodData,
} from "@/lib/services/payments-service";
import { supabase } from "@/lib/supabase/client";

export function usePayments(filters?: PaymentFilters) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["payments", "history", userId, filters],
    queryFn: async () => {
      if (!userId) return [];
      return paymentsService.getPayments(userId, filters);
    },
    enabled: !!userId,
  });

  return {
    userId,
    payments: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function usePendingPayments() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["payments", "pending", userId],
    queryFn: async () => {
      if (!userId) return [];
      return paymentsService.getPendingPayments(userId);
    },
    enabled: !!userId,
  });

  return {
    userId,
    pendingPayments: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function usePaymentMethods() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["payments", "methods", userId],
    queryFn: async () => {
      if (!userId) return [];
      return paymentsService.getPaymentMethods(userId);
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: CreatePaymentMethodData) => {
      if (!userId) throw new Error("No user");
      return paymentsService.addPaymentMethod(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "methods", userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return paymentsService.deletePaymentMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "methods", userId] });
    },
  });

  const addMethod = useCallback(
    async (
      data: CreatePaymentMethodData
    ): Promise<{ success: boolean; method?: PaymentMethod }> => {
      if (!userId) return { success: false };
      try {
        const method = await addMutation.mutateAsync(data);
        return { success: true, method };
      } catch {
        return { success: false };
      }
    },
    [userId, addMutation]
  );

  const deleteMethod = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await deleteMutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [deleteMutation]
  );

  return {
    userId,
    methods: query.data ?? [],
    loading: query.isLoading,
    saving: addMutation.isPending || deleteMutation.isPending,
    error:
      query.error?.message ??
      addMutation.error?.message ??
      deleteMutation.error?.message ??
      null,
    addMethod,
    deleteMethod,
    refresh: query.refetch,
  };
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      paymentId,
      methodId,
    }: {
      paymentId: string;
      methodId: string;
    }) => {
      return paymentsService.processPayment(paymentId, methodId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const process = useCallback(
    async (
      paymentId: string,
      methodId: string
    ): Promise<{ success: boolean; payment?: Payment }> => {
      try {
        const payment = await mutation.mutateAsync({ paymentId, methodId });
        return { success: true, payment };
      } catch {
        return { success: false };
      }
    },
    [mutation]
  );

  return {
    process,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

export function useAddPaymentMethod() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: CreatePaymentMethodData) => {
      if (!userId) throw new Error("No user");
      return paymentsService.addPaymentMethod(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "methods", userId] });
    },
  });

  const add = useCallback(
    async (
      data: CreatePaymentMethodData
    ): Promise<{ success: boolean; method?: PaymentMethod }> => {
      if (!userId) return { success: false };
      try {
        const method = await mutation.mutateAsync(data);
        return { success: true, method };
      } catch {
        return { success: false };
      }
    },
    [userId, mutation]
  );

  return {
    add,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

export function usePaymentStats() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["payments", "stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      return paymentsService.getPaymentStats(userId);
    },
    enabled: !!userId,
  });

  return {
    stats: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function useExchangeRate() {
  const query = useQuery({
    queryKey: ["payments", "exchange-rate"],
    queryFn: () => paymentsService.getExchangeRate(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return {
    rate: query.data?.rate ?? null,
    updatedAt: query.data?.updated_at ?? null,
    loading: query.isLoading,
  };
}

export function useInvoice(paymentId: string | null) {
  const query = useQuery({
    queryKey: ["payments", "invoice", paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      return paymentsService.getInvoice(paymentId);
    },
    enabled: !!paymentId,
  });

  return {
    invoice: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
