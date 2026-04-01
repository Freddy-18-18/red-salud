import { CheckCircle, MapPin, Clock } from 'lucide-react'

import { RatingStars } from '@/components/public/rating-stars'
import type { PublicDoctorDetail } from '@/lib/types/public'

interface DoctorProfileHeaderProps {
  doctor: PublicDoctorDetail
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatPrice(price: number | null): string | null {
  if (price == null) return null
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function DoctorProfileHeader({ doctor }: DoctorProfileHeaderProps) {
  const initials = getInitials(doctor.profile.name)
  const price = formatPrice(doctor.consultationFee)
  const location = [doctor.profile.city, doctor.profile.state]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      {/* Large avatar */}
      {doctor.profile.avatarUrl ? (
        <img
          src={doctor.profile.avatarUrl}
          alt={doctor.profile.name}
          className="h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-32"
        />
      ) : (
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl font-bold text-emerald-700 sm:h-32 sm:w-32 dark:bg-emerald-900 dark:text-emerald-300">
          {initials}
        </div>
      )}

      <div className="text-center sm:text-left">
        {/* Name + verified */}
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
            {doctor.profile.name}
          </h1>
          {doctor.verified && (
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          )}
        </div>

        {/* Specialty */}
        <p className="mt-1 text-lg text-[hsl(var(--muted-foreground))]">
          {doctor.specialty.name}
        </p>

        {/* Rating */}
        <div className="mt-2">
          <RatingStars
            rating={doctor.avgRating}
            reviewCount={doctor.reviewCount}
            size="md"
          />
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
          {location && (
            <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
              <MapPin className="h-4 w-4" />
              {location}
            </span>
          )}

          {doctor.yearsExperience != null && doctor.yearsExperience > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
              <Clock className="h-4 w-4" />
              {doctor.yearsExperience}{' '}
              {doctor.yearsExperience === 1 ? 'ano' : 'anos'} de experiencia
            </span>
          )}

          {price && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Consulta: {price}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
