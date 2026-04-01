import {
  Shield,
  Lock,
  Eye,
  Server,
  UserCheck,
  ShieldCheck,
  Ban,
  FileCheck,
  KeyRound,
  Database,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seguridad y Privacidad | Red-Salud',
  description:
    'Conoce como Red-Salud protege tu informacion medica. Encriptacion, seguridad a nivel de filas y los mas altos estandares de privacidad.',
}

const protectedData = [
  'Historial medico y diagnosticos',
  'Informacion personal (nombre, cedula, fecha de nacimiento)',
  'Conversaciones con tu medico',
  'Resultados de laboratorio',
  'Prescripciones y tratamientos',
  'Datos de contacto y ubicacion',
] as const

const neverSharedData = [
  'Tu informacion medica con terceros sin tu consentimiento',
  'Tus datos personales con fines publicitarios',
  'Tu historial de consultas con otros pacientes',
  'Tu informacion financiera con entidades no autorizadas',
  'Tus conversaciones privadas con medicos',
] as const

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encriptacion de Datos',
    description:
      'Toda la informacion que transmites esta protegida con encriptacion TLS/SSL de 256 bits. Tus datos viajan de forma segura entre tu dispositivo y nuestros servidores.',
    color: 'emerald',
  },
  {
    icon: Database,
    title: 'Seguridad a Nivel de Filas (RLS)',
    description:
      'Cada registro en nuestra base de datos tiene reglas de acceso individuales. Esto significa que solo TU puedes ver TU informacion. Ni siquiera otros usuarios con acceso al sistema pueden ver datos que no les pertenecen.',
    color: 'blue',
  },
  {
    icon: KeyRound,
    title: 'Autenticacion Segura',
    description:
      'Usamos autenticacion moderna con tokens seguros y sesiones encriptadas. Cada vez que inicias sesion, verificamos tu identidad de forma robusta.',
    color: 'purple',
  },
  {
    icon: Server,
    title: 'Infraestructura en la Nube',
    description:
      'Nuestros servidores estan alojados en infraestructura de clase mundial con redundancia, respaldos automaticos y monitoreo 24/7.',
    color: 'amber',
  },
] as const

const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
}

export default function SeguridadPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Shield className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
          Tu Seguridad es{' '}
          <span className="text-emerald-500">Nuestra Prioridad</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
          Proteger tu informacion medica no es opcional, es fundamental.
          Conoce como mantenemos tus datos seguros.
        </p>
      </section>

      {/* Security Features Grid */}
      <section className="mt-16">
        <div className="grid gap-6 md:grid-cols-2">
          {securityFeatures.map((feature) => {
            const colors = colorMap[feature.color]
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}
                >
                  <feature.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h2 className="text-xl font-bold text-[hsl(var(--card-foreground))]">
                  {feature.title}
                </h2>
                <p className="mt-3 leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* RLS Explanation (user-friendly) */}
      <section className="mt-20">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Como funciona la proteccion de tus datos?
              </h2>
              <p className="mt-4 leading-relaxed text-[hsl(var(--muted-foreground))]">
                Imagina que tu informacion medica esta en una caja fuerte
                personal dentro de un banco. Aunque el banco tiene miles de
                cajas fuertes, solo TU tienes la llave de la tuya. Eso es lo
                que hacemos con la tecnologia de{' '}
                <strong className="text-[hsl(var(--foreground))]">
                  Seguridad a Nivel de Filas
                </strong>
                .
              </p>
              <p className="mt-3 leading-relaxed text-[hsl(var(--muted-foreground))]">
                Cada vez que accedes a la plataforma, el sistema verifica tu
                identidad y solo te muestra la informacion que te pertenece.
                Tu medico solo puede ver los datos que TU has compartido con
                el. Ningun otro usuario, ni siquiera administradores del
                sistema, pueden acceder a tu informacion personal sin
                autorizacion explicita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Protect / What We Never Share */}
      <section className="mt-20 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-[hsl(var(--card-foreground))]">
            Datos que protegemos
          </h2>
          <ul className="mt-4 space-y-3">
            {protectedData.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <Ban className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[hsl(var(--card-foreground))]">
            Lo que NUNCA compartimos
          </h2>
          <ul className="mt-4 space-y-3">
            {neverSharedData.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Ban className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Privacy Commitment */}
      <section className="mt-20">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
              <UserCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Nuestro compromiso de privacidad
              </h2>
              <p className="mt-4 leading-relaxed text-[hsl(var(--muted-foreground))]">
                En Red-Salud nos comprometemos a:
              </p>
              <ul className="mt-4 space-y-2 text-[hsl(var(--muted-foreground))]">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Recopilar solo la informacion estrictamente necesaria para el funcionamiento de la plataforma.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Nunca vender tus datos a terceros bajo ninguna circunstancia.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Darte control total sobre tu informacion: puedes exportar o eliminar tus datos en cualquier momento.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Mantener la transparencia sobre como usamos y protegemos tus datos.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HIPAA Aspiration */}
      <section id="terminos" className="mt-20">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-4 text-xl font-bold text-[hsl(var(--foreground))]">
            Alineados con estandares internacionales
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Aunque HIPAA es una regulacion de Estados Unidos, en Red-Salud
            nos esforzamos por cumplir con sus principios de proteccion de
            datos de salud. Nuestras practicas de seguridad estan disenadas
            para igualar o superar los estandares internacionales de
            privacidad en el sector salud, preparandonos para operar en
            cualquier jurisdiccion.
          </p>
        </div>
      </section>
    </div>
  )
}
