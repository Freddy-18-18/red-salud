export interface MappedSpecialty {
  specialty_id: string;
  weight: number;
  reason: string;
}

export interface TriageSource {
  label: string;
  url: string;
  type?: "oms" | "ops" | "msds" | "sociedad" | "otro";
}

export type TriageReviewStatus =
  | "pending_medical_review"
  | "approved"
  | "needs_revision";

export interface SymptomTriage {
  id: string;
  slug: string;
  name: string;
  synonyms: string[];
  description: string | null;
  is_emergency: boolean;
  red_flags: string[];
  mapped_specialties: MappedSpecialty[];
  self_care: string[];
  when_to_seek_care: string | null;
  sources: TriageSource[];
  review_status: TriageReviewStatus;
}

export interface TriageSpecialtyEnriched extends MappedSpecialty {
  name: string;
  slug: string | null;
  doctor_count: number;
}

export interface TriageDetail {
  symptom: SymptomTriage;
  specialties: TriageSpecialtyEnriched[];
}

export interface TriageSearchHit {
  id: string;
  slug: string;
  name: string;
  is_emergency: boolean;
  matched_synonym: string | null;
}
