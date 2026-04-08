import { fetchJson, postJson } from "@/lib/utils/fetch";

// ── Types ─────────────────────────────────────────────────────────────

export type ReferralStatus = "pending" | "scheduled" | "completed" | "expired";
export type ReferralUrgency = "urgente" | "prioritario" | "electivo";

export interface ReferralDoctor {
  id: string;
  consultation_fee: number | null;
  years_experience?: number | null;
  biografia?: string | null;
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    phone?: string | null;
  };
  specialty: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export interface ReferralTargetSpecialty {
  id: string;
  name: string;
  icon: string | null;
}

export interface MedicalReferral {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  specialist_doctor_id: string | null;
  specialty_id: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  reason: string;
  diagnosis: string | null;
  clinical_notes: string | null;
  expires_at: string | null;
  scheduled_appointment_id: string | null;
  created_at: string;
  updated_at: string;
  referring_doctor: ReferralDoctor;
  specialist: ReferralDoctor | null;
  target_specialty: ReferralTargetSpecialty;
}

export interface MedicalReferralDetail extends MedicalReferral {
  attached_documents: AttachedDocument[] | null;
}

export interface AttachedDocument {
  name: string;
  url: string;
  type: string;
}

// ── Service ───────────────────────────────────────────────────────────

export const medicalReferralService = {
  /**
   * List all medical referrals for the authenticated patient.
   * Optional status filter.
   */
  async getReferrals(status?: ReferralStatus): Promise<MedicalReferral[]> {
    const params = new URLSearchParams();
    if (status) params.set("status", status);

    const qs = params.toString();
    return fetchJson<MedicalReferral[]>(`/api/referrals${qs ? `?${qs}` : ""}`);
  },

  /**
   * Get full detail for a single medical referral.
   */
  async getReferralDetail(id: string): Promise<MedicalReferralDetail> {
    return fetchJson<MedicalReferralDetail>(`/api/referrals/${id}`);
  },

  /**
   * Update the status of a medical referral.
   * Used when the patient books an appointment (→ scheduled) or completes it.
   */
  async updateReferralStatus(
    id: string,
    status: "scheduled" | "completed",
    scheduledAppointmentId?: string,
  ): Promise<MedicalReferral> {
    return postJson<MedicalReferral>(
      `/api/referrals/${id}`,
      {
        status,
        scheduled_appointment_id: scheduledAppointmentId,
      },
      "PATCH",
    );
  },
};
