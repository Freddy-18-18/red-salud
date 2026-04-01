'use client'

import { ArrowLeft } from 'lucide-react'
import type { FillLayerSpecification, LineLayerSpecification } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'next-themes'
import { useCallback, useMemo, useRef, useState } from 'react'
import MapGL, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapMouseEvent,
  type MapRef,
} from 'react-map-gl/mapbox'

import {
  VENEZUELA_GEOJSON,
  VENEZUELA_VIEW,
  ZOOM_LEVELS,
  type VenezuelaStateFeatureProperties,
} from '@/lib/data/venezuela-geojson'
import type { StateMapData } from '@/lib/types/public'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InteractiveVenezuelaMapProps {
  stateData: StateMapData[]
  onStateSelect?: (stateName: string) => void
  className?: string
}

interface HoverInfo {
  longitude: number
  latitude: number
  stateName: string
  doctorCount: number
}

// ---------------------------------------------------------------------------
// Map Styles
// ---------------------------------------------------------------------------

const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const

// ---------------------------------------------------------------------------
// Layer paint helpers
// ---------------------------------------------------------------------------

function getFillPaint(isDark: boolean): FillLayerSpecification['paint'] {
  return {
    'fill-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(16, 185, 129, 0.45)',
      isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.2)',
    ],
    'fill-outline-color': isDark
      ? 'rgba(52, 211, 153, 0.7)'
      : 'rgba(16, 185, 129, 0.8)',
  }
}

function getLinePaint(isDark: boolean): LineLayerSpecification['paint'] {
  return {
    'line-color': isDark
      ? 'rgba(52, 211, 153, 0.5)'
      : 'rgba(16, 185, 129, 0.6)',
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      2.5,
      1,
    ],
  }
}

const SELECTED_FILL_PAINT: FillLayerSpecification['paint'] = {
  'fill-color': 'rgba(16, 185, 129, 0.35)',
  'fill-outline-color': '#10B981',
}

const SELECTED_LINE_PAINT: LineLayerSpecification['paint'] = {
  'line-color': '#10B981',
  'line-width': 3,
}

// ---------------------------------------------------------------------------
// Helper: build count lookup (uses Record to avoid Turbopack Map conflict)
// ---------------------------------------------------------------------------

function buildCountMap(stateData: StateMapData[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const s of stateData) {
    counts[s.stateName] = s.doctorCount
    const normalized = s.stateName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    counts[normalized] = s.doctorCount
  }
  return counts
}

