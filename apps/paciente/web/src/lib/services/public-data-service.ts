import { publicSupabase } from "@/lib/supabase/public";
import type {
  PlatformStats,
  PublicSpecialty,
  PublicDoctor,
  PublicDoctorDetail,
  PublicReview,
  StateMapData,
  DoctorSchedule,
} from "@/lib/types/public";
import { fetchJson } from "@/lib/utils/fetch";

// ---------------------------------------------------------------------------
// Shared API response types
// ---------------------------------------------------------------------------

interface ApiDoctor {
  id: string;
  user_id: string;
  is_active: boolean;
  consultation_fee: number | null;
  accepts_insurance: boolean;
  city: string | null;
  address: string | null;
  years_experience: number | null;
  biography: string | null;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    phone: string | null;
    email?: string | null;
  } | null;
  specialty: {
    id: string;
    name: string;
    icon: string | null;
    description?: string | null;
  } | null;
  avg_rating: number | null;
  review_count: number;
}

interface ApiSpecialty {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface ApiReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapApiDoctorToPublic(d: ApiDoctor): PublicDoctor {
  const fullName = d.profile
    ? `${d.profile.first_name} ${d.profile.last_name}`.trim()
    : "";

  return {
    id: d.user_id || d.id,
    slug: "", // slug not returned by API; consumers should use id
    consultationFee: d.consultation_fee,
    acceptsInsurance: d.accepts_insurance || false,
    yearsExperience: d.years_experience,
    biography: d.biography,
    verified: true,
    profile: {
      name: fullName,
      avatarUrl: d.profile?.avatar_url ?? null,
      city: d.city,
      state: null,
      gender: null,
    },
    specialty: d.specialty
      ? { id: d.specialty.id, name: d.specialty.name, slug: "" }
      : { id: "", name: "", slug: "" },
    avgRating: d.avg_rating,
    reviewCount: d.review_count,
  };
}

// ---------------------------------------------------------------------------
// 1. getPlatformStats
// ---------------------------------------------------------------------------

export async function getPlatformStats(): Promise<PlatformStats> {
  // platform_stats is a patient-domain aggregate view — keep as Supabase
  try {
    const { data, error } = await publicSupabase
      .from("platform_stats")
      .select(
        "doctor_count, specialty_count, patient_count, appointment_count, avg_rating",
      )
      .eq("id", "global")
      .single();

    if (error) throw error;

    return {
      doctorCount: data.doctor_count ?? 0,
      specialtyCount: data.specialty_count ?? 0,
      patientCount: data.patient_count ?? 0,
      appointmentCount: data.appointment_count ?? 0,
      avgRating: data.avg_rating ? parseFloat(data.avg_rating) : 0,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return {
      doctorCount: 0,
      specialtyCount: 0,
      patientCount: 0,
      appointmentCount: 0,
      avgRating: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// 2. getSpecialtiesWithDoctorCount
// ---------------------------------------------------------------------------

export async function getSpecialtiesWithDoctorCount(): Promise<
  PublicSpecialty[]
> {
  try {
    // Fetch specialties that have active doctors via the BFF route
    const specialties = await fetchJson<ApiSpecialty[]>(
      "/api/specialties?with_doctors=true",
    );
    if (!specialties || specialties.length === 0) return [];

    // The API doesn't return doctor counts per specialty, so we fetch doctor
    // search results per specialty to compute counts. For efficiency we do a
    // single large doctor search and count locally.
    const doctors = await fetchJson<ApiDoctor[]>(
      "/api/doctors/search?page_size=50",
    );

    const countMap = new Map<string, number>();
    (doctors || []).forEach((d) => {
      if (d.specialty?.id) {
        const current = countMap.get(d.specialty.id) || 0;
        countMap.set(d.specialty.id, current + 1);
      }
    });

    const result: PublicSpecialty[] = specialties.map((s) => ({
      id: s.id,
      name: s.name,
      slug: "", // slug not returned by API
      description: s.description,
      icon: s.icon,
      doctorCount: countMap.get(s.id) || 0,
    }));

    result.sort((a, b) => b.doctorCount - a.doctorCount);
    return result;
  } catch (error) {
    console.error("Error fetching specialties with doctor count:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3. getTopSpecialties
// ---------------------------------------------------------------------------

export async function getTopSpecialties(
  limit: number = 8,
): Promise<PublicSpecialty[]> {
  const all = await getSpecialtiesWithDoctorCount();
  return all.slice(0, limit);
}

// ---------------------------------------------------------------------------
// 4. getSpecialtyBySlug
// ---------------------------------------------------------------------------

export async function getSpecialtyBySlug(
  slug: string,
): Promise<PublicSpecialty | null> {
  try {
    // The API route doesn't support slug lookup, so we fetch all specialties
    // and find the match client-side. This is acceptable because the list is
    // small and cached by Next.js.
    const specialties = await fetchJson<ApiSpecialty[]>("/api/specialties");
    if (!specialties) return null;

    // slug is not returned by the API, so we derive it from name for matching
    const match = specialties.find(
      (s) =>
        s.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase() ||
        s.id === slug,
    );

    if (!match) return null;

    // Get doctor count for this specialty
    const doctors = await fetchJson<ApiDoctor[]>(
      `/api/doctors/search?specialty_id=${match.id}&page_size=1`,
    );

    // The pagination total gives us the real count
    const res = await fetch(
      `/api/doctors/search?specialty_id=${match.id}&page_size=1`,
    );
    const json = await res.json();
    const total = json.pagination?.total ?? (doctors?.length || 0);

    return {
      id: match.id,
      name: match.name,
      slug: slug,
      description: match.description,
      icon: match.icon,
      doctorCount: total,
    };
  } catch (error) {
    console.error("Error fetching specialty by slug:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 5. getDoctorBySlug
// ---------------------------------------------------------------------------

export async function getDoctorBySlug(
  slug: string,
): Promise<PublicDoctorDetail | null> {
  try {
    // The API route uses doctor_details.id, not slug.
    // Try to use the slug as the ID directly (works if consumers pass ID).
    const doctor = await fetchJson<ApiDoctor & {
      education?: unknown;
      languages?: unknown;
    }>(`/api/doctors/${slug}`);

    if (!doctor) return null;

    const profileId = doctor.user_id || doctor.id;

    // Fetch reviews via the API route
    const res = await fetch(
      `/api/doctors/${doctor.id}/reviews?page_size=20`,
    );
    const reviewsJson = await res.json();
    const apiReviews: ApiReview[] = reviewsJson.data ?? [];

    const reviews: PublicReview[] = apiReviews.map((r) => {
      const reviewerName = r.patient
        ? `${r.patient.first_name} ${r.patient.last_name}`.trim()
        : "Paciente";
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        reviewerName,
        isAnonymous: false,
      };
    });

    const fullName = doctor.profile
      ? `${doctor.profile.first_name} ${doctor.profile.last_name}`.trim()
      : "";

    return {
      id: profileId,
      slug: slug,
      consultationFee: doctor.consultation_fee,
      acceptsInsurance: doctor.accepts_insurance || false,
      yearsExperience: doctor.years_experience,
      biography: doctor.biography,
      verified: true,
      profile: {
        name: fullName,
        avatarUrl: doctor.profile?.avatar_url ?? null,
        city: doctor.city,
        state: null,
        gender: null,
      },
      specialty: doctor.specialty
        ? { id: doctor.specialty.id, name: doctor.specialty.name, slug: "" }
        : { id: "", name: "", slug: "" },
      avgRating: doctor.avg_rating,
      reviewCount: doctor.review_count,
      reviews,
      schedule: {} as DoctorSchedule,
    };
  } catch (error) {
    console.error("Error fetching doctor by slug:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 6. getDoctorReviews
// ---------------------------------------------------------------------------

export async function getDoctorReviews(
  doctorId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ reviews: PublicReview[]; total: number }> {
  try {
    const res = await fetch(
      `/api/doctors/${doctorId}/reviews?page=${page}&page_size=${limit}`,
    );
    if (!res.ok) throw new Error("Request failed");

    const json = await res.json();
    const apiReviews: ApiReview[] = json.data ?? [];
    const total: number = json.pagination?.total ?? 0;

    const reviews: PublicReview[] = apiReviews.map((r) => {
      const reviewerName = r.patient
        ? `${r.patient.first_name} ${r.patient.last_name}`.trim()
        : "Paciente";
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        reviewerName,
        isAnonymous: false,
      };
    });

    return { reviews, total };
  } catch (error) {
    console.error("Error fetching doctor reviews:", error);
    return { reviews: [], total: 0 };
  }
}

// ---------------------------------------------------------------------------
// 7. getSimilarDoctors
// ---------------------------------------------------------------------------

export async function getSimilarDoctors(
  specialtyId: string,
  state: string,
  excludeId: string,
  limit: number = 4,
): Promise<PublicDoctor[]> {
  try {
    const doctors = await fetchJson<ApiDoctor[]>(
      `/api/doctors/search?specialty_id=${specialtyId}&page_size=${limit + 10}`,
    );
    if (!doctors || doctors.length === 0) return [];

    let mapped = doctors
      .filter((d) => (d.user_id || d.id) !== excludeId)
      .map(mapApiDoctorToPublic);

    // Prefer same state, then fill with others
    const sameState = mapped.filter(
      (d) =>
        d.profile.state?.toLowerCase() === state.toLowerCase(),
    );
    const otherState = mapped.filter(
      (d) =>
        d.profile.state?.toLowerCase() !== state.toLowerCase(),
    );

    mapped = [...sameState, ...otherState].slice(0, limit);
    return mapped;
  } catch (error) {
    console.error("Error fetching similar doctors:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 8. getStateDoctorCounts
// ---------------------------------------------------------------------------

export async function getStateDoctorCounts(): Promise<StateMapData[]> {
  // This function groups doctors by state for a map visualization.
  // The API doesn't expose a dedicated endpoint for this aggregate, so we
  // fetch a large page of doctors and group client-side.
  try {
    const doctors = await fetchJson<ApiDoctor[]>(
      "/api/doctors/search?page_size=50",
    );
    if (!doctors || doctors.length === 0) return [];

    const stateMap = new Map<string, number>();
    doctors.forEach((d) => {
      const stateName = d.city; // API returns city; state grouping approximation
      if (!stateName) return;
      stateMap.set(stateName, (stateMap.get(stateName) || 0) + 1);
    });

    return Array.from(stateMap.entries())
      .map(([stateName, doctorCount]) => ({
        stateId: stateName.toLowerCase().replace(/\s+/g, "-"),
        stateName,
        doctorCount,
      }))
      .sort((a, b) => b.doctorCount - a.doctorCount);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 9. getDoctorsBySpecialty
// ---------------------------------------------------------------------------

export async function getDoctorsBySpecialty(
  specialtySlug: string,
  page: number = 1,
  limit: number = 12,
): Promise<{ doctors: PublicDoctor[]; total: number }> {
  try {
    // Resolve specialty slug to id by fetching all specialties
    const specialties = await fetchJson<ApiSpecialty[]>("/api/specialties");
    const specialty = (specialties || []).find(
      (s) =>
        s.name.toLowerCase().replace(/\s+/g, "-") ===
        specialtySlug.toLowerCase() || s.id === specialtySlug,
    );

    if (!specialty) return { doctors: [], total: 0 };

    const res = await fetch(
      `/api/doctors/search?specialty_id=${specialty.id}&page=${page}&page_size=${limit}`,
    );
    if (!res.ok) throw new Error("Request failed");

    const json = await res.json();
    const apiDoctors: ApiDoctor[] = json.data ?? [];
    const total: number = json.pagination?.total ?? 0;

    const doctors = apiDoctors.map(mapApiDoctorToPublic);

    return { doctors, total };
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    return { doctors: [], total: 0 };
  }
}
