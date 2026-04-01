import { MessageSquareHeart, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Testimonios | Red-Salud',
  description:
    'Experiencias y opiniones de pacientes y profesionales de la salud en Red-Salud. Proximamente.',
}

export default function TestimoniosPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950">
          <MessageSquareHeart className="h-10 w-10 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          Testimonios
        </h1>
        <p className="mt-3 text-lg text-[hsl(var(--muted-foreground))]">
          Esta seccion se activara proximamente
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          Pronto podras leer las experiencias de pacientes y profesionales que
          forman parte de Red-Salud. Las historias reales de nuestra comunidad
          te ayudaran a tomar mejores decisiones de salud.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
