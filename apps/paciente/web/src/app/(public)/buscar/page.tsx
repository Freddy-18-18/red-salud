import { Search, Stethoscope, MapPin, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { DoctorCardList } from '@/components/public/doctor-card-list'
import { Pagination } from '@/components/public/pagination'
import { ActiveFilters } from '@/components/public/search/active-filters'
import { FilterPanel } from '@/components/public/search/filter-panel'
import { SearchForm } from '@/components/public/search/search-form'
import { SortDropdown } from '@/components/public/search/sort-dropdown'
import { getSpecialtiesWithDoctorCount } from '@/lib/services/public-data-service'
import { searchDoctors } from '@/lib/services/public-search-service'
import type { SearchFilters } from '@/lib/types/public'

interface BuscarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({
  searchParams,
}: BuscarPageProps): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = Object.keys(params).length > 0

  return {
    title: 'Buscar Doctores en Venezuela | Red-Salud',
    description:
      'Busca y compara doctores verificados en Venezuela. Filtra por especialidad, ubicacion, precio y valoraciones.',
    robots: hasFilters ? { index: false, follow: true } : undefined,
  }
}

/**
 * Parse raw URL search params into our typed SearchFilters.
 */
function parseFilters(
  raw: Record<string, string | string[] | undefined>,
): SearchFilters {
  const str = (key: string): string | undefined => {
    const val = raw[key]
    return typeof val === 'string' ? val : undefined
  }

  const sortMap: Record<string, SearchFilters['sortBy']> = {
    price_asc: 'price_asc',
    price_desc: 'price_desc',
    rating: 'rating',
  }

  return {
    q: str('q'),
    specialtySlug: str('especialidad'),
    state: str('estado'),
    city: str('ciudad'),
    acceptsInsurance: str('seguro') === 'true' ? true : undefined,
    minRating: str('valoracion') ? Number(str('valoracion')) : undefined,
    maxPrice: str('precio_max') ? Number(str('precio_max')) : undefined,
    gender: str('genero'),
    sortBy: sortMap[str('orden') ?? ''] ?? 'relevance',
    page: str('page') ? Number(str('page')) : 1,
    limit: 12,
  }
}

const SEARCH_SUGGESTIONS = [
  {
    icon: Stethoscope,
    label: 'Medicina General',
    href: '/buscar?especialidad=medicina-general',
  },
  {
    icon: Star,
    label: 'Mejor valorados',
    href: '/buscar?orden=rating',
  },
  {
    icon: MapPin,
    label: 'Distrito Capital',
    href: '/buscar?estado=Distrito%20Capital',
  },
]

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const rawParams = await searchParams
  const filters = parseFilters(rawParams)

  const [results, specialties] = await Promise.all([
    searchDoctors(filters),
    getSpecialtiesWithDoctorCount(),
  ])

  const hasActiveFilters = Object.keys(rawParams).length > 0

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Search header */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
            Buscar doctores
          </h1>
          <p className="mb-6 text-[hsl(var(--muted-foreground))]">
            Encuentra al especialista que necesitas entre nuestros profesionales
            verificados
          </p>
          <Suspense>
            <SearchForm specialties={specialties} />
          </Suspense>
        </div>
      </section>

      {/* Results area */}
      <section className="px-4 py-8">
        <div className="mx-auto flex max-w-7xl gap-8">
          {/* Filter sidebar (desktop) + mobile toggle */}
          <Suspense>
            <FilterPanel />
          </Suspense>

          {/* Main results */}
          <div className="min-w-0 flex-1">
            {/* Active filters + sort + count */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {results.total}{' '}
                  {results.total === 1
                    ? 'doctor encontrado'
                    : 'doctores encontrados'}
                </p>
                <Suspense>
                  <SortDropdown />
                </Suspense>
              </div>
              <Suspense>
                <ActiveFilters />
              </Suspense>
            </div>

            {/* Doctor cards or empty state */}
            {results.doctors.length > 0 ? (
              <DoctorCardList doctors={results.doctors} />
            ) : (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                  <Search className="h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  No encontramos doctores con estos criterios
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
                  {hasActiveFilters
                    ? 'Intenta ajustar los filtros o buscar con terminos mas amplios.'
                    : 'Prueba con alguna de estas busquedas sugeridas.'}
                </p>

                {/* Suggestions */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {SEARCH_SUGGESTIONS.map((suggestion) => (
                    <Link
                      key={suggestion.href}
                      href={suggestion.href}
                      className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                    >
                      <suggestion.icon className="h-4 w-4 text-emerald-500" />
                      {suggestion.label}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/especialidades"
                  className="mt-6 inline-block text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Ver todas las especialidades
                </Link>
              </div>
            )}

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="mt-8">
                <Suspense>
                  <Pagination
                    currentPage={results.page}
                    totalPages={results.totalPages}
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
