import {
  Accessibility,
  Eye,
  Award,
  Lightbulb,
  Heart,
  MapPin,
  Users,
  Target,
  Sparkles,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Red-Salud',
  description:
    'Conoce a Red-Salud, la plataforma de salud digital para Venezuela. Nuestra mision es democratizar el acceso a la salud a traves de la tecnologia.',
}

const values = [
  {
    icon: Accessibility,
    title: 'Accesibilidad',
    description:
      'Creemos que toda persona merece acceso a atencion medica de calidad, sin importar donde se encuentre o su situacion economica.',
  },
  {
    icon: Eye,
    title: 'Transparencia',
    description:
      'Informacion clara sobre precios, disponibilidad y calificaciones. Sin costos ocultos, sin sorpresas.',
  },
  {
    icon: Award,
    title: 'Calidad',
    description:
      'Cada profesional en nuestra plataforma es verificado. Garantizamos estandares altos para tu tranquilidad.',
  },
  {
    icon: Lightbulb,
    title: 'Innovacion',
    description:
      'Usamos tecnologia de punta para simplificar la experiencia de salud: telemedicina, IA diagnostica, recetas digitales.',
  },
] as const

const teamMembers = [
  {
    initials: 'RS',
    name: 'Equipo de Ingenieria',
    role: 'Desarrollo de Plataforma',
  },
  {
    initials: 'MS',
    name: 'Equipo Medico',
    role: 'Asesoria Clinica',
  },
  {
    initials: 'UX',
    name: 'Equipo de Diseno',
    role: 'Experiencia de Usuario',
  },
  {
    initials: 'OP',
    name: 'Equipo de Operaciones',
    role: 'Soporte y Crecimiento',
  },
] as const

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Heart className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
          Sobre <span className="text-emerald-500">Red-Salud</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
          Estamos construyendo el futuro de la salud digital en Venezuela.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="mt-20 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Target className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Nuestra Mision
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
            Democratizar el acceso a la salud en Venezuela a traves de la
            tecnologia, conectando pacientes con profesionales de salud
            verificados de manera rapida, transparente y accesible.
          </p>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Nuestra Vision
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
            Ser la plataforma de salud digital lider en Latinoamerica,
            transformando la manera en que millones de personas acceden a
            atencion medica de calidad.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mt-20">
        <h2 className="text-center text-3xl font-bold text-[hsl(var(--foreground))]">
          Nuestros Valores
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[hsl(var(--muted-foreground))]">
          Los principios que guian cada decision que tomamos.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <value.icon className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Venezuela */}
      <section className="mt-20">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-12">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
              <MapPin className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Por que Venezuela primero?
              </h2>
              <p className="mt-3 text-[hsl(var(--muted-foreground))] leading-relaxed">
                Venezuela enfrenta retos unicos en su sistema de salud:
                migracion de profesionales, acceso limitado en zonas rurales y
                una infraestructura que necesita digitalizarse. Red-Salud nace
                para cerrar esas brechas. Comenzamos aqui porque conocemos la
                realidad, entendemos las necesidades y creemos que la tecnologia
                puede ser el puente entre pacientes y los profesionales que
                siguen comprometidos con el pais.
              </p>
              <p className="mt-3 text-[hsl(var(--muted-foreground))] leading-relaxed">
                Nuestro objetivo es probar que un sistema de salud digital puede
                funcionar en las condiciones mas desafiantes, para luego
                llevarlo a toda Latinoamerica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mt-20">
        <h2 className="text-center text-3xl font-bold text-[hsl(var(--foreground))]">
          Un equipo comprometido con la salud de Venezuela
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[hsl(var(--muted-foreground))]">
          Profesionales multidisciplinarios unidos por un mismo proposito:
          mejorar la salud de nuestro pais.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.initials}
              className="flex flex-col items-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <span className="text-lg font-bold text-emerald-500">
                  {member.initials}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-[hsl(var(--card-foreground))]">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
          <Users className="h-6 w-6 text-emerald-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-[hsl(var(--foreground))]">
          Se parte del cambio
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[hsl(var(--muted-foreground))]">
          Unete a miles de venezolanos que ya estan transformando su experiencia
          de salud.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/buscar"
            className="rounded-lg border border-[hsl(var(--border))] px-6 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
          >
            Explorar doctores
          </Link>
        </div>
      </section>
    </div>
  )
}
