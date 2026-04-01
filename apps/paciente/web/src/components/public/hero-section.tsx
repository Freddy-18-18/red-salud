import { BgPattern } from './decorative/bg-pattern'
import { GradientBlob } from './decorative/gradient-blob'
import { SearchHero } from './search-hero'
import { TrustBadges } from './trust-badges'

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, hsl(160 40% 96%) 0%, hsl(var(--background)) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, hsl(160 30% 8%) 0%, hsl(var(--background)) 100%)',
        }}
      />

      {/* Decorative blobs */}
      <GradientBlob color="emerald" className="-top-20 -left-20 h-96 w-96" />
      <GradientBlob color="blue" className="-right-32 top-1/4 h-80 w-80" />
      <GradientBlob color="teal" className="-bottom-16 left-1/3 h-64 w-64" />

      {/* Subtle background pattern */}
      <BgPattern variant="dots" />

      <div className="mx-auto max-w-4xl text-center">
        <h1 className="animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-[hsl(var(--foreground))] sm:text-5xl md:text-6xl">
          Encuentra al medico ideal{' '}
          <span className="text-emerald-500">en Venezuela</span>
        </h1>

        <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-[hsl(var(--muted-foreground))] sm:text-xl">
          Busca especialistas verificados, agenda tu cita en minutos y gestiona
          tu salud en un solo lugar.
        </p>

        <div className="animate-fade-in-up delay-400 mt-10">
          <SearchHero />
        </div>

        <div className="animate-fade-in-up delay-500 mt-10">
          <TrustBadges />
        </div>
      </div>
    </section>
  )
}
