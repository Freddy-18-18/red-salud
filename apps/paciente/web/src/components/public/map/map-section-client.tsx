'use client'

import { MapPin, Search, Stethoscope, Building2, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback } from 'react'

import { VenezuelaMapSVG } from './venezuela-map-svg'

import type { StateMapData } from '@/lib/types/public'

// ─── Types for the detail panel ─────────────────────────────────────────────

interface StateSpecialty {
  name: string
  count: number
}

interface StateCity {
  name: string
  count: number
}

interface StateDetail {
  stateName: string
  doctorCount: number
  specialties: StateSpecialty[]
  cities: StateCity[]
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface MapSectionClientProps {
  stateData: StateMapData[]
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MapSectionClient({ stateData }: MapSectionClientProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [stateDetail, setStateDetail] = useState<StateDetail | null>(null)

  const handleStateClick = useCallback(
    (stateName: string) => {
      if (selectedState === stateName) {
        // Clicking same state again deselects it
        setSelectedState(null)
        setStateDetail(null)
        return
      }

      setSelectedState(stateName)

      // Find the count from stateData
      const stateInfo = stateData.find(
        (s) =>
          s.stateName === stateName ||
          s.stateName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() ===
            stateName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
      )

      setStateDetail({
        stateName,
        doctorCount: stateInfo?.doctorCount ?? 0,
        // These arrays are empty for now -- designed for future data
        specialties: [],
        cities: [],
      })
    },
    [selectedState, stateData],
  )

  const handleClose = useCallback(() => {
    setSelectedState(null)
    setStateDetail(null)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Map */}
      <div
        className={`w-full transition-all duration-300 ${
          selectedState ? 'lg:w-[60%]' : 'lg:w-full lg:max-w-3xl lg:mx-auto'
        }`}
      >
        <VenezuelaMapSVG
          stateData={stateData}
          selectedState={selectedState}
          onStateClick={handleStateClick}
        />
      </div>

      {/* Detail Panel / Prompt */}
      <div
        className={`w-full transition-all duration-300 ${
          selectedState ? 'lg:w-[40%]' : 'lg:w-full lg:max-w-3xl lg:mx-auto'
        }`}
      >
        {selectedState && stateDetail ? (
          <StateDetailPanel key={selectedState} detail={stateDetail} onClose={handleClose} />
        ) : (
          <PromptPanel />
        )}
      </div>
    </div>
  )
}

// ─── State Detail Panel ─────────────────────────────────────────────────────

function StateDetailPanel({
  detail,
  onClose,
}: {
  detail: StateDetail
  onClose: () => void
}) {
  return (
    <div
      className="rounded-xl border animate-fade-in-up lg:animate-slide-in-right"
      style={{
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-3 border-b px-5 py-4"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="min-w-0">
          <h3
            className="text-xl font-bold tracking-tight"
            style={{ color: 'hsl(var(--card-foreground))' }}
          >
            {detail.stateName}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {detail.doctorCount === 0
              ? 'Sin doctores registrados aun'
              : `${detail.doctorCount} ${detail.doctorCount === 1 ? 'doctor verificado' : 'doctores verificados'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[hsl(var(--muted))]"
          aria-label="Cerrar panel de estado"
        >
          <X className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5 px-5 py-4">
        {/* Specialties */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="h-4 w-4 text-emerald-500" />
            <span
              className="text-sm font-medium"
              style={{ color: 'hsl(var(--card-foreground))' }}
            >
              Especialidades disponibles
            </span>
          </div>
          {detail.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detail.specialties.map((spec) => (
                <span
                  key={spec.name}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: 'hsl(160, 84%, 39%, 0.1)',
                    color: 'hsl(160, 84%, 30%)',
                  }}
                >
                  {spec.name}
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: 'hsl(160, 84%, 39%, 0.15)',
                    }}
                  >
                    {spec.count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Informacion de especialidades no disponible aun
            </p>
          )}
        </div>

        {/* Top Cities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-emerald-500" />
            <span
              className="text-sm font-medium"
              style={{ color: 'hsl(var(--card-foreground))' }}
            >
              Principales ciudades
            </span>
          </div>
          {detail.cities.length > 0 ? (
            <div className="space-y-2">
              {detail.cities.map((city) => (
                <div
                  key={city.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                  <span style={{ color: 'hsl(var(--card-foreground))' }}>
                    {city.name}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {city.count} {city.count === 1 ? 'doctor' : 'doctores'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Informacion de ciudades no disponible aun
            </p>
          )}
        </div>

        {/* Search CTA */}
        <Link
          href={`/buscar?estado=${encodeURIComponent(detail.stateName)}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Search className="h-4 w-4" />
          Buscar doctores en {detail.stateName}
        </Link>
      </div>
    </div>
  )
}

// ─── Prompt Panel (no state selected) ───────────────────────────────────────

function PromptPanel() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border px-6 py-10 text-center"
      style={{
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        borderStyle: 'dashed',
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: 'hsl(160, 84%, 39%, 0.1)' }}
      >
        <MapPin className="h-6 w-6 text-emerald-500" />
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'hsl(var(--card-foreground))' }}
      >
        Selecciona un estado para ver detalles
      </p>
      <p className="mt-1.5 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Haz clic en cualquier estado del mapa para explorar doctores en esa zona
      </p>
    </div>
  )
}
