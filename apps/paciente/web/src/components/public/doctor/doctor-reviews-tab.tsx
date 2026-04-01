'use client'

import { Star, User, ChevronDown } from 'lucide-react'
import { useState, useCallback } from 'react'

import { getDoctorReviews } from '@/lib/services/public-data-service'
import type { PublicReview } from '@/lib/types/public'

interface DoctorReviewsTabProps {
  doctorId: string
  initialReviews: PublicReview[]
}

export function DoctorReviewsTab({
  doctorId,
  initialReviews,
}: DoctorReviewsTabProps) {
  const [reviews, setReviews] = useState<PublicReview[]>(initialReviews)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialReviews.length >= 20)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const nextPage = page + 1
      const { reviews: newReviews, total } = await getDoctorReviews(
        doctorId,
        nextPage,
        10,
      )
      setReviews((prev) => [...prev, ...newReviews])
      setPage(nextPage)
      setHasMore(reviews.length + newReviews.length < total)
    } catch {
      // Silently fail, user can retry
    } finally {
      setLoading(false)
    }
  }, [doctorId, page, reviews.length])

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-12 text-center">
        <User className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-40" />
        <p className="text-[hsl(var(--foreground))]">
          Este doctor aun no tiene opiniones
        </p>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Se el primero en dejar tu opinion despues de una consulta
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {loading ? 'Cargando...' : 'Ver mas opiniones'}
          </button>
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: PublicReview }) {
  const date = new Date(review.createdAt)
  const formattedDate = date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Reviewer avatar placeholder */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {review.isAnonymous ? (
              <User className="h-5 w-5" />
            ) : (
              review.reviewerName
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {review.reviewerName}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex shrink-0">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-[hsl(var(--muted-foreground))] opacity-40'
              }`}
            />
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {review.comment}
        </p>
      )}
    </div>
  )
}
