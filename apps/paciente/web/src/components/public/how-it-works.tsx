'use client'

import { Search, CalendarCheck, Video } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    icon: Search,
    title: 'Busca tu especialista',
    description:
      'Explora doctores por especialidad, ubicacion, precios y disponibilidad. Consulta valoraciones de otros pacientes.',
  },
  {
    icon: CalendarCheck,
    title: 'Agenda tu cita',
    description:
      'Selecciona el horario que mejor te convenga. Recibe confirmacion inmediata y recordatorios automaticos.',
  },
  {
    icon: Video,
    title: 'Consulta al instante',
    description:
      'Accede a tu historial medico, recetas, resultados de laboratorio y comunicacion directa con tu doctor.',
  },
] as const

const delayClasses = ['delay-100', 'delay-200', 'delay-300']

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [])

  return (
    <section className="py-20 px-4 bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-6xl" ref={ref}>
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[hsl(var(--foreground))] sm:text-4xl">
            Como funciona
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
            En tres simples pasos puedes agendar tu cita con el mejor
            especialista
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connecting line (desktop only) */}
          <div
            className={`pointer-events-none absolute top-10 left-[16.67%] right-[16.67%] hidden h-0.5 md:block transition-all duration-1000 ${
              isVisible
                ? 'bg-emerald-300 dark:bg-emerald-700 scale-x-100'
                : 'bg-transparent scale-x-0'
            }`}
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`relative text-center ${
                isVisible ? `animate-fade-in-up ${delayClasses[index]}` : 'opacity-0'
              }`}
            >
              {/* Icon container */}
              <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950">
                <step.icon className="h-8 w-8 text-emerald-500" />
              </div>

              {/* Step number */}
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                {index + 1}
              </div>

              <h3 className="mb-3 text-xl font-semibold text-[hsl(var(--foreground))]">
                {step.title}
              </h3>
              <p className="leading-relaxed text-[hsl(var(--muted-foreground))]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
