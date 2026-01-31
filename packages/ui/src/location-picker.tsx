/**
 * @file location-picker.tsx
 * @description Componente de Google Maps para seleccionar ubicación con marcador arrastrable.
 * @module Components/UI
 */

"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Label } from "./label";
import { Button } from "./button";
import { MapPin, Loader2, Navigation } from "lucide-react";

/** Interfaz para datos de ubicación */
export interface LocationData {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
}

interface LocationPickerProps {
    /** Ubicación inicial */
    initialLocation?: LocationData;
    /** Callback cuando se selecciona una ubicación */
    onLocationSelect: (location: LocationData) => void;
    /** API Key de Google Maps */
    apiKey: string;
    /** Altura del mapa */
    height?: string;
}

const defaultCenter = {
    lat: 10.491016, // Caracas, Venezuela
    lng: -66.902061
};

const mapContainerStyle = {
    width: "100%",
    height: "400px"
};

/**
 * Componente de selector de ubicación con Google Maps
 */
export function LocationPicker({
    initialLocation,
    onLocationSelect,
    apiKey,
    height = "400px"
}: LocationPickerProps) {
    const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(
        initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
    );
    const [isGeolocating, setIsGeolocating] = useState(false);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries: ["places"]
    });

    /**
     * Reverse geocoding: convierte coordenadas a dirección
     */
    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({
                location: { lat, lng }
            });

            if (result.results[0]) {
                const addressComponents = result.results[0].address_components;
                const formattedAddress = result.results[0].formatted_address;

                // Extraer componentes
                let city = "";
                let state = "";
                let postalCode = "";

                addressComponents.forEach(component => {
                    if (component.types.includes("locality")) {
                        city = component.long_name;
                    }
                    if (component.types.includes("administrative_area_level_1")) {
                        state = component.long_name;
                    }
                    if (component.types.includes("postal_code")) {
                        postalCode = component.long_name;
                    }
                });

                onLocationSelect({
                    lat,
                    lng,
                    address: formattedAddress,
                    city,
                    state,
                    postalCode
                });
            }
        } catch (error) {
            console.error("[LocationPicker] Reverse geocoding error:", error);
        }
    }, [onLocationSelect]);

    /**
     * Maneja el click en el mapa para colocar marcador
     */
    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarker({ lat, lng });
            reverseGeocode(lat, lng);
        }
    }, [reverseGeocode]);

    /**
     * Obtiene ubicación actual del dispositivo
     */
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización");
            return;
        }

        setIsGeolocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setMarker({ lat, lng });
                reverseGeocode(lat, lng);
                setIsGeolocating(false);
            },
            (error) => {
                console.error("[LocationPicker] Geolocation error:", error);
                alert("No se pudo obtener tu ubicación. Verifica los permisos del navegador.");
                setIsGeolocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    if (loadError) {
        return (
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Error al cargar Google Maps. Verifica tu API Key.
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Ubicación en Mapa
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={isGeolocating}
                    className="gap-2"
                >
                    {isGeolocating ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Obteniendo...
                        </>
                    ) : (
                        <>
                            <Navigation className="h-3.5 w-3.5" />
                            Mi Ubicación
                        </>
                    )}
                </Button>
            </div>

            <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={{ ...mapContainerStyle, height }}
                    center={marker || defaultCenter}
                    zoom={marker ? 15 : 12}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {marker && (
                        <Marker
                            position={marker}
                            draggable={true}
                            onDragEnd={(e) => {
                                if (e.latLng) {
                                    const lat = e.latLng.lat();
                                    const lng = e.latLng.lng();
                                    setMarker({ lat, lng });
                                    reverseGeocode(lat, lng);
                                }
                            }}
                        />
                    )}
                </GoogleMap>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="inline h-3 w-3 mr-1" />
                Haz click en el mapa o arrastra el marcador para seleccionar la ubicación exacta
            </p>
        </div>
    );
}
