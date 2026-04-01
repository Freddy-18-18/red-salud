import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number | null
  reviewCount?: number
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, reviewCount, size = 'sm' }: RatingStarsProps) {
  const displayRating = rating ?? 0
  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.round(displayRating)
          return (
            <Star
              key={i}
              className={`${starSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-[hsl(var(--muted-foreground))] opacity-40'
              }`}
            />
          )
        })}
      </div>
      {rating != null && (
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount != null && reviewCount > 0 && (
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          ({reviewCount} {reviewCount === 1 ? 'opinion' : 'opiniones'})
        </span>
      )}
    </div>
  )
}
