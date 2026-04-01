"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Button,
  Badge,
  StateCitySelector,
} from "@red-salud/design-system";
import {
  Loader2,
  Navigation,
  MapPin,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";

import {
  detectLocation,
  type GeoLocationResult,
  type GeoLocationError,
} from "@/lib/services/geo-location-service";

// -------------------------------------------------------------------
// Local mapping: state name -> design-system code (used by StateCitySelector)
// -------------------------------------------------------------------
const STATE_NAME_TO_CODE: Record<string, string> = {
  Amazonas: "AM",
  "Anzoategui": "AN",
  Apure: "AP",
  Aragua: "AR",
  Barinas: "BA",
  "Bolivar": "BO",
  Carabobo: "CA",
  Cojedes: "CO",
  "Delta Amacuro": "DA",
  "Distrito Capital": "DC",
  "Falcon": "FA",
  "Guarico": "GU",
  Lara: "LA",
  "Merida": "ME",
  Miranda: "MI",
  Monagas: "MO",
  "Nueva Esparta": "NE",
  Portuguesa: "PO",
  Sucre: "SU",
  "Tachira": "TA",
  Trujillo: "TR",
  "La Guaira": "LG",
  Vargas: "LG",
  Yaracuy: "YA",
  Zulia: "ZU",
};

const CODE_TO_STATE_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_CODE).map(([name, code]) => [code, name]),
);

function findEstadoCode(estadoName: string): string {
  if (!estadoName) return "";
  // Direct match
  const direct = STATE_NAME_TO_CODE[estadoName];
  if (direct) return direct;
  // Accent-insensitive match
  const normalized = estadoName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    const nameNorm = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (nameNorm === normalized) return code;
  }
  return "";
}

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface LocationPickerProps {
  /** Current estado value */
  estado: string;
  /** Current municipio/ciudad value */
  municipio: string;
  /** Whether the location was auto-detected */
  autoDetected?: boolean;
  /** Called when location changes */
  onLocationChange: (location: {
    estado: string;
    municipio: string;
    ciudad: string;
    lat?: number;
    lng?: number;
    autoDetected: boolean;
  }) => void;
  /** Disable all interactions */
  disabled?: boolean;
}

type DetectState = "idle" | "detecting" | "success" | "error";

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function ProfileLocationPicker({
  estado,
  municipio,
  autoDetected,
  onLocationChange,
  disabled = false,
}: LocationPickerProps) {
  const [detectState, setDetectState] = useState<DetectState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gpsResult, setGpsResult] = useState<GeoLocationResult | null>(null);
  const [showManual, setShowManual] = useState(!autoDetected && !estado);
  const [manualEstadoCode, setManualEstadoCode] = useState(() =>
    findEstadoCode(estado),
  );
  const [manualCiudad, setManualCiudad] = useState(municipio ?? "");

  // -----------------------------------------------------------------
  // GPS Detection
  // -----------------------------------------------------------------
  const handleDetect = useCallback(async () => {
    setDetectState("detecting");
    setErrorMessage(null);

    try {
      const result = await detectLocation();
      setGpsResult(result);
      setDetectState("success");

      onLocationChange({
        estado: result.estado,
        municipio: result.municipio,
        ciudad: result.ciudad,
        lat: result.lat,
        lng: result.lng,
        autoDetected: true,
      });
    } catch (err) {
      const geoError = err as GeoLocationError;
      setErrorMessage(geoError.message ?? "Error al detectar la ubicacion.");
      setDetectState("error");
    }
  }, [onLocationChange]);

  // -----------------------------------------------------------------
  // Manual Selection
  // -----------------------------------------------------------------
  const handleManualEstadoChange = useCallback(
    (code: string) => {
      setManualEstadoCode(code);
      setManualCiudad("");

      const estadoName = CODE_TO_STATE_NAME[code] ?? "";

      onLocationChange({
        estado: estadoName,
        municipio: "",
        ciudad: "",
        autoDetected: false,
      });
    },
    [onLocationChange],
  );

  const handleManualCiudadChange = useCallback(
    (ciudad: string) => {
      setManualCiudad(ciudad);

      const estadoName = CODE_TO_STATE_NAME[manualEstadoCode] ?? "";

      onLocationChange({
        estado: estadoName,
        municipio: ciudad,
        ciudad,
        autoDetected: false,
      });
    },
    [manualEstadoCode, onLocationChange],
  );

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  const hasLocation = Boolean(estado);

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Ubicacion Actual
        </CardTitle>
        <CardDescription>
          Detecta tu ubicacion automaticamente o seleccionala manualmente.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error banner */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current location display */}
        {hasLocation && detectState !== "detecting" && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {estado}
                  {municipio ? `, ${municipio}` : ""}
                </p>
                {autoDetected && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Detectado por GPS
                  </p>
                )}
              </div>
            </div>
            {autoDetected && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-700 text-xs">
                GPS
              </Badge>
            )}
          </div>
        )}

        {/* GPS Detection Button */}
        <Button
          type="button"
          variant={hasLocation ? "outline" : "default"}
          onClick={handleDetect}
          disabled={disabled || detectState === "detecting"}
          className="w-full gap-2"
        >
          {detectState === "detecting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Detectando ubicacion...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              {hasLocation ? "Detectar de nuevo" : "Detectar mi ubicacion"}
            </>
          )}
        </Button>

        {/* GPS result confirmation */}
        {detectState === "success" && gpsResult && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                Ubicacion detectada:{" "}
                <span className="font-medium">
                  {gpsResult.estado}
                  {gpsResult.municipio ? `, ${gpsResult.municipio}` : ""}
                  {gpsResult.ciudad && gpsResult.ciudad !== gpsResult.municipio
                    ? ` (${gpsResult.ciudad})`
                    : ""}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              o selecciona manualmente
            </span>
          </div>
        </div>

        {/* Manual Selection Toggle */}
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          disabled={disabled}
          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5" />
            Seleccion manual
          </span>
          {showManual ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Manual Estado + Ciudad selectors */}
        {showManual && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Estado y Ciudad</Label>
            <StateCitySelector
              selectedEstadoCode={manualEstadoCode}
              selectedCiudad={manualCiudad}
              onEstadoChange={handleManualEstadoChange}
              onCiudadChange={handleManualCiudadChange}
              disabled={disabled}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
