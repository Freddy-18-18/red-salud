"use client";

import {
  ArrowLeft,
  MapPin,
  Phone,
  Pill,
  Smartphone,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { HoursDisplay } from "@/components/directory/hours-display";
import { RatingDisplay } from "@/components/directory/rating-display";
import { ReviewsSection } from "@/components/directory/reviews-section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProviderDetail,
  useProviderReviews,
  useSubmitReview,
} from "@/hooks/use-directory";
import type { PharmacyDetail } from "@/lib/services/directory-service";
import { supabase } from "@/lib/supabase/client";

export default function PharmacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string>();

  const { detail, loading, error } = useProviderDetail(id, "pharmacy");
  const pharmacy = detail as PharmacyDetail | null;

  const {
    reviews,
    breakdown,
    loading: reviewsLoading,
    loadingMore,
    hasMore,
    loadMoreReviews,
    refresh: refreshReviews,
  } = useProviderReviews(id, "pharmacy");

  const { submit: submitReview, loading: submittingReview } =
    useSubmitReview();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleSubmitReview = async (data: Parameters<typeof submitReview>[1]) => {
    if (!userId) return false;
    const success = await submitReview(userId, data);
    if (success) refreshReviews();
    return success;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="text-center py-16">
          <p className="text-gray-500">
            {error || "No se encontro la farmacia"}
          </p>
        </div>
      </div>
    );
  }

  const location = [pharmacy.city, pharmacy.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al directorio
      </button>

      {/* Profile header */}
      <div className="p-5 sm:p-6 bg-white border border-gray-100 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {pharmacy.avatarUrl ? (
              <img
                src={pharmacy.avatarUrl}
                alt={pharmacy.businessName}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <Pill className="h-10 w-10 text-blue-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {pharmacy.businessName}
            </h1>

            {pharmacy.pharmacyType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mt-1">
                <Pill className="h-3 w-3" />
                {pharmacy.pharmacyType}
              </span>
            )}

            <div className="mt-2">
              <RatingDisplay
                rating={pharmacy.avgRating}
                reviewCount={pharmacy.reviewCount}
                size="md"
              />
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              {location && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {pharmacy.acceptsDigitalPrescriptions && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                  <Smartphone className="h-3 w-3" />
                  Recetas digitales
                </span>
              )}
              {pharmacy.pharmacyLicense && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  <BadgeCheck className="h-3 w-3" />
                  Lic. {pharmacy.pharmacyLicense}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <a
            href={`/dashboard/farmacias?id=${pharmacy.profileId}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition"
          >
            <FileText className="h-4 w-4" />
            Buscar medicamento
          </a>
          {pharmacy.phone && (
            <a
              href={`tel:${pharmacy.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </a>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hours */}
        {pharmacy.officeHours && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <HoursDisplay hours={pharmacy.officeHours} />
          </div>
        )}

        {/* Contact */}
        {pharmacy.phone && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Contacto
            </h4>
            <a
              href={`tel:${pharmacy.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
            >
              <Phone className="h-4 w-4 text-gray-400" />
              {pharmacy.phone}
            </a>
          </div>
        )}
      </div>

      {/* Services */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Servicios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ServiceChip
            label="Recetas digitales"
            active={pharmacy.acceptsDigitalPrescriptions}
          />
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection
        providerId={id}
        providerType="pharmacy"
        providerName={pharmacy.businessName}
        reviews={reviews}
        breakdown={breakdown}
        loading={reviewsLoading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMoreReviews}
        onSubmitReview={handleSubmitReview}
        submittingReview={submittingReview}
        userId={userId}
      />
    </div>
  );
}

function ServiceChip({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-50 text-gray-400"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-300"
        }`}
      />
      {label}
    </div>
  );
}
