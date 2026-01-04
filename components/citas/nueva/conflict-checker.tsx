"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConflictingAppointment {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
  paciente?: { nombre_completo: string };
  offline_patient?: { nombre_completo: string };
}

interface ConflictCheckerProps {
  checkingConflict: boolean;
  conflictingAppointments: ConflictingAppointment[];
  error: string | null;
}

export function ConflictChecker({
  checkingConflict,
  conflictingAppointments,
  error,
}: ConflictCheckerProps) {
  // Estado de carga
  if (checkingConflict) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        <span className="text-sm text-blue-700 font-medium">Verificando disponibilidad...</span>
      </div>
    );
  }

  // Error crítico
  if (error) {
    return (
      <Alert variant="destructive" className="border-red-300 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  // Conflictos detectados (no es error, solo advertencia)
  if (conflictingAppointments.length > 0) {
    return (
      <Alert className="border-amber-300 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <div className="font-semibold mb-2">⚠️ Citas en este horario:</div>
          <ul className="space-y-1 ml-2">
            {conflictingAppointments.map((apt) => {
              const patientName =
                apt.paciente?.nombre_completo ||
                apt.offline_patient?.nombre_completo ||
                "Paciente";
              const time = new Date(apt.fecha_hora).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={apt.id} className="text-sm">
                  {time} - {patientName} ({apt.motivo || "Sin motivo"})
                </div>
              );
            })}
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
