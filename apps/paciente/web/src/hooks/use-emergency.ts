import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createEmergencyRequest,
  cancelEmergencyRequest,
  getEmergencyHistory,
  getMedicalSummary,
  getFamilyMembers,
  subscribeToEmergencyStatus,
  type EmergencyRequest,
  type EmergencyPriority,
  type EmergencyLocation,
  type MedicalSummary,
  type FamilyMember,
  type CreateEmergencyData,
} from "@/lib/services/emergency-service";

// --- Offline queue for when there is no internet ---

interface QueuedRequest {
  data: CreateEmergencyData;
  timestamp: number;
}

const QUEUE_KEY = "emergency_offline_queue";

function getOfflineQueue(): QueuedRequest[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToOfflineQueue(data: CreateEmergencyData) {
  const queue = getOfflineQueue();
  queue.push({ data, timestamp: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

// --- Geolocation helper ---

export function useGeolocation() {
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no disponible en este dispositivo");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Attempt reverse-geocode via Nominatim (best-effort, no API key needed)
        let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "es" } }
          );
          if (res.ok) {
            const json = await res.json();
            if (json.display_name) {
              address = json.display_name;
            }
          }
        } catch {
          // Keep the coordinate string as fallback
        }

        setLocation({ lat: latitude, lng: longitude, address });
        setLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Permiso de ubicación denegado. Actívalo en la configuración.",
          2: "No se pudo determinar tu ubicación.",
          3: "La solicitud de ubicación expiró. Intentá de nuevo.",
        };
        setError(messages[err.code] || "Error al obtener ubicación");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { location, setLocation, loading, error, requestLocation };
}

// --- Main emergency hook ---

export type EmergencyStep =
  | "idle"
  | "who"
  | "priority"
  | "location"
  | "requesting"
  | "tracking";

export function useEmergency(userId: string | undefined) {
  // Flow state — local UI state, stays as useState
  const [step, setStep] = useState<EmergencyStep>("idle");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null); // null = self
  const [priority, setPriority] = useState<EmergencyPriority | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);

  const queryClient = useQueryClient();
  const unsubRef = useRef<(() => void) | null>(null);

  // Family members → useQuery
  const familyMembersQuery = useQuery({
    queryKey: ["emergency", "family-members", userId],
    queryFn: async () => {
      if (!userId) return [];
      const result = await getFamilyMembers(userId);
      return result.data;
    },
    enabled: !!userId,
  });

  // Medical summary → useQuery (enabled when flow starts)
  const medicalSummaryQuery = useQuery({
    queryKey: ["emergency", "medical-summary", userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await getMedicalSummary(userId);
      return result.data;
    },
    enabled: !!userId && step !== "idle",
  });

  // Emergency history → useQuery
  const historyQuery = useQuery({
    queryKey: ["emergency", "history", userId],
    queryFn: async () => {
      if (!userId) return [];
      const result = await getEmergencyHistory(userId);
      return result.data;
    },
    enabled: !!userId,
  });

  const familyMembers = familyMembersQuery.data ?? [];
  const medicalSummary = medicalSummaryQuery.data ?? null;
  const history = historyQuery.data ?? [];

  // Flush offline queue when we come online
  useEffect(() => {
    const flush = async () => {
      const queue = getOfflineQueue();
      if (queue.length === 0) return;

      for (const item of queue) {
        await createEmergencyRequest(item.data);
      }
      clearOfflineQueue();
    };

    window.addEventListener("online", flush);
    // Try immediately on mount in case we're already online with a pending queue
    if (navigator.onLine) flush();

    return () => window.removeEventListener("online", flush);
  }, []);

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  // --- Actions ---

  const startEmergency = useCallback(() => {
    setStep("who");
  }, []);

  const selectPerson = useCallback((familyMemberId: string | null) => {
    setSelectedPerson(familyMemberId);
    setStep("priority");
  }, []);

  const selectPriority = useCallback((p: EmergencyPriority, symptomText: string) => {
    setPriority(p);
    setSymptoms(symptomText);
    setStep("location");
  }, []);

  const confirmLocation = useCallback((loc: EmergencyLocation) => {
    setLocation(loc);
  }, []);

  const reset = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    setStep("idle");
    setSelectedPerson(null);
    setPriority(null);
    setSymptoms("");
    setLocation(null);
    setActiveRequest(null);
  }, []);

  // Submit request → useMutation
  const submitMutation = useMutation({
    mutationFn: async (data: CreateEmergencyData) => {
      return createEmergencyRequest(data);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setActiveRequest(result.data);
        setStep("tracking");

        // Subscribe to realtime updates
        unsubRef.current?.();
        unsubRef.current = subscribeToEmergencyStatus(result.data.id, (updated) => {
          setActiveRequest(updated);
          // Auto-transition to idle when completed or cancelled
          if (updated.status === "completed" || updated.status === "cancelled") {
            setTimeout(() => reset(), 3000);
          }
        });
      }
    },
  });

  const submitRequest = useCallback(async () => {
    if (!userId || !priority || !location) return;

    setStep("requesting");

    const requestData: CreateEmergencyData = {
      patientId: userId,
      familyMemberId: selectedPerson || undefined,
      priority,
      location,
      symptoms,
    };

    // If offline, queue for later
    if (!navigator.onLine) {
      addToOfflineQueue(requestData);
      return;
    }

    const result = await submitMutation.mutateAsync(requestData);

    if (!result.success) {
      setStep("location"); // Go back to let them retry
    }
  }, [userId, priority, location, symptoms, selectedPerson, submitMutation, reset]);

  // Cancel request → useMutation
  const cancelMutation = useMutation({
    mutationFn: async ({
      requestId,
      patientId,
    }: {
      requestId: string;
      patientId: string;
    }) => {
      return cancelEmergencyRequest(requestId, patientId);
    },
    onSuccess: (_result, variables) => {
      setActiveRequest((prev) => prev ? { ...prev, status: "cancelled" } : null);
      setTimeout(() => reset(), 1500);
    },
  });

  const cancelRequest = useCallback(async () => {
    if (!activeRequest || !userId) return;
    const result = await cancelMutation.mutateAsync({
      requestId: activeRequest.id,
      patientId: userId,
    });
    if (!result.success) {
      // Error handled via mutation state
    }
  }, [activeRequest, userId, cancelMutation, reset]);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    await historyQuery.refetch();
  }, [userId, historyQuery]);

  const isLoading =
    submitMutation.isPending ||
    cancelMutation.isPending ||
    familyMembersQuery.isLoading ||
    medicalSummaryQuery.isLoading;
  const error =
    submitMutation.error?.message ??
    cancelMutation.error?.message ??
    familyMembersQuery.error?.message ??
    medicalSummaryQuery.error?.message ??
    null;

  return {
    // State
    step,
    selectedPerson,
    priority,
    symptoms,
    location,
    familyMembers,
    medicalSummary,
    activeRequest,
    history,
    loading: isLoading,
    error,

    // Actions
    startEmergency,
    selectPerson,
    selectPriority,
    confirmLocation,
    setLocation,
    submitRequest,
    cancelRequest,
    reset,
    loadHistory,
    setStep,
  };
}
