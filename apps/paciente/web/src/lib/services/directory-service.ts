import { supabase } from "@/lib/supabase/client";
import { fetchJson } from "@/lib/utils/fetch";

// --- Types ---

export type ProviderType = "doctor" | "pharmacy" | "clinic" | "laboratory";

export interface DirectoryFilters {
  query?: string;
  providerType?: ProviderType | "all";
  city?: string;
  state?: string;
  specialtyId?: string;
  minRating?: number;
  acceptsInsurance?: boolean;
  openNow?: boolean;
  hasDelivery?: boolean;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface DoctorFilters extends DirectoryFilters {
  specialtyId?: string;
  gender?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating";
}

export interface PharmacyFilters extends DirectoryFilters {
  pharmacyType?: string;
  acceptsDigitalPrescriptions?: boolean;
}

export interface ClinicFilters extends DirectoryFilters {
  clinicType?: string;
  minBedCount?: number;
}

export interface LabFilters extends DirectoryFilters {
  labType?: string;
  acceptsDigitalOrders?: boolean;
  maxDeliveryHours?: number;
}

export interface ProviderResult {
  id: string;
  type: ProviderType;
  name: string;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  avgRating: number | null;
  reviewCount: number;
  // Doctor-specific
  specialty?: string;
  specialtyId?: string;
  consultationFee?: number | null;
  acceptsInsurance?: boolean;
  yearsExperience?: number | null;
  officeHours?: string | null;
  // Pharmacy-specific
  businessName?: string;
  pharmacyType?: string;
  pharmacyLicense?: string;
  acceptsDigitalPrescriptions?: boolean;
  // Clinic-specific
  clinicType?: string;
  clinicLicense?: string;
  bedCount?: number | null;
  specialties?: string[];
  // Lab-specific
  labType?: string;
  labLicense?: string;
  avgDeliveryTimeHours?: number | null;
  acceptsDigitalOrders?: boolean;
}

export interface DoctorDetail {
  id: string;
  profileId: string;
  name: string;
  avatarUrl: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  specialty: string;
  specialtyId: string;
  consultationFee: number | null;
  acceptsInsurance: boolean;
  yearsExperience: number | null;
  biography: string | null;
  verified: boolean;
  avgRating: number | null;
  reviewCount: number;
  officeHours: string | null;
  offices: DoctorOffice[];
}

export interface DoctorOffice {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  phone: string | null;
}

export interface PharmacyDetail {
  id: string;
  profileId: string;
  businessName: string;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  pharmacyLicense: string | null;
  pharmacyType: string | null;
  officeHours: string | null;
  acceptsDigitalPrescriptions: boolean;
  avgRating: number | null;
  reviewCount: number;
}

export interface ClinicDetail {
  id: string;
  profileId: string;
  businessName: string;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  clinicLicense: string | null;
  clinicType: string | null;
  officeHours: string | null;
  bedCount: number | null;
  specialties: string[];
  avgRating: number | null;
  reviewCount: number;
}

export interface LabDetail {
  id: string;
  profileId: string;
  businessName: string;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  labLicense: string | null;
  labType: string | null;
  officeHours: string | null;
  avgDeliveryTimeHours: number | null;
  acceptsDigitalOrders: boolean;
  avgRating: number | null;
  reviewCount: number;
}

export interface ProviderReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  providerId: string;
  providerType: ProviderType;
  rating: number;
  title: string | null;
  comment: string | null;
  wouldRecommend: boolean;
  visitDate: string | null;
  createdAt: string;
}

export interface RatingBreakdown {
  avgRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  wouldRecommendPercent: number;
}

export interface CreateReview {
  providerId: string;
  providerType: ProviderType;
  rating: number;
  title?: string;
  comment?: string;
  wouldRecommend: boolean;
  visitDate?: string;
}

// --- Helpers ---

function computeRating(
  reviews: { provider_id: string; rating: number }[],
  providerId: string
): { avg: number | null; count: number } {
  const filtered = reviews.filter((r) => r.provider_id === providerId);
  if (filtered.length === 0) return { avg: null, count: 0 };
  const sum = filtered.reduce((acc, r) => acc + r.rating, 0);
  return {
    avg: Math.round((sum / filtered.length) * 10) / 10,
    count: filtered.length,
  };
}

