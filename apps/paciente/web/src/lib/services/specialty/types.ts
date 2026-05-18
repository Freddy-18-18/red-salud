export interface SpecialtyCatalog {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  active: boolean | null;
}

export interface SpecialtyProcedure {
  name?: string;
  description?: string;
  typical_duration_minutes?: number;
  typical_cost_range_usd?: string;
}

export interface SpecialtyFaq {
  question: string;
  answer: string;
}

export interface SpecialtySource {
  label: string;
  url: string;
  type?: "oms" | "ops" | "msds" | "sociedad" | "otro";
}

export type SpecialtyReviewStatus =
  | "pending_medical_review"
  | "approved"
  | "needs_revision";

export interface SpecialtyEducation {
  intro: string | null;
  when_to_consult: string | null;
  what_to_expect: string | null;
  what_it_treats: string[];
  symptoms_to_consult: string[];
  preparation_tips: string[];
  red_flags: string[];
  common_procedures: SpecialtyProcedure[];
  faqs: SpecialtyFaq[];
  sources: SpecialtySource[];
  review_status: SpecialtyReviewStatus;
  reviewed_at: string | null;
}

export interface SpecialtyDoctorPreview {
  id: string;
  slug: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  consultation_fee: number | null;
  years_experience: number | null;
  accepts_telemedicine: boolean | null;
  accepts_insurance: boolean | null;
  sacs_verified: boolean | null;
  languages: string[] | null;
  subspecialties: string[] | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
}

export interface SpecialtyDetail {
  specialty: SpecialtyCatalog;
  education: SpecialtyEducation | null;
  doctors: SpecialtyDoctorPreview[];
}
