import { DoctorCard } from '@/components/public/doctor-card'
import type { PublicDoctor } from '@/lib/types/public'

interface SimilarDoctorsProps {
  doctors: PublicDoctor[]
}

export function SimilarDoctors({ doctors }: SimilarDoctorsProps) {
  if (doctors.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-[hsl(var(--foreground))]">
        Doctores similares
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  )
}
