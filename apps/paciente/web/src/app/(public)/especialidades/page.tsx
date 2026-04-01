import { Stethoscope } from 'lucide-react'
import type { Metadata } from 'next'

import { SpecialtyDirectoryGrid } from '@/components/public/specialty-directory-grid'
import { getSpecialtiesWithDoctorCount } from '@/lib/services/public-data-service'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Especialidades Medicas | Red-Salud',
  description:
    'Explora todas las especialidades medicas disponibles en Red-Salud. Encuentra el especialista que necesitas en Venezuela.',
}

export default async function EspecialidadesPage() {
  const specialties = await getSpecialtiesWithDoctorCount()

  const totalDoctors = specialties.reduce((sum, s) => sum + s.doctorCount, 0)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
            Especialidades Medicas
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[hsl(var(--muted-foreground))]">
            Explora todas las especialidades disponibles y encuentra al profesional
            de salud que necesitas en Venezuela
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="rounded-full bg-[hsl(var(--background))] px-3 py-1 font-medium">
              {specialties.length} especialidades
            </span>
            <span className="rounded-full bg-[hsl(var(--background))] px-3 py-1 font-medium">
              {totalDoctors} especialistas
            </span>
          </div>
        </div>
      </section>

      {/* Grid with client-side filtering */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <SpecialtyDirectoryGrid specialties={specialties} />
        </div>
      </section>
    </div>
  )
}
