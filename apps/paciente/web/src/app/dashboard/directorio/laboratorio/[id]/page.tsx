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
  FlaskConical,
  Truck,
  Smartphone,
  Calendar,
  BadgeCheck,
  FileText,
} from "lucide-react";
import type { LabDetail } from "@/lib/services/directory-service";

export default function LabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string>();

  const { detail, loading, error } = useProviderDetail(id, "laboratory");
  const lab = detail as LabDetail | null;

  const {
    reviews,
    breakdown,
    loading: reviewsLoading,
    loadingMore,
    hasMore,
    loadMoreReviews,
    refresh: refreshReviews,
  } = useProviderReviews(id, "laboratory");

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

  if (error || !lab) {
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
            {error || "No se encontro el laboratorio"}
          </p>
        </div>
      </div>
    );
  }

  const location = [lab.city, lab.state].filter(Boolean).join(", ");

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
          <div className="h-24 w-24 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {lab.avatarUrl ? (
              <img
                src={lab.avatarUrl}
                alt={lab.businessName}
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <FlaskConical className="h-10 w-10 text-amber-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {lab.businessName}
            </h1>

            {lab.labType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full mt-1">
                <FlaskConical className="h-3 w-3" />
                {lab.labType}
              </span>
            )}

            <div className="mt-2">
              <RatingDisplay
                rating={lab.avgRating}
                reviewCount={lab.reviewCount}
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
              {lab.avgDeliveryTimeHours != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs rounded-full">
                  <Truck className="h-3 w-3" />
                  Resultados en {lab.avgDeliveryTimeHours}h
                </span>
              )}
              {lab.acceptsDigitalOrders && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs rounded-full">
                  <Smartphone className="h-3 w-3" />
                  Ordenes digitales
                </span>
              )}
              {lab.labLicense && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                  <BadgeCheck className="h-3 w-3" />
                  Lic. {lab.labLicense}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <button
            onClick={() => {
              // Navigate to lab catalog or booking
              router.push(
                `/dashboard/pedidos?lab=${lab.profileId}`
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition"
          >
            <FileText className="h-4 w-4" />
            Ver catalogo de examenes
          </button>
          <button
            onClick={() => {
              router.push(
                `/dashboard/pedidos?lab=${lab.profileId}&action=schedule`
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <Calendar className="h-4 w-4" />
            Agendar turno
          </button>
        </div>
      </div>

      {/* Services */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Servicios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ServiceChip
            icon={Smartphone}
            label="Ordenes digitales"
            active={lab.acceptsDigitalOrders}
          />
          <ServiceChip
            icon={Truck}
            label={
              lab.avgDeliveryTimeHours != null
                ? `Entrega de resultados en ~${lab.avgDeliveryTimeHours}h`
                : "Tiempo de entrega no especificado"
            }
            active={lab.avgDeliveryTimeHours != null}
          />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hours */}
        {lab.officeHours && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <HoursDisplay hours={lab.officeHours} />
          </div>
        )}

        {/* Contact */}
        {lab.phone && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Contacto
            </h4>
            <a
              href={`tel:${lab.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition"
            >
              <Phone className="h-4 w-4 text-gray-400" />
              {lab.phone}
            </a>
          </div>
        )}

        {/* Delivery time */}
        {lab.avgDeliveryTimeHours != null && (
          <div className="p-5 bg-white border border-gray-100 rounded-xl">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Tiempo de entrega
            </h4>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold text-gray-900">
                ~{lab.avgDeliveryTimeHours}
              </span>
              <span className="text-sm text-gray-500">horas</span>
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <ReviewsSection
        providerId={id}
        providerType="laboratory"
        providerName={lab.businessName}
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
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Truck;
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
      <Icon className={`h-4 w-4 ${active ? "text-emerald-500" : "text-gray-300"}`} />
      {label}
    </div>
  );
}
