'use client';

import { Star } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';

import type { MapDoctorPoint } from '@/lib/types/public';

// Default map style (OpenFreeMap)
const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  'https://tiles.openfreemap.org/styles/liberty';

// Venezuela center coordinates
const INITIAL_VIEW = {
  longitude: -66.58,
  latitude: 6.42,
  zoom: 6,
} as const;

interface MapViewProps {
  doctors: MapDoctorPoint[];
  center?: { longitude: number; latitude: number; zoom: number };
  className?: string;
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  name: string;
  specialty: string;
  rating: number | null;
  slug: string;
  avatarUrl: string | null;
  city: string;
  state: string;
}

/**
 * Convert MapDoctorPoint[] to a GeoJSON FeatureCollection for clustering.
 */
function toGeoJSON(
  doctors: MapDoctorPoint[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: doctors.map((d) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [d.lng, d.lat],
      },
      properties: {
        id: d.id,
        slug: d.slug,
        name: d.name,
        specialty: d.specialty,
        rating: d.rating,
        avatarUrl: d.avatarUrl,
        city: d.city,
        state: d.state,
      },
    })),
  };
}

function MapViewInner({ doctors, center, className }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const geojsonData = toGeoJSON(doctors);

  const initialViewState = center ?? INITIAL_VIEW;

  const handleClusterClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature || !mapRef.current) return;

    const geometry = feature.geometry as GeoJSON.Point;
    const clusterId = feature.properties?.cluster_id;

    if (clusterId != null) {
      const source = mapRef.current.getSource('doctors') as unknown as {
        getClusterExpansionZoom: (
          clusterId: number,
          callback: (err: unknown, zoom: number) => void,
        ) => void;
      };

      source.getClusterExpansionZoom(clusterId, (err: unknown, zoom: number) => {
        if (err || !mapRef.current) return;
        mapRef.current.flyTo({
          center: geometry.coordinates as [number, number],
          zoom,
          duration: 500,
        });
      });
    }
  }, []);

  const handleMarkerClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;

    const geometry = feature.geometry as GeoJSON.Point;
    const props = feature.properties;

    if (props) {
      setPopupInfo({
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1],
        name: props.name,
        specialty: props.specialty,
        rating: props.rating,
        slug: props.slug,
        avatarUrl: props.avatarUrl,
        city: props.city,
        state: props.state,
      });
    }
  }, []);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      // Check if we clicked on a cluster
      if (e.features?.some((f) => f.layer?.id === 'clusters')) {
        handleClusterClick(e);
        return;
      }
      // Check if we clicked on an unclustered point
      if (e.features?.some((f) => f.layer?.id === 'unclustered-point')) {
        handleMarkerClick(e);
        return;
      }
      // Clicked on empty space — close popup
      setPopupInfo(null);
    },
    [handleClusterClick, handleMarkerClick],
  );

  return (
    <div
      className={
        className ??
        'h-[400px] w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] md:h-[500px]'
      }
    >
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={MAP_STYLE_URL}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        cursor="pointer"
      >
        <NavigationControl position="top-right" />

        <Source
          id="doctors"
          type="geojson"
          data={geojsonData}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#34D399', // emerald-400 for small clusters
                10,
                '#10B981', // emerald-500 for medium
                50,
                '#059669', // emerald-600 for large
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20, // base radius
                10,
                25, // 10+ points
                50,
                35, // 50+ points
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-size': 13,
              'text-font': ['Open Sans Bold'],
            }}
            paint={{
              'text-color': '#ffffff',
            }}
          />

          {/* Individual (unclustered) doctor markers */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': '#10B981',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {/* Popup for clicked doctor */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            anchor="bottom"
            maxWidth="260px"
          >
            <div className="p-1">
              <p className="font-semibold text-sm text-gray-900">
                {popupInfo.name}
              </p>
              <p className="text-xs text-gray-600">{popupInfo.specialty}</p>
              <p className="text-xs text-gray-500">
                {popupInfo.city}, {popupInfo.state}
              </p>
              {popupInfo.rating != null && (
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium text-gray-700">
                    {popupInfo.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <Link
                href={`/medicos/${popupInfo.slug}`}
                className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Ver perfil &rarr;
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

// Export with SSR disabled to avoid MapLibre window reference errors
const MapView = dynamic(() => Promise.resolve(MapViewInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] md:h-[500px]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Cargando mapa...</p>
      </div>
    </div>
  ),
});

export { MapView };
export type { MapViewProps };
