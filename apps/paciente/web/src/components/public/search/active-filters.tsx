'use client'

import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Maps URL param keys to human-readable labels.
 */
const FILTER_LABELS: Record<string, string> = {
  q: 'Busqueda',
  especialidad: 'Especialidad',
  estado: 'Estado',
  ciudad: 'Ciudad',
  precio_max: 'Precio max',
  valoracion: 'Valoracion min',
  seguro: 'Acepta seguro',
  genero: 'Genero',
}

/** Params that represent active filters (excluding pagination and sort). */
const FILTER_KEYS = Object.keys(FILTER_LABELS)

function formatValue(key: string, value: string): string {
  if (key === 'seguro') return 'Si'
  if (key === 'precio_max') return `$${value}`
  if (key === 'valoracion') return `${value}+ estrellas`
  return value
}

export function ActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFilters = FILTER_KEYS.filter((key) => searchParams.has(key)).map(
    (key) => ({
      key,
      label: FILTER_LABELS[key],
      value: searchParams.get(key)!,
    }),
  )

  if (activeFilters.length === 0) return null

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    // If removing state, also remove city
    if (key === 'estado') params.delete('ciudad')
    params.delete('page')
    router.push(`/buscar?${params.toString()}`)
  }

  const clearAll = () => {
    // Keep only sort
    const params = new URLSearchParams()
    const sort = searchParams.get('orden')
    if (sort) params.set('orden', sort)
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(({ key, label, value }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs text-[hsl(var(--foreground))]"
        >
          <span className="font-medium">{label}:</span>{' '}
          {formatValue(key, value)}
          <button
            onClick={() => removeFilter(key)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-[hsl(var(--border))]"
            aria-label={`Remover filtro ${label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
