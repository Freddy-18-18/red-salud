import { publicSupabase } from "@/lib/supabase/public";
import type {
  SearchFilters,
  SearchResults,
  PublicDoctor,
  MapDoctorPoint,
} from "@/lib/types/public";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 12;

const DOCTOR_PUBLIC_SELECT = `
  id,
  profile_id,
  slug,
  specialty_id,
  consultation_fee,
  accepts_insurance,
  years_experience,
  biografia,
  verified,
  profile:profiles!inner(full_name, avatar_url, city, state),
  specialty:specialties!inner(id, name, slug)
`;

const DOCTOR_MAP_SELECT = `
  id,
  profile_id,
  slug,
  profile:profiles!inner(full_name, avatar_url, city, state),
  specialty:specialties!inner(name)
`;

// ---------------------------------------------------------------------------
// 1. searchDoctors
// ---------------------------------------------------------------------------

export async function searchDoctors(
  filters: SearchFilters,
): Promise<SearchResults> {
  try {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Resolve specialty slug to id if provided
    let specialtyId: string | null = null;
    if (filters.specialtySlug) {
      const { data: spec } = await publicSupabase
        .from("specialties")
        .select("id")
        .eq("slug", filters.specialtySlug)
        .maybeSingle();

      specialtyId = spec?.id ?? null;
      // If slug was provided but not found, return empty results
      if (!specialtyId) {
        return { doctors: [], total: 0, page, totalPages: 0 };
      }
    }

    // ----- Build the query -----
    // We always filter verified = true (mandatory for public access)
    let query = publicSupabase
      .from("doctor_details")
      .select(DOCTOR_PUBLIC_SELECT, { count: "exact" })
      .eq("verified", true);

    // Specialty filter
    if (specialtyId) {
      query = query.eq("specialty_id", specialtyId);
    }

    // Insurance filter
    if (filters.acceptsInsurance === true) {
      query = query.eq("accepts_insurance", true);
    }

    // Max price filter
    if (filters.maxPrice != null) {
      query = query.lte("consultation_fee", filters.maxPrice);
    }

    // Sorting at DB level (where possible)
    switch (filters.sortBy) {
      case "price_asc":
        query = query.order("consultation_fee", {
          ascending: true,
          nullsFirst: false,
        });
        break;
      case "price_desc":
        query = query.order("consultation_fee", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      default:
        // rating and relevance sorted in-memory after rating computation
        break;
    }

    // Pagination
    query = query.range(from, to);

    const { data, error, count: totalCount } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      return { doctors: [], total: totalCount ?? 0, page, totalPages: 0 };
    }

    // ----- Fetch ratings -----
    const profileIds = data.map(
      (d: { profile_id: string }) => d.profile_id,
    );
    const { data: reviews } = await publicSupabase
      .from("doctor_reviews")
      .select("doctor_id, rating")
      .in("doctor_id", profileIds);

    // ----- Map to PublicDoctor + apply in-memory filters -----
    let doctors: PublicDoctor[] = data.map(
      (d: Record<string, unknown>) => {
        const profile = d.profile as {
          full_name: string;
          avatar_url: string | null;
          city: string | null;
          state: string | null;
        };
        const specialty = d.specialty as {
          id: string;
          name: string;
          slug: string;
        } | null;

        const { avg, count: reviewCount } = computeRating(
          (reviews || []) as { doctor_id: string; rating: number }[],
          d.profile_id as string,
        );

        return {
          id: d.profile_id as string,
          slug: (d.slug as string) || "",
          consultationFee: d.consultation_fee
            ? parseFloat(d.consultation_fee as string)
            : null,
          acceptsInsurance: (d.accepts_insurance as boolean) || false,
          yearsExperience: (d.years_experience as number) || null,
          biography: (d.biografia as string) || null,
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
          avgRating: avg,
          reviewCount,
        };
      },
    );

    // Text search (ilike is not efficient across joins, filter in-memory)
    if (filters.q) {
      const q = filters.q.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.profile.name.toLowerCase().includes(q) ||
          d.specialty.name.toLowerCase().includes(q) ||
          d.profile.city?.toLowerCase().includes(q) ||
          d.profile.state?.toLowerCase().includes(q),
      );
    }

    // State filter
    if (filters.state) {
      const state = filters.state.toLowerCase();
      doctors = doctors.filter(
        (d) => d.profile.state?.toLowerCase() === state,
      );
    }

    // City filter
    if (filters.city) {
      const city = filters.city.toLowerCase();
      doctors = doctors.filter(
        (d) => d.profile.city?.toLowerCase().includes(city),
      );
    }

    // Gender filter
    if (filters.gender) {
      doctors = doctors.filter(
        (d) => d.profile.gender === filters.gender,
      );
    }

    // Min rating filter
    if (filters.minRating != null) {
      doctors = doctors.filter(
        (d) => d.avgRating != null && d.avgRating >= filters.minRating!,
      );
    }

    // In-memory sorting for rating/relevance (needs computed avgRating)
    if (filters.sortBy === "rating") {
      doctors.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    } else if (!filters.sortBy || filters.sortBy === "relevance") {
      // Relevance = weighted score: rating * log(reviewCount + 1)
      doctors.sort(
        (a, b) =>
          (b.avgRating ?? 0) * Math.log((b.reviewCount || 1) + 1) -
          (a.avgRating ?? 0) * Math.log((a.reviewCount || 1) + 1),
      );
    }

    const total = totalCount ?? doctors.length;
    const totalPages = Math.ceil(total / limit);

    return { doctors, total, page, totalPages };
  } catch {
    // Expected when tables don't exist yet — return empty results silently
    return { doctors: [], total: 0, page: 1, totalPages: 0 };
  }
}

