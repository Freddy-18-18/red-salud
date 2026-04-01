import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  nearbyService,
  type GeoPoint,
  type NearbyFilters,
} from "@/lib/services/nearby-service";

export function useUserLocation() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta geolocalizacion");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Permiso de ubicacion denegado. Activa la ubicacion en la configuracion de tu navegador."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError("No se pudo determinar tu ubicacion");
            break;
          case err.TIMEOUT:
            setError("La solicitud de ubicacion expiro");
            break;
          default:
            setError("Error al obtener la ubicacion");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // Cache for 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location,
    loading,
    error,
    retry: requestLocation,
  };
}

export function useNearbyProviders(
  location: GeoPoint | null,
  filters?: NearbyFilters
) {
  const query = useQuery({
    queryKey: ["nearby", "providers", location, filters],
    queryFn: async () => {
      if (!location) return [];
      return nearbyService.getNearbyProviders(location, filters);
    },
    enabled: !!location,
  });

  return {
    providers: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}
