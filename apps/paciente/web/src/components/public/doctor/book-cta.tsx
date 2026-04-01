'use client'

import { CalendarPlus, Phone } from 'lucide-react'
import Link from 'next/link'

interface BookCtaProps {
  doctorName: string
}

export function BookCta({ doctorName }: BookCtaProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <h3 className="mb-1 text-lg font-semibold text-[hsl(var(--foreground))]">
        Agenda tu cita
      </h3>
      <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
        Reserva una consulta con {doctorName}
      </p>

      <Link
        href="/auth/register"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      >
        <CalendarPlus className="h-4 w-4" />
        Agendar cita
      </Link>

      <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Necesitas una cuenta para agendar. Es gratis.
      </p>

      <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Phone className="h-4 w-4" />
          Tambien puedes llamar al consultorio
        </div>
      </div>
    </div>
  )
}
