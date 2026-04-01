import {
  Check,
  Crown,
  Heart,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Shield,
  Users,
  Brain,
  FileText,
  BellRing,
  Headphones,
  Ban,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Planes y Precios | Red-Salud',
  description:
    'Conoce los planes de Red-Salud para pacientes. Plan gratuito con todas las funciones esenciales. Premium con IA, gestion familiar y mas.',
}

const freePlanFeatures = [
  'Buscar doctores ilimitado',
  'Agendar citas',
  'Historial medico completo',
  'Recetas digitales',
  'Telemedicina',
  'Mensajeria con doctores',
  'Servicio de emergencias',
  'Recordatorios de salud',
  'QR Medico de identificacion',
  'Resultados de laboratorio',
] as const

const premiumFeatures = [
  {
    icon: Brain,
    label: 'Asistente IA de salud',
    description:
      'Analisis inteligente de examenes, recomendaciones personalizadas',
  },
  {
    icon: Zap,
    label: 'Opinion medica express',
    description: 'Prioridad en segunda opinion',
  },
  {
    icon: Users,
    label: 'Gestion familiar completa',
    description:
      'Administra la salud de toda tu familia desde una cuenta',
  },
  {
    icon: FileText,
    label: 'Exportar historial en PDF',
    description: 'Descarga tu historial completo',
  },
  {
    icon: Ban,
    label: 'Sin publicidad',
    description: 'Experiencia limpia',
  },
  {
    icon: Headphones,
    label: 'Soporte prioritario',
    description: 'Respuesta en menos de 2 horas',
  },
  {
    icon: BellRing,
    label: 'Alertas inteligentes',
    description:
      'Recordatorios basados en tu historial y condiciones',
  },
] as const

const faqItems = [
  {
    question: 'Es realmente gratis?',
    answer:
      'Si. El plan gratuito incluye todas las funciones esenciales para gestionar tu salud: buscar doctores, agendar citas, historial medico, telemedicina, mensajeria, emergencias y mucho mas. No hay trampa, no hay periodo de prueba. Es gratis para siempre.',
  },
  {
    question: 'Cuando estara disponible Premium?',
    answer:
      'Estamos trabajando en el plan Premium y anunciaremos su disponibilidad pronto. Mientras tanto, puedes disfrutar de todas las funciones del plan gratuito sin ninguna limitacion. Te notificaremos cuando Premium este listo.',
  },
  {
    question: 'Mis datos estan seguros?',
    answer:
      'Absolutamente. Utilizamos encriptacion de extremo a extremo, seguridad a nivel de filas en nuestra base de datos (Row Level Security) y cumplimos con los mas altos estandares de privacidad medica. Puedes conocer mas en nuestra pagina de Seguridad.',
  },
  {
    question: 'Puedo cambiar de plan en cualquier momento?',
    answer:
      'Si. Cuando el plan Premium este disponible, podras cambiar de plan en cualquier momento desde la configuracion de tu cuenta. Si decides volver al plan gratuito, no perderas ningun dato.',
  },
  {
    question: 'Que metodos de pago aceptaran?',
    answer:
      'Aceptaremos tarjetas de credito/debito internacionales, pagos moviles (Pago Movil) y transferencias bancarias nacionales. Nuestro objetivo es ofrecer la mayor cantidad de opciones para facilitar el acceso.',
  },
] as const

export default function PreciosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Heart className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
          Tu salud, <span className="text-emerald-500">sin limites</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
          La plataforma de salud mas completa de Venezuela, gratis para siempre.
          Porque cuidar tu salud no deberia tener barreras.
        </p>
      </section>

      {/* Plan comparison */}
      <section className="mt-16 grid gap-8 md:grid-cols-2">
        {/* Free plan */}
        <div className="relative flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Gratis
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Siempre
            </p>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-[hsl(var(--foreground))]">
              $0
            </span>
            <span className="text-[hsl(var(--muted-foreground))]">/mes</span>
          </div>

          <ul className="mb-8 flex flex-1 flex-col gap-3">
            {freePlanFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm text-[hsl(var(--card-foreground))]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/auth/register"
            className="mt-auto rounded-lg bg-emerald-500 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Crear cuenta gratis
          </Link>
        </div>

        {/* Premium plan */}
        <div className="relative flex flex-col rounded-2xl border-2 border-transparent bg-[hsl(var(--card))] p-8 shadow-lg ring-1 ring-emerald-500/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-emerald-500/5 before:to-blue-500/5">
          {/* Badge */}
          <div className="absolute -top-3 right-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3 w-3" />
              Proximamente
            </span>
          </div>

          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
              <Crown className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Premium
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Para quienes quieren mas
            </p>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-[hsl(var(--foreground))]">
              $4.99
            </span>
            <span className="text-[hsl(var(--muted-foreground))]">/mes</span>
          </div>

          {/* Everything from free */}
          <p className="mb-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Todo lo del plan Gratis, mas:
          </p>

          <ul className="mb-8 flex flex-1 flex-col gap-4">
            {premiumFeatures.map((feature) => (
              <li key={feature.label} className="flex items-start gap-3">
                <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <span className="text-sm font-medium text-[hsl(var(--card-foreground))]">
                    {feature.label}
                  </span>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled
            className="mt-auto cursor-not-allowed rounded-lg bg-[hsl(var(--muted))] px-6 py-3 text-center text-sm font-medium text-[hsl(var(--muted-foreground))] opacity-60"
          >
            Proximamente
          </button>
          <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
            El plan Premium estara disponible proximamente
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-24">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <HelpCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Preguntas frecuentes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[hsl(var(--muted-foreground))]">
            Resolvemos tus dudas sobre los planes de Red-Salud.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="divide-y divide-[hsl(var(--border))]">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left">
                  <span className="text-base font-medium text-[hsl(var(--foreground))]">
                    {item.question}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Sparkles className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Empieza gratis hoy
          </h2>
          <p className="mt-3 text-[hsl(var(--muted-foreground))]">
            Unete a miles de venezolanos que ya gestionan su salud de forma
            inteligente. Sin costo, sin compromiso.
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
        </div>
      </section>
    </div>
  )
}
