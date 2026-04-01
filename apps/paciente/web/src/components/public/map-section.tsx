import { MapSectionClient } from './map/map-section-client'

import { getStateDoctorCounts } from '@/lib/services/public-data-service'

export async function MapSection() {
  const stateData = await getStateDoctorCounts()

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Subtle gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(150 20% 97%) 50%, hsl(var(--background)) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(160 15% 8%) 50%, hsl(var(--background)) 100%)',
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            Doctores en toda Venezuela
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
            Explora por estado para encontrar especialistas cerca de ti
          </p>
        </div>

        <MapSectionClient stateData={stateData} />

        {/* Quick stats below the map */}
        {stateData.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <span>
              <strong className="text-[hsl(var(--foreground))]">{stateData.length}</strong> estados
              con doctores
            </span>
            <span className="hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <span>
              <strong className="text-[hsl(var(--foreground))]">
                {stateData.reduce((sum, s) => sum + s.doctorCount, 0)}
              </strong>{' '}
              doctores verificados
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
