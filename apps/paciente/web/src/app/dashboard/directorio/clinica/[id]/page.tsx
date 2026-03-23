"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  useProviderDetail,
  useProviderReviews,
  useSubmitReview,
} from "@/hooks/use-directory";
import { RatingDisplay } from "@/components/directory/rating-display";
import { HoursDisplay } from "@/components/directory/hours-display";
import { ReviewsSection } from "@/components/directory/reviews-section";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  BedDouble,
  Stethoscope,
  Users,
  BadgeCheck,
  MessageSquare,
} from "lucide-react";
import type { ClinicDetail } from "@/lib/services/directory-service";

export default function ClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string>();

  const { detail, loading, error } = useProviderDetail(id, "clinic");
  const clinic = detail as ClinicDetail | null;

  const {
    reviews,
    breakdown,
    loading: reviewsLoading,
    loadingMore,
    hasMore,
    loadMoreReviews,
    refresh: refreshReviews,
  } = useProviderReviews(id, "clinic");

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

  if (error || !clinic) {
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
            {error || "No se encontro la clinica"}
          </p>
        </div>
      </div>
    );
  }

  const location = [clinic.city, clinic.state].filter(Boolean).join(", ");

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
          <div className="h-24 w-24 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {clinic.avatarUrl ? (
              <img
                src={clinic.avatarUrl}
                alt={clinic.businessName}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <Building2 className="h-10 w-10 text-purple-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {clinic.businessName}
            </h1>

            {clinic.clinicType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full mt-1">
                <Building2 className="h-3 w-3" />
                {clinic.clinicType}
              </span>
            )}

            <div className="mt-2">
              <RatingDisplay
                rating={clinic.avgRating}
                reviewCount={clinic.reviewCount}
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
              {clinic.bedCount != null && clinic.bedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                  <BedDouble className="h-3 w-3" />
                  {clinic.bedCount} camas
                </span>
              )}
              {clinic.specialties.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                  <Stethoscope className="h-3 w-3" />
                  {clinic.specialties.length} especialidad
                  {clinic.specialties.length > 1 ? "es" : ""}
                </span>
              )}
              {clinic.clinicLicense && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  <BadgeCheck className="h-3 w-3" />
                  Lic. {clinic.clinicLicense}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <button
            onClick={() =>
              router.push(
                `/dashboard/directorio?type=doctor&clinic=${clinic.profileId}`
              )
            }
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 transition"
          >
            <Users className="h-4 w-4" />
            Ver especialistas
          </button>
          {clinic.phone ? (
            <a
              href={`tel:${clinic.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <Phone className="h-4 w-4" />
              Contactar
            </a>
          ) : (
            <button
              onClick={() =>
                router.push(
                  `/dashboard/mensajes?to=${clinic.profileId}`
                )
              }
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <MessageSquare className="h-4 w-4" />
              Contactar
            </button>
          )}
        </div>
      </div>

      {/* Specialties */}
      {clinic.specialties.length > 0 && (
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Especialidades disponibles
          </h3>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
              >
                <Stethoscope className="h-3 w-3" />
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hours */}
        {clinic.officeHours && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <HoursDisplay hours={clinic.officeHours} />
          </div>
        )}

        {/* Contact */}
        {clinic.phone && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Contacto
            </h4>
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition"
            >
              <Phone className="h-4 w-4 text-gray-400" />
              {clinic.phone}
            </a>
          </div>
        )}

        {/* Bed count */}
        {clinic.bedCount != null && clinic.bedCount > 0 && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Capacidad
            </h4>
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">
                {clinic.bedCount}
              </span>
              <span className="text-sm text-gray-500">camas</span>
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <ReviewsSection
        providerId={id}
        providerType="clinic"
        providerName={clinic.businessName}
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
