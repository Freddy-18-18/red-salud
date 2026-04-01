import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  queueService,
  type QueueEntry,
  type JoinQueueData,
} from "@/lib/services/queue-service";
import { supabase } from "@/lib/supabase/client";

export function useActiveQueue() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["queue", "active", userId],
    queryFn: async () => {
      if (!userId) return null;
      return queueService.getActiveQueue(userId);
    },
    enabled: !!userId,
    refetchInterval: 10_000, // Poll every 10 seconds
  });

  return {
    userId,
    activeEntry: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function useQueuePosition(queueId: string | null) {
  const query = useQuery({
    queryKey: ["queue", "position", queueId],
    queryFn: async () => {
      if (!queueId) return null;
      return queueService.getQueuePosition(queueId);
    },
    enabled: !!queueId,
    refetchInterval: 10_000, // Poll every 10 seconds
  });

  return {
    position: query.data?.position ?? 0,
    totalAhead: query.data?.total_ahead ?? 0,
    status: query.data?.status ?? null,
    estimatedWait: query.data?.estimated_wait_minutes ?? 0,
    loading: query.isLoading,
  };
}

export function useQueueHistory() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["queue", "history", userId],
    queryFn: async () => {
      if (!userId) return [];
      return queueService.getQueueHistory(userId);
    },
    enabled: !!userId,
  });

  return {
    history: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function useJoinQueue() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: JoinQueueData) => {
      if (!userId) throw new Error("No user");
      return queueService.joinQueue(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", "active", userId] });
      queryClient.invalidateQueries({ queryKey: ["queue", "history", userId] });
    },
  });

  const join = useCallback(
    async (
      data: JoinQueueData
    ): Promise<{ success: boolean; entry?: QueueEntry }> => {
      if (!userId) return { success: false };
      try {
        const entry = await mutation.mutateAsync(data);
        return { success: true, entry };
      } catch {
        return { success: false };
      }
    },
    [userId, mutation]
  );

  return {
    join,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

export function useCancelQueue() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async (queueId: string) => {
      if (!userId) throw new Error("No user");
      return queueService.cancelQueue(queueId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", "active", userId] });
      queryClient.invalidateQueries({ queryKey: ["queue", "history", userId] });
    },
  });

  const cancel = useCallback(
    async (queueId: string): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };
      try {
        await mutation.mutateAsync(queueId);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [userId, mutation]
  );

  return {
    cancel,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
