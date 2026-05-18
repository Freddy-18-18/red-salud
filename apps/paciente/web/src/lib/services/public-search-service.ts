import type {
  GatewayDoctorSearchItem,
} from "@red-salud/api-client";

import { gateway } from "@/lib/api/gateway";
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

interface ApiSpecialty {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapGatewayDoctorToPublic(d: GatewayDoctorSearchItem): PublicDoctor {
  return {
    // Use profile.id (the auth user) so /medico/[id] routes resolve.
    id: d.profile?.id ?? d.id,
    slug: d.slug ?? "",
    consultationFee: d.consultation_fee ?? d.consultation_price ?? null,
    acceptsInsurance: d.accepts_insurance ?? false,
    yearsExperience: d.years_experience,
    biography: d.biography,
    verified: d.verified ?? false,
    profile: {
      name: d.profile?.full_name ?? "",
      avatarUrl: d.profile?.avatar_url ?? null,
      city: d.profile?.city ?? null,
      state: d.profile?.state ?? null,
      gender: null, // not exposed by the gateway today
    },
    specialty: d.specialty
      ? {
          id: d.specialty.id,
          name: d.specialty.name,
          slug: d.specialty.slug ?? "",
        }
      : { id: d.specialty_id ?? "", name: "", slug: "" },
    avgRating: d.average_rating,
    reviewCount: d.total_reviews ?? 0,
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

    // Resolve specialty slug to id if provided. The catalog still lives on the
    // app-local /api/specialties route until the gateway exposes it.
    let specialtyId: string | undefined;
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
      specialtyId = match.id;
    }

    const response = await gateway.doctors.searchDoctors({
      specialty_id: specialtyId,
      accepts_insurance: filters.acceptsInsurance === true ? true : undefined,
      min_rating: filters.minRating,
      page,
      pageSize: limit,
    });

    let doctors: PublicDoctor[] = response.data.map(mapGatewayDoctorToPublic);

    // City filter (gateway does not filter by city today — applied client-side).
    if (filters.city) {
      const city = filters.city.toLowerCase();
      doctors = doctors.filter(
        (d) => d.profile.city?.toLowerCase().includes(city),
      );
    }

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

    // State filter (gateway does not filter by state)
    if (filters.state) {
      const state = filters.state.toLowerCase();
      doctors = doctors.filter(
        (d) => d.profile.state?.toLowerCase() === state,
      );
    }

    // Gender filter (not exposed by the gateway)
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

    // Sort
    if (filters.sortBy === "price_asc") {
      doctors.sort(
        (a, b) => (a.consultationFee ?? Infinity) - (b.consultationFee ?? Infinity),
      );
    } else if (filters.sortBy === "price_desc") {
      doctors.sort(
        (a, b) => (b.consultationFee ?? 0) - (a.consultationFee ?? 0),
      );
    } else if (filters.sortBy === "rating") {
      doctors.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    } else if (!filters.sortBy || filters.sortBy === "relevance") {
      doctors.sort(
        (a, b) =>
          (b.avgRating ?? 0) * Math.log((b.reviewCount || 1) + 1) -
          (a.avgRating ?? 0) * Math.log((a.reviewCount || 1) + 1),
      );
    }

    const total = response.pagination.total;
    const totalPages = response.pagination.totalPages || Math.ceil(total / limit);

    return { doctors, total, page, totalPages };
  } catch {
    // Gateway unreachable or returned an error — return empty results silently
    // so the UI degrades gracefully (e.g. on cold-start or local dev without
    // the gateway running).
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
    let specialtyId: string | undefined;
    if (filters?.specialtySlug) {
      const specialties = await fetchJson<ApiSpecialty[]>("/api/specialties");
      const match = (specialties || []).find(
        (s) =>
          s.name.toLowerCase().replace(/\s+/g, "-") ===
          filters.specialtySlug!.toLowerCase() || s.id === filters.specialtySlug,
      );
      if (match) specialtyId = match.id;
    }

    const response = await gateway.doctors.searchDoctors({
      specialty_id: specialtyId,
      accepts_insurance: filters?.acceptsInsurance === true ? true : undefined,
      min_rating: filters?.minRating,
      page: 1,
      pageSize: 50,
    });

    let points: MapDoctorPoint[] = response.data
      .map((d) => {
        const city = d.profile?.city;
        if (!city) return null;
        return {
          id: d.profile?.id ?? d.id,
          slug: d.slug ?? "",
          name: d.profile?.full_name ?? "",
          specialty: d.specialty?.name ?? "",
          lat: 0, // resolved by the map component from city lookup
          lng: 0,
          rating: d.average_rating,
          avatarUrl: d.profile?.avatar_url ?? null,
          city,
          state: d.profile?.state ?? "",
        } satisfies MapDoctorPoint;
      })
      .filter((p): p is MapDoctorPoint => p !== null);

    if (filters?.city) {
      const city = filters.city.toLowerCase();
      points = points.filter((p) => p.city.toLowerCase().includes(city));
    }

    if (filters?.state) {
      const state = filters.state.toLowerCase();
      points = points.filter((p) => p.state.toLowerCase() === state);
    }

    return points;
  } catch {
    return [];
  }
}
