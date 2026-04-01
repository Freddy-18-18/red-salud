'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

import type { PublicSpecialty } from '@/lib/types/public'

interface SearchFormProps {
  specialties: PublicSpecialty[]
}

export function SearchForm({ specialties }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [specialty, setSpecialty] = useState(searchParams.get('especialidad') ?? '')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const params = new URLSearchParams(searchParams.toString())

      if (query.trim()) {
        params.set('q', query.trim())
      } else {
        params.delete('q')
      }

      if (specialty) {
        params.set('especialidad', specialty)
      } else {
        params.delete('especialidad')
      }

      // Reset to page 1 on new search
      params.delete('page')

      router.push(`/buscar?${params.toString()}`)
    },
    [query, specialty, searchParams, router],
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      {/* Text input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder="Buscar por nombre, especialidad o ciudad..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-3 pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Specialty dropdown */}
      <select
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:w-56"
      >
        <option value="">Todas las especialidades</option>
        {specialties.map((s) => (
          <option key={s.id} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Submit */}
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      >
        Buscar
      </button>
    </form>
  )
}
