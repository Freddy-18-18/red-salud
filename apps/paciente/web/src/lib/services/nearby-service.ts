import { supabase } from "@/lib/supabase/client";
import { fetchJson } from "@/lib/utils/fetch";

// ─── Types ───────────────────────────────────────────────────────────

export type ProviderType = "medico" | "farmacia" | "clinica" | "laboratorio";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface NearbyProvider {
  id: string;
  type: ProviderType;
  name: string;
  specialty: string | null;
  address: string | null;
  phone: string | null;
  avatar_url: string | null;
  rating: number | null;
  review_count: number;
  lat: number;
  lng: number;
  distance_km: number;
  is_available: boolean;
  opening_hours: string | null;
}

export interface NearbyFilters {
  types?: ProviderType[];
  radius_km?: number;
  is_available?: boolean;
  min_rating?: number;
}

// ─── Constants ───────────────────────────────────────────────────────

export const PROVIDER_TYPE_CONFIG: Record<
  ProviderType,
  { label: string; plural: string; color: string; bgColor: string }
> = {
  medico: {
    label: "Medico",
    plural: "Medicos",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  farmacia: {
    label: "Farmacia",
    plural: "Farmacias",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  clinica: {
    label: "Clinica",
    plural: "Clinicas",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  laboratorio: {
    label: "Laboratorio",
    plural: "Laboratorios",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
};

export const PROVIDER_TYPE_PIN_COLORS: Record<ProviderType, string> = {
  medico: "#3B82F6",
  farmacia: "#10B981",
  clinica: "#8B5CF6",
  laboratorio: "#F59E0B",
};

const EARTH_RADIUS_KM = 6371;

// ─── Haversine ───────────────────────────────────────────────────────

export function haversineDistance(
  p1: GeoPoint,
  p2: GeoPoint
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// ─── Service ─────────────────────────────────────────────────────────

export const nearbyService = {
  /**
   * Queries all provider types and filters by Haversine distance.
   */
  async getNearbyProviders(
    userLocation: GeoPoint,
    filters?: NearbyFilters
  ): Promise<NearbyProvider[]> {
    const radiusKm = filters?.radius_km ?? 10;
    const enabledTypes = filters?.types ?? [
      "medico",
      "farmacia",
      "clinica",
      "laboratorio",
    ];

    const providers: NearbyProvider[] = [];

    // ── Doctors ──
    if (enabledTypes.includes("medico")) {
      try {
        const doctors = await fetchJson<Record<string, unknown>[]>(
          `/api/doctors/search?page_size=50`
        );

        for (const doc of doctors ?? []) {
          const profile = doc.profile as Record<string, unknown> | null;
          const specialty = doc.specialty as Record<string, unknown> | null;
          // doctor_details doesn't have lat/lng in the search route — skip geo-filtering for doctors
          // They are included without distance for now
          const address = (doc.address as string) ?? null;
          const phone = (profile?.phone as string) ?? null;
          const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

          providers.push({
            id: doc.id as string,
            type: "medico",
            name: fullName || "Medico",
            specialty: (specialty?.name as string) ?? null,
            address,
            phone,
            avatar_url: (profile?.avatar_url as string) ?? null,
            rating: doc.avg_rating != null ? Number(doc.avg_rating) : null,
            review_count: Number(doc.review_count) || 0,
            lat: userLocation.lat, // geo data not available via API — place at user location
            lng: userLocation.lng,
            distance_km: 0,
            is_available: (doc.is_active as boolean) ?? false,
            opening_hours: null,
          });
        }
      } catch {
        // Doctor search API unavailable — skip
      }
    }

    // ── Pharmacies ──
    if (enabledTypes.includes("farmacia")) {
      try {
        interface ApiPharmacy {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          logo_url: string | null;
          rating: number | null;
          review_count: number;
          lat: number | null;
          lng: number | null;
          opening_hours: string | null;
        }

        const pharmacies = await fetchJson<ApiPharmacy[]>('/api/pharmacy/search');

        for (const ph of pharmacies ?? []) {
          const lat = Number(ph.lat);
          const lng = Number(ph.lng);
          if (!lat || !lng) continue;

          const dist = haversineDistance(userLocation, { lat, lng });
          if (dist > radiusKm) continue;

          providers.push({
            id: ph.id,
            type: "farmacia",
            name: ph.name ?? "Farmacia",
            specialty: null,
            address: ph.address ?? null,
            phone: ph.phone ?? null,
            avatar_url: ph.logo_url ?? null,
            rating: ph.rating != null ? Number(ph.rating) : null,
            review_count: Number(ph.review_count) || 0,
            lat,
            lng,
            distance_km: Math.round(dist * 100) / 100,
            is_available: true,
            opening_hours: ph.opening_hours ?? null,
          });
        }
      } catch {
        // Pharmacy search API unavailable — skip
      }
    }

    // ── Clinics ──
    if (enabledTypes.includes("clinica")) {
      const { data: clinics } = await supabase
        .from("clinic_details")
        .select(
          `
          id,
          name,
          address,
          phone,
          logo_url,
          rating,
          review_count,
          lat,
          lng,
          is_active,
          opening_hours
        `
        )
        .eq("is_active", true)
        .not("lat", "is", null)
        .not("lng", "is", null);

      for (const cl of clinics ?? []) {
        const lat = Number(cl.lat);
        const lng = Number(cl.lng);
        if (!lat || !lng) continue;

        const dist = haversineDistance(userLocation, { lat, lng });
        if (dist > radiusKm) continue;

        providers.push({
          id: cl.id as string,
          type: "clinica",
          name: (cl.name as string) ?? "Clinica",
          specialty: null,
          address: (cl.address as string) ?? null,
          phone: (cl.phone as string) ?? null,
          avatar_url: (cl.logo_url as string) ?? null,
          rating: cl.rating != null ? Number(cl.rating) : null,
          review_count: Number(cl.review_count) || 0,
          lat,
          lng,
          distance_km: Math.round(dist * 100) / 100,
          is_available: true,
          opening_hours: (cl.opening_hours as string) ?? null,
        });
      }
    }

    // ── Laboratories ──
    if (enabledTypes.includes("laboratorio")) {
      const { data: labs } = await supabase
        .from("laboratory_details")
        .select(
          `
          id,
          name,
          address,
          phone,
          logo_url,
          rating,
          review_count,
          lat,
          lng,
          is_active,
          opening_hours
        `
        )
        .eq("is_active", true)
        .not("lat", "is", null)
        .not("lng", "is", null);

      for (const lb of labs ?? []) {
        const lat = Number(lb.lat);
        const lng = Number(lb.lng);
        if (!lat || !lng) continue;

        const dist = haversineDistance(userLocation, { lat, lng });
        if (dist > radiusKm) continue;

        providers.push({
          id: lb.id as string,
          type: "laboratorio",
          name: (lb.name as string) ?? "Laboratorio",
          specialty: null,
          address: (lb.address as string) ?? null,
          phone: (lb.phone as string) ?? null,
          avatar_url: (lb.logo_url as string) ?? null,
          rating: lb.rating != null ? Number(lb.rating) : null,
          review_count: Number(lb.review_count) || 0,
          lat,
          lng,
          distance_km: Math.round(dist * 100) / 100,
          is_available: true,
          opening_hours: (lb.opening_hours as string) ?? null,
        });
      }
    }

    // Filter by additional criteria
    let filtered = providers;

    if (filters?.is_available) {
      filtered = filtered.filter((p) => p.is_available);
    }
    if (filters?.min_rating != null) {
      filtered = filtered.filter(
        (p) => p.rating != null && p.rating >= (filters.min_rating ?? 0)
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance_km - b.distance_km);

    return filtered;
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function getProviderTypeConfig(type: ProviderType) {
  return PROVIDER_TYPE_CONFIG[type] ?? PROVIDER_TYPE_CONFIG.medico;
}
