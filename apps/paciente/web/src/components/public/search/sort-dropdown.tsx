'use client'

import { ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: '', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio (menor)' },
  { value: 'price_desc', label: 'Precio (mayor)' },
  { value: 'rating', label: 'Mejor valorados' },
]

export function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('orden') ?? ''

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('orden', value)
    } else {
      params.delete('orden')
    }
    params.delete('page')
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
