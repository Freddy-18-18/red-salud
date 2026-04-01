"use client";

import { Star, ThumbsUp, MessageSquare, ChevronDown } from "lucide-react";
import { useState } from "react";

import { RatingDisplay } from "@/components/directory/rating-display";
import { ReviewForm } from "@/components/directory/review-form";
import type {
  ProviderReview,
  RatingBreakdown,
  ProviderType,
  CreateReview,
} from "@/lib/services/directory-service";

interface ReviewsSectionProps {
  providerId: string;
  providerType: ProviderType;
  providerName: string;
  reviews: ProviderReview[];
  breakdown: RatingBreakdown | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSubmitReview: (data: CreateReview) => Promise<boolean>;
  submittingReview: boolean;
  userId?: string;
}

export function ReviewsSection({
  providerId,
  providerType,
  providerName,
  reviews,
  breakdown,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onSubmitReview,
  submittingReview,
  userId,
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="skeleton h-20 w-full rounded-xl" />
        <div className="skeleton h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Resenas
          {breakdown && breakdown.totalReviews > 0 && (
            <span className="text-gray-400 font-normal ml-1">
              ({breakdown.totalReviews})
            </span>
          )}
        </h3>
        {userId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
          >
            <MessageSquare className="h-4 w-4" />
            Escribir resena
          </button>
        )}
      </div>

      {/* Rating Breakdown */}
      {breakdown && breakdown.totalReviews > 0 && (
        <RatingBreakdownCard breakdown={breakdown} />
      )}

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
            >
              {loadingMore ? (
                "Cargando..."
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Cargar mas resenas
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold">Aun no hay resenas</p>
          <p className="text-sm text-gray-500 mt-1">
            Se el primero en compartir tu experiencia
          </p>
          {userId && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
            >
              Escribir resena
            </button>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        providerId={providerId}
        providerType={providerType}
        providerName={providerName}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={onSubmitReview}
        submitting={submittingReview}
      />
    </div>
  );
}

// --- Sub-components ---

function RatingBreakdownCard({
  breakdown,
}: {
  breakdown: RatingBreakdown;
}) {
  return (
    <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-xl">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Average */}
        <div className="text-center sm:text-left flex-shrink-0">
          <p className="text-4xl font-bold text-gray-900">
            {breakdown.avgRating.toFixed(1)}
          </p>
          <RatingDisplay
            rating={breakdown.avgRating}
            reviewCount={breakdown.totalReviews}
            size="md"
          />
          <p className="text-xs text-gray-500 mt-1">
            {breakdown.wouldRecommendPercent}% lo recomiendan
          </p>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = breakdown.distribution[star];
            const percent =
              breakdown.totalReviews > 0
                ? Math.round((count / breakdown.totalReviews) * 100)
                : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right text-gray-500 text-xs">
                  {star}
                </span>
                <Star className="h-3 w-3 text-amber-400 fill-current flex-shrink-0" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-gray-400">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ProviderReview }) {
  const initials = review.reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    "es-VE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl">
      {/* Author + rating */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {review.reviewerAvatar ? (
            <img
              src={review.reviewerAvatar}
              alt={review.reviewerName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-gray-500">
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {review.reviewerName}
            </p>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
          <RatingDisplay
            rating={review.rating}
            showCount={false}
          />
        </div>
      </div>

      {/* Title + comment */}
      {review.title && (
        <h4 className="text-sm font-semibold text-gray-900 mt-3">
          {review.title}
        </h4>
      )}
      {review.comment && (
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        {review.wouldRecommend && (
          <span className="flex items-center gap-1 text-emerald-600">
            <ThumbsUp className="h-3 w-3" />
            Lo recomienda
          </span>
        )}
        {review.visitDate && (
          <span>
            Visita:{" "}
            {new Date(review.visitDate + "T00:00:00").toLocaleDateString(
              "es-VE",
              { year: "numeric", month: "short" }
            )}
          </span>
        )}
      </div>
    </div>
  );
}
