import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { SpecialtyCard } from './specialty-card'

import type { PublicSpecialty } from '@/lib/types/public'

interface SpecialtyGridProps {
  specialties: PublicSpecialty[]
}

/**
 * Duplicate items enough times to ensure the marquee fills the viewport seamlessly.
 * We need at least 3x duplication for a smooth infinite loop.
 */
function duplicateForMarquee(items: PublicSpecialty[]): PublicSpecialty[] {
  if (items.length === 0) return []
  const copies = items.length < 6 ? 4 : 3
  return Array.from({ length: copies }, () => items).flat()
}

export function SpecialtyGrid({ specialties }: SpecialtyGridProps) {
  if (specialties.length === 0) return null

  const mid = Math.ceil(specialties.length / 2)
  const row1 = specialties.slice(0, mid)
  const row2 = specialties.slice(mid)

  const marqueeRow1 = duplicateForMarquee(row1)
  const marqueeRow2 = duplicateForMarquee(row2)

  return (
    <section className="py-20 px-4 bg-[hsl(var(--muted))] overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--foreground))] sm:text-4xl">
            Especialidades destacadas
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Encuentra al especialista que necesitas
          </p>
        </div>
      </div>

      {/* Marquee row 1 - scrolls left */}
      <div className="marquee-track mb-4 overflow-hidden">
        <div className="marquee-row-left flex w-max gap-4">
          {marqueeRow1.map((specialty, i) => (
            <div
              key={`r1-${specialty.id}-${i}`}
              className="w-48 shrink-0 transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl"
            >
              <SpecialtyCard specialty={specialty} />
            </div>
          ))}
        </div>
      </div>

      {/* Marquee row 2 - scrolls right */}
      <div className="marquee-track overflow-hidden">
        <div className="marquee-row-right flex w-max gap-4">
          {marqueeRow2.map((specialty, i) => (
            <div
              key={`r2-${specialty.id}-${i}`}
              className="w-48 shrink-0 transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl"
            >
              <SpecialtyCard specialty={specialty} />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mt-8 text-center">
          <Link
            href="/especialidades"
            className="inline-flex items-center gap-2 font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Ver todas las especialidades
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