function matchesQuery(text: string | null | undefined, query: string): boolean {
  if (!text || !query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function isCurrentlyOpen(officeHours: string | null): boolean {
  if (!officeHours) return false;
  // Simple heuristic: parse "Lun-Vie 8:00-18:00" format
  // For production, this would need proper JSONB parsing
  const now = new Date();
  const currentHour = now.getHours();
  const match = officeHours.match(/(\d{1,2}):?\d{0,2}\s*-\s*(\d{1,2}):?\d{0,2}/);
  if (!match) return false;
  const openHour = parseInt(match[1], 10);
  const closeHour = parseInt(match[2], 10);
  return currentHour >= openHour && currentHour < closeHour;
}

// --- Service ---

export const directoryService = {
  /**
   * Search across ALL provider types in a single query.
   * Returns mixed results sorted by relevance (rating-weighted).
   */
  async searchAll(filters: DirectoryFilters): Promise<{
    results: ProviderResult[];
    total: number;
    hasMore: boolean;
  }> {
    const limit = filters.limit || 20;
    const page = filters.page || 0;
    const q = filters.query?.trim().toLowerCase() || "";
    const type = filters.providerType || "all";

    const allResults: ProviderResult[] = [];

    // Fetch all provider types in parallel based on selected tab
    const promises: Promise<ProviderResult[]>[] = [];

    if (type === "all" || type === "doctor") {
      promises.push(this.fetchDoctors(q, filters));
    }
    if (type === "all" || type === "pharmacy") {
      promises.push(this.fetchPharmacies(q, filters));
    }
    if (type === "all" || type === "clinic") {
      promises.push(this.fetchClinics(q, filters));
    }
    if (type === "all" || type === "laboratory") {
      promises.push(this.fetchLabs(q, filters));
    }

    const results = await Promise.all(promises);
    results.forEach((r) => allResults.push(...r));

    // Sort by relevance (rating * review_count as weight)
    allResults.sort((a, b) => {
      const scoreA = (a.avgRating ?? 0) * Math.log2((a.reviewCount || 0) + 1);
      const scoreB = (b.avgRating ?? 0) * Math.log2((b.reviewCount || 0) + 1);
      return scoreB - scoreA;
    });

    // Paginate
    const start = page * limit;
    const paginated = allResults.slice(start, start + limit);

    return {
      results: paginated,
      total: allResults.length,
      hasMore: start + limit < allResults.length,
    };
  },

  /**
   * Search doctors specifically
   */
  async searchDoctors(
    query: string,
    filters: DoctorFilters
  ): Promise<ProviderResult[]> {
    return this.fetchDoctors(query.toLowerCase(), filters);
  },

  /**
   * Search pharmacies specifically
   */
  async searchPharmacies(
    query: string,
    filters: PharmacyFilters
  ): Promise<ProviderResult[]> {
    return this.fetchPharmacies(query.toLowerCase(), filters);
  },

  /**
   * Search clinics specifically
   */
  async searchClinics(
    query: string,
    filters: ClinicFilters
  ): Promise<ProviderResult[]> {
    return this.fetchClinics(query.toLowerCase(), filters);
  },

  /**
   * Search labs specifically
   */
  async searchLabs(
    query: string,
    filters: LabFilters
  ): Promise<ProviderResult[]> {
    return this.fetchLabs(query.toLowerCase(), filters);
  },

  /**
   * Get full provider detail by ID and type
   */
  async getProviderDetail(
    id: string,
    type: ProviderType
  ): Promise<DoctorDetail | PharmacyDetail | ClinicDetail | LabDetail | null> {
    switch (type) {
      case "doctor":
        return this.getDoctorDetail(id);
      case "pharmacy":
        return this.getPharmacyDetail(id);
      case "clinic":
        return this.getClinicDetail(id);
      case "laboratory":
        return this.getLabDetail(id);
    }
  },

  /**
   * Get reviews for a provider with rating breakdown
   */
  async getProviderReviews(
    providerId: string,
    providerType: ProviderType,
    page: number = 0,
    limit: number = 10
  ): Promise<{
    reviews: ProviderReview[];
    breakdown: RatingBreakdown;
    hasMore: boolean;
  }> {
    // Get all reviews for breakdown computation
    const { data: allReviews, error: countError } = await supabase
      .from("provider_reviews")
      .select("rating, would_recommend")
      .eq("provider_id", providerId)
      .eq("provider_type", providerType);

    if (countError) throw countError;

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let ratingSum = 0;
    let recommendCount = 0;

    (allReviews || []).forEach((r: { rating: number; would_recommend: boolean }) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[star]++;
      ratingSum += r.rating;
      if (r.would_recommend) recommendCount++;
    });

    const totalReviews = allReviews?.length || 0;
    const breakdown: RatingBreakdown = {
      avgRating: totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0,
      totalReviews,
      distribution,
      wouldRecommendPercent:
        totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 0,
    };

    // Fetch paginated reviews with reviewer info
    const from = page * limit;
    const to = from + limit - 1;

    const { data: reviews, error: reviewsError } = await supabase
      .from("provider_reviews")
      .select(
        `
        id,
        reviewer_id,
        provider_id,
        provider_type,
        rating,
        title,
        comment,
        would_recommend,
        visit_date,
        created_at,
        reviewer:profiles!provider_reviews_reviewer_id_fkey(full_name, avatar_url)
      `
      )
      .eq("provider_id", providerId)
      .eq("provider_type", providerType)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (reviewsError) throw reviewsError;

    const mapped: ProviderReview[] = (reviews || []).map(
      (r: Record<string, unknown>) => {
        const reviewer = r.reviewer as {
          full_name: string | null;
          avatar_url: string | null;
        } | null;
        return {
          id: r.id as string,
          reviewerId: r.reviewer_id as string,
          reviewerName: reviewer?.full_name || "Paciente",
          reviewerAvatar: reviewer?.avatar_url || null,
          providerId: r.provider_id as string,
          providerType: r.provider_type as ProviderType,
          rating: r.rating as number,
          title: r.title as string | null,
          comment: r.comment as string | null,
          wouldRecommend: r.would_recommend as boolean,
          visitDate: r.visit_date as string | null,
          createdAt: r.created_at as string,
        };
      }
    );

    return {
      reviews: mapped,
      breakdown,
      hasMore: from + limit < totalReviews,
    };
  },

  /**
   * Submit a new review for a provider
   */
  async submitReview(
    userId: string,
    data: CreateReview
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from("provider_reviews").insert({
      reviewer_id: userId,
      provider_id: data.providerId,
      provider_type: data.providerType,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment || null,
      would_recommend: data.wouldRecommend,
      visit_date: data.visitDate || null,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Ya dejaste una resena para este proveedor." };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Get specialties list (reused from booking service pattern)
   */
  async getSpecialties(): Promise<{ id: string; name: string }[]> {
    try {
      const data = await fetchJson<{ id: string; name: string; icon: string | null; description: string | null }[]>(
        "/api/specialties"
      );
      return (data || []).map((s) => ({ id: s.id, name: s.name }));
    } catch {
      return [];
    }
  },

  // --- Internal fetch methods ---

  async fetchDoctors(
    q: string,
    filters: DirectoryFilters
  ): Promise<ProviderResult[]> {
    // Build query params for the BFF API route
    const params = new URLSearchParams();
    if (filters.specialtyId) params.set("specialty_id", filters.specialtyId);
    if (filters.city) params.set("city", filters.city);
    if (filters.acceptsInsurance) params.set("accepts_insurance", "true");
    params.set("page_size", "50"); // fetch a large page for client-side filtering

    const qs = params.toString();
    const url = `/api/doctors/search${qs ? `?${qs}` : ""}`;

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

    const doctors = await fetchJson<ApiDoctor[]>(url);
    if (!doctors || doctors.length === 0) return [];

    let results: ProviderResult[] = doctors.map((d) => {
      const fullName = d.profile
        ? `${d.profile.first_name} ${d.profile.last_name}`.trim()
        : "";
      return {
        id: d.user_id || d.id,
        type: "doctor" as ProviderType,
        name: fullName,
        avatarUrl: d.profile?.avatar_url ?? null,
        city: d.city,
        state: null, // API doesn't return state separately
        phone: d.profile?.phone ?? null,
        avgRating: d.avg_rating,
        reviewCount: d.review_count,
        specialty: d.specialty?.name,
        specialtyId: d.specialty?.id,
        consultationFee: d.consultation_fee,
        acceptsInsurance: d.accepts_insurance || false,
        yearsExperience: d.years_experience,
        officeHours: null,
      };
    });

    // Apply client-side filters not handled by the API
    if (q) {
      results = results.filter(
        (r) =>
          matchesQuery(r.name, q) ||
          matchesQuery(r.specialty, q) ||
          matchesQuery(r.city, q) ||
          matchesQuery(r.state, q)
      );
    }
    if (filters.state) {
      results = results.filter((r) => matchesQuery(r.state, filters.state!));
    }
    if (filters.minRating) {
      results = results.filter(
        (r) => r.avgRating != null && r.avgRating >= filters.minRating!
      );
    }
    if (filters.openNow) {
      results = results.filter((r) => isCurrentlyOpen(r.officeHours || null));
    }
    if (filters.maxPrice != null) {
      results = results.filter(
        (r) =>
          r.consultationFee == null || r.consultationFee <= filters.maxPrice!
      );
    }

    return results;
  },

  async fetchPharmacies(
    q: string,
    filters: DirectoryFilters
  ): Promise<ProviderResult[]> {
    // Build query params for the BFF pharmacy search route
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (q) params.set("name", q);
    const qs = params.toString();

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

    const pharmacies = await fetchJson<ApiPharmacy[]>(
      `/api/pharmacy/search${qs ? `?${qs}` : ""}`
    );

    if (!pharmacies || pharmacies.length === 0) return [];

    let results: ProviderResult[] = pharmacies.map((ph) => ({
      id: ph.id,
      type: "pharmacy" as ProviderType,
      name: ph.name || "Farmacia",
      avatarUrl: ph.logo_url,
      city: null, // Search route doesn't return city/state separately
      state: null,
      phone: ph.phone,
      avgRating: ph.rating,
      reviewCount: ph.review_count || 0,
      businessName: ph.name,
      officeHours: ph.opening_hours,
    }));

    if (filters.state) {
      results = results.filter((r) => matchesQuery(r.state, filters.state!));
    }
    if (filters.minRating) {
      results = results.filter(
        (r) => r.avgRating != null && r.avgRating >= filters.minRating!
      );
    }
    if (filters.openNow) {
      results = results.filter((r) => isCurrentlyOpen(r.officeHours || null));
    }
    if ((filters as PharmacyFilters).acceptsDigitalPrescriptions) {
      results = results.filter((r) => r.acceptsDigitalPrescriptions);
    }

    return results;
  },

  async fetchClinics(
    q: string,
    filters: DirectoryFilters
  ): Promise<ProviderResult[]> {
    const { data, error } = await supabase
      .from("clinic_details")
      .select(
        `
        id,
        profile_id,
        business_name,
        clinic_license,
        clinic_type,
        office_hours,
        bed_count,
        specialties,
        profile:profiles!inner(id, full_name, avatar_url, city, state, phone)
      `
      );

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const profileIds = data.map((d: { profile_id: string }) => d.profile_id);
    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("provider_id, rating")
      .eq("provider_type", "clinic")
      .in("provider_id", profileIds);

    let results: ProviderResult[] = data.map((d: Record<string, unknown>) => {
      const profile = d.profile as {
        id: string;
        full_name: string;
        avatar_url: string | null;
        city: string | null;
        state: string | null;
        phone: string | null;
      };
      const { avg, count } = computeRating(
        (reviews || []) as { provider_id: string; rating: number }[],
        profile.id
      );

      return {
        id: profile.id,
        type: "clinic" as ProviderType,
        name: (d.business_name as string) || profile.full_name,
        avatarUrl: profile.avatar_url,
        city: profile.city,
        state: profile.state,
        phone: profile.phone,
        avgRating: avg,
        reviewCount: count,
        businessName: d.business_name as string,
        clinicType: d.clinic_type as string,
        clinicLicense: d.clinic_license as string,
        officeHours: d.office_hours as string | null,
        bedCount: (d.bed_count as number) || null,
        specialties: (d.specialties as string[]) || [],
      };
    });

    if (q) {
      results = results.filter(
        (r) =>
          matchesQuery(r.name, q) ||
          matchesQuery(r.businessName, q) ||
          matchesQuery(r.clinicType, q) ||
          matchesQuery(r.city, q) ||
          r.specialties?.some((s) => matchesQuery(s, q))
      );
    }
    if (filters.city) {
      results = results.filter((r) => matchesQuery(r.city, filters.city!));
    }
    if (filters.state) {
      results = results.filter((r) => matchesQuery(r.state, filters.state!));
    }
    if (filters.minRating) {
      results = results.filter(
        (r) => r.avgRating != null && r.avgRating >= filters.minRating!
      );
    }
    if (filters.openNow) {
      results = results.filter((r) => isCurrentlyOpen(r.officeHours || null));
    }

    return results;
  },

  async fetchLabs(
    q: string,
    filters: DirectoryFilters
  ): Promise<ProviderResult[]> {
    const { data, error } = await supabase
      .from("laboratory_details")
      .select(
        `
        id,
        profile_id,
        business_name,
        laboratory_license,
        laboratory_type,
        office_hours,
        avg_delivery_time_hours,
        accepts_digital_orders,
        profile:profiles!inner(id, full_name, avatar_url, city, state, phone)
      `
      );

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const profileIds = data.map((d: { profile_id: string }) => d.profile_id);
    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("provider_id, rating")
      .eq("provider_type", "laboratory")
      .in("provider_id", profileIds);

    let results: ProviderResult[] = data.map((d: Record<string, unknown>) => {
      const profile = d.profile as {
        id: string;
        full_name: string;
        avatar_url: string | null;
        city: string | null;
        state: string | null;
        phone: string | null;
      };
      const { avg, count } = computeRating(
        (reviews || []) as { provider_id: string; rating: number }[],
        profile.id
      );

      return {
        id: profile.id,
        type: "laboratory" as ProviderType,
        name: (d.business_name as string) || profile.full_name,
        avatarUrl: profile.avatar_url,
        city: profile.city,
        state: profile.state,
        phone: profile.phone,
        avgRating: avg,
        reviewCount: count,
        businessName: d.business_name as string,
        labType: d.laboratory_type as string,
        labLicense: d.laboratory_license as string,
        officeHours: d.office_hours as string | null,
        avgDeliveryTimeHours: (d.avg_delivery_time_hours as number) || null,
        acceptsDigitalOrders:
          (d.accepts_digital_orders as boolean) || false,
      };
    });

    if (q) {
      results = results.filter(
        (r) =>
          matchesQuery(r.name, q) ||
          matchesQuery(r.businessName, q) ||
          matchesQuery(r.labType, q) ||
          matchesQuery(r.city, q)
      );
    }
    if (filters.city) {
      results = results.filter((r) => matchesQuery(r.city, filters.city!));
    }
    if (filters.state) {
      results = results.filter((r) => matchesQuery(r.state, filters.state!));
    }
    if (filters.minRating) {
      results = results.filter(
        (r) => r.avgRating != null && r.avgRating >= filters.minRating!
      );
    }
    if (filters.openNow) {
      results = results.filter((r) => isCurrentlyOpen(r.officeHours || null));
    }
    if (filters.hasDelivery) {
      results = results.filter(
        (r) => r.avgDeliveryTimeHours != null && r.avgDeliveryTimeHours > 0
      );
    }
    if ((filters as LabFilters).acceptsDigitalOrders) {
      results = results.filter((r) => r.acceptsDigitalOrders);
    }

    return results;
  },

  // --- Detail fetchers ---

  async getDoctorDetail(profileId: string): Promise<DoctorDetail | null> {
    interface ApiDoctorDetail {
      id: string;
      user_id: string;
      is_active: boolean;
      consultation_fee: number | null;
      accepts_insurance: boolean;
      city: string | null;
      address: string | null;
      years_experience: number | null;
      biography: string | null;
      education: unknown;
      languages: unknown;
      profile: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        phone: string | null;
        email: string | null;
      } | null;
      specialty: {
        id: string;
        name: string;
        icon: string | null;
        description: string | null;
      } | null;
      avg_rating: number | null;
      review_count: number;
    }

    try {
      const doctor = await fetchJson<ApiDoctorDetail>(
        `/api/doctors/${profileId}`
      );
      if (!doctor) return null;

      const fullName = doctor.profile
        ? `${doctor.profile.first_name} ${doctor.profile.last_name}`.trim()
        : "";

      return {
        id: doctor.id,
        profileId: doctor.user_id || profileId,
        name: fullName,
        avatarUrl: doctor.profile?.avatar_url ?? null,
        email: doctor.profile?.email ?? null,
        city: doctor.city,
        state: null,
        phone: doctor.profile?.phone ?? null,
        specialty: doctor.specialty?.name || "",
        specialtyId: doctor.specialty?.id || "",
        consultationFee: doctor.consultation_fee,
        acceptsInsurance: doctor.accepts_insurance || false,
        yearsExperience: doctor.years_experience,
        biography: doctor.biography,
        verified: doctor.is_active || false,
        avgRating: doctor.avg_rating,
        reviewCount: doctor.review_count,
        officeHours: null,
        offices: [], // Offices not returned by the API route yet
      };
    } catch {
      return null;
    }
  },

  async getPharmacyDetail(
    profileId: string
  ): Promise<PharmacyDetail | null> {
    try {
      interface ApiPharmacy {
        id: string;
        name: string;
        address: string | null;
        phone: string | null;
        logo_url: string | null;
        rating: number | null;
        review_count: number;
        opening_hours: string | null;
      }

      // Use BFF search route filtered to match a specific pharmacy
      const pharmacies = await fetchJson<ApiPharmacy[]>(
        `/api/pharmacy/search`
      );

      const match = (pharmacies || []).find((ph) => ph.id === profileId);
      if (!match) return null;

      return {
        id: match.id,
        profileId,
        businessName: match.name || "Farmacia",
        avatarUrl: match.logo_url,
        city: null,
        state: null,
        phone: match.phone,
        pharmacyLicense: null,
        pharmacyType: null,
        officeHours: match.opening_hours,
        acceptsDigitalPrescriptions: false,
        avgRating: match.rating,
        reviewCount: match.review_count || 0,
      };
    } catch {
      return null;
    }
  },

  async getClinicDetail(profileId: string): Promise<ClinicDetail | null> {
    const { data, error } = await supabase
      .from("clinic_details")
      .select(
        `
        id,
        profile_id,
        business_name,
        clinic_license,
        clinic_type,
        office_hours,
        bed_count,
        specialties,
        profile:profiles!inner(id, full_name, avatar_url, city, state, phone)
      `
      )
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const profile = data.profile as unknown as {
      id: string;
      full_name: string;
      avatar_url: string | null;
      city: string | null;
      state: string | null;
      phone: string | null;
    };

    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("rating")
      .eq("provider_id", profileId)
      .eq("provider_type", "clinic");

    const reviewCount = reviews?.length || 0;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            ((reviews || []).reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0
            ) /
              reviewCount) *
              10
          ) / 10
        : null;

    return {
      id: data.id as string,
      profileId: profile.id,
      businessName: (data.business_name as string) || profile.full_name,
      avatarUrl: profile.avatar_url,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      clinicLicense: data.clinic_license as string | null,
      clinicType: data.clinic_type as string | null,
      officeHours: data.office_hours as string | null,
      bedCount: (data.bed_count as number) || null,
      specialties: (data.specialties as string[]) || [],
      avgRating,
      reviewCount,
    };
  },

  async getLabDetail(profileId: string): Promise<LabDetail | null> {
    const { data, error } = await supabase
      .from("laboratory_details")
      .select(
        `
        id,
        profile_id,
        business_name,
        laboratory_license,
        laboratory_type,
        office_hours,
        avg_delivery_time_hours,
        accepts_digital_orders,
        profile:profiles!inner(id, full_name, avatar_url, city, state, phone)
      `
      )
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const profile = data.profile as unknown as {
      id: string;
      full_name: string;
      avatar_url: string | null;
      city: string | null;
      state: string | null;
      phone: string | null;
    };

    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("rating")
      .eq("provider_id", profileId)
      .eq("provider_type", "laboratory");

    const reviewCount = reviews?.length || 0;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            ((reviews || []).reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0
            ) /
              reviewCount) *
              10
          ) / 10
        : null;

    return {
      id: data.id as string,
      profileId: profile.id,
      businessName: (data.business_name as string) || profile.full_name,
      avatarUrl: profile.avatar_url,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      labLicense: data.laboratory_license as string | null,
      labType: data.laboratory_type as string | null,
      officeHours: data.office_hours as string | null,
      avgDeliveryTimeHours: (data.avg_delivery_time_hours as number) || null,
      acceptsDigitalOrders:
        (data.accepts_digital_orders as boolean) || false,
      avgRating,
      reviewCount,
    };
  },
};
