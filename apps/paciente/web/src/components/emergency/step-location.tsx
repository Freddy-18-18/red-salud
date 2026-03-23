"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2, Edit3 } from "lucide-react";
import { useGeolocation } from "@/hooks/use-emergency";
import type { EmergencyLocation } from "@/lib/services/emergency-service";

interface StepLocationProps {
  initialLocation: EmergencyLocation | null;
  onConfirm: (location: EmergencyLocation) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

/**
 * Step 3: Location confirmation.
 * Auto-detects GPS, shows address, allows manual override.
 */
export function StepLocation({
  initialLocation,
  onConfirm,
  onSubmit,
  onBack,
  loading: submitting,
}: StepLocationProps) {
  const { location: gpsLocation, loading: gpsLoading, error: gpsError, requestLocation } =
    useGeolocation();
  const [manualAddress, setManualAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const currentLocation = initialLocation || gpsLocation;

  // Auto-request on mount
  useEffect(() => {
    if (!initialLocation) {
      requestLocation();
    }
  }, [initialLocation, requestLocation]);

  // Push location to parent when GPS resolves
  useEffect(() => {
    if (gpsLocation && !initialLocation) {
      onConfirm(gpsLocation);
    }
  }, [gpsLocation, initialLocation, onConfirm]);

  const handleManualSave = () => {
    if (!manualAddress.trim()) return;
    const loc: EmergencyLocation = {
      lat: currentLocation?.lat || 0,
      lng: currentLocation?.lng || 0,
      address: manualAddress.trim(),
    };
    onConfirm(loc);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Confirmá tu ubicación</h2>
        <p className="text-sm text-gray-500 mt-1">La ambulancia será enviada a esta dirección</p>
      </div>

      {/* Location display */}
      <div className="bg-white border-2 border-red-200 rounded-xl p-5 space-y-4">
        {gpsLoading && !currentLocation ? (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-6 w-6 text-red-500 animate-spin" />
            <p className="text-sm text-gray-500">Obteniendo tu ubicación...</p>
          </div>
        ) : currentLocation && !isEditing ? (
          <>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Dirección detectada</p>
                <p className="text-sm text-gray-900 mt-0.5 break-words">
                  {currentLocation.address}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestLocation}
                disabled={gpsLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Navigation className="h-4 w-4" />
                Actualizar ubicación
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualAddress(currentLocation.address);
                  setIsEditing(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Manual entry or editing */}
            {gpsError && !currentLocation && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">{gpsError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Dirección
              </label>
              <textarea
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Escribí la dirección completa..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestLocation}
                disabled={gpsLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Navigation className="h-4 w-4" />
                {gpsLoading ? "Buscando..." : "Usar mi ubicación"}
              </button>
              <button
                type="button"
                onClick={handleManualSave}
                disabled={!manualAddress.trim()}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                Confirmar dirección
              </button>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar edición
              </button>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!currentLocation || submitting}
          className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Solicitar ambulancia"
          )}
        </button>
      </div>
    </div>
  );
}
