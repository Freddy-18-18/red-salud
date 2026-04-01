import { Search } from 'lucide-react'

import { DoctorCard } from './doctor-card'

import type { PublicDoctor } from '@/lib/types/public'

interface DoctorCardListProps {
  doctors: PublicDoctor[]
  emptyMessage?: string
}

export function DoctorCardList({
  doctors,
  emptyMessage = 'No se encontraron doctores',
}: DoctorCardListProps) {
  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center">
        <Search className="mb-4 h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-40" />
        <p className="text-lg font-medium text-[hsl(var(--foreground))]">
          {emptyMessage}
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Intenta ajustar los filtros o buscar otra especialidad
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  )
}
