"use client";

import { useState } from "react";
import {
  Truck,
  Navigation,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  Loader2,
} from "lucide-react";
import { MedicalIdCard } from "./medical-id-card";
import type {
  EmergencyRequest,
  EmergencyStatus,
  MedicalSummary,
} from "@/lib/services/emergency-service";

interface StepTrackingProps {
  request: EmergencyRequest;
  medicalSummary: MedicalSummary | null;
  onCancel: () => void;
  loading: boolean;
}

interface StatusStep {
  key: EmergencyStatus;
  label: string;
  icon: typeof Truck;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "dispatched", label: "Despachada", icon: Truck },
  { key: "en_route", label: "En camino", icon: Navigation },
  { key: "on_scene", label: "En sitio", icon: MapPin },
  { key: "transporting", label: "Trasladando", icon: Truck },
];

const STATUS_ORDER: EmergencyStatus[] = [
  "requesting",
  "dispatched",
  "en_route",
  "on_scene",
  "transporting",
  "completed",
];

function getStatusIndex(status: EmergencyStatus): number {
  return STATUS_ORDER.indexOf(status);
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Step 5: Real-time ambulance tracking.
 * Shows status progression, ambulance info, and cancel option.
 */
export function StepTracking({
  request,
  medicalSummary,
  onCancel,
  loading,
}: StepTrackingProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const currentIndex = getStatusIndex(request.status);
  const isCancellable = ["requesting", "dispatched", "en_route"].includes(request.status);
  const isCompleted = request.status === "completed";
  const isCancelled = request.status === "cancelled";

  const priorityLabels: Record<string, { label: string; color: string }> = {
    red: { label: "Peligro de vida", color: "bg-red-100 text-red-700" },
    yellow: { label: "Urgente", color: "bg-amber-100 text-amber-700" },
    green: { label: "No urgente", color: "bg-green-100 text-green-700" },
  };

  const priorityInfo = priorityLabels[request.priority] || priorityLabels.red;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        {isCompleted ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">Emergencia completada</h2>
          </>
        ) : isCancelled ? (
          <>
            <X className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">Emergencia cancelada</h2>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900">Ambulancia en camino</h2>
            <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
          </>
        )}
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const stepIndex = getStatusIndex(step.key);
              const isDone = currentIndex > stepIndex;
              const isActive = currentIndex === stepIndex;
              const isPending = currentIndex < stepIndex;
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <div key={step.key} className="flex gap-3">
                  {/* Line + dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-red-600 text-white ring-4 ring-red-100"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isActive ? (
                        <step.icon className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          isDone ? "bg-emerald-300" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pt-1">
                    <p
                      className={`text-sm font-medium ${
                        isDone
                          ? "text-emerald-700"
                          : isActive
                            ? "text-red-700 font-semibold"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                      {isActive && (
                        <span className="inline-block ml-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </p>
                    {isDone && step.key === "dispatched" && request.dispatched_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(request.dispatched_at)}
                      </p>
                    )}
                    {isDone && step.key === "on_scene" && request.arrived_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(request.arrived_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request info */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          Solicitada a las {formatTime(request.created_at)}
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span className="break-words">{request.location_address}</span>
        </div>
        {request.symptoms && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{request.symptoms}</span>
          </div>
        )}
      </div>

      {/* Emergency contact notification */}
      {medicalSummary?.contacto_emergencia.telefono && request.status !== "requesting" && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Se notificó a {medicalSummary.contacto_emergencia.nombre || "tu contacto de emergencia"}
          </p>
        </div>
      )}

      {/* Medical ID */}
      {medicalSummary && (
        <details className="group">
          <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1 transition-colors">
            Ver información médica compartida
            <span className="ml-auto text-xs text-gray-400 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="mt-3">
            <MedicalIdCard summary={medicalSummary} />
          </div>
        </details>
      )}

      {/* Cancel button */}
      {isCancellable && (
        <>
          {showCancelConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-red-700 text-center">
                ¿Estás seguro de cancelar la emergencia?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  No, mantener
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sí, cancelar"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              Cancelar emergencia
            </button>
          )}
        </>
      )}
    </div>
  );
}
