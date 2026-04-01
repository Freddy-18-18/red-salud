'use client'

import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

// Venezuelan states for the location filter
const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoategui', 'Apure', 'Aragua', 'Barinas',
  'Bolivar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital',
  'Falcon', 'Guarico', 'Lara', 'Merida', 'Miranda',
  'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Tachira',
  'Trujillo', 'Vargas', 'Yaracuy', 'Zulia',
]

const RATING_OPTIONS = [
  { value: '4', label: '4+ estrellas' },
  { value: '3', label: '3+ estrellas' },
  { value: '2', label: '2+ estrellas' },
]

const PRICE_OPTIONS = [
  { value: '20', label: 'Hasta $20' },
  { value: '50', label: 'Hasta $50' },
  { value: '100', label: 'Hasta $100' },
]

export function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    price: true,
    rating: true,
    other: true,
  })

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset page on filter change
      router.push(`/buscar?${params.toString()}`)
    },
    [searchParams, router],
  )

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const currentState = searchParams.get('estado') ?? ''
  const currentCity = searchParams.get('ciudad') ?? ''
  const currentMaxPrice = searchParams.get('precio_max') ?? ''
  const currentMinRating = searchParams.get('valoracion') ?? ''
  const currentInsurance = searchParams.get('seguro') === 'true'
  const currentGender = searchParams.get('genero') ?? ''

  const filterContent = (
    <div className="space-y-6">
      {/* Location */}
      <FilterSection
        title="Ubicacion"
        expanded={expandedSections.location}
        onToggle={() => toggleSection('location')}
      >
        <select
          value={currentState}
          onChange={(e) => {
            updateParam('estado', e.target.value || null)
            // Clear city when state changes
            if (!e.target.value) updateParam('ciudad', null)
          }}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {VENEZUELAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {currentState && (
          <input
            type="text"
            placeholder="Ciudad..."
            value={currentCity}
            onChange={(e) =>
              updateParam('ciudad', e.target.value || null)
            }
            className="mt-2 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-emerald-500 focus:outline-none"
          />
        )}
      </FilterSection>

      {/* Price */}
      <FilterSection
        title="Precio"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-2">
          {PRICE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-[hsl(var(--foreground))]"
            >
              <input
                type="radio"
                name="price"
                checked={currentMaxPrice === option.value}
                onChange={() => updateParam('precio_max', option.value)}
                className="accent-emerald-600"
              />
              {option.label}
            </label>
          ))}
          {currentMaxPrice && (
            <button
              onClick={() => updateParam('precio_max', null)}
              className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Quitar filtro de precio
            </button>
          )}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Valoracion"
        expanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-[hsl(var(--foreground))]"
            >
              <input
                type="radio"
                name="rating"
                checked={currentMinRating === option.value}
                onChange={() => updateParam('valoracion', option.value)}
                className="accent-emerald-600"
              />
              {option.label}
            </label>
          ))}
          {currentMinRating && (
            <button
              onClick={() => updateParam('valoracion', null)}
              className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Quitar filtro de valoracion
            </button>
          )}
        </div>
      </FilterSection>

      {/* Other filters */}
      <FilterSection
        title="Otros filtros"
        expanded={expandedSections.other}
        onToggle={() => toggleSection('other')}
      >
        <div className="space-y-3">
          {/* Insurance */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[hsl(var(--foreground))]">
            <input
              type="checkbox"
              checked={currentInsurance}
              onChange={(e) =>
                updateParam('seguro', e.target.checked ? 'true' : null)
              }
              className="accent-emerald-600"
            />
            Acepta seguro medico
          </label>

          {/* Gender */}
          <select
            value={currentGender}
            onChange={(e) => updateParam('genero', e.target.value || null)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Cualquier genero</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
      </button>

      {/* Mobile slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[hsl(var(--background))] p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Filtros
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Filtros
          </h2>
          {filterContent}
        </div>
      </aside>
    </>
  )
}

// Collapsible section helper
function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-[hsl(var(--border))] pb-4 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1 text-sm font-medium text-[hsl(var(--foreground))]"
      >
        {title}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        )}
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  )
}
