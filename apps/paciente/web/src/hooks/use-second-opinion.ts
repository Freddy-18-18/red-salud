import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  secondOpinionService,
  type SecondOpinionRequest,
  type MedicalRecordSummary,
  type ReviewerDoctor,
  type ConsultationType,
} from "@/lib/services/second-opinion-service";

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
  const [requests, setRequests] = useState<SecondOpinionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadRequests = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await secondOpinionService.getPatientRequests(patientId);
      setRequests(data);
    } catch (err) {
      console.error("Error loading second opinion requests:", err);
      setError("No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadRequests(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [loadRequests]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = secondOpinionService.subscribeToPatientRequests(
      userId,
      () => {
        loadRequests(userId);
      }
    );

    return unsubscribe;
  }, [userId, loadRequests]);

  return { requests, loading, error, refresh: () => userId && loadRequests(userId) };
}

export function useSecondOpinionDetail(requestId: string) {
  const [request, setRequest] = useState<SecondOpinionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await secondOpinionService.getRequestById(requestId);
        setRequest(data);
      } catch (err) {
        console.error("Error loading request detail:", err);
        setError("No se pudo cargar la solicitud");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  // Real-time subscription
  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = secondOpinionService.subscribeToRequest(
      requestId,
      (updated) => {
        setRequest(updated);
      }
    );

    return unsubscribe;
  }, [requestId]);

  return { request, loading, error };
}

// --- Hook: Request Flow ---

export function useSecondOpinionFlow() {
  const [state, setState] = useState<RequestFlowState>(INITIAL_FLOW_STATE);
  const [userId, setUserId] = useState<string | null>(null);

  // Data for steps
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordSummary[]>(
    []
  );
  const [specialties, setSpecialties] = useState<
    { id: string; name: string }[]
  >([]);
  const [reviewerDoctors, setReviewerDoctors] = useState<ReviewerDoctor[]>([]);

  // Loading states
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

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

  // Load medical records on mount
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoadingRecords(true);
      try {
        const data =
          await secondOpinionService.getPatientMedicalRecords(userId);
        setMedicalRecords(data);

        // Extract unique specialties from records
        const uniqueSpecialties = new Map<string, string>();
        data.forEach((r) => {
          if (r.specialty_id) {
            uniqueSpecialties.set(r.specialty_id, r.specialty_name);
          }
        });
        setSpecialties(
          Array.from(uniqueSpecialties.entries()).map(([id, name]) => ({
            id,
            name,
          }))
        );
      } catch (err) {
        console.error("Error loading medical records:", err);
        setError("No se pudieron cargar tus registros medicos");
      } finally {
        setLoadingRecords(false);
      }
    };
    load();
  }, [userId]);

  // Load reviewer doctors when specialty changes
  useEffect(() => {
    if (!state.selectedSpecialtyId || !state.selectedRecord) {
      setReviewerDoctors([]);
      return;
    }

    const load = async () => {
      setLoadingDoctors(true);
      setError(null);
      try {
        const data = await secondOpinionService.getReviewerDoctors(
          state.selectedSpecialtyId!,
          state.selectedRecord!.doctor_id
        );
        setReviewerDoctors(data);
      } catch (err) {
        console.error("Error loading reviewer doctors:", err);
        setError("No se pudieron cargar los doctores disponibles");
      } finally {
        setLoadingDoctors(false);
      }
    };
    load();
  }, [state.selectedSpecialtyId, state.selectedRecord]);

  // --- Actions ---

  const selectRecord = useCallback((record: MedicalRecordSummary) => {
    setState((prev) => ({
      ...prev,
      selectedRecord: record,
      // Auto-select specialty from the record
      selectedSpecialtyId: record.specialty_id,
      selectedSpecialtyName: record.specialty_name,
      selectedDoctor: null,
    }));
  }, []);

  const selectSpecialty = useCallback(
    (id: string, name: string) => {
      setState((prev) => ({
        ...prev,
        selectedSpecialtyId: id,
        selectedSpecialtyName: name,
        selectedDoctor: null,
      }));
    },
    []
  );

  const selectDoctor = useCallback((doctor: ReviewerDoctor) => {
    setState((prev) => ({ ...prev, selectedDoctor: doctor }));
  }, []);

  const setReason = useCallback((reason: string) => {
    setState((prev) => ({ ...prev, reason }));
  }, []);

  const setPatientNotes = useCallback((patientNotes: string) => {
    setState((prev) => ({ ...prev, patientNotes }));
  }, []);

  const setConsultationType = useCallback((consultationType: ConsultationType) => {
    setState((prev) => ({ ...prev, consultationType }));
  }, []);

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
    if (
      !userId ||
      !state.selectedRecord ||
      !state.selectedSpecialtyId ||
      !state.selectedDoctor ||
      !state.reason.trim()
    ) {
      setError("Faltan datos para enviar la solicitud");
      return null;
    }

    setLoadingSubmit(true);
    setError(null);

    try {
      const result = await secondOpinionService.createRequest(userId, {
        original_medical_record_id: state.selectedRecord.id,
        original_doctor_id: state.selectedRecord.doctor_id,
        original_diagnosis: state.selectedRecord.diagnosis,
        specialty_id: state.selectedSpecialtyId,
        reviewing_doctor_id: state.selectedDoctor.profile_id,
        reason: state.reason,
        patient_notes: state.patientNotes || undefined,
        consultation_type: state.consultationType,
      });

      return result.id;
    } catch (err) {
      console.error("Error creating second opinion request:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la solicitud. Intenta de nuevo."
      );
      return null;
    } finally {
      setLoadingSubmit(false);
    }
  }, [userId, state]);

  const resetFlow = useCallback(() => {
    setState(INITIAL_FLOW_STATE);
    setReviewerDoctors([]);
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
    reviewerDoctors,

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