function getCount(countMap: Record<string, number>, name: string): number {
  if (name in countMap) return countMap[name]
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return countMap[normalized] ?? 0
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InteractiveMapInner({
  stateData,
  onStateSelect,
  className,
}: InteractiveVenezuelaMapProps) {
  const mapRef = useRef<MapRef>(null)
  const hoveredIdRef = useRef<string | null>(null)
  const { resolvedTheme } = useTheme()

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)

  const countMap = useMemo(() => buildCountMap(stateData), [stateData])
  const isDark = resolvedTheme === 'dark'
  const fillPaint = useMemo(() => getFillPaint(isDark), [isDark])
  const linePaint = useMemo(() => getLinePaint(isDark), [isDark])

  const clearHover = useCallback(() => {
    if (hoveredIdRef.current && mapRef.current) {
      mapRef.current.setFeatureState(
        { source: 'venezuela-states', id: hoveredIdRef.current },
        { hover: false },
      )
      hoveredIdRef.current = null
    }
    setHoverInfo(null)
  }, [])

  const onMouseMove = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature || !mapRef.current) {
        clearHover()
        return
      }

      const props = feature.properties as VenezuelaStateFeatureProperties
      const featureId = props.id

      if (hoveredIdRef.current && hoveredIdRef.current !== featureId) {
        mapRef.current.setFeatureState(
          { source: 'venezuela-states', id: hoveredIdRef.current },
          { hover: false },
        )
      }

      hoveredIdRef.current = featureId
      mapRef.current.setFeatureState(
        { source: 'venezuela-states', id: featureId },
        { hover: true },
      )

      let lng = e.lngLat.lng
      let lat = e.lngLat.lat
      try {
        const centerRaw = props.center
        if (typeof centerRaw === 'string') {
          const parsed = JSON.parse(centerRaw) as [number, number]
          lng = parsed[0]
          lat = parsed[1]
        } else if (Array.isArray(centerRaw)) {
          lng = centerRaw[0]
          lat = centerRaw[1]
        }
      } catch {
        // Use mouse position as fallback
      }

      setHoverInfo({
        longitude: lng,
        latitude: lat,
        stateName: props.name,
        doctorCount: getCount(countMap, props.name),
      })
    },
    [clearHover, countMap],
  )

  const onMouseLeave = useCallback(() => {
    clearHover()
  }, [clearHover])

  const flyToState = useCallback(
    (props: VenezuelaStateFeatureProperties) => {
      if (!mapRef.current) return

      let center: [number, number]
      try {
        const raw = props.center
        if (typeof raw === 'string') {
          center = JSON.parse(raw) as [number, number]
        } else if (Array.isArray(raw)) {
          center = raw as [number, number]
        } else {
          return
        }
      } catch {
        return
      }

      setSelectedState(props.name)
      setIsZoomed(true)

      let bounds: [[number, number], [number, number]] | null = null
      try {
        const rawBounds = props.bounds
        if (typeof rawBounds === 'string') {
          bounds = JSON.parse(rawBounds) as [[number, number], [number, number]]
        } else if (Array.isArray(rawBounds)) {
          bounds = rawBounds as unknown as [[number, number], [number, number]]
        }
      } catch {
        // fallback to flyTo center
      }

      if (bounds) {
        mapRef.current.fitBounds(bounds, {
          padding: 60,
          duration: 1000,
        })
      } else {
        mapRef.current.flyTo({
          center,
          zoom: ZOOM_LEVELS.state,
          duration: 1000,
        })
      }

      onStateSelect?.(props.name)
    },
    [onStateSelect],
  )

  const onClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature) return
      const props = feature.properties as VenezuelaStateFeatureProperties
      flyToState(props)
    },
    [flyToState],
  )

  const resetView = useCallback(() => {
    if (!mapRef.current) return
    setSelectedState(null)
    setIsZoomed(false)
    mapRef.current.flyTo({
      center: [VENEZUELA_VIEW.longitude, VENEZUELA_VIEW.latitude],
      zoom: VENEZUELA_VIEW.zoom,
      duration: 1000,
    })
  }, [])

  const geojsonData = useMemo(() => VENEZUELA_GEOJSON, [])

  const selectedFilter = useMemo(
    (): ['==', unknown, unknown] =>
      selectedState
        ? ['==', ['get', 'name'], selectedState]
        : ['==', ['get', 'name'], ''],
    [selectedState],
  )

  const mapStyle = isDark ? MAP_STYLES.dark : MAP_STYLES.light

  return (
    <div
      className={`mapbox-container relative overflow-hidden rounded-xl border border-[hsl(var(--border))] ${className ?? ''}`}
    >
      <MapGL
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={VENEZUELA_VIEW}
        mapStyle={mapStyle}
        interactiveLayerIds={['states-fill']}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{ width: '100%', height: '100%' }}
        cursor="pointer"
        minZoom={4}
        maxZoom={15}
        maxBounds={[
          [-76, -2],
          [-56, 14],
        ]}
      >
        <NavigationControl position="top-right" showCompass showZoom />

        <Source
          id="venezuela-states"
          type="geojson"
          data={geojsonData}
          promoteId="id"
        >
          <Layer id="states-fill" type="fill" paint={fillPaint} />
          <Layer id="states-line" type="line" paint={linePaint} />
          <Layer
            id="states-selected-fill"
            type="fill"
            filter={selectedFilter}
            paint={SELECTED_FILL_PAINT}
          />
          <Layer
            id="states-selected-line"
            type="line"
            filter={selectedFilter}
            paint={SELECTED_LINE_PAINT}
          />
          <Layer
            id="state-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 9,
                8, 12,
                10, 14,
              ],
              'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'text-ignore-placement': false,
              'text-padding': 4,
            }}
            paint={{
              'text-color': isDark ? '#d1d5db' : '#374151',
              'text-halo-color': isDark
                ? 'rgba(0,0,0,0.7)'
                : 'rgba(255,255,255,0.8)',
              'text-halo-width': 1.5,
            }}
          />
        </Source>

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
            className="[&_.mapboxgl-popup-content]:!rounded-lg [&_.mapboxgl-popup-content]:!border [&_.mapboxgl-popup-content]:!border-[hsl(var(--border))] [&_.mapboxgl-popup-content]:!bg-[hsl(var(--card))] [&_.mapboxgl-popup-content]:!px-3 [&_.mapboxgl-popup-content]:!py-2 [&_.mapboxgl-popup-content]:!shadow-lg [&_.mapboxgl-popup-tip]:!border-t-[hsl(var(--card))]"
          >
            <p className="text-sm font-semibold text-[hsl(var(--card-foreground))]">
              {hoverInfo.stateName}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {hoverInfo.doctorCount === 0
                ? 'Sin doctores registrados'
                : `${hoverInfo.doctorCount} ${hoverInfo.doctorCount === 1 ? 'doctor' : 'doctores'}`}
            </p>
          </Popup>
        )}
      </MapGL>

      {isZoomed && (
        <button
          type="button"
          onClick={resetView}
          className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium text-[hsl(var(--card-foreground))] shadow-md transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Vista general
        </button>
      )}

      {selectedState && (
        <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 shadow-md backdrop-blur-sm">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {selectedState}
          </p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
            {getCount(countMap, selectedState)}{' '}
            {getCount(countMap, selectedState) === 1
              ? 'doctor'
              : 'doctores'}{' '}
            verificados
          </p>
        </div>
      )}
    </div>
  )
}
