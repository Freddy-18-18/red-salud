"use client";

import { useState } from "react";
import {
  UserPlus,
  X,
  Clock,
  Stethoscope,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { type JoinQueueData } from "@/lib/services/queue-service";

interface Appointment {
  id: string;
  doctor_name?: string;
  doctor_id?: string;
  specialty?: string;
  scheduled_at: string;
}

interface JoinQueueDialogProps {
  appointments: Appointment[];
  onJoin: (data: JoinQueueData) => Promise<{ success: boolean }>;
  onClose: () => void;
  loading?: boolean;
}

export function JoinQueueDialog({
  appointments,
  onJoin,
  onClose,
  loading = false,
}: JoinQueueDialogProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    appointments.length === 1 ? appointments[0].id : ""
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedAppointment = appointments.find(
    (a) => a.id === selectedAppointmentId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAppointmentId) {
      setError("Selecciona una cita");
      return;
    }

    const result = await onJoin({
      appointment_id: selectedAppointmentId,
      doctor_id: selectedAppointment?.doctor_id,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setError("No se pudo unir a la cola. Intenta de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Unirse a la cola
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Appointment selection */}
          {appointments.length === 0 ? (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  No tienes citas disponibles
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Necesitas una cita confirmada para unirte a la cola virtual
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Selecciona tu cita
              </label>
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => setSelectedAppointmentId(apt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      selectedAppointmentId === apt.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedAppointmentId === apt.id
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {apt.doctor_name
                          ? `Dr. ${apt.doctor_name}`
                          : "Consulta medica"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        {apt.specialty && <span>{apt.specialty}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(apt.scheduled_at).toLocaleTimeString(
                            "es-VE",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notas{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Soy paciente con movilidad reducida, llegue temprano..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || appointments.length === 0 || !selectedAppointmentId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uniendo...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Unirme a la cola
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
