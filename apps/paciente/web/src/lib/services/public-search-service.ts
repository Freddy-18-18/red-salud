import type {
  SearchFilters,
  SearchResults,
  PublicDoctor,
  MapDoctorPoint,
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
  } | null;
  specialty: {
    id: string;
    name: string;
    icon: string | null;
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapApiDoctorToPublic(d: ApiDoctor): PublicDoctor {
  const fullName = d.profile
    ? `${d.profile.first_name} ${d.profile.last_name}`.trim()
    : "";

  return {
    id: d.user_id || d.id,
    slug: "", // slug not returned by API
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
// Constants
// ---------------------------------------------------------------------------

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 12;

// ---------------------------------------------------------------------------
// 1. searchDoctors
// ---------------------------------------------------------------------------

export async function searchDoctors(
  filters: SearchFilters,
): Promise<SearchResults> {
  try {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));

    // Build query params for the BFF API route
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(limit));

    // Resolve specialty slug to id if provided
    if (filters.specialtySlug) {
      const specialties = await fetchJson<ApiSpecialty[]>("/api/specialties");
      const match = (specialties || []).find(
        (s) =>
          s.name.toLowerCase().replace(/\s+/g, "-") ===
          filters.specialtySlug!.toLowerCase() || s.id === filters.specialtySlug,
      );
      if (!match) {
        return { doctors: [], total: 0, page, totalPages: 0 };
      }
      params.set("specialty_id", match.id);
    }

    if (filters.city) params.set("city", filters.city);
    if (filters.acceptsInsurance === true) params.set("accepts_insurance", "true");

    // Map sortBy to API sort_by parameter
    if (filters.sortBy === "price_asc" || filters.sortBy === "price_desc") {
      params.set("sort_by", "price");
    } else if (filters.sortBy === "rating") {
      params.set("sort_by", "rating");
    }

    const qs = params.toString();
    const res = await fetch(`/api/doctors/search?${qs}`);
    if (!res.ok) throw new Error("Request failed");

    const json = await res.json();
    const apiDoctors: ApiDoctor[] = json.data ?? [];
    const totalCount: number = json.pagination?.total ?? 0;

    let doctors: PublicDoctor[] = apiDoctors.map(mapApiDoctorToPublic);

    // Apply client-side filters not handled by the API

    // Text search
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

    // State filter (API only supports city)
    if (filters.state) {
      const state = filters.state.toLowerCase();
      doctors = doctors.filter(
        (d) => d.profile.state?.toLowerCase() === state,
      );
    }

    // Gender filter
    if (filters.gender) {
      doctors = doctors.filter(
        (d) => d.profile.gender === filters.gender,
      );
    }

    // Max price filter
    if (filters.maxPrice != null) {
      doctors = doctors.filter(
        (d) =>
          d.consultationFee == null || d.consultationFee <= filters.maxPrice!,
      );
    }

    // Min rating filter
    if (filters.minRating != null) {
      doctors = doctors.filter(
        (d) => d.avgRating != null && d.avgRating >= filters.minRating!,
      );
    }

    // In-memory sorting for price_desc (API only does asc) and relevance
    if (filters.sortBy === "price_desc") {
      doctors.sort(
        (a, b) => (b.consultationFee ?? 0) - (a.consultationFee ?? 0),
      );
    } else if (!filters.sortBy || filters.sortBy === "relevance") {
      doctors.sort(
        (a, b) =>
          (b.avgRating ?? 0) * Math.log((b.reviewCount || 1) + 1) -
          (a.avgRating ?? 0) * Math.log((a.reviewCount || 1) + 1),
      );
    }

    const total = totalCount;
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
    // Build query params for the BFF API route
    const params = new URLSearchParams();
    params.set("page_size", "50"); // max page for map points

    // Resolve specialty slug to id if provided
    if (filters?.specialtySlug) {
      const specialties = await fetchJson<ApiSpecialty[]>("/api/specialties");
      const match = (specialties || []).find(
        (s) =>
          s.name.toLowerCase().replace(/\s+/g, "-") ===
          filters.specialtySlug!.toLowerCase() || s.id === filters.specialtySlug,
      );
      if (match) {
        params.set("specialty_id", match.id);
      }
    }

    if (filters?.acceptsInsurance === true) params.set("accepts_insurance", "true");
    if (filters?.city) params.set("city", filters.city);

    const qs = params.toString();
    const doctors = await fetchJson<ApiDoctor[]>(
      `/api/doctors/search?${qs}`,
    );
    if (!doctors || doctors.length === 0) return [];

    let points: MapDoctorPoint[] = doctors
      .map((d) => {
        const fullName = d.profile
          ? `${d.profile.first_name} ${d.profile.last_name}`.trim()
          : "";
        const city = d.city;

        // Skip doctors without location
        if (!city) return null;

        return {
          id: d.user_id || d.id,
          slug: "",
          name: fullName,
          specialty: d.specialty?.name || "",
          lat: 0, // Coordinates resolved by map component from city lookup
          lng: 0,
          rating: d.avg_rating,
          avatarUrl: d.profile?.avatar_url ?? null,
          city,
          state: "", // API doesn't return state separately
        };
      })
      .filter((p): p is MapDoctorPoint => p !== null);

    // Apply client-side filters
    if (filters?.state) {
      const state = filters.state.toLowerCase();
      points = points.filter(
        (p) => p.state.toLowerCase() === state,
      );
    }

    if (filters?.minRating != null) {
      points = points.filter(
        (p) => p.rating != null && p.rating >= filters.minRating!,
      );
    }

    if (filters?.maxPrice != null) {
      // Price not available in map points — would require additional query.
      // Skip for performance.
    }

    return points;
  } catch {
    // Expected when tables don't exist yet — return empty results silently
    return [];
  }
}
