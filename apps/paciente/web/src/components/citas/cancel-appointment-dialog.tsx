"use client";

import {
  AlertTriangle,
  Calendar,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Appointment } from "@/lib/services/appointments/appointments.types";

interface CancelResult {
  success: boolean;
  error: string | null;
}

interface CancelAppointmentDialogProps {
  appointment: Appointment;
  onConfirm: (reason: string | undefined) => Promise<CancelResult>;
  onClose: () => void;
  loading?: boolean;
}

const CANCEL_REASONS: Array<{ value: string; label: string }> = [
  { value: "improved", label: "Mejoré, ya no necesito la consulta" },
  { value: "schedule_conflict", label: "Tengo un conflicto de horario" },
  { value: "other_doctor", label: "Voy a ver a otro médico" },
  { value: "personal", label: "Razones personales" },
  { value: "cannot_attend", label: "No puedo asistir" },
  { value: "other", label: "Otro motivo" },
];

function formatScheduled(scheduledAt: string): { date: string; time: string } {
  try {
    const dt = new Date(scheduledAt);
    return {
      date: dt.toLocaleDateString("es-VE", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      time: dt.toLocaleTimeString("es-VE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  } catch {
    return { date: scheduledAt, time: "" };
  }
}

export function CancelAppointmentDialog({
  appointment,
  onConfirm,
  onClose,
  loading = false,
}: CancelAppointmentDialogProps) {
  const [reasonKey, setReasonKey] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const { date, time } = formatScheduled(appointment.scheduled_at);
  const doctorName = appointment.doctor?.full_name ?? "tu médico";

  // ESC closes the dialog (only when not in the middle of a request).
  // Focus trap: keep TAB navigation inside the dialog while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  // Focus the dialog when it opens; restore focus to the trigger on close.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    // Move focus into the dialog (the dialog container itself is the entry point).
    const node = dialogRef.current;
    if (node) {
      // Prefer the first focusable inside the dialog body for sensible keyboard flow.
      const firstFocusable = node.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (firstFocusable ?? node).focus();
    }
    return () => {
      // Restore focus to the element that opened the dialog (the trigger button).
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  const resolveReason = (): string | undefined => {
    if (!reasonKey) return undefined;
    if (reasonKey === "other") {
      const trimmed = customReason.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return CANCEL_REASONS.find((r) => r.value === reasonKey)?.label;
  };

  const handleSubmit = async () => {
    setError(null);
    const result = await onConfirm(resolveReason());
    if (!result.success) {
      setError(result.error ?? "No se pudo cancelar la cita. Intenta de nuevo.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden shadow-xl outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle aria-hidden="true" className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3
                id="cancel-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Cancelar cita
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X aria-hidden="true" className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-4">
          {/* Appointment summary */}
          <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
            <p className="text-sm font-medium text-gray-900">
              Dr. {doctorName}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 capitalize">
                <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
                {date}
              </span>
              {time && (
                <span className="flex items-center gap-1">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  {time}
                </span>
              )}
            </div>
          </div>

          {/* Policy hint */}
          <p className="text-xs text-gray-500">
            Algunas citas tienen política de cancelación con anticipación. Si la
            tuya está cerca, podrías recibir un mensaje del médico.
          </p>

          {/* Reason select */}
          <div className="space-y-1.5">
            <label
              htmlFor="cancel-reason"
              className="block text-xs font-medium text-gray-600"
            >
              Motivo{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <select
              id="cancel-reason"
              value={reasonKey}
              onChange={(e) => {
                setReasonKey(e.target.value);
                setError(null);
              }}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
            >
              <option value="">Sin especificar</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom reason textarea (only when "other") */}
          {reasonKey === "other" && (
            <div className="space-y-1.5">
              <label
                htmlFor="cancel-custom-reason"
                className="block text-xs font-medium text-gray-600"
              >
                Contanos brevemente
              </label>
              <textarea
                id="cancel-custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={500}
                placeholder="Tu motivo ayuda al médico a entender qué pasó."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 text-right">
                {customReason.length}/500
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg"
            >
              <AlertTriangle aria-hidden="true" className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition border-l border-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                Cancelando...
              </>
            ) : (
              "Cancelar cita"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
