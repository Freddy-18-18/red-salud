"use client";

import { useState, useCallback } from "react";
import { X, Loader2, Plus } from "lucide-react";

import {
  CONDITION_OPTIONS,
  type ConditionType,
  type Severity,
  type AddConditionData,
} from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AddConditionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddConditionData) => Promise<void>;
  submitting?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AddConditionDialog({
  open,
  onClose,
  onSubmit,
  submitting = false,
}: AddConditionDialogProps) {
  const [conditionType, setConditionType] = useState<ConditionType | "">("");
  const [customLabel, setCustomLabel] = useState("");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [severity, setSeverity] = useState<Severity>("moderado");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setConditionType("");
    setCustomLabel("");
    setDiagnosedDate("");
    setSeverity("moderado");
    setNotes("");
    setError("");
  }, []);

  const handleClose = useCallback(() => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  }, [submitting, resetForm, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!conditionType) {
        setError("Selecciona una condicion.");
        return;
      }

      if (!diagnosedDate) {
        setError("Indica la fecha de diagnostico.");
        return;
      }

      const data: AddConditionData = {
        condition_type: conditionType,
        diagnosed_date: diagnosedDate,
        severity,
        notes: notes.trim() || undefined,
      };

      if (conditionType === "otro" && customLabel.trim()) {
        data.condition_label = customLabel.trim();
      }

      try {
        await onSubmit(data);
        resetForm();
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al registrar la condicion.",
        );
      }
    },
    [conditionType, customLabel, diagnosedDate, severity, notes, onSubmit, resetForm, onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Agregar condicion cronica"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Agregar condicion cronica
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Condition type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condicion <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setConditionType(option.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all min-h-[44px] ${
                    conditionType === option.value
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom label for "otro" */}
          {conditionType === "otro" && (
            <div>
              <label
                htmlFor="custom-label"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la condicion
              </label>
              <input
                id="custom-label"
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Ej: Fibromialgia, Lupus..."
                className="w-full h-12 px-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Diagnosed date */}
          <div>
            <label
              htmlFor="diagnosed-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de diagnostico <span className="text-red-400">*</span>
            </label>
            <input
              id="diagnosed-date"
              type="date"
              value={diagnosedDate}
              onChange={(e) => setDiagnosedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full h-12 px-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidad <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {(
                [
                  { value: "leve" as const, label: "Leve", color: "emerald" },
                  {
                    value: "moderado" as const,
                    label: "Moderado",
                    color: "amber",
                  },
                  { value: "severo" as const, label: "Severo", color: "red" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSeverity(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                    severity === opt.value
                      ? opt.color === "emerald"
                        ? "bg-emerald-500 text-white"
                        : opt.color === "amber"
                          ? "bg-amber-500 text-white"
                          : "bg-red-500 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="condition-notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notas{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="condition-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: tratamiento actual, alergias, informacion relevante..."
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 h-12 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!conditionType || !diagnosedDate || submitting}
              className="flex-1 h-12 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Registrar condicion"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
