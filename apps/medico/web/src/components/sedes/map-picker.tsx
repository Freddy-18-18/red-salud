'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Input, Button } from '@red-salud/design-system';
import { MapPin, Search, Loader2 } from 'lucide-react';

import 'leaflet/dist/leaflet.css';

/**
 * @file components/sedes/map-picker.tsx
 * @description Reusable Leaflet map picker for the sede wizard.
 *
 * Two interaction surfaces:
 *   1. Address search (Nominatim via /api/geocode) — debounced.
 *   2. Direct click on the map — drops/moves the marker, fires `onChange`.
 *
 * The marker is the single source of truth. When the parent supplies
 * `value={{ lat, lng }}` the map recenters on it. When the user clicks the
 * map or selects a search result, we call `onChange({ lat, lng, address })`.
 *
 * Leaflet quirks we handle:
 *   - It only works in the browser (`window` required). The page-level
 *     wrapper imports this component with `dynamic({ ssr: false })`.
 *   - Default marker icons are broken with bundlers — we override the
 *     icon paths to point at the public Leaflet CDN, which is the smallest
 *     fix that doesn't drag asset config into the Next config.
 *   - `MapContainer` doesn't accept `center` changes after mount — we use
 *     a child component `RecenterOn` that calls `map.flyTo` whenever the
 *     value prop changes.
 */

// ---- Default icon fix --------------------------------------------------------

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

// ---- Public API --------------------------------------------------------------

export interface MapPickerValue {
  lat: number;
  lng: number;
  address?: string;
}

export interface MapPickerProps {
  /** Current marker position. `null` → map opens centered on Venezuela without a marker. */
  value: MapPickerValue | null;
  /** Fired on map click or geocoding-result selection. */
  onChange: (value: MapPickerValue) => void;
  /**
   * Initial value of the address search box. Useful when the wizard already
   * has an address string but no coordinates yet — the user can hit "Buscar"
   * to drop a marker without retyping.
   */
  initialQuery?: string;
  /** Optional: control the map height. Defaults to 320px which fits a wizard step. */
  height?: string;
}

// ---- Helpers -----------------------------------------------------------------

// Venezuela center as a sensible default — narrow enough that Caracas is
// visible, wide enough that the doctor sees they need to drop a pin.
const VENEZUELA_CENTER: [number, number] = [8.0, -66.0];
const VENEZUELA_ZOOM = 6;
const PINPOINT_ZOOM = 16;

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

async function geocode(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: GeocodeResult[] };
  return data.results ?? [];
}

// ---- Inner components --------------------------------------------------------

function RecenterOn({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.flyTo(position, PINPOINT_ZOOM, { duration: 0.7 });
  }, [map, position]);
  return null;
}

function ClickToPlace({
  onPlace,
}: {
  onPlace: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPlace(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// ---- Main --------------------------------------------------------------------

export function MapPicker({
  value,
  onChange,
  initialQuery = '',
  height = '320px',
}: MapPickerProps): React.ReactElement {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const markerPosition = useMemo<[number, number] | null>(
    () => (value ? [value.lat, value.lng] : null),
    [value],
  );

  // Debounced auto-search: wait 500ms after the user stops typing so we don't
  // hammer Nominatim. The user can also press Enter or click "Buscar" to skip
  // the debounce.
  useEffect(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      void runSearch(q);
    }, 500);
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function runSearch(q: string) {
    setSearching(true);
    try {
      const found = await geocode(q);
      setResults(found);
      setShowResults(true);
    } finally {
      setSearching(false);
    }
  }

  function pickResult(result: GeocodeResult) {
    onChange({ lat: result.lat, lng: result.lng, address: result.displayName });
    setQuery(result.displayName);
    setShowResults(false);
  }

  function handleMapClick(lat: number, lng: number) {
    onChange({ lat, lng });
    // We deliberately do not reverse-geocode here — the doctor can keep their
    // free-text address and only the coordinates change.
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              onBlur={() => {
                // Delay so click on a result fires before we hide the list.
                window.setTimeout(() => setShowResults(false), 150);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void runSearch(query.trim());
                }
              }}
              placeholder="Av. Andrés Bello, Caracas..."
              className="pl-9"
              aria-label="Buscar dirección"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void runSearch(query.trim())}
            disabled={searching || query.trim().length < 3}
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            ) : (
              'Buscar'
            )}
          </Button>
        </div>
        {showResults && results.length > 0 && (
          <ul
            role="listbox"
            aria-label="Resultados de búsqueda"
            className="absolute z-[1000] mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md"
          >
            {results.map((r, idx) => (
              <li key={`${r.lat}-${r.lng}-${idx}`}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // Use onMouseDown so onBlur of the input doesn't race us.
                    e.preventDefault();
                    pickResult(r);
                  }}
                  className="flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent"
                >
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-lighter"
                    aria-hidden="true"
                  />
                  <span className="truncate">{r.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {showResults && !searching && results.length === 0 && query.trim().length >= 3 && (
          <div className="absolute z-[1000] mt-1 w-full rounded-md border border-border bg-popover p-3 text-xs text-muted-foreground shadow-md">
            Sin resultados. Probá con más detalle o tocá el mapa para fijar
            manualmente.
          </div>
        )}
      </div>

      <div
        className="overflow-hidden rounded-lg border border-border"
        style={{ height }}
      >
        <MapContainer
          center={markerPosition ?? VENEZUELA_CENTER}
          zoom={markerPosition ? PINPOINT_ZOOM : VENEZUELA_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPlace={handleMapClick} />
          <RecenterOn position={markerPosition} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={DEFAULT_ICON}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onChange({ lat, lng, address: value?.address });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Tocá el mapa o arrastrá el marcador para ajustar la ubicación exacta.
      </p>
    </div>
  );
}
