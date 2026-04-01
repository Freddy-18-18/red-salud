import { CheckCircle, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

import { RatingStars } from './rating-stars'

import type { PublicDoctor } from '@/lib/types/public'


interface DoctorCardProps {
  doctor: PublicDoctor
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

export function DoctorCard({ doctor }: DoctorCardProps) {
  const initials = getInitials(doctor.profile.name)
  const price = formatPrice(doctor.consultationFee)
  const location = [doctor.profile.city, doctor.profile.state]
    .filter(Boolean)
    .join(', ')

  return (
    <Link
      href={`/medicos/${doctor.slug}`}
      className="group flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:shadow-lg dark:hover:border-emerald-800"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {doctor.profile.avatarUrl ? (
          <img
            src={doctor.profile.avatarUrl}
            alt={doctor.profile.name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Name + verified */}
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-[hsl(var(--foreground))]">
              {doctor.profile.name}
            </h3>
            {doctor.verified && (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
            )}
          </div>

          {/* Specialty */}
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {doctor.specialty.name}
          </p>

          {/* Rating */}
          <div className="mt-1">
            <RatingStars rating={doctor.avgRating} reviewCount={doctor.reviewCount} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[hsl(var(--border))] pt-4">
        {/* Price */}
        {price && (
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {price}
          </span>
        )}

        {/* Location */}
        {location && (
          <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>
        )}

        {/* Experience */}
        {doctor.yearsExperience != null && doctor.yearsExperience > 0 && (
          <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3.5 w-3.5" />
            {doctor.yearsExperience} {doctor.yearsExperience === 1 ? 'ano' : 'anos'} exp.
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4">
        <span className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:group-hover:bg-emerald-900">
          Ver perfil
        </span>
      </div>
    </Link>
  )
}
