import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BookCta } from '@/components/public/doctor/book-cta'
import { DoctorProfileHeader } from '@/components/public/doctor/doctor-profile-header'
import { DoctorProfileTabs } from '@/components/public/doctor/doctor-profile-tabs'
import { SimilarDoctors } from '@/components/public/doctor/similar-doctors'
import {
  getDoctorBySlug,
  getSimilarDoctors,
} from '@/lib/services/public-data-service'

export const revalidate = 120

interface DoctorSlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: DoctorSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const doctor = await getDoctorBySlug(slug)

  if (!doctor) {
    return { title: 'Doctor no encontrado | Red-Salud' }
  }

  const city = doctor.profile.city ?? 'Venezuela'

  return {
    title: `Dr. ${doctor.profile.name} — ${doctor.specialty.name} en ${city} | Red-Salud`,
    description: `Dr. ${doctor.profile.name}, especialista en ${doctor.specialty.name} en ${city}, Venezuela. ${doctor.reviewCount} opiniones, ${doctor.avgRating ?? 0} estrellas. Agenda tu cita.`,
  }
}

export default async function DoctorSlugPage({
  params,
}: DoctorSlugPageProps) {
  const { slug } = await params
  const doctor = await getDoctorBySlug(slug)

  if (!doctor) {
    notFound()
  }

  // Fetch similar doctors in parallel
  const similarDoctors = await getSimilarDoctors(
    doctor.specialty.id,
    doctor.profile.state ?? '',
    doctor.id,
    4,
  )

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.profile.name,
    medicalSpecialty: doctor.specialty.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: doctor.profile.city,
      addressRegion: doctor.profile.state,
      addressCountry: 'VE',
    },
    ...(doctor.avgRating != null && doctor.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: doctor.avgRating,
            reviewCount: doctor.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(doctor.profile.avatarUrl
      ? { image: doctor.profile.avatarUrl }
      : {}),
    url: `https://redsalud.ve/medicos/${doctor.slug}`,
  }

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[hsl(var(--background))]">
        {/* Profile header */}
        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <DoctorProfileHeader doctor={doctor} />
          </div>
        </section>

        {/* Main content */}
        <section className="px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Tabs (main area) */}
              <div className="min-w-0 flex-1">
                <DoctorProfileTabs doctor={doctor} />
              </div>

              {/* CTA sidebar (desktop) */}
              <div className="hidden w-72 shrink-0 lg:block">
                <div className="sticky top-24">
                  <BookCta doctorName={doctor.profile.name} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky mobile CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 lg:hidden">
          <BookCta doctorName={doctor.profile.name} />
        </div>

        {/* Similar doctors */}
        {similarDoctors.length > 0 && (
          <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-12">
            <div className="mx-auto max-w-6xl">
              <SimilarDoctors doctors={similarDoctors} />
            </div>
          </section>
        )}

        {/* Spacer for mobile sticky CTA */}
        <div className="h-32 lg:hidden" />
      </div>
    </>
  )
}
