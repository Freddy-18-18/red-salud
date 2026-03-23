"use client";

import { ArrowLeft, MapPin, Video } from "lucide-react";

interface BookingDetailsProps {
  appointmentType: "presencial" | "telemedicina";
  reason: string;
  notes: string;
  onTypeChange: (type: "presencial" | "telemedicina") => void;
  onReasonChange: (reason: string) => void;
  onNotesChange: (notes: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const REASON_SUGGESTIONS = [
  "Consulta general",
  "Control de rutina",
  "Dolor o molestia",
  "Revision de resultados",
  "Segunda opinion",
  "Seguimiento de tratamiento",
];

export function BookingDetails({
  appointmentType,
  reason,
  notes,
  onTypeChange,
  onReasonChange,
  onNotesChange,
  onBack,
  onContinue,
}: BookingDetailsProps) {
  const canContinue = reason.trim().length >= 3;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar horario
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Detalles de la consulta
        </h2>
        <p className="text-gray-500 text-sm">
          Completa la informacion de tu cita
        </p>
      </div>

      {/* Appointment type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de consulta
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTypeChange("presencial")}
            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
              appointmentType === "presencial"
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-100 hover:border-emerald-200"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                appointmentType === "presencial"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Presencial
            </span>
            <span className="text-xs text-gray-500 text-center">
              Visita el consultorio del doctor
            </span>
          </button>

          <button
            onClick={() => onTypeChange("telemedicina")}
            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
              appointmentType === "telemedicina"
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-100 hover:border-emerald-200"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                appointmentType === "telemedicina"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Video className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Telemedicina
            </span>
            <span className="text-xs text-gray-500 text-center">
              Consulta por videollamada
            </span>
          </button>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Motivo de la consulta *
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={3}
          placeholder="Describe brevemente por que necesitas esta consulta..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
        />

        {/* Quick suggestions */}
        {!reason && (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-2">
              Sugerencias rapidas:
            </p>
            <div className="flex flex-wrap gap-2">
              {REASON_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onReasonChange(s)}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-gray-200 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Notas adicionales{" "}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          placeholder="Informacion adicional que quieras compartir con el doctor..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
        >
          Atras
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex-1 py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Revisar y confirmar
        </button>
      </div>
    </div>
  );
}
