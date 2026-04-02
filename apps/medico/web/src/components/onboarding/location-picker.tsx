'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Navigation } from 'lucide-react';

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-zinc-800/50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
    </div>
  ),
});

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  formatted: string;
}

interface LocationPickerProps {
  onLocationChange: (data: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
}

const VENEZUELA_CENTER: [number, number] = [8.0, -66.0];

async function reverseGeocode(lat: number, lng: number): Promise<LocationData> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`,
      { headers: { 'User-Agent': 'RedSalud/1.0' } }
    );
    const data = await response.json();
    const addr = data.address || {};

    return {
      lat,
      lng,
      address: [addr.road, addr.house_number].filter(Boolean).join(' ') || data.display_name?.split(',')[0] || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      state: addr.state || '',
      formatted: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  } catch {
    return {
      lat,
      lng,
      address: '',
      city: '',
      state: '',
      formatted: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
}

export function LocationPicker({ onLocationChange, initialLocation }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : VENEZUELA_CENTER
  );
  const [loading, setLoading] = useState(false);
  const [located, setLocated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setLocated(true);
        const locationData = await reverseGeocode(latitude, longitude);
        onLocationChange(locationData);
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permiso de ubicación denegado. Habilitalo en tu navegador.');
        } else {
          setError('No pudimos obtener tu ubicación. Intentá de nuevo.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationChange]);

  const handlePositionChange = useCallback(
    async (lat: number, lng: number) => {
      setPosition([lat, lng]);
      setLocated(true);
      const locationData = await reverseGeocode(lat, lng);
      onLocationChange(locationData);
    },
    [onLocationChange]
  );

  return (
    <div className="space-y-3">
      {/* GPS Button */}
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
          border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm font-medium
          hover:bg-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Obteniendo ubicación...
          </>
        ) : (
          <>
            <Navigation className="h-4 w-4" />
            {located ? 'Actualizar ubicación' : 'Usar mi ubicación'}
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Map */}
      <div className="h-[250px] rounded-xl overflow-hidden border border-white/10">
        <LeafletMap
          position={position}
          onPositionChange={handlePositionChange}
          zoom={located ? 16 : 7}
        />
      </div>

      {!located && (
        <p className="text-xs text-zinc-500 text-center">
          Usá el botón de arriba o hacé clic en el mapa para marcar la ubicación de tu consultorio
        </p>
      )}
    </div>
  );
}
