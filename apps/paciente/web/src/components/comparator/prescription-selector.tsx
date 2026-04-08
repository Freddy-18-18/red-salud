"use client";

import {
  FileText,
  Pill,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

export interface PrescriptionMedication {
  id: string;
  medication_name: string;
  total_quantity?: string;
  duration_days?: number;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  general_instructions?: string;
  prescribed_at: string;
  expires_at?: string;
  status: "active" | "expired" | "dispensed";
  doctor?: {
    id?: string;
    full_name?: string;
    avatar_url?: string;
  };
  medications?: PrescriptionMedication[];
}

interface PrescriptionSelectorProps {
  prescriptions: Prescription[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Activa", bg: "bg-emerald-50", text: "text-emerald-700" },
  expired: { label: "Expirada", bg: "bg-gray-100", text: "text-gray-500" },
  dispensed: { label: "Dispensada", bg: "bg-blue-50", text: "text-blue-700" },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ───────────────────────────────────────────────────────

export function PrescriptionSelector({
  prescriptions,
  selectedId,
  onSelect,
  loading,
}: PrescriptionSelectorProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-gray-100 rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No tienes recetas activas
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">
          Necesitas una receta activa para comparar precios de medicamentos
        </p>
        <a
          href="/dashboard/buscar-medico"
          className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          Buscar Medico
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Selecciona una receta para comparar precios en farmacias cercanas
      </p>

      {prescriptions.map((prescription) => {
        const isSelected = selectedId === prescription.id;
        const statusConfig =
          STATUS_CONFIG[prescription.status] ?? STATUS_CONFIG.active;
        const medCount = prescription.medications?.length ?? 0;
        const doctorInitials = (prescription.doctor?.full_name ?? "D")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <button
            key={prescription.id}
            onClick={() => onSelect(prescription.id)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              isSelected
                ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Doctor avatar */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-emerald-100" : "bg-gray-50"
                }`}
              >
                {prescription.doctor?.avatar_url ? (
                  <img
                    src={prescription.doctor.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {doctorInitials}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    Dr. {prescription.doctor?.full_name ?? "Medico"}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                    >
                      {statusConfig.label}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                </div>

                {prescription.diagnosis && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {prescription.diagnosis}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(prescription.prescribed_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Pill className="h-3 w-3" />
                    {medCount} medicamento{medCount !== 1 ? "s" : ""}
                  </div>
                  {prescription.expires_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Exp: {formatDate(prescription.expires_at)}
                    </div>
                  )}
                </div>

                {/* Medication preview */}
                {medCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prescription.medications!.slice(0, 4).map((med) => (
                      <span
                        key={med.id}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Pill className="h-2.5 w-2.5" />
                        {med.medication_name}
                      </span>
                    ))}
                    {medCount > 4 && (
                      <span className="text-xs text-gray-400">
                        +{medCount - 4} mas
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
