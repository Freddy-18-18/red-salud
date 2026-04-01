import {
  Calendar,
  Users,
  Globe,
  FileText,
  Pill,
  Video,
  ArrowRight,
  Stethoscope,
  TrendingUp,
  Clock,
  Shield,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Para Profesionales de la Salud | Red-Salud',
  description:
    'Haz crecer tu practica medica con Red-Salud. Agenda digital, gestion de pacientes, telemedicina y mas.',
}

const benefits = [
  {
    icon: Calendar,
    title: 'Agenda Digital',
    description:
      'Gestiona tu agenda de citas online. Tus pacientes agendan directamente y tu recibes notificaciones en tiempo real.',
  },
  {
    icon: Users,
    title: 'Gestion de Pacientes',
    description:
      'Historial clinico digital, notas de consulta y seguimiento de tratamientos en un solo lugar.',
  },
  {
    icon: Globe,
    title: 'Presencia Online',
    description:
      'Perfil publico verificado con calificaciones, especialidades y ubicacion. Pacientes te encuentran facilmente.',
  },
  {
    icon: FileText,
    title: 'Historial Medico Digital',
    description:
      'Accede al historial completo de tus pacientes: diagnosticos previos, alergias, medicamentos y resultados de laboratorio.',
  },
  {
    icon: Pill,
    title: 'Recetas Electronicas',
    description:
      'Genera recetas digitales con codigos QR verificables. Envialas directamente al paciente o a la farmacia.',
  },
  {
    icon: Video,
    title: 'Telemedicina',
    description:
      'Consultas por videollamada integradas. Atiende pacientes de todo el pais sin importar la distancia.',
  },
] as const

const stats: readonly { value: string; label: string; suffix?: string }[] = [
  { value: '500+', label: 'Doctores confian en Red-Salud' },
  { value: '50+', label: 'Especialidades disponibles' },
  { value: '10K+', label: 'Citas agendadas' },
  { value: '4.8', label: 'Calificacion promedio', suffix: '/5' },
]

export default function ParaProfesionalesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                <Stethoscope className="h-4 w-4" />
                Para Profesionales de la Salud
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
                Haz crecer tu practica medica con{' '}
                <span className="text-emerald-500">Red-Salud</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
                La plataforma digital que te conecta con miles de pacientes,
                digitaliza tu consultorio y te permite enfocarte en lo que mejor
                haces: atender pacientes.
              </p>
              <div className="mt-8">
                <a
                  href="https://medico.redsalud.ve/auth/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                >
                  Conoce mas en nuestra plataforma para profesionales
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                Seras redirigido a nuestra plataforma para profesionales de la
                salud.
              </p>
            </div>

            {/* Illustration placeholder */}
            <div className="flex w-full max-w-sm shrink-0 items-center justify-center">
              <div className="flex h-64 w-full items-center justify-center rounded-2xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <div className="text-center">
                  <Stethoscope className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    Dashboard del Medico
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-emerald-500 sm:text-3xl">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-lg text-[hsl(var(--muted-foreground))]">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Todo lo que necesitas para tu consultorio
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[hsl(var(--muted-foreground))]">
            Herramientas disenadas por y para profesionales de la salud.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <benefit.icon className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Red-Salud */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Por que los medicos eligen Red-Salud?
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <TrendingUp className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="mt-4 font-semibold text-[hsl(var(--foreground))]">
                Mas pacientes
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Miles de pacientes buscan medicos en nuestra plataforma
                diariamente. Tu perfil verificado te da visibilidad inmediata.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <Clock className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="mt-4 font-semibold text-[hsl(var(--foreground))]">
                Menos tiempo administrativo
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Automatiza la agenda, los recordatorios y el seguimiento. Dedica
                tu tiempo a lo que importa: tus pacientes.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Shield className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="mt-4 font-semibold text-[hsl(var(--foreground))]">
                Seguridad garantizada
              </h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Datos encriptados, seguridad a nivel de filas y cumplimiento con
                estandares internacionales de privacidad medica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Listo para hacer crecer tu practica?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
            Unete a los cientos de profesionales que ya confian en Red-Salud
            para gestionar su consultorio.
          </p>
          <a
            href="https://medico.redsalud.ve/auth/register"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Conoce mas en nuestra plataforma para profesionales
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            Seras redirigido a nuestra plataforma para profesionales de la
            salud.
          </p>
        </div>
      </section>
    </div>
  )
}
