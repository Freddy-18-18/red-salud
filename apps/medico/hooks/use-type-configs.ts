"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ensureDefaultTypeConfigs,
  createTypeConfig,
  updateTypeConfig,
  deleteTypeConfig,
  type AppointmentTypeConfig,
  type CreateTypeConfigInput,
  type UpdateTypeConfigInput,
} from "@/lib/supabase/services/type-configs-service";

interface UseTypeConfigsOptions {
  doctorId: string;
}

export function useTypeConfigs({ doctorId }: UseTypeConfigsOptions) {
  const [configs, setConfigs]   = useState<AppointmentTypeConfig[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null); // id of row being saved
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    const result = await ensureDefaultTypeConfigs(doctorId);
    if (result.error) {
      setError(result.error);
    } else {
      setConfigs(result.data ?? []);
    }
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  const addConfig = useCallback(
    async (input: CreateTypeConfigInput) => {
      setSaving("new");
      const result = await createTypeConfig(doctorId, input);
      setSaving(null);
      if (result.error) return { error: result.error };
      await load();
      return { error: null };
    },
    [doctorId, load]
  );

  const editConfig = useCallback(
    async (id: string, updates: UpdateTypeConfigInput) => {
      setSaving(id);
      // Optimistic update
      setConfigs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      const result = await updateTypeConfig(id, updates);
      setSaving(null);
      if (result.error) {
        setError(result.error);
        await load(); // revert optimistic
      }
      return { error: result.error };
    },
    [load]
  );

  const removeConfig = useCallback(
    async (id: string) => {
      setSaving(id);
      // Optimistic remove
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      const result = await deleteTypeConfig(id);
      setSaving(null);
      if (result.error) {
        setError(result.error);
        await load(); // revert
      }
      return { error: result.error };
    },
    [load]
  );

  return { configs, loading, saving, error, load, addConfig, editConfig, removeConfig };
}
