"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  FileText,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";

import type { BookingState } from "@/hooks/use-booking";

interface BookingSummaryProps {
  state: BookingState;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("es-VE", options);
}

export function BookingSummary({
  state,
  loading,
  error,
  onConfirm,
  onBack,
}: BookingSummaryProps) {
  const doctorName =
    state.doctor?.profile.full_name || "Doctor";
  const fee = state.doctor?.consultation_fee;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Modificar detalles
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Confirmar tu cita
        </h2>
        <p className="text-gray-500 text-sm">
          Verifica los detalles antes de confirmar
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Doctor header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            {state.doctor?.profile.avatar_url ? (
              <img
                src={state.doctor.profile.avatar_url}
                alt={doctorName}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">Dr. {doctorName}</h3>
              <p className="text-emerald-100 text-sm">
                {state.specialty?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Fecha
              </p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {state.date ? formatDateLabel(state.date) : "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Hora
              </p>
              <p className="text-sm font-medium text-gray-900">
                {state.timeSlot
                  ? `${state.timeSlot.start} - ${state.timeSlot.end}`
                  : "-"}{" "}
                <span className="text-gray-500">(30 min)</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {state.appointmentType === "telemedicina" ? (
                <Video className="h-4 w-4 text-blue-600" />
              ) : (
                <MapPin className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Modalidad
              </p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {state.appointmentType === "telemedicina"
                  ? "Telemedicina (videollamada)"
                  : "Presencial"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-50 rounded-lg">
              <FileText className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Motivo
              </p>
              <p className="text-sm text-gray-900">{state.reason || "-"}</p>
              {state.notes && (
                <p className="text-sm text-gray-500 mt-1">
                  Notas: {state.notes}
                </p>
              )}
            </div>
          </div>

          {fee !== null && fee !== undefined && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Costo de consulta
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    ${fee.toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Important note */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-800">
            Tu cita quedara en estado <strong>pendiente</strong> hasta que el
            doctor la confirme. Recibiras una notificacion cuando sea aceptada.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
        >
          Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Agendando...
            </>
          ) : (
            "Confirmar Cita"
          )}
        </button>
      </div>
    </div>
  );
}
