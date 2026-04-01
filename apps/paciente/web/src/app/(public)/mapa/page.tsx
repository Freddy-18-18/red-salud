import type { Metadata } from 'next'

import { MapPageClient } from '@/components/public/map/map-page-client'
import { getStateDoctorCounts } from '@/lib/services/public-data-service'

export const metadata: Metadata = {
  title: 'Mapa de Doctores en Venezuela | Red-Salud',
  description:
    'Explora el mapa interactivo de Venezuela y encuentra doctores verificados en cada estado. Navega por regiones para descubrir especialistas cerca de ti.',
  openGraph: {
    title: 'Mapa de Doctores en Venezuela | Red-Salud',
    description:
      'Explora el mapa interactivo de Venezuela y encuentra doctores verificados en cada estado.',
    type: 'website',
    locale: 'es_VE',
  },
}

export default async function MapaPage() {
  const stateData = await getStateDoctorCounts()

  return <MapPageClient stateData={stateData} />
}
