'use client'

import { Search, LayoutGrid, List } from 'lucide-react'
import { useState, useMemo } from 'react'

import { SpecialtyCard } from './specialty-card'
import { SpecialtyRowCard } from './specialty-row-card'

import type { PublicSpecialty } from '@/lib/types/public'

interface SpecialtyDirectoryGridProps {
  specialties: PublicSpecialty[]
}

export function SpecialtyDirectoryGrid({ specialties }: SpecialtyDirectoryGridProps) {
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    if (!query.trim()) return specialties
    const q = query.toLowerCase()
    return specialties.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q),
    )
  }, [specialties, query])

  return (
    <>
      {/* Search + view toggle */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Buscar especialidad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 pl-9 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="hidden items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
            aria-label="Vista en cuadricula"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
            aria-label="Vista en lista"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Search className="mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-40" />
          <p className="text-base font-medium text-[hsl(var(--foreground))]">
            No se encontraron especialidades
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Intenta con otro termino de busqueda
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
            {filtered.length} {filtered.length === 1 ? 'especialidad' : 'especialidades'} disponibles
          </p>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((specialty) => (
                <SpecialtyCard key={specialty.id} specialty={specialty} />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((specialty) => (
                <SpecialtyRowCard key={specialty.id} specialty={specialty} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
