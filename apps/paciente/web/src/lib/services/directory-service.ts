import { supabase } from "@/lib/supabase/client";

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
    const { data, error } = await supabase
      .from("specialties")
      .select("id, name")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  // --- Internal fetch methods ---

  async fetchDoctors(
    q: string,
    filters: DirectoryFilters
  ): Promise<ProviderResult[]> {
    const { data, error } = await supabase
      .from("doctor_details")
      .select(
        `
        id,
        profile_id,
        specialty_id,
        consultation_fee,
        accepts_insurance,
        years_experience,
        office_hours,
        verified,
        profile:profiles!inner(id, full_name, avatar_url, city, state, phone),
        specialty:specialties(id, name)
      `
      )
      .eq("verified", true);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get ratings
    const profileIds = data.map((d: { profile_id: string }) => d.profile_id);
    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("provider_id, rating")
      .eq("provider_type", "doctor")
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
      const specialty = d.specialty as { id: string; name: string } | null;
      const { avg, count } = computeRating(
        (reviews || []) as { provider_id: string; rating: number }[],
        profile.id
      );

      return {
        id: profile.id,
        type: "doctor" as ProviderType,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        city: profile.city,
        state: profile.state,
        phone: profile.phone,
        avgRating: avg,
        reviewCount: count,
        specialty: specialty?.name,
        specialtyId: specialty?.id,
        consultationFee: d.consultation_fee
          ? parseFloat(d.consultation_fee as string)
          : null,
        acceptsInsurance: (d.accepts_insurance as boolean) || false,
        yearsExperience: (d.years_experience as number) || null,
        officeHours: (d.office_hours as string) || null,
      };
    });

    // Apply filters
    if (q) {
      results = results.filter(
        (r) =>
          matchesQuery(r.name, q) ||
          matchesQuery(r.specialty, q) ||
          matchesQuery(r.city, q) ||
          matchesQuery(r.state, q)
      );
    }
    if (filters.city) {
      results = results.filter((r) => matchesQuery(r.city, filters.city!));
    }
    if (filters.state) {
      results = results.filter((r) => matchesQuery(r.state, filters.state!));
    }
    if (filters.specialtyId) {
      results = results.filter((r) => r.specialtyId === filters.specialtyId);
    }
    if (filters.minRating) {
      results = results.filter(
        (r) => r.avgRating != null && r.avgRating >= filters.minRating!
      );
    }
    if (filters.acceptsInsurance) {
      results = results.filter((r) => r.acceptsInsurance);
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
    const { data, error } = await supabase
      .from("pharmacy_details")
      .select(
        `
        id,
        profile_id,
        business_name,
        pharmacy_license,
        pharmacy_type,
        office_hours,
        accepts_digital_prescriptions,
        profile:profiles!inner(id, full_name, avatar_url, city, state, phone)
      `
      );

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const profileIds = data.map((d: { profile_id: string }) => d.profile_id);
    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("provider_id, rating")
      .eq("provider_type", "pharmacy")
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
        type: "pharmacy" as ProviderType,
        name: (d.business_name as string) || profile.full_name,
        avatarUrl: profile.avatar_url,
        city: profile.city,
        state: profile.state,
        phone: profile.phone,
        avgRating: avg,
        reviewCount: count,
        businessName: d.business_name as string,
        pharmacyType: d.pharmacy_type as string,
        pharmacyLicense: d.pharmacy_license as string,
        officeHours: d.office_hours as string | null,
        acceptsDigitalPrescriptions:
          (d.accepts_digital_prescriptions as boolean) || false,
      };
    });

    if (q) {
      results = results.filter(
        (r) =>
          matchesQuery(r.name, q) ||
          matchesQuery(r.businessName, q) ||
          matchesQuery(r.pharmacyType, q) ||
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
    const { data, error } = await supabase
      .from("doctor_details")
      .select(
        `
        id,
        profile_id,
        specialty_id,
        consultation_fee,
        accepts_insurance,
        years_experience,
        biografia,
        office_hours,
        verified,
        profile:profiles!inner(id, full_name, email, avatar_url, city, state, phone),
        specialty:specialties(id, name)
      `
      )
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const profile = data.profile as unknown as {
      id: string;
      full_name: string;
      email: string | null;
      avatar_url: string | null;
      city: string | null;
      state: string | null;
      phone: string | null;
    };
    const specialty = data.specialty as unknown as { id: string; name: string };

    // Get offices
    const { data: offices } = await supabase
      .from("doctor_offices")
      .select("id, name, address, city, state, phone")
      .eq("doctor_id", profileId);

    // Get rating
    const { data: reviews } = await supabase
      .from("provider_reviews")
      .select("rating")
      .eq("provider_id", profileId)
      .eq("provider_type", "doctor");

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
      name: profile.full_name,
      avatarUrl: profile.avatar_url,
      email: profile.email,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      specialty: specialty.name,
      specialtyId: specialty.id,
      consultationFee: data.consultation_fee
        ? parseFloat(data.consultation_fee as string)
        : null,
      acceptsInsurance: (data.accepts_insurance as boolean) || false,
      yearsExperience: (data.years_experience as number) || null,
      biography: (data.biografia as string) || null,
      verified: (data.verified as boolean) || false,
      avgRating,
      reviewCount,
      officeHours: (data.office_hours as string) || null,
      offices: (offices || []).map((o: Record<string, unknown>) => ({
        id: o.id as string,
        name: o.name as string,
        address: o.address as string,
        city: o.city as string | null,
        state: o.state as string | null,
        phone: o.phone as string | null,
      })),
    };
  },

  async getPharmacyDetail(
    profileId: string
  ): Promise<PharmacyDetail | null> {
    const { data, error } = await supabase
      .from("pharmacy_details")
      .select(
        `
        id,
        profile_id,
        business_name,
        pharmacy_license,
        pharmacy_type,
        office_hours,
        accepts_digital_prescriptions,
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
      .eq("provider_type", "pharmacy");

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
      pharmacyLicense: data.pharmacy_license as string | null,
      pharmacyType: data.pharmacy_type as string | null,
      officeHours: data.office_hours as string | null,
      acceptsDigitalPrescriptions:
        (data.accepts_digital_prescriptions as boolean) || false,
      avgRating,
      reviewCount,
    };
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
