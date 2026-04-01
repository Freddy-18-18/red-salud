import { Users } from 'lucide-react'
import Link from 'next/link'

import { GradientBlob } from './decorative/gradient-blob'

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 px-4">
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
      <GradientBlob color="emerald" className="-left-24 top-1/4 h-64 w-64" />
      <GradientBlob color="blue" className="-right-20 bottom-0 h-56 w-56" />

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
          <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--foreground))] sm:text-4xl">
          Comienza a cuidar tu salud hoy
        </h2>

        <p className="mb-8 text-lg text-[hsl(var(--muted-foreground))]">
          Crea tu cuenta gratuita y accede a los mejores doctores de Venezuela.
          Sin costos ocultos, sin compromisos.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/register"
            className="w-full rounded-xl bg-emerald-500 px-8 py-3.5 text-center font-medium text-white transition-colors hover:bg-emerald-600 sm:w-auto"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/buscar"
            className="w-full rounded-xl border border-[hsl(var(--border))] px-8 py-3.5 text-center font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] sm:w-auto"
          >
            Explorar doctores
          </Link>
        </div>
      </div>
    </section>
  )
}
