"use client";

import { Loader2 } from "lucide-react";
import { MedicalIdCard } from "./medical-id-card";
import type { MedicalSummary } from "@/lib/services/emergency-service";

interface StepRequestingProps {
  medicalSummary: MedicalSummary | null;
  error: string | null;
}

/**
 * Step 4: Requesting / searching for an ambulance.
 * Shows a pulsing animation and the medical summary being shared.
 */
export function StepRequesting({ medicalSummary, error }: StepRequestingProps) {
  return (
    <div className="space-y-6">
      {/* Pulsing animation */}
      <div className="flex flex-col items-center py-8">
        <div className="relative w-24 h-24 mb-6">
          {/* Outer pulse rings */}
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
          <span
            className="absolute inset-2 rounded-full bg-red-400 opacity-20"
            style={{ animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.3s" }}
          />
          {/* Center circle */}
          <div className="absolute inset-4 rounded-full bg-red-600 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900">Buscando ambulancia cercana...</h2>
        <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
          Estamos localizando la unidad de emergencia más cercana a tu ubicación
        </p>

        {error && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}
      </div>

      {/* Medical summary being shared */}
      {medicalSummary && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide text-center">
            Información médica compartida con el equipo
          </p>
          <MedicalIdCard summary={medicalSummary} compact />
        </div>
      )}
    </div>
  );
}
