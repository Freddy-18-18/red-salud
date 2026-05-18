// New referral model — specialty-targeted, consent-based.
// The referring doctor is preserved for audit (visible only to the patient who
// owns the referral). The destination is a SPECIALTY, never a specific doctor.

export type ReferralStatus =
  | "pending_consent"
  | "active"
  | "used"
  | "completed"
  | "expired"
  | "declined";

export type ReferralUrgency = "electivo" | "prioritario" | "urgente";

export interface ReferralReferringDoctor {
  id: string;
  slug: string | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  };
  specialty: {
    id: string;
    name: string;
  } | null;
}

export interface ReferralTargetSpecialty {
  id: string;
  name: string;
  slug: string | null;
  icon: string | null;
}

export interface AttachedDocument {
  id?: string;
  name: string;
  url: string;
  type: string;
}

export interface MedicalReferral {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  specialty_id: string;
  reason: string;
  diagnosis: string | null;
  clinical_notes: string | null;
  exams_recommended: string[];
  attached_documents: AttachedDocument[] | null;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  patient_consent_given: boolean;
  patient_consent_at: string | null;
  share_referrer_identity: boolean;
  used_appointment_id: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  referring_doctor: ReferralReferringDoctor;
  target_specialty: ReferralTargetSpecialty;
  has_duplicate?: boolean;
}

export type MedicalReferralDetail = MedicalReferral;

export interface ReferralShare {
  id: string;
  referral_id: string;
  token: string;
  share_referrer_identity: boolean;
  recipient_label: string | null;
  expires_at: string;
  revoked_at: string | null;
  accessed_count: number;
  last_accessed_at: string | null;
  created_at: string;
  url?: string;
}

export interface ReferralMessage {
  id: string;
  sender_id: string;
  sender_role: "patient" | "referring_doctor";
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface PatientDocumentSummary {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string;
  status: string;
  uploaded_at: string | null;
  created_at: string;
}

export interface ReferralAuditEntry {
  id: string;
  actor_id: string | null;
  actor_role: "patient" | "referring_doctor" | "system";
  action: string;
  from_status: string | null;
  to_status: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error ?? "Error en la solicitud");
  }
  return json.data as T;
}

export const medicalReferralService = {
  async getReferrals(status?: ReferralStatus): Promise<MedicalReferral[]> {
    const url = status
      ? `/api/referrals?status=${encodeURIComponent(status)}`
      : "/api/referrals";
    const res = await fetch(url, { credentials: "include" });
    return jsonOrThrow<MedicalReferral[]>(res);
  },

  async getReferralDetail(id: string): Promise<MedicalReferralDetail> {
    const res = await fetch(`/api/referrals/${id}`, {
      credentials: "include",
    });
    return jsonOrThrow<MedicalReferralDetail>(res);
  },

  async consent(
    id: string,
    shareReferrerIdentity: boolean,
  ): Promise<MedicalReferral> {
    const res = await fetch(`/api/referrals/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "consent",
        share_referrer_identity: shareReferrerIdentity,
      }),
    });
    return jsonOrThrow<MedicalReferral>(res);
  },

  async decline(id: string): Promise<MedicalReferral> {
    const res = await fetch(`/api/referrals/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline" }),
    });
    return jsonOrThrow<MedicalReferral>(res);
  },

  async updateSharePreference(
    id: string,
    shareReferrerIdentity: boolean,
  ): Promise<MedicalReferral> {
    const res = await fetch(`/api/referrals/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ share_referrer_identity: shareReferrerIdentity }),
    });
    return jsonOrThrow<MedicalReferral>(res);
  },

  // Sharing

  async listShares(referralId: string): Promise<ReferralShare[]> {
    const res = await fetch(`/api/referrals/${referralId}/shares`, {
      credentials: "include",
    });
    return jsonOrThrow<ReferralShare[]>(res);
  },

  async createShare(
    referralId: string,
    opts: {
      shareReferrerIdentity: boolean;
      recipientLabel?: string;
      expiresInHours: number;
    },
  ): Promise<ReferralShare> {
    const res = await fetch(`/api/referrals/${referralId}/shares`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        share_referrer_identity: opts.shareReferrerIdentity,
        recipient_label: opts.recipientLabel ?? null,
        expires_in_hours: opts.expiresInHours,
      }),
    });
    return jsonOrThrow<ReferralShare>(res);
  },

  async revokeShare(referralId: string, shareId: string): Promise<void> {
    const res = await fetch(
      `/api/referrals/${referralId}/shares?share_id=${encodeURIComponent(shareId)}`,
      { method: "DELETE", credentials: "include" },
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error ?? "No se pudo revocar el enlace");
    }
  },

  // Messaging

  async listMessages(referralId: string): Promise<ReferralMessage[]> {
    const res = await fetch(`/api/referrals/${referralId}/messages`, {
      credentials: "include",
    });
    return jsonOrThrow<ReferralMessage[]>(res);
  },

  async sendMessage(
    referralId: string,
    body: string,
  ): Promise<ReferralMessage> {
    const res = await fetch(`/api/referrals/${referralId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    return jsonOrThrow<ReferralMessage>(res);
  },

  // Documents

  async listAttachableDocuments(): Promise<PatientDocumentSummary[]> {
    const res = await fetch("/api/patient-documents", {
      credentials: "include",
    });
    return jsonOrThrow<PatientDocumentSummary[]>(res);
  },

  async attachDocuments(
    referralId: string,
    documentIds: string[],
  ): Promise<{ attached: AttachedDocument[] }> {
    const res = await fetch(`/api/referrals/${referralId}/documents`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_ids: documentIds }),
    });
    return jsonOrThrow<{ attached: AttachedDocument[] }>(res);
  },

  async uploadDocument(file: File): Promise<PatientDocumentSummary> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/patient-documents", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    return jsonOrThrow<PatientDocumentSummary>(res);
  },

  // Audit timeline

  async listAudit(referralId: string): Promise<ReferralAuditEntry[]> {
    const res = await fetch(`/api/referrals/${referralId}/audit`, {
      credentials: "include",
    });
    return jsonOrThrow<ReferralAuditEntry[]>(res);
  },
};
