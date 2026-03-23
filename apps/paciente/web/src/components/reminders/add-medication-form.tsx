"use client";

import { useState } from "react";
import { X, Plus, Clock, Trash2 } from "lucide-react";
import type { CreateMedicationReminder } from "@/lib/services/reminders-service";

interface AddMedicationFormProps {
  onSubmit: (data: CreateMedicationReminder) => Promise<unknown>;
  onClose: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: "1", label: "1 vez al dia" },
  { value: "2", label: "2 veces al dia" },
  { value: "3", label: "3 veces al dia" },
  { value: "4", label: "4 veces al dia" },
  { value: "weekly", label: "Semanal" },
  { value: "custom", label: "Personalizado" },
];

const DEFAULT_TIMES: Record<string, string[]> = {
  "1": ["08:00"],
  "2": ["08:00", "20:00"],
  "3": ["08:00", "14:00", "20:00"],
  "4": ["08:00", "12:00", "16:00", "20:00"],
  weekly: ["08:00"],
  custom: [],
};

export function AddMedicationForm({ onSubmit, onClose }: AddMedicationFormProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("1");
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(["08:00"]);
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    const defaults = DEFAULT_TIMES[value];
    if (defaults) {
      setScheduleTimes([...defaults]);
    }
  };

  const addTime = () => {
    setScheduleTimes([...scheduleTimes, "12:00"]);
  };

  const removeTime = (index: number) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    const updated = [...scheduleTimes];
    updated[index] = value;
    setScheduleTimes(updated);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!medicationName.trim()) {
      setError("Ingresa el nombre del medicamento");
      return;
    }
    if (scheduleTimes.length === 0) {
      setError("Agrega al menos un horario");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        medication_name: medicationName.trim(),
        dosage: dosage.trim() || undefined,
        frequency:
          frequency === "custom"
            ? "personalizado"
            : FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label,
        starts_at: startsAt,
        ends_at: endsAt || undefined,
        schedule_times: scheduleTimes.sort(),
        notes: notes.trim() || undefined,
      });
    } catch {
      setError("Error al crear el recordatorio");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Agregar medicamento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Medication name */}
          <div>
            <label
              htmlFor="med-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del medicamento *
            </label>
            <input
              id="med-name"
              type="text"
              autoFocus
              placeholder="Ej: Losartan 50mg"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Dosage */}
          <div>
            <label
              htmlFor="dosage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dosis
            </label>
            <input
              id="dosage"
              type="text"
              placeholder="Ej: 1 comprimido"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Frequency */}
          <div>
            <label
              htmlFor="frequency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Frecuencia
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule times */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horarios
            </label>
            <div className="space-y-2">
              {scheduleTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {scheduleTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700 py-1"
              >
                <Plus className="h-4 w-4" />
                Agregar horario
              </button>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="starts-at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha inicio *
              </label>
              <input
                id="starts-at"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="ends-at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha fin
              </label>
              <input
                id="ends-at"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                min={startsAt}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">
                Dejar vacio = indefinido
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notas
            </label>
            <textarea
              id="notes"
              placeholder="Ej: Tomar con el desayuno"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={submitting || !medicationName.trim()}
              onClick={handleSubmit}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Guardar medicamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
