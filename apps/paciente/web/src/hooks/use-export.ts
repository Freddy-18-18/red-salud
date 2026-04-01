import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  exportService,
  type ExportRecord,
  type ExportCategoryCount,
  type CreateExportData,
} from "@/lib/services/export-service";
import { supabase } from "@/lib/supabase/client";

export function useExportCounts() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["export", "counts", userId],
    queryFn: async () => {
      if (!userId) return [];
      return exportService.getExportCounts(userId);
    },
    enabled: !!userId,
  });

  return {
    counts: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function useExportHistory() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["export", "history", userId],
    queryFn: async () => {
      if (!userId) return [];
      return exportService.getExportHistory(userId);
    },
    enabled: !!userId,
  });

  return {
    exports: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function useCreateExport() {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: CreateExportData) => {
      if (!userId) throw new Error("No user");
      return exportService.createExport(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["export", "history", userId] });
    },
  });

  const createExport = useCallback(
    async (
      data: CreateExportData
    ): Promise<{ success: boolean; record?: ExportRecord }> => {
      if (!userId) return { success: false };
      try {
        const record = await mutation.mutateAsync(data);
        return { success: true, record };
      } catch {
        return { success: false };
      }
    },
    [userId, mutation]
  );

  return {
    createExport,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
