import { BookOpen, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog Medico | Red-Salud',
  description:
    'Articulos, consejos y novedades del mundo de la salud. Proximamente en Red-Salud.',
}

export default function BlogPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950">
          <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          Blog Medico
        </h1>
        <p className="mt-3 text-lg text-[hsl(var(--muted-foreground))]">
          Esta seccion se activara proximamente
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          Estamos preparando articulos escritos por profesionales de la salud
          con consejos, novedades medicas y guias para tu bienestar. Vuelve
          pronto para leer nuestro contenido.
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
