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
  Shield,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Calendar,
  MessageSquare,
  Stethoscope,
  Building,
} from "lucide-react";
import type { DoctorDetail } from "@/lib/services/directory-service";

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string>();

  const { detail, loading, error } = useProviderDetail(id, "doctor");
  const doctor = detail as DoctorDetail | null;

  const {
    reviews,
    breakdown,
    loading: reviewsLoading,
    loadingMore,
    hasMore,
    loadMoreReviews,
    refresh: refreshReviews,
  } = useProviderReviews(id, "doctor");

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

  if (error || !doctor) {
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
            {error || "No se encontro el doctor"}
          </p>
        </div>
      </div>
    );
  }

  const location = [doctor.city, doctor.state].filter(Boolean).join(", ");

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
          <div className="h-24 w-24 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {doctor.avatarUrl ? (
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-3xl font-bold text-emerald-600">
                {doctor.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Dr. {doctor.name}
              </h1>
              {doctor.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full self-center sm:self-auto">
                  <Shield className="h-3 w-3" />
                  Verificado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
              <Stethoscope className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-600">{doctor.specialty}</span>
            </div>

            <div className="mt-2">
              <RatingDisplay
                rating={doctor.avgRating}
                reviewCount={doctor.reviewCount}
                size="md"
              />
            </div>

            {/* Quick info chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              {location && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {doctor.yearsExperience != null &&
                doctor.yearsExperience > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                    <Briefcase className="h-3 w-3" />
                    {doctor.yearsExperience} anos
                  </span>
                )}
              {doctor.acceptsInsurance && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                  <Shield className="h-3 w-3" />
                  Acepta seguro
                </span>
              )}
              {doctor.consultationFee != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                  <DollarSign className="h-3 w-3" />
                  {doctor.consultationFee.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <a
            href={`/dashboard/agendar?doctor=${doctor.profileId}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
          >
            <Calendar className="h-4 w-4" />
            Agendar cita
          </a>
          <a
            href={`/dashboard/mensajes?to=${doctor.profileId}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <MessageSquare className="h-4 w-4" />
            Mensaje
          </a>
          {doctor.phone && (
            <a
              href={`tel:${doctor.phone}`}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Biography */}
      {doctor.biography && (
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Acerca de
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {doctor.biography}
          </p>
        </div>
      )}

      {/* Office hours */}
      {doctor.officeHours && (
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <HoursDisplay hours={doctor.officeHours} />
        </div>
      )}

      {/* Offices */}
      {doctor.offices.length > 0 && (
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Consultorios
          </h3>
          <div className="space-y-3">
            {doctor.offices.map((office) => (
              <div
                key={office.id}
                className="p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {office.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {office.address}
                      {office.city && `, ${office.city}`}
                      {office.state && `, ${office.state}`}
                    </p>
                    {office.phone && (
                      <a
                        href={`tel:${office.phone}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-1 hover:text-emerald-700"
                      >
                        <Phone className="h-3 w-3" />
                        {office.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact info */}
      {(doctor.email || doctor.phone) && (
        <div className="p-5 bg-white border border-gray-100 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Contacto
          </h3>
          <div className="space-y-2">
            {doctor.email && (
              <a
                href={`mailto:${doctor.email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
              >
                <Mail className="h-4 w-4 text-gray-400" />
                {doctor.email}
              </a>
            )}
            {doctor.phone && (
              <a
                href={`tel:${doctor.phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
              >
                <Phone className="h-4 w-4 text-gray-400" />
                {doctor.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewsSection
        providerId={id}
        providerType="doctor"
        providerName={`Dr. ${doctor.name}`}
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
