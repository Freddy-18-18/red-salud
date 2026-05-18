"use client";

import { AlertTriangle, Loader2, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { AppointmentDetail } from "@/lib/services/appointments/appointments.types";
import { postJson } from "@/lib/utils/fetch";

interface RateAppointmentDialogProps {
  appointment: AppointmentDetail;
  onSubmitted: (rating: number) => void;
  onClose: () => void;
}

interface SubResult {
  success: boolean;
  error: string | null;
}

const SUB_RATING_FIELDS: Array<{ key: SubKey; label: string }> = [
  { key: "punctuality_rating", label: "Puntualidad" },
  { key: "communication_rating", label: "Comunicación" },
  { key: "professionalism_rating", label: "Profesionalismo" },
  { key: "time_dedicated_rating", label: "Tiempo dedicado" },
  { key: "bedside_manner_rating", label: "Trato humano" },
];

type SubKey =
  | "punctuality_rating"
  | "communication_rating"
  | "professionalism_rating"
  | "time_dedicated_rating"
  | "bedside_manner_rating";

interface SubRatings {
  punctuality_rating: number;
  communication_rating: number;
  professionalism_rating: number;
  time_dedicated_rating: number;
  bedside_manner_rating: number;
}

const RATING_LABELS: Record<number, string> = {
  1: "Muy mala",
  2: "Mala",
  3: "Regular",
  4: "Buena",
  5: "Excelente",
};

function StarRow({
  value,
  onChange,
  disabled,
  size = "md",
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const dim = size === "md" ? "h-7 w-7" : "h-5 w-5";
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            disabled={disabled}
            className="transition disabled:opacity-50 hover:scale-110"
            title={RATING_LABELS[n]}
          >
            <Star
              className={`${dim} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function RateAppointmentDialog({
  appointment,
  onSubmitted,
  onClose,
}: RateAppointmentDialogProps) {
  const doctorProfileId = appointment.doctor?.doctor_profile?.id;
  const [overall, setOverall] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [subs, setSubs] = useState<SubRatings>({
    punctuality_rating: 0,
    communication_rating: 0,
    professionalism_rating: 0,
    time_dedicated_rating: 0,
    bedside_manner_rating: 0,
  });
  const [showDetail, setShowDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESC closes when not submitting
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitting, onClose]);

  const handleSubmit = async (): Promise<SubResult> => {
    if (overall < 1) {
      setError("Selecciona una calificación general");
      return { success: false, error: "rating required" };
    }
    if (!doctorProfileId) {
      setError("No pudimos identificar al doctor. Recarga la página.");
      return { success: false, error: "missing doctor_profile_id" };
    }

    setError(null);
    setSubmitting(true);
    try {
      await postJson<{ id: string }>(
        `/api/doctors/${doctorProfileId}/reviews`,
        {
          appointment_id: appointment.id,
          rating: overall,
          comment: comment.trim() || null,
          is_anonymous: isAnonymous,
          ...Object.fromEntries(
            Object.entries(subs).filter(([, v]) => v > 0),
          ),
        },
      );
      onSubmitted(overall);
      return { success: true, error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo enviar la reseña. Intenta de nuevo.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <h3
                id="rate-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Calificar consulta
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Dr. {appointment.doctor?.full_name ?? "tu médico"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* Overall rating */}
          <div className="text-center space-y-2 py-2">
            <p className="text-sm font-medium text-gray-700">
              ¿Cómo fue tu consulta?
            </p>
            <div className="flex justify-center">
              <StarRow
                value={overall}
                onChange={(v) => {
                  setOverall(v);
                  setError(null);
                }}
                disabled={submitting}
                ariaLabel="Calificación general"
              />
            </div>
            {overall > 0 && (
              <p className="text-xs text-gray-500">{RATING_LABELS[overall]}</p>
            )}
          </div>

          {/* Detail toggle */}
          <button
            type="button"
            onClick={() => setShowDetail((s) => !s)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {showDetail
              ? "Ocultar calificación detallada"
              : "Calificá aspectos puntuales (opcional)"}
          </button>

          {showDetail && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
              {SUB_RATING_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-gray-700">{field.label}</span>
                  <StarRow
                    value={subs[field.key]}
                    onChange={(v) =>
                      setSubs((prev) => ({ ...prev, [field.key]: v }))
                    }
                    disabled={submitting}
                    size="sm"
                    ariaLabel={field.label}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          <div className="space-y-1.5">
            <label
              htmlFor="rate-comment"
              className="block text-xs font-medium text-gray-600"
            >
              Comentario{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="rate-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={2000}
              placeholder="Tu reseña ayuda a otros pacientes a elegir."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 text-right">
              {comment.length}/2000
            </p>
          </div>

          {/* Anonymous */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={submitting}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
            />
            Publicar como anónimo
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || overall < 1}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition border-l border-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar reseña"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
