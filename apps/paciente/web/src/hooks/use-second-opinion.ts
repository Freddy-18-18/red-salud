import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

import {
  secondOpinionService,
  type MedicalRecordSummary,
  type ReviewerDoctor,
  type ConsultationType,
} from "@/lib/services/second-opinion-service";
import { supabase } from "@/lib/supabase/client";

// --- Types ---

export type RequestStep =
  | "record"
  | "specialty"
  | "doctor"
  | "reason"
  | "type"
  | "review";

export interface RequestFlowState {
  step: RequestStep;
  selectedRecord: MedicalRecordSummary | null;
  selectedSpecialtyId: string | null;
  selectedSpecialtyName: string | null;
  selectedDoctor: ReviewerDoctor | null;
  reason: string;
  patientNotes: string;
  consultationType: ConsultationType;
}

const INITIAL_FLOW_STATE: RequestFlowState = {
  step: "record",
  selectedRecord: null,
  selectedSpecialtyId: null,
  selectedSpecialtyName: null,
  selectedDoctor: null,
  reason: "",
  patientNotes: "",
  consultationType: "remote",
};

const STEP_ORDER: RequestStep[] = [
  "record",
  "specialty",
  "doctor",
  "reason",
  "type",
  "review",
];

// --- Hook: List & Detail ---

export function useSecondOpinionList() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const {
    data,
    isFetching,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["secondOpinionRequests", userId],
    queryFn: async () => {
      return await secondOpinionService.getPatientRequests(userId!);
    },
    enabled: !!userId,
  });

  // Real-time subscription stays as useEffect
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = secondOpinionService.subscribeToPatientRequests(
      userId,
      () => {
        queryClient.invalidateQueries({
          queryKey: ["secondOpinionRequests", userId],
        });
      }
    );

    return unsubscribe;
  }, [userId, queryClient]);

  return {
    requests: data ?? [],
    loading: isFetching,
    error: error ? "No se pudieron cargar las solicitudes" : null,
    refresh: () => userId && refresh(),
  };
}

export function useSecondOpinionDetail(requestId: string) {
  const queryClient = useQueryClient();

  const { data, isFetching, error } = useQuery({
    queryKey: ["secondOpinionRequest", requestId],
    queryFn: async () => {
      return await secondOpinionService.getRequestById(requestId);
    },
    enabled: !!requestId,
  });

  // Real-time subscription stays as useEffect
  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = secondOpinionService.subscribeToRequest(
      requestId,
      (updated) => {
        queryClient.setQueryData(
          ["secondOpinionRequest", requestId],
          updated
        );
      }
    );

    return unsubscribe;
  }, [requestId, queryClient]);

  return {
    request: data ?? null,
    loading: isFetching,
    error: error ? "No se pudo cargar la solicitud" : null,
  };
}

// --- Hook: Request Flow ---

export function useSecondOpinionFlow() {
  const [state, setState] = useState<RequestFlowState>(INITIAL_FLOW_STATE);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  // Load medical records + extract specialties
  const {
    data: recordsData,
    isFetching: loadingRecords,
  } = useQuery({
    queryKey: ["patientMedicalRecords", userId],
    queryFn: async () => {
      const data =
        await secondOpinionService.getPatientMedicalRecords(userId!);
      return data;
    },
    enabled: !!userId,
  });

  const medicalRecords = recordsData ?? [];

  const specialties = (() => {
    if (!recordsData) return [];
    const unique = new Map<string, string>();
    recordsData.forEach((r) => {
      if (r.specialty_id) {
        unique.set(r.specialty_id, r.specialty_name);
      }
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  })();

  // Load reviewer doctors when specialty changes
  const {
    data: reviewerDoctors,
    isFetching: loadingDoctors,
  } = useQuery({
    queryKey: [
      "reviewerDoctors",
      state.selectedSpecialtyId,
      state.selectedRecord?.doctor_id,
    ],
    queryFn: async () => {
      return await secondOpinionService.getReviewerDoctors(
        state.selectedSpecialtyId!,
        state.selectedRecord!.doctor_id
      );
    },
    enabled: !!state.selectedSpecialtyId && !!state.selectedRecord,
  });

  // Submit mutation
  const { mutateAsync: submitMutation, isPending: loadingSubmit } =
    useMutation({
      mutationFn: async () => {
        if (
          !userId ||
          !state.selectedRecord ||
          !state.selectedSpecialtyId ||
          !state.selectedDoctor ||
          !state.reason.trim()
        ) {
          throw new Error("Faltan datos para enviar la solicitud");
        }

        return await secondOpinionService.createRequest(userId, {
          original_medical_record_id: state.selectedRecord.id,
          original_doctor_id: state.selectedRecord.doctor_id,
          original_diagnosis: state.selectedRecord.diagnosis,
          specialty_id: state.selectedSpecialtyId,
          reviewing_doctor_id: state.selectedDoctor.profile_id,
          reason: state.reason,
          patient_notes: state.patientNotes || undefined,
          consultation_type: state.consultationType,
        });
      },
    });

  // --- Actions ---

  const selectRecord = useCallback((record: MedicalRecordSummary) => {
    setState((prev) => ({
      ...prev,
      selectedRecord: record,
      selectedSpecialtyId: record.specialty_id,
      selectedSpecialtyName: record.specialty_name,
      selectedDoctor: null,
    }));
  }, []);

  const selectSpecialty = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      selectedSpecialtyId: id,
      selectedSpecialtyName: name,
      selectedDoctor: null,
    }));
  }, []);

  const selectDoctor = useCallback((doctor: ReviewerDoctor) => {
    setState((prev) => ({ ...prev, selectedDoctor: doctor }));
  }, []);

  const setReason = useCallback((reason: string) => {
    setState((prev) => ({ ...prev, reason }));
  }, []);

  const setPatientNotes = useCallback((patientNotes: string) => {
    setState((prev) => ({ ...prev, patientNotes }));
  }, []);

  const setConsultationType = useCallback(
    (consultationType: ConsultationType) => {
      setState((prev) => ({ ...prev, consultationType }));
    },
    []
  );

  const goToStep = useCallback((step: RequestStep) => {
    setState((prev) => ({ ...prev, step }));
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step);
      if (currentIndex < STEP_ORDER.length - 1) {
        return { ...prev, step: STEP_ORDER[currentIndex + 1] };
      }
      return prev;
    });
    setError(null);
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step);
      if (currentIndex > 0) {
        return { ...prev, step: STEP_ORDER[currentIndex - 1] };
      }
      return prev;
    });
    setError(null);
  }, []);

  const submitRequest = useCallback(async (): Promise<string | null> => {
    setError(null);
    try {
      const result = await submitMutation();
      return result.id;
    } catch (err) {
      console.error("Error creating second opinion request:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la solicitud. Intenta de nuevo."
      );
      return null;
    }
  }, [submitMutation]);

  const resetFlow = useCallback(() => {
    setState(INITIAL_FLOW_STATE);
    setError(null);
  }, []);

  const currentStepIndex = STEP_ORDER.indexOf(state.step);
  const totalSteps = STEP_ORDER.length;

  return {
    // State
    state,
    currentStepIndex,
    totalSteps,

    // Data
    medicalRecords,
    specialties,
    reviewerDoctors: reviewerDoctors ?? [],

    // Loading
    loadingRecords,
    loadingDoctors,
    loadingSubmit,

    // Error
    error,

    // Actions
    selectRecord,
    selectSpecialty,
    selectDoctor,
    setReason,
    setPatientNotes,
    setConsultationType,
    goToStep,
    nextStep,
    prevStep,
    submitRequest,
    resetFlow,
  };
}
