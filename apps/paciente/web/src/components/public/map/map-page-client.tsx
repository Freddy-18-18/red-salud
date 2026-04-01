'use client'

import { MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { InteractiveVenezuelaMap } from './interactive-venezuela-map'
import { VenezuelaMapSVG } from './venezuela-map-svg'

import type { StateMapData } from '@/lib/types/public'

interface MapPageClientProps {
  stateData: StateMapData[]
}

export function MapPageClient({ stateData }: MapPageClientProps) {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const handleStateSelect = useCallback(
    (stateName: string) => {
      setSelectedState(stateName)
      router.push(`/buscar?estado=${encodeURIComponent(stateName)}`)
    },
    [router],
  )

  const totalDoctors = stateData.reduce((sum, s) => sum + s.doctorCount, 0)
  const topStates = [...stateData].sort((a, b) => b.doctorCount - a.doctorCount).slice(0, 8)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <section className="border-b border-[hsl(var(--border))] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
                Mapa de doctores
              </h1>
              <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                Explora el mapa interactivo para encontrar especialistas en cada estado
              </p>
            </div>
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              <Search className="h-4 w-4" />
              Buscar doctores
            </Link>
          </div>
        </div>
      </section>

      {/* Map + sidebar */}
      <section className="px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
          {/* Map */}
          <div className="min-w-0 flex-1">
            {hasMapboxToken ? (
              <InteractiveVenezuelaMap
                stateData={stateData}
                onStateSelect={handleStateSelect}
                className="h-[500px] w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] md:h-[600px] lg:h-[700px]"
              />
            ) : (
              <div className="rounded-xl border border-[hsl(var(--border))] p-6">
                <VenezuelaMapSVG
                  stateData={stateData}
                  onStateClick={handleStateSelect}
                />
              </div>
            )}
          </div>

          {/* Sidebar: state list */}
          <aside className="w-full shrink-0 lg:w-72">
            {/* Summary card */}
            <div className="mb-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Total de doctores
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalDoctors}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                en {stateData.length} estados
              </p>
            </div>

            {/* State ranking */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="border-b border-[hsl(var(--border))] px-4 py-3">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Estados con mas doctores
                </h3>
              </div>
              <ul className="divide-y divide-[hsl(var(--border))]">
                {topStates.map((state) => (
                  <li key={state.stateId}>
                    <Link
                      href={`/buscar?estado=${encodeURIComponent(state.stateName)}`}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[hsl(var(--muted))] ${
                        selectedState === state.stateName
                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                          : ''
                      }`}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="min-w-0 flex-1 truncate text-sm text-[hsl(var(--foreground))]">
                        {state.stateName}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {state.doctorCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {stateData.length > 8 && (
                <div className="border-t border-[hsl(var(--border))] px-4 py-3 text-center">
                  <Link
                    href="/buscar"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Ver todos los estados
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
