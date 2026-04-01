import type { Metadata } from 'next'

import { CTASection } from '@/components/public/cta-section'
import { HeroSection } from '@/components/public/hero-section'
import { HowItWorks } from '@/components/public/how-it-works'
import { MapSection } from '@/components/public/map-section'
import { PublicFooter } from '@/components/public/public-footer'
import { PublicNavbar } from '@/components/public/public-navbar'
import { SectionWrapper } from '@/components/public/section-wrapper'
import { SpecialtyGrid } from '@/components/public/specialty-grid'
import { StatsSection } from '@/components/public/stats-section'
import { TestimonialsSection } from '@/components/public/testimonials-section'
import { getPlatformStats, getTopSpecialties } from '@/lib/services/public-data-service'

// ISR: revalidate every 60 seconds

export const revalidate = 60

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Red-Salud — Tu salud, en un solo lugar',
  description:
    'Encuentra al medico ideal en Venezuela. Busca especialistas verificados, agenda tu cita en minutos y gestiona tu salud desde una sola plataforma.',
  openGraph: {
    title: 'Red-Salud — Tu salud, en un solo lugar',
    description:
      'Encuentra al medico ideal en Venezuela. Busca especialistas verificados, agenda tu cita en minutos.',
    type: 'website',
    locale: 'es_VE',
    siteName: 'Red-Salud',
  },
}

/**
 * JSON-LD structured data for the landing page.
 * Includes MedicalOrganization and WebSite with SearchAction for Google Sitelinks search box.
 */
function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Red-Salud',
    url: 'https://redsalud.ve',
    logo: 'https://redsalud.ve/icons/icon-512.png',
    description:
      'Plataforma de salud digital para Venezuela. Busca medicos, agenda citas y gestiona tu salud.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VE',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Venezuela',
    },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Red-Salud',
    url: 'https://redsalud.ve',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://redsalud.ve/buscar?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  )
}

export default async function HomePage() {
  const [stats, specialties] = await Promise.all([
    getPlatformStats(),
    getTopSpecialties(8),
  ])

  return (
    <>
      <JsonLd />
      <div className="min-h-screen">
        <PublicNavbar />
        <main>
          <HeroSection />
          <SectionWrapper>
            <StatsSection stats={stats} />
          </SectionWrapper>
          <SectionWrapper>
            <SpecialtyGrid specialties={specialties} />
          </SectionWrapper>
          <SectionWrapper>
            <HowItWorks />
          </SectionWrapper>
          <SectionWrapper>
            <MapSection />
          </SectionWrapper>
          <TestimonialsSection testimonials={[]} />
          <SectionWrapper>
            <CTASection />
          </SectionWrapper>
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
