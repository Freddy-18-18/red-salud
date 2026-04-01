import { Shield, Calendar, Banknote, HeartPulse } from 'lucide-react'

import type { PublicDoctorDetail, DoctorSchedule } from '@/lib/types/public'

interface DoctorInfoTabProps {
  doctor: PublicDoctorDetail
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sabado',
  sunday: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miercoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sabado',
  domingo: 'Domingo',
}

function formatPrice(price: number | null): string | null {
  if (price == null) return null
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function ScheduleDisplay({ schedule }: { schedule: DoctorSchedule }) {
  const days = Object.entries(schedule)
  const activeDays = days.filter(([, info]) => info.enabled && info.slots.length > 0)

  if (activeDays.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Horario no disponible
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {activeDays.map(([day, info]) => (
        <div
          key={day}
          className="flex items-start justify-between text-sm"
        >
          <span className="font-medium text-[hsl(var(--foreground))]">
            {DAY_LABELS[day.toLowerCase()] ?? day}
          </span>
          <div className="text-right text-[hsl(var(--muted-foreground))]">
            {info.slots.map((slot, i) => (
              <span key={i}>
                {slot.start} - {slot.end}
                {i < info.slots.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function DoctorInfoTab({ doctor }: DoctorInfoTabProps) {
  const price = formatPrice(doctor.consultationFee)
  const hasSchedule = Object.keys(doctor.schedule).length > 0

  return (
    <div className="space-y-8">
      {/* Biography */}
      {doctor.biography && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]">
            Sobre el doctor
          </h3>
          <p className="leading-relaxed text-[hsl(var(--muted-foreground))]">
            {doctor.biography}
          </p>
        </section>
      )}

      {/* Info cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Consultation fee */}
        {price && (
          <InfoCard
            icon={<Banknote className="h-5 w-5" />}
            title="Tarifa de consulta"
            value={price}
          />
        )}

        {/* Insurance */}
        <InfoCard
          icon={<Shield className="h-5 w-5" />}
          title="Seguro medico"
          value={doctor.acceptsInsurance ? 'Acepta seguro' : 'No acepta seguro'}
        />

        {/* Experience */}
        {doctor.yearsExperience != null && doctor.yearsExperience > 0 && (
          <InfoCard
            icon={<HeartPulse className="h-5 w-5" />}
            title="Experiencia"
            value={`${doctor.yearsExperience} ${doctor.yearsExperience === 1 ? 'ano' : 'anos'} de experiencia`}
          />
        )}
      </div>

      {/* Schedule */}
      {hasSchedule && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Horario de atencion
            </h3>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <ScheduleDisplay schedule={doctor.schedule} />
          </div>
        </section>
      )}
    </div>
  )
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {title}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--foreground))]">
          {value}
        </p>
      </div>
    </div>
  )
}
