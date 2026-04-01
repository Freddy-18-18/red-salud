"use client";

import { useState } from "react";
import {
  MapPin,
  List,
  Map,
  Loader2,
  RefreshCw,
  LocateFixed,
  AlertCircle,
} from "lucide-react";

import { ProviderListView } from "@/components/nearby/provider-list-view";
import { MapView } from "@/components/nearby/map-view";
import { ProviderDetailSheet } from "@/components/nearby/provider-detail-sheet";
import { DistanceFilter } from "@/components/nearby/distance-filter";
import { SkeletonList } from "@/components/ui/skeleton";

import { useUserLocation, useNearbyProviders } from "@/hooks/use-nearby";
import { type NearbyProvider, type ProviderType } from "@/lib/services/nearby-service";

type ViewMode = "list" | "map";

export default function CercanosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<ProviderType[]>([
    "medico",
    "farmacia",
    "clinica",
    "laboratorio",
  ]);
  const [selectedProvider, setSelectedProvider] = useState<NearbyProvider | null>(null);

  const {
    location,
    loading: locationLoading,
    error: locationError,
    retry: retryLocation,
  } = useUserLocation();

  const {
    providers,
    loading: providersLoading,
    refresh: refreshProviders,
  } = useNearbyProviders(location, {
    types: selectedTypes,
    radius_km: radiusKm,
  });

  const isLoading = locationLoading || providersLoading;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Cercanos
          </h1>
          <p className="text-gray-500 mt-1">
            Proveedores de salud cerca de ti
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshProviders()}
            disabled={isLoading}
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          {/* View toggle */}
          <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-md transition ${
                viewMode === "map"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Vista de mapa"
            >
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Location error */}
      {locationError && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              No pudimos obtener tu ubicacion
            </p>
            <p className="text-xs text-amber-600 mt-0.5">{locationError}</p>
          </div>
          <button
            onClick={retryLocation}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* Location loading */}
      {locationLoading && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Obteniendo tu ubicacion...
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Permite el acceso a la ubicacion en tu navegador
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {location && (
        <DistanceFilter
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
        />
      )}

      {/* Results count */}
      {location && !providersLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {providers.length} proveedor{providers.length !== 1 ? "es" : ""}{" "}
            encontrado{providers.length !== 1 ? "s" : ""} en {radiusKm} km
          </span>
        </div>
      )}

      {/* Content */}
      {providersLoading ? (
        <SkeletonList count={4} />
      ) : location ? (
        <>
          {viewMode === "list" ? (
            <ProviderListView
              providers={providers}
              onSelect={setSelectedProvider}
            />
          ) : (
            <MapView
              providers={providers}
              userLocation={location}
              radiusKm={radiusKm}
              selectedId={
                selectedProvider
                  ? `${selectedProvider.type}-${selectedProvider.id}`
                  : null
              }
              onSelectProvider={setSelectedProvider}
            />
          )}
        </>
      ) : null}

      {/* Detail sheet */}
      {selectedProvider && (
        <ProviderDetailSheet
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}
