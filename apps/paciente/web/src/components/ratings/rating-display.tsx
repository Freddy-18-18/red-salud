"use client";

import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

import type { Rating } from "@/lib/services/rating-service";

interface RatingDisplayProps {
  rating: Rating;
  compact?: boolean;
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
    }

    return date.toLocaleDateString("es-VE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function RatingDisplay({ rating, compact = false }: RatingDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StarRating value={rating.rating} size="sm" />
        <span className="text-xs text-gray-500">
          {formatRelativeDate(rating.created_at)}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
      {/* Stars and date */}
      <div className="flex items-center justify-between">
        <StarRating value={rating.rating} size="md" />
        <span className="text-xs text-gray-400">
          {formatRelativeDate(rating.created_at)}
        </span>
      </div>

      {/* Comment */}
      {rating.comment && (
        <p className="text-sm text-gray-700 leading-relaxed">
          {rating.comment}
        </p>
      )}

      {/* Would recommend */}
      <div className="flex items-center gap-1.5">
        {rating.would_recommend ? (
          <>
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">
              Recomienda a este medico
            </span>
          </>
        ) : (
          <>
            <ThumbsDown className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">
              No recomienda a este medico
            </span>
          </>
        )}
      </div>
    </div>
  );
}
