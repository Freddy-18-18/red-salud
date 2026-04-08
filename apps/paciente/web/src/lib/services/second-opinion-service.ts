import { supabase } from "@/lib/supabase/client";
import { fetchJson } from "@/lib/utils/fetch";

// --- Types ---

export type SecondOpinionStatus =
  | "pending"
  | "accepted"
  | "in_review"
  | "completed"
  | "declined";

export type ConsultationType = "remote" | "in_person";

export interface SecondOpinionRequest {
  id: string;
  patient_id: string;
  original_doctor_id: string;
  reviewing_doctor_id: string | null;
  original_diagnosis: string;
  original_medical_record_id: string | null;
  specialty_id: string;
  reason: string;
  patient_notes: string | null;
  reviewer_opinion: string | null;
  reviewer_diagnosis: string | null;
  agrees_with_original: boolean | null;
  status: SecondOpinionStatus;
  consultation_type: ConsultationType;
  fee: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  original_doctor?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  reviewing_doctor?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  specialty?: {
    id: string;
    name: string;
  };
  medical_record?: {
    id: string;
    diagnosis: string;
    notes: string | null;
    created_at: string;
  };
}

export interface MedicalRecordSummary {
  id: string;
  diagnosis: string;
  notes: string | null;
  created_at: string;
  doctor_id: string;
  doctor_name: string;
  specialty_name: string;
  specialty_id: string;
}

export interface ReviewerDoctor {
  id: string;
  profile_id: string;
  specialty_id: string;
  consultation_fee: number | null;
  years_experience: number | null;
  biografia: string | null;
  verified: boolean;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
  avg_rating: number | null;
  review_count: number;
}

export interface CreateSecondOpinionData {
  original_medical_record_id: string;
  original_doctor_id: string;
  original_diagnosis: string;
  specialty_id: string;
  reviewing_doctor_id: string;
  reason: string;
  patient_notes?: string;
  consultation_type: ConsultationType;
}

// --- Service ---

export const secondOpinionService = {
  /**
   * Get all second opinion requests for the current patient
   */
  async getPatientRequests(
    patientId: string
  ): Promise<SecondOpinionRequest[]> {
    const { data, error } = await supabase
      .from("second_opinion_requests")
      .select(
        `
        *,
        original_doctor:profiles!second_opinion_requests_original_doctor_id_fkey(id, full_name, avatar_url),
        reviewing_doctor:profiles!second_opinion_requests_reviewing_doctor_id_fkey(id, full_name, avatar_url),
        specialty:specialties!second_opinion_requests_specialty_id_fkey(id, name)
      `
      )
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as SecondOpinionRequest[];
  },

  /**
   * Get a single second opinion request by ID
   */
  async getRequestById(
    requestId: string
  ): Promise<SecondOpinionRequest | null> {
    const { data, error } = await supabase
      .from("second_opinion_requests")
      .select(
        `
        *,
        original_doctor:profiles!second_opinion_requests_original_doctor_id_fkey(id, full_name, avatar_url),
        reviewing_doctor:profiles!second_opinion_requests_reviewing_doctor_id_fkey(id, full_name, avatar_url),
        specialty:specialties!second_opinion_requests_specialty_id_fkey(id, name),
        medical_record:medical_records!second_opinion_requests_original_medical_record_id_fkey(id, diagnosis, notes, created_at)
      `
      )
      .eq("id", requestId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as SecondOpinionRequest | null;
  },

  /**
   * Get patient's medical records for the selection step
   */
  async getPatientMedicalRecords(
    patientId: string
  ): Promise<MedicalRecordSummary[]> {
    const { data, error } = await supabase
      .from("medical_records")
      .select(
        `
        id,
        diagnosis,
        notes,
        created_at,
        doctor_id,
        doctor:profiles!medical_records_doctor_id_fkey(full_name),
        specialty:specialties!medical_records_specialty_id_fkey(id, name)
      `
      )
      .eq("patient_id", patientId)
      .not("diagnosis", "is", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(
      (record: Record<string, unknown>) => {
        const doctor = record.doctor as { full_name: string } | null;
        const specialty = record.specialty as {
          id: string;
          name: string;
        } | null;

        return {
          id: record.id as string,
          diagnosis: record.diagnosis as string,
          notes: record.notes as string | null,
          created_at: record.created_at as string,
          doctor_id: record.doctor_id as string,
          doctor_name: doctor?.full_name || "Doctor",
          specialty_name: specialty?.name || "Especialidad",
          specialty_id: specialty?.id || "",
        };
      }
    );
  },

  /**
   * Get verified doctors for a specialty, excluding the original doctor
   */
  async getReviewerDoctors(
    specialtyId: string,
    excludeDoctorId: string
  ): Promise<ReviewerDoctor[]> {
    const doctors = await fetchJson<Record<string, unknown>[]>(
      `/api/doctors/search?specialty_id=${specialtyId}&page_size=50`
    );

    if (!doctors || doctors.length === 0) return [];

    return doctors
      .filter((d) => {
        const profile = d.profile as Record<string, unknown> | null;
        return profile?.id !== excludeDoctorId;
      })
      .map((d) => {
        const profile = d.profile as {
          id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
        } | null;

        const specialty = d.specialty as {
          id: string;
          name: string;
        } | null;

        return {
          id: d.id as string,
          profile_id: (d.user_id as string) ?? "",
          specialty_id: specialty?.id ?? specialtyId,
          consultation_fee: d.consultation_fee
            ? parseFloat(d.consultation_fee as string)
            : null,
          years_experience: (d.years_experience as number) || null,
          biografia: (d.biography as string) || null,
          verified: true,
          profile: {
            id: profile?.id ?? "",
            full_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
            avatar_url: profile?.avatar_url ?? null,
            city: (d.city as string) ?? null,
            state: null,
          },
          avg_rating: (d.avg_rating as number) ?? null,
          review_count: (d.review_count as number) ?? 0,
        };
      });
  },

  /**
   * Create a new second opinion request
   */
  async createRequest(
    patientId: string,
    data: CreateSecondOpinionData
  ): Promise<SecondOpinionRequest> {
    const { data: request, error } = await supabase
      .from("second_opinion_requests")
      .insert({
        patient_id: patientId,
        original_doctor_id: data.original_doctor_id,
        reviewing_doctor_id: data.reviewing_doctor_id,
        original_diagnosis: data.original_diagnosis,
        original_medical_record_id: data.original_medical_record_id,
        specialty_id: data.specialty_id,
        reason: data.reason,
        patient_notes: data.patient_notes || null,
        consultation_type: data.consultation_type,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "second_opinion_requested",
      description: "Solicitud de segunda opinion medica creada",
      status: "success",
    });

    return request as unknown as SecondOpinionRequest;
  },

  /**
   * Subscribe to real-time updates for a specific request
   */
  subscribeToRequest(
    requestId: string,
    onUpdate: (request: SecondOpinionRequest) => void
  ) {
    const channel = supabase
      .channel(`second-opinion-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "second_opinion_requests",
          filter: `id=eq.${requestId}`,
        },
        async () => {
          // Refetch with joined data
          const updated = await secondOpinionService.getRequestById(
            requestId
          );
          if (updated) onUpdate(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to real-time updates for all patient requests
   */
  subscribeToPatientRequests(
    patientId: string,
    onUpdate: () => void
  ) {
    const channel = supabase
      .channel(`second-opinions-patient-${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "second_opinion_requests",
          filter: `patient_id=eq.${patientId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
