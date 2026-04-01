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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute avg rating and review count from a list of reviews for a given doctor.
 */
function computeRating(
  reviews: { doctor_id: string; rating: number }[],
  doctorId: string,
): { avg: number | null; count: number } {
  const matching = reviews.filter((r) => r.doctor_id === doctorId);
  if (matching.length === 0) return { avg: null, count: 0 };

  const sum = matching.reduce((acc, r) => acc + r.rating, 0);
  return {
    avg: Math.round((sum / matching.length) * 10) / 10,
    count: matching.length,
  };
}

/**
 * Map a raw doctor row (from doctor_details + profile + specialty joins)
 * into the PublicDoctor shape.
 * NEVER exposes email, phone, date_of_birth, national_id.
 */
function mapToPublicDoctor(
  row: Record<string, unknown>,
  ratingInfo: { avg: number | null; count: number },
): PublicDoctor {
  const profile = row.profile as {
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    state: string | null;
  };
  const specialty = row.specialty as {
    id: string;
    name: string;
    slug: string;
  } | null;

  return {
    id: row.profile_id as string,
    slug: (row.slug as string) || "",
    consultationFee: row.consultation_fee
      ? parseFloat(row.consultation_fee as string)
      : null,
    acceptsInsurance: (row.accepts_insurance as boolean) || false,
    yearsExperience: (row.years_experience as number) || null,
    biography: (row.biografia as string) || null,
    verified: true, // all results are pre-filtered to verified
    profile: {
      name: profile.full_name,
      avatarUrl: profile.avatar_url,
      city: profile.city,
      state: profile.state,
      gender: null,
    },
    specialty: specialty
      ? { id: specialty.id, name: specialty.name, slug: specialty.slug }
      : { id: "", name: "", slug: "" },
    avgRating: ratingInfo.avg,
    reviewCount: ratingInfo.count,
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Columns selected from doctor_details for public queries.
 * NEVER includes PII from profiles (email, phone, date_of_birth, national_id).
 */
const DOCTOR_PUBLIC_SELECT = `
  id,
  profile_id,
  slug,
  consultation_fee,
  accepts_insurance,
  years_experience,
  biografia,
  verified,
  profile:profiles!inner(full_name, avatar_url, city, state),
  specialty:specialties!inner(id, name, slug)
`;

const DOCTOR_DETAIL_SELECT = `
  id,
  profile_id,
  slug,
  consultation_fee,
  accepts_insurance,
  years_experience,
  biografia,
  verified,
  schedule,
  profile:profiles!inner(full_name, avatar_url, city, state),
  specialty:specialties!inner(id, name, slug)
`;

// ---------------------------------------------------------------------------
// 1. getPlatformStats
// ---------------------------------------------------------------------------

export async function getPlatformStats(): Promise<PlatformStats> {
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
    const { data: specialties, error } = await publicSupabase
      .from("specialties")
      .select("id, name, slug, description, icon");

    if (error) throw error;
    if (!specialties || specialties.length === 0) return [];

    // Count verified doctors per specialty
    const { data: doctors } = await publicSupabase
      .from("doctor_details")
      .select("specialty_id")
      .eq("verified", true);

    const countMap = new Map<string, number>();
    (doctors || []).forEach(
      (d: { specialty_id: string }) => {
        const current = countMap.get(d.specialty_id) || 0;
        countMap.set(d.specialty_id, current + 1);
      },
    );

    const result: PublicSpecialty[] = specialties.map(
      (s: Record<string, unknown>) => ({
        id: s.id as string,
        name: s.name as string,
        slug: (s.slug as string) || "",
        description: (s.description as string) || null,
        icon: (s.icon as string) || null,
        doctorCount: countMap.get(s.id as string) || 0,
      }),
    );

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
    const { data, error } = await publicSupabase
      .from("specialties")
      .select("id, name, slug, description, icon")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Count verified doctors for this specialty
    const { count } = await publicSupabase
      .from("doctor_details")
      .select("id", { count: "exact", head: true })
      .eq("specialty_id", data.id)
      .eq("verified", true);

    return {
      id: data.id as string,
      name: data.name as string,
      slug: (data.slug as string) || "",
      description: (data.description as string) || null,
      icon: (data.icon as string) || null,
      doctorCount: count ?? 0,
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
    const { data, error } = await publicSupabase
      .from("doctor_details")
      .select(DOCTOR_DETAIL_SELECT)
      .eq("slug", slug)
      .eq("verified", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const profileId = data.profile_id as string;

    // Fetch reviews (top 20)
    const { data: reviewsData } = await publicSupabase
      .from("doctor_reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        is_anonymous,
        patient:profiles!doctor_reviews_patient_id_fkey(full_name)
      `,
      )
      .eq("doctor_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20);

    const reviews: PublicReview[] = (reviewsData || []).map(
      (r: Record<string, unknown>) => {
        const patient = r.patient as { full_name: string } | null;
        const isAnon = r.is_anonymous as boolean;
        return {
          id: r.id as string,
          rating: r.rating as number,
          comment: (r.comment as string) || null,
          createdAt: r.created_at as string,
          reviewerName: isAnon
            ? "Paciente anónimo"
            : patient?.full_name || "Paciente",
          isAnonymous: isAnon,
        };
      },
    );

    // Compute rating from fetched reviews
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating =
      reviews.length > 0
        ? Math.round((totalRating / reviews.length) * 10) / 10
        : null;

    const profile = data.profile as unknown as {
      full_name: string;
      avatar_url: string | null;
      city: string | null;
      state: string | null;
    };
    const specialty = data.specialty as unknown as {
      id: string;
      name: string;
      slug: string;
    } | null;

    return {
      id: profileId,
      slug: (data.slug as string) || "",
      consultationFee: data.consultation_fee
        ? parseFloat(data.consultation_fee as string)
        : null,
      acceptsInsurance: (data.accepts_insurance as boolean) || false,
      yearsExperience: (data.years_experience as number) || null,
      biography: (data.biografia as string) || null,
      verified: true,
      profile: {
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        city: profile.city,
        state: profile.state,
        gender: null,
      },
      specialty: specialty
        ? { id: specialty.id, name: specialty.name, slug: specialty.slug }
        : { id: "", name: "", slug: "" },
      avgRating,
      reviewCount: reviews.length,
      reviews,
      schedule: (data.schedule as DoctorSchedule) || {},
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
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get total count
    const { count } = await publicSupabase
      .from("doctor_reviews")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", doctorId);

    // Get paginated reviews
    const { data, error } = await publicSupabase
      .from("doctor_reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        is_anonymous,
        patient:profiles!doctor_reviews_patient_id_fkey(full_name)
      `,
      )
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const reviews: PublicReview[] = (data || []).map(
      (r: Record<string, unknown>) => {
        const patient = r.patient as { full_name: string } | null;
        const isAnon = r.is_anonymous as boolean;
        return {
          id: r.id as string,
          rating: r.rating as number,
          comment: (r.comment as string) || null,
          createdAt: r.created_at as string,
          reviewerName: isAnon
            ? "Paciente anónimo"
            : patient?.full_name || "Paciente",
          isAnonymous: isAnon,
        };
      },
    );

    return { reviews, total: count ?? 0 };
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
    const { data, error } = await publicSupabase
      .from("doctor_details")
      .select(DOCTOR_PUBLIC_SELECT)
      .eq("specialty_id", specialtyId)
      .eq("verified", true)
      .neq("profile_id", excludeId)
      .limit(limit + 10); // fetch extra to allow state filtering

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get ratings
    const profileIds = data.map(
      (d: { profile_id: string }) => d.profile_id,
    );
    const { data: reviews } = await publicSupabase
      .from("doctor_reviews")
      .select("doctor_id, rating")
      .in("doctor_id", profileIds);

    let doctors = data.map((d: Record<string, unknown>) => {
      const { avg, count } = computeRating(
        (reviews || []) as { doctor_id: string; rating: number }[],
        d.profile_id as string,
      );
      return mapToPublicDoctor(d, { avg, count });
    });

    // Prefer same state, then fill with others
    const sameState = doctors.filter(
      (d) =>
        d.profile.state?.toLowerCase() === state.toLowerCase(),
    );
    const otherState = doctors.filter(
      (d) =>
        d.profile.state?.toLowerCase() !== state.toLowerCase(),
    );

    doctors = [...sameState, ...otherState].slice(0, limit);
    return doctors;
  } catch (error) {
    console.error("Error fetching similar doctors:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 8. getStateDoctorCounts
// ---------------------------------------------------------------------------

export async function getStateDoctorCounts(): Promise<StateMapData[]> {
  // Try multiple table/column name combinations to handle both legacy and
  // current schemas. The database may have either doctor_profiles (current)
  // or doctor_details (legacy) with different column names for verification.
  const attempts: { table: string; verifiedCol: string }[] = [
    { table: "doctor_profiles", verifiedCol: "is_verified" },
    { table: "doctor_profiles", verifiedCol: "verified" },
    { table: "doctor_details", verifiedCol: "verified" },
    { table: "doctor_details", verifiedCol: "is_verified" },
  ];

  for (const { table, verifiedCol } of attempts) {
    const { data, error } = await publicSupabase
      .from(table)
      .select("profile:profiles!inner(state)")
      .eq(verifiedCol, true);

    // If the table or column doesn't exist, try the next combination
    if (error) continue;
    if (!data || data.length === 0) return [];

    // Group by state
    const stateMap = new Map<string, number>();
    data.forEach((d: Record<string, unknown>) => {
      const profile = d.profile as { state: string | null };
      const stateName = profile?.state;
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
  }

  // All attempts failed — return empty without logging an error.
  // This is expected when the database schema has not been set up yet.
  return [];
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
    // Resolve specialty id from slug
    const { data: specialty } = await publicSupabase
      .from("specialties")
      .select("id")
      .eq("slug", specialtySlug)
      .maybeSingle();

    if (!specialty) return { doctors: [], total: 0 };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get total count
    const { count } = await publicSupabase
      .from("doctor_details")
      .select("id", { count: "exact", head: true })
      .eq("specialty_id", specialty.id)
      .eq("verified", true);

    // Get paginated doctors
    const { data, error } = await publicSupabase
      .from("doctor_details")
      .select(DOCTOR_PUBLIC_SELECT)
      .eq("specialty_id", specialty.id)
      .eq("verified", true)
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) return { doctors: [], total: count ?? 0 };

    // Get ratings
    const profileIds = data.map(
      (d: { profile_id: string }) => d.profile_id,
    );
    const { data: reviews } = await publicSupabase
      .from("doctor_reviews")
      .select("doctor_id, rating")
      .in("doctor_id", profileIds);

    const doctors = data.map((d: Record<string, unknown>) => {
      const { avg, count: reviewCount } = computeRating(
        (reviews || []) as { doctor_id: string; rating: number }[],
        d.profile_id as string,
      );
      return mapToPublicDoctor(d, { avg, count: reviewCount });
    });

    return { doctors, total: count ?? 0 };
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    return { doctors: [], total: 0 };
  }
}
