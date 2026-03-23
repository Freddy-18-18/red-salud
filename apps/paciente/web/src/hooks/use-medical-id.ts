import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  medicalIdService,
  type MedicalIdData,
  type QRPreferences,
  DEFAULT_PREFERENCES,
} from "@/lib/services/medical-id-service";

export function useMedicalId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [medicalData, setMedicalData] = useState<MedicalIdData | null>(null);
  const [preferences, setPreferences] = useState<QRPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  // Load medical data and preferences
  const loadAll = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const [data, prefs] = await Promise.all([
        medicalIdService.getMedicalIdData(userId),
        medicalIdService.getPreferences(userId),
      ]);
      setMedicalData(data);
      setPreferences(prefs);
    } catch {
      setError("No se pudo cargar la informacion medica");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadAll();
  }, [userId, loadAll]);

  // Generate QR payload
  const qrPayload = medicalData
    ? medicalIdService.generateQRPayload(medicalData, preferences)
    : null;

  // Generate QR URL (for the QR to encode)
  const qrUrl = medicalData
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/id/${medicalData.patient_id}`
    : null;

  // Full QR content: URL + embedded data as fragment for offline
  const qrContent = qrPayload && qrUrl ? `${qrUrl}#${qrPayload}` : null;

  // Update preferences
  const updatePreferences = useCallback(
    async (
      newPrefs: Partial<QRPreferences>
    ): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };

      const merged = { ...preferences, ...newPrefs };
      const snapshot = { ...preferences };
      setPreferences(merged);

      setSaving(true);
      try {
        await medicalIdService.updatePreferences(userId, merged);
        return { success: true };
      } catch {
        setPreferences(snapshot);
        setError("No se pudieron guardar las preferencias");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId, preferences]
  );

  // Update medical info
  const updateMedicalInfo = useCallback(
    async (
      data: Parameters<typeof medicalIdService.updateMedicalInfo>[1]
    ): Promise<{ success: boolean }> => {
      if (!userId) return { success: false };

      setSaving(true);
      setError(null);
      try {
        await medicalIdService.updateMedicalInfo(userId, data);
        // Reload to get fresh data
        const fresh = await medicalIdService.getMedicalIdData(userId);
        setMedicalData(fresh);
        return { success: true };
      } catch {
        setError("No se pudo actualizar la informacion medica");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  return {
    userId,
    medicalData,
    preferences,
    qrPayload,
    qrUrl,
    qrContent,
    loading,
    saving,
    error,
    updatePreferences,
    updateMedicalInfo,
    refresh: loadAll,
  };
}
