'use client';

import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

import { MapView } from '@/components/public/map/map-view';
import { getCityCoordinates } from '@/lib/data/venezuela-geo';
import type { MapDoctorPoint } from '@/lib/types/public';

interface DoctorLocationTabProps {
  doctorId: string;
  doctorSlug: string;
  doctorName: string;
  specialty: string;
  city: string | null;
  state: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
}

/**
 * Shows a MapLibre map with a single marker for the doctor's location.
 * Uses city center coordinates from the static lookup table.
 */
export function DoctorLocationTab({
  doctorId,
  doctorSlug,
  doctorName,
  specialty,
  city,
  state,
  avatarUrl,
  rating,
}: DoctorLocationTabProps) {
  const coordinates = useMemo(
    () => getCityCoordinates(state, city),
    [state, city],
  );

  if (!coordinates) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-6 py-16 text-center">
        <MapPin className="mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
          Ubicacion no disponible
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Este doctor no ha registrado su ubicacion
        </p>
      </div>
    );
  }

  const doctorMarker: MapDoctorPoint[] = [
    {
      id: doctorId,
      slug: doctorSlug,
      name: doctorName,
      specialty,
      lat: coordinates.lat,
      lng: coordinates.lng,
      rating: rating ?? null,
      avatarUrl: avatarUrl ?? null,
      city: city ?? '',
      state: state ?? '',
    },
  ];

  return (
    <div className="space-y-3">
      <MapView
        doctors={doctorMarker}
        center={{
          longitude: coordinates.lng,
          latitude: coordinates.lat,
          zoom: 12,
        }}
        className="h-[350px] w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] md:h-[400px]"
      />

      {/* Location label */}
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>
          {city && state
            ? `${city}, ${state}`
            : state ?? 'Venezuela'}
        </span>
      </div>
    </div>
  );
}
