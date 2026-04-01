import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

import {
  medicalIdService,
  type QRPreferences,
  DEFAULT_PREFERENCES,
} from "@/lib/services/medical-id-service";
import { supabase } from "@/lib/supabase/client";

export function useMedicalId() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── User ID query ───────────────────────────────────────────────────────

  const { data: userId } = useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  // ── Data queries ────────────────────────────────────────────────────────

  const { data: medicalData, isLoading: loadingMedical } = useQuery({
    queryKey: ["medical-id-data", userId],
    queryFn: () => medicalIdService.getMedicalIdData(userId!),
    enabled: !!userId,
  });

  const { data: preferences, isLoading: loadingPrefs } = useQuery({
    queryKey: ["medical-id-prefs", userId],
    queryFn: () => medicalIdService.getPreferences(userId!),
    enabled: !!userId,
  });

  const loading = loadingMedical || loadingPrefs;

  // ── Mutations ───────────────────────────────────────────────────────────

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs: QRPreferences) => {
      await medicalIdService.updatePreferences(userId!, newPrefs);
    },
    onMutate: (newPrefs) => {
      queryClient.setQueryData(["medical-id-prefs", userId], newPrefs);
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["medical-id-prefs", userId],
      });
      setError("No se pudieron guardar las preferencias");
    },
  });

  const updateMedicalInfoMutation = useMutation({
    mutationFn: async (
      data: Parameters<typeof medicalIdService.updateMedicalInfo>[1]
    ) => {
      await medicalIdService.updateMedicalInfo(userId!, data);
      return medicalIdService.getMedicalIdData(userId!);
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: (freshData) => {
      queryClient.setQueryData(["medical-id-data", userId], freshData);
    },
    onError: () => {
      setError("No se pudo actualizar la informacion medica");
    },
  });

  // ── Actions ─────────────────────────────────────────────────────────────

  const updatePreferences = useCallback(
    async (
      newPrefs: Partial<QRPreferences>
    ): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };

      const currentPrefs =
        queryClient.getQueryData<QRPreferences>(["medical-id-prefs", userId]) ??
        DEFAULT_PREFERENCES;
      const merged = { ...currentPrefs, ...newPrefs };

      setSaving(true);
      try {
        await updatePreferencesMutation.mutateAsync(merged);
        return { success: true };
      } catch {
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId, queryClient, updatePreferencesMutation]
  );

  const updateMedicalInfo = useCallback(
    async (
      data: Parameters<typeof medicalIdService.updateMedicalInfo>[1]
    ): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };

      setSaving(true);
      try {
        await updateMedicalInfoMutation.mutateAsync(data);
        return { success: true };
      } catch {
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId, updateMedicalInfoMutation]
  );

  // ── Computed ────────────────────────────────────────────────────────────

  const qrPayload =
    medicalData && preferences
      ? medicalIdService.generateQRPayload(medicalData, preferences)
      : null;

  const qrUrl = medicalData
    ? `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/id/${medicalData.patient_id}`
    : null;

  const qrContent =
    qrPayload && qrUrl ? `${qrUrl}#${qrPayload}` : null;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["medical-id-data", userId] });
    queryClient.invalidateQueries({ queryKey: ["medical-id-prefs", userId] });
  }, [queryClient, userId]);

  return {
    userId: userId ?? null,
    medicalData: medicalData ?? null,
    preferences: preferences ?? DEFAULT_PREFERENCES,
    qrPayload,
    qrUrl,
    qrContent,
    loading,
    saving,
    error,
    updatePreferences,
    updateMedicalInfo,
    refresh,
  };
}
