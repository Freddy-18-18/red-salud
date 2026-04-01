import {
  ArrowRight,
  CheckCircle,
  Heart,
  BarChart3,
  Lightbulb,
  AlertCircle,
  Users,
  Stethoscope,
  Brain,
  Eye,
  Baby,
  Bone,
  Smile,
  Pill,
  Activity,
  Microscope,
  Ear,
  Syringe,
  Thermometer,
  Ribbon,
  BookOpen,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createElement } from 'react'

import { DoctorCardList } from '@/components/public/doctor-card-list'
import { SpecialtyNav } from '@/components/public/specialty/specialty-nav'
import { getSpecialtyContent } from '@/lib/data/specialty-content'
import {
  getSpecialtyBySlug,
  getDoctorsBySpecialty,
  getSpecialtiesWithDoctorCount,
} from '@/lib/services/public-data-service'

export const revalidate = 120

const iconMap: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  heart: Heart,
  brain: Brain,
  eye: Eye,
  baby: Baby,
  bone: Bone,
  smile: Smile,
  pill: Pill,
  activity: Activity,
  microscope: Microscope,
  ear: Ear,
  syringe: Syringe,
  thermometer: Thermometer,
  ribbon: Ribbon,
}

function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Stethoscope
  return iconMap[iconName.toLowerCase()] ?? Stethoscope
}

function DynamicIcon({
  iconName,
  ...props
}: { iconName: string | null } & LucideProps) {
  return createElement(getIcon(iconName), props)
}

interface SpecialtySlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: SpecialtySlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const specialty = await getSpecialtyBySlug(slug)

  if (!specialty) {
    return { title: 'Especialidad no encontrada | Red-Salud' }
  }

  const content = getSpecialtyContent(slug, specialty.name)

  return {
    title: `${specialty.name} — Especialistas en Venezuela | Red-Salud`,
    description: content.description.slice(0, 160),
    openGraph: {
      title: `${specialty.name} — Red-Salud`,
      description: content.description.slice(0, 160),
      type: 'website',
    },
  }
}

export default async function SpecialtySlugPage({
  params,
}: SpecialtySlugPageProps) {
  const { slug } = await params
  const specialty = await getSpecialtyBySlug(slug)

  if (!specialty) {
    notFound()
  }

  const [{ doctors, total }, allSpecialties] = await Promise.all([
    getDoctorsBySpecialty(slug, 1, 12),
    getSpecialtiesWithDoctorCount(),
  ])

  const content = getSpecialtyContent(slug, specialty.name)
  const hasMore = total > 12

  // Resolve related specialties from the full list
  const relatedSpecialties = content.relatedSlugs
    .map((relSlug) => allSpecialties.find((s) => s.slug === relSlug))
    .filter(
      (s): s is NonNullable<typeof s> => s !== undefined,
    )
    .slice(0, 4)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: specialty.name,
    description: content.description,
    url: `https://redsalud.ve/especialidades/${slug}`,
    provider: {
      '@type': 'MedicalOrganization',
      name: 'Red-Salud',
      url: 'https://redsalud.ve',
    },
  }

  const navItems = [
    { id: 'info', label: 'Informacion' },
    { id: 'especialistas', label: 'Especialistas' },
    ...(relatedSpecialties.length > 0
      ? [{ id: 'relacionadas', label: 'Relacionadas' }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero (compact) ── */}
      <section className="relative overflow-hidden border-b border-[hsl(var(--border))] bg-gradient-to-br from-emerald-50 via-[hsl(var(--muted))] to-teal-50 px-4 py-10 dark:from-emerald-950/30 dark:via-[hsl(var(--muted))] dark:to-teal-950/30 sm:py-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400">
            <DynamicIcon iconName={specialty.icon} className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl lg:text-4xl">
            {specialty.name}
          </h1>
          {specialty.description && (
            <p className="mx-auto mt-2 max-w-2xl text-base text-[hsl(var(--muted-foreground))]">
              {specialty.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Users className="h-3.5 w-3.5" />
              {total} {total === 1 ? 'especialista' : 'especialistas'}
            </span>
            <Link
              href={`/buscar?especialidad=${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Buscar especialista
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section navigation ── */}
      <SpecialtyNav items={navItems} />

      {/* ── Main content: 2-column layout for info sections ── */}
      <section id="info" className="scroll-mt-28 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left column: Description + Facts (3/5 width) */}
            <div className="space-y-8 lg:col-span-3">
              {/* What is this specialty */}
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                    Que es la {specialty.name}?
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {content.description}
                </p>
              </div>

              {/* Benefits */}
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Heart className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                    Beneficios de la atencion especializada
                  </h2>
                </div>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {content.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2.5 rounded-lg bg-emerald-50/50 p-3 dark:bg-emerald-950/20"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm text-[hsl(var(--foreground))]">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Facts */}
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                    Datos interesantes
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {content.facts.map((fact) => (
                    <div
                      key={fact}
                      className="flex items-start gap-2.5 rounded-lg bg-purple-50/50 p-3 dark:bg-purple-950/20"
                    >
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: When to visit + CTA sidebar (2/5 width) */}
            <div className="space-y-6 lg:col-span-2">
              {/* When to visit */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900 dark:bg-amber-950/20">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                    Cuando visitar?
                  </h2>
                </div>
                <ul className="space-y-2">
                  {content.whenToVisit.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2.5 rounded-lg border border-amber-100 bg-white/60 p-3 dark:border-amber-900/50 dark:bg-[hsl(var(--card))]/60"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-sm text-[hsl(var(--foreground))]">
                        {reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sticky CTA sidebar */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-teal-50 p-6 dark:border-emerald-900 dark:from-emerald-950/30 dark:to-teal-950/30 lg:sticky lg:top-28">
                <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                  Necesitas una consulta?
                </h3>
                <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                  Agenda tu cita con un especialista verificado en {specialty.name}.
                </p>
                <div className="mt-4 space-y-2.5">
                  <Link
                    href="/auth/register"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Registrarme gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/buscar?especialidad=${slug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    Buscar especialistas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Doctors section ── */}
      <section
        id="especialistas"
        className="scroll-mt-28 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-4 py-10"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Especialistas en {specialty.name}
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Profesionales verificados listos para atenderte
              </p>
            </div>
            {hasMore && (
              <Link
                href={`/buscar?especialidad=${slug}`}
                className="hidden items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 sm:inline-flex"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {doctors.length > 0 ? (
            <>
              <DoctorCardList doctors={doctors} />
              {hasMore && (
                <div className="mt-6 text-center sm:hidden">
                  <Link
                    href={`/buscar?especialidad=${slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-6 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                  >
                    Ver todos los especialistas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Stethoscope className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                Aun no hay especialistas registrados
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
                Pronto contaremos con especialistas en {specialty.name}. Si
                eres profesional de la salud, se el primero en registrarte.
              </p>
              <a
                href="https://medico.redsalud.ve/auth/register"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Registrate como especialista
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Related specialties ── */}
      {relatedSpecialties.length > 0 && (
        <section
          id="relacionadas"
          className="scroll-mt-28 border-t border-[hsl(var(--border))] px-4 py-10"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-xl font-bold text-[hsl(var(--foreground))]">
              Especialidades relacionadas
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedSpecialties.map((related) => (
                <Link
                  key={related.slug}
                  href={`/especialidades/${related.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all hover:shadow-md dark:hover:border-emerald-800"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:group-hover:bg-emerald-900">
                    <DynamicIcon
                      iconName={related.icon}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                      {related.name}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {related.doctorCount}{' '}
                      {related.doctorCount === 1
                        ? 'especialista'
                        : 'especialistas'}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
