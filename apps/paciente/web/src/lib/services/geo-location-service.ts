// -------------------------------------------------------------------
// GPS Location Service
// -------------------------------------------------------------------
// Uses the browser Geolocation API for coords and Mapbox for reverse
// geocoding. Falls back gracefully when permissions are denied or the
// API is unavailable.
// -------------------------------------------------------------------

export interface GeoLocationResult {
  lat: number;
  lng: number;
  estado: string;
  municipio: string;
  ciudad: string;
}

export interface GeoLocationError {
  code: "UNSUPPORTED" | "DENIED" | "UNAVAILABLE" | "TIMEOUT" | "GEOCODE_FAILED";
  message: string;
}

// -------------------------------------------------------------------
// 1. Get current GPS position
// -------------------------------------------------------------------

export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({
        code: "UNSUPPORTED",
        message: "Tu navegador no soporta geolocalizacion.",
      } satisfies GeoLocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        const mapped: GeoLocationError = (() => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              return {
                code: "DENIED" as const,
                message:
                  "Permiso de ubicacion denegado. Activalo en la configuracion del navegador.",
              };
            case error.POSITION_UNAVAILABLE:
              return {
                code: "UNAVAILABLE" as const,
                message: "No se pudo determinar tu ubicacion. Intenta de nuevo.",
              };
            case error.TIMEOUT:
              return {
                code: "TIMEOUT" as const,
                message:
                  "La solicitud de ubicacion tardo demasiado. Intenta de nuevo.",
              };
            default:
              return {
                code: "UNAVAILABLE" as const,
                message: "Error desconocido al obtener la ubicacion.",
              };
          }
        })();
        reject(mapped);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000, // Cache for 1 minute
      },
    );
  });
}

// -------------------------------------------------------------------
// 2. Reverse geocode via Mapbox
// -------------------------------------------------------------------

interface MapboxFeature {
  id: string;
  place_type: string[];
  text: string;
  place_name: string;
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface MapboxGeocodingResponse {
  type: string;
  features: MapboxFeature[];
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeoLocationResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    throw {
      code: "GEOCODE_FAILED",
      message: "Servicio de geocodificacion no configurado.",
    } satisfies GeoLocationError;
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "VE");
  url.searchParams.set("types", "region,district,place");
  url.searchParams.set("language", "es");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw {
      code: "GEOCODE_FAILED",
      message: "Error al consultar el servicio de geocodificacion.",
    } satisfies GeoLocationError;
  }

  const data = (await response.json()) as MapboxGeocodingResponse;

  if (!data.features || data.features.length === 0) {
    throw {
      code: "GEOCODE_FAILED",
      message:
        "No se encontraron resultados para tu ubicacion. Puede que estes fuera de Venezuela.",
    } satisfies GeoLocationError;
  }

  // Parse features to extract estado, municipio, ciudad
  let estado = "";
  let municipio = "";
  let ciudad = "";

  for (const feature of data.features) {
    if (feature.place_type.includes("place")) {
      ciudad = feature.text;
    }
    if (feature.place_type.includes("district")) {
      municipio = feature.text;
    }
    if (feature.place_type.includes("region")) {
      estado = feature.text;
    }

    // Also check context for parent regions
    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith("region")) {
          estado = ctx.text;
        }
        if (ctx.id.startsWith("district")) {
          municipio = ctx.text;
        }
        if (ctx.id.startsWith("place")) {
          ciudad = ctx.text;
        }
      }
    }
  }

  // If we got a place but no region, try the context of the first feature
  if (!estado && data.features[0]?.context) {
    for (const ctx of data.features[0].context) {
      if (ctx.id.startsWith("region")) {
        estado = ctx.text;
      }
    }
  }

  return { lat, lng, estado, municipio, ciudad };
}

// -------------------------------------------------------------------
// 3. Convenience: detect location + reverse geocode in one call
// -------------------------------------------------------------------

export async function detectLocation(): Promise<GeoLocationResult> {
  const coords = await getCurrentLocation();
  return reverseGeocode(coords.lat, coords.lng);
}
