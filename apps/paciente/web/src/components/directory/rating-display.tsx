import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number | null;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function RatingDisplay({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
}: RatingDisplayProps) {
  if (rating == null) {
    return (
      <span className="text-xs text-gray-400">Sin resenas</span>
    );
  }

  const iconSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textSize = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";
  const countSize = size === "lg" ? "text-sm" : "text-xs";

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${iconSize} text-amber-400 fill-current`}
          />
        ))}
        {hasHalf && (
          <div className="relative">
            <Star className={`${iconSize} text-gray-200`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${iconSize} text-amber-400 fill-current`} />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${iconSize} text-gray-200`} />
        ))}
      </div>
      <span className={`font-medium text-gray-700 ${textSize}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount != null && (
        <span className={`text-gray-400 ${countSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

// Compact star display for cards
interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, max = 5, size = "sm" }: StarRatingProps) {
  const iconSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < Math.round(rating)
              ? "text-amber-400 fill-current"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
