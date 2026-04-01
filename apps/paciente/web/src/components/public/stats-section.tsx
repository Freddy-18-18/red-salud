import { BgPattern } from './decorative/bg-pattern'
import { StatsCounter } from './stats-counter'

import type { PlatformStats } from '@/lib/types/public'

interface StatsSectionProps {
  stats: PlatformStats
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="relative py-16 px-4 bg-emerald-500 dark:bg-emerald-600 overflow-hidden">
      <BgPattern variant="waves" />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatsCounter
            value={stats.doctorCount}
            label="Doctores verificados"
            suffix="+"
            valueClassName="text-white"
            labelClassName="text-emerald-100"
          />
          <StatsCounter
            value={stats.specialtyCount}
            label="Especialidades"
            valueClassName="text-white"
            labelClassName="text-emerald-100"
          />
          <StatsCounter
            value={stats.patientCount}
            label="Pacientes atendidos"
            suffix="+"
            valueClassName="text-white"
            labelClassName="text-emerald-100"
          />
          <StatsCounter
            value={stats.avgRating}
            label="Satisfaccion promedio"
            suffix="/5"
            valueClassName="text-white"
            labelClassName="text-emerald-100"
          />
        </div>
      </div>
    </section>
  )
}
