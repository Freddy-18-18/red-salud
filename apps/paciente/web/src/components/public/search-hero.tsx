'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchHero() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/buscar?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/buscar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por especialidad, doctor o condicion..."
          className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] py-4 pl-12 pr-32 text-base text-[hsl(var(--foreground))] shadow-lg placeholder:text-[hsl(var(--muted-foreground))] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="absolute right-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
