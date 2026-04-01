import {
  Smartphone,
  Monitor,
  Download,
  WifiOff,
  Bell,
  CalendarCheck,
  QrCode,
  Chrome,
  Globe,
  Clock,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Descargar Red-Salud',
  description:
    'Descarga Red-Salud en tu telefono o computadora. Disponible como app movil, PWA y proximamente en escritorio.',
}

const mobileFeatures = [
  {
    icon: WifiOff,
    title: 'Acceso sin conexion',
    description:
      'Consulta tus citas, historial y datos de salud incluso sin internet. Se sincroniza automaticamente cuando recuperas la conexion.',
  },
  {
    icon: Bell,
    title: 'Notificaciones push',
    description:
      'Recibe recordatorios de citas, mensajes de tu medico y alertas importantes directamente en tu telefono.',
  },
  {
    icon: CalendarCheck,
    title: 'Agenda rapida',
    description:
      'Busca un especialista y agenda tu cita en menos de un minuto, directamente desde tu telefono.',
  },
] as const

const pwaSteps = [
  {
    step: 1,
    title: 'Abre Red-Salud en tu navegador',
    description: 'Visita redsalud.ve desde Chrome, Safari o Edge en tu telefono.',
  },
  {
    step: 2,
    title: 'Toca "Agregar a pantalla de inicio"',
    description:
      'En Chrome: menu (3 puntos) → "Agregar a pantalla de inicio". En Safari: boton compartir → "Agregar a inicio".',
  },
  {
    step: 3,
    title: 'Listo! Usala como una app nativa',
    description:
      'Red-Salud aparecera en tu pantalla de inicio como cualquier otra app. Abrela y disfruta de la experiencia completa.',
  },
] as const

export default function DescargarPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
                Tu salud, siempre{' '}
                <span className="text-emerald-500">contigo</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
                Descarga Red-Salud en tu dispositivo favorito y lleva tu salud
                en el bolsillo. Citas, historial, mensajes y mas, todo en un
                solo lugar.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                {/* Google Play Badge */}
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 transition-colors hover:bg-[hsl(var(--surface-elevated))]"
                >
                  <svg
                    className="h-7 w-7 text-[hsl(var(--foreground))]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.085 12l2.613-2.492zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] leading-none text-[hsl(var(--muted-foreground))]">
                      Disponible en
                    </p>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      Google Play
                    </p>
                  </div>
                </a>

                {/* App Store Badge */}
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 transition-colors hover:bg-[hsl(var(--surface-elevated))]"
                >
                  <svg
                    className="h-7 w-7 text-[hsl(var(--foreground))]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] leading-none text-[hsl(var(--muted-foreground))]">
                      Descargala en
                    </p>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      App Store
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Device Mockup */}
            <div className="flex w-full max-w-sm shrink-0 items-end justify-center gap-6">
              {/* Phone mockup */}
              <div className="relative">
                <div className="h-72 w-36 rounded-3xl border-4 border-[hsl(var(--foreground))]/20 bg-[hsl(var(--card))] p-2">
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
                    <Smartphone className="h-8 w-8 text-emerald-500" />
                    <p className="mt-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      Red-Salud
                    </p>
                    <p className="text-[8px] text-[hsl(var(--muted-foreground))]">
                      App Movil
                    </p>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 h-5 w-16 -translate-x-1/2 rounded-b-xl bg-[hsl(var(--foreground))]/20" />
                </div>
              </div>

              {/* Desktop mockup */}
              <div className="hidden sm:block">
                <div className="h-48 w-64 rounded-t-xl border-4 border-b-0 border-[hsl(var(--foreground))]/20 bg-[hsl(var(--card))] p-2">
                  <div className="flex h-full flex-col items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                    <Monitor className="h-8 w-8 text-blue-500" />
                    <p className="mt-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      Red-Salud
                    </p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Desktop
                    </p>
                  </div>
                </div>
                <div className="mx-auto h-3 w-72 rounded-b-lg bg-[hsl(var(--foreground))]/20" />
                <div className="mx-auto h-2 w-32 rounded-b-lg bg-[hsl(var(--foreground))]/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Disenada para tu telefono
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[hsl(var(--muted-foreground))]">
            Una experiencia rapida, fluida y optimizada para dispositivos
            moviles.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {mobileFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <feature.icon className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--card-foreground))]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Install */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600">
                <Chrome className="h-4 w-4" />
                Progressive Web App
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
                Instala desde tu navegador
              </h2>
              <p className="mt-3 text-[hsl(var(--muted-foreground))]">
                No necesitas ir a una tienda de aplicaciones. Instala Red
                Salud directamente desde tu navegador web y usala como una app
                nativa.
              </p>

              <div className="mt-8 space-y-6">
                {pwaSteps.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported browsers */}
            <div className="w-full max-w-sm shrink-0">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <h3 className="font-semibold text-[hsl(var(--card-foreground))]">
                  Navegadores compatibles
                </h3>
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'Google Chrome', supported: true },
                    { name: 'Microsoft Edge', supported: true },
                    { name: 'Safari (iOS)', supported: true },
                    { name: 'Firefox', supported: true },
                    { name: 'Samsung Internet', supported: true },
                  ].map((browser) => (
                    <div
                      key={browser.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                        <span className="text-sm text-[hsl(var(--foreground))]">
                          {browser.name}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Compatible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop App */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
              <Monitor className="h-10 w-10 text-blue-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Proximamente
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                App de Escritorio
              </h2>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                Estamos desarrollando una aplicacion de escritorio nativa con{' '}
                <strong className="text-[hsl(var(--foreground))]">Tauri</strong>{' '}
                para Windows, macOS y Linux. Mas rapida, mas segura y con acceso
                completo a todas las funcionalidades de Red-Salud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
          <QrCode className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold text-[hsl(var(--foreground))]">
            Escanea y descarga
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[hsl(var(--muted-foreground))]">
            Escanea este codigo QR con tu telefono para abrir Red-Salud
            directamente.
          </p>

          {/* QR Placeholder */}
          <div className="mx-auto mt-8 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="text-center">
              <QrCode className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" />
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                Codigo QR
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Download className="h-4 w-4" />
              Comenzar ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
