'use client';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

/**
 * @file components/sedes/sede-preview-map.tsx
 * @description Read-only Leaflet preview rendered inside each SedeCard.
 *
 * All user interactions are disabled — this is a thumbnail, not a map. Doctors
 * who want to interact open the wizard. This keeps the card grid lightweight
 * (no zoom handlers, no event listeners) and prevents accidental drags while
 * scrolling the page.
 */

const ICON_BASE =
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images';
const DEFAULT_ICON = L.icon({
  iconUrl: `${ICON_BASE}/marker-icon.png`,
  iconRetinaUrl: `${ICON_BASE}/marker-icon-2x.png`,
  shadowUrl: `${ICON_BASE}/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
}

export function SedePreviewMap({ lat, lng, zoom = 15 }: Props): React.ReactElement {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      dragging={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
      className="pointer-events-none h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={DEFAULT_ICON} interactive={false} />
    </MapContainer>
  );
}