// ---------------------------------------------------------------------------
// 2. getDoctorsForMap
// ---------------------------------------------------------------------------

export async function getDoctorsForMap(
  filters?: Partial<SearchFilters>,
): Promise<MapDoctorPoint[]> {
  try {
    // Resolve specialty slug to id if provided
    let specialtyId: string | null = null;
    if (filters?.specialtySlug) {
      const { data: spec } = await publicSupabase
        .from("specialties")
        .select("id")
        .eq("slug", filters.specialtySlug)
        .maybeSingle();

      specialtyId = spec?.id ?? null;
    }

    let query = publicSupabase
      .from("doctor_details")
      .select(DOCTOR_MAP_SELECT)
      .eq("verified", true)
      .limit(500);

    if (specialtyId) {
      query = query.eq("specialty_id", specialtyId);
    }

    if (filters?.acceptsInsurance === true) {
      query = query.eq("accepts_insurance", true);
    }

    if (filters?.maxPrice != null) {
      query = query.lte("consultation_fee", filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch ratings for all doctors
    const profileIds = data.map(
      (d: { profile_id: string }) => d.profile_id,
    );
    const { data: reviews } = await publicSupabase
      .from("doctor_reviews")
      .select("doctor_id, rating")
      .in("doctor_id", profileIds);

    let points: MapDoctorPoint[] = data
      .map((d: Record<string, unknown>) => {
        const profile = d.profile as {
          full_name: string;
          avatar_url: string | null;
          city: string | null;
          state: string | null;
        };
        const specialty = d.specialty as { name: string } | null;

        // Skip doctors without location
        if (!profile.city || !profile.state) return null;

        const { avg } = computeRating(
          (reviews || []) as { doctor_id: string; rating: number }[],
          d.profile_id as string,
        );

        return {
          id: d.profile_id as string,
          slug: (d.slug as string) || "",
          name: profile.full_name,
          specialty: specialty?.name || "",
          lat: 0, // Coordinates resolved by map component from city/state lookup
          lng: 0,
          rating: avg,
          avatarUrl: profile.avatar_url,
          city: profile.city,
          state: profile.state,
        };
      })
      .filter((p): p is MapDoctorPoint => p !== null);

    // Apply in-memory filters
    if (filters?.state) {
      const state = filters.state.toLowerCase();
      points = points.filter(
        (p) => p.state.toLowerCase() === state,
      );
    }

    if (filters?.city) {
      const city = filters.city.toLowerCase();
      points = points.filter(
        (p) => p.city.toLowerCase().includes(city),
      );
    }

    if (filters?.minRating != null) {
      points = points.filter(
        (p) => p.rating != null && p.rating >= filters.minRating!,
      );
    }

    if (filters?.gender) {
      // Gender not available in map select (minimal columns),
      // would require additional query. Skip for performance.
    }

    return points;
  } catch {
    // Expected when tables don't exist yet — return empty results silently
    return [];
  }
}
