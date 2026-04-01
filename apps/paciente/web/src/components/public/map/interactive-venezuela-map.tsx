'use client'

import dynamic from 'next/dynamic'

import type { InteractiveVenezuelaMapProps } from './interactive-map-inner'

const InteractiveVenezuelaMap = dynamic(
  () => import('./interactive-map-inner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] md:h-[600px] lg:h-[700px]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Cargando mapa interactivo...
          </p>
        </div>
      </div>
    ),
  },
)

export { InteractiveVenezuelaMap }
export type { InteractiveVenezuelaMapProps }
