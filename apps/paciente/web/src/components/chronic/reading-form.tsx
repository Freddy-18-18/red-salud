"use client";

import { useState, useCallback } from "react";
import {
  Check,
  Loader2,
} from "lucide-react";

import {
  type ConditionType,
  type LogReadingData,
  CONDITION_OPTIONS,
} from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Reading form configs per condition type                            */
/* ------------------------------------------------------------------ */

interface FieldConfig {
  label: string;
  placeholder: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

interface FormConfig {
  primary: FieldConfig;
  secondary?: FieldConfig;
  readingType: string;
  contexts?: { value: string; label: string }[];
}

const FORM_CONFIGS: Record<string, FormConfig> = {
  diabetes_tipo_1: {
    primary: {
      label: "Glucosa",
      placeholder: "120",
      unit: "mg/dL",
      min: 20,
      max: 600,
      step: 1,
    },
    readingType: "glucose",
    contexts: [
      { value: "ayunas", label: "En ayunas" },
      { value: "postprandial", label: "Postprandial (2h)" },
      { value: "random", label: "Al azar" },
      { value: "pre_comida", label: "Antes de comer" },
    ],
  },
  diabetes_tipo_2: {
    primary: {
      label: "Glucosa",
      placeholder: "120",
      unit: "mg/dL",
      min: 20,
      max: 600,
      step: 1,
    },
    readingType: "glucose",
    contexts: [
      { value: "ayunas", label: "En ayunas" },
      { value: "postprandial", label: "Postprandial (2h)" },
      { value: "random", label: "Al azar" },
      { value: "pre_comida", label: "Antes de comer" },
    ],
  },
  hipertension: {
    primary: {
      label: "Sistolica",
      placeholder: "120",
      unit: "mmHg",
      min: 60,
      max: 250,
      step: 1,
    },
    secondary: {
      label: "Diastolica",
      placeholder: "80",
      unit: "mmHg",
      min: 40,
      max: 180,
      step: 1,
    },
    readingType: "blood_pressure",
    contexts: [
      { value: "reposo", label: "En reposo" },
      { value: "post_ejercicio", label: "Post ejercicio" },
      { value: "manana", label: "Por la manana" },
      { value: "noche", label: "Por la noche" },
    ],
  },
  asma: {
    primary: {
      label: "Flujo espiratorio maximo",
      placeholder: "450",
      unit: "L/min",
      min: 50,
      max: 900,
      step: 5,
    },
    readingType: "peak_flow",
    contexts: [
      { value: "manana", label: "Por la manana" },
      { value: "noche", label: "Por la noche" },
      { value: "pre_medicacion", label: "Antes de medicacion" },
      { value: "post_medicacion", label: "Despues de medicacion" },
    ],
  },
  hipotiroidismo: {
    primary: {
      label: "Peso",
      placeholder: "70",
      unit: "kg",
      min: 20,
      max: 300,
      step: 0.1,
    },
    readingType: "weight",
  },
  hipertiroidismo: {
    primary: {
      label: "Frecuencia cardiaca",
      placeholder: "80",
      unit: "bpm",
      min: 30,
      max: 220,
      step: 1,
    },
    readingType: "heart_rate",
    contexts: [
      { value: "reposo", label: "En reposo" },
      { value: "post_ejercicio", label: "Post ejercicio" },
    ],
  },
  epoc: {
    primary: {
      label: "Flujo espiratorio maximo",
      placeholder: "350",
      unit: "L/min",
      min: 50,
      max: 900,
      step: 5,
    },
    readingType: "peak_flow",
    contexts: [
      { value: "manana", label: "Por la manana" },
      { value: "noche", label: "Por la noche" },
    ],
  },
};

const DEFAULT_CONFIG: FormConfig = {
  primary: {
    label: "Valor",
    placeholder: "0",
    unit: "",
    min: 0,
    max: 9999,
    step: 1,
  },
  readingType: "custom",
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ReadingFormProps {
  conditionId: string;
  conditionType: ConditionType;
  onSubmit: (data: LogReadingData) => Promise<void>;
  submitting?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ReadingForm({
  conditionId,
  conditionType,
  onSubmit,
  submitting = false,
}: ReadingFormProps) {
  const config = FORM_CONFIGS[conditionType] ?? DEFAULT_CONFIG;
  const conditionOption = CONDITION_OPTIONS.find((o) => o.value === conditionType);

  const [primaryValue, setPrimaryValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [context, setContext] = useState("");
  const [notes, setNotes] = useState("");
  const [measuredAt, setMeasuredAt] = useState(() => {
    const now = new Date();
    // Format for datetime-local input
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!primaryValue || submitting) return;

      const data: LogReadingData = {
        condition_id: conditionId,
        reading_type: config.readingType as LogReadingData["reading_type"],
        value: parseFloat(primaryValue),
        unit: config.primary.unit || conditionOption?.defaultUnit || "",
        measured_at: new Date(measuredAt).toISOString(),
      };

      if (config.secondary && secondaryValue) {
        data.value2 = parseFloat(secondaryValue);
      }

      if (context) {
        data.context = context;
      }

      if (notes.trim()) {
        data.notes = notes.trim();
      }

      try {
        await onSubmit(data);
        setSuccess(true);
        setPrimaryValue("");
        setSecondaryValue("");
        setContext("");
        setNotes("");
        setTimeout(() => setSuccess(false), 2000);
      } catch {
        // Error handled by parent via mutation
      }
    },
    [
      primaryValue,
      secondaryValue,
      context,
      notes,
      measuredAt,
      conditionId,
      config,
      conditionOption,
      onSubmit,
      submitting,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Value inputs */}
      <div className={`grid gap-3 ${config.secondary ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Primary value */}
        <div>
          <label
            htmlFor="primary-value"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {config.primary.label}
          </label>
          <div className="relative">
            <input
              id="primary-value"
              type="number"
              inputMode="decimal"
              value={primaryValue}
              onChange={(e) => setPrimaryValue(e.target.value)}
              placeholder={config.primary.placeholder}
              min={config.primary.min}
              max={config.primary.max}
              step={config.primary.step}
              required
              className="w-full h-14 px-4 text-xl font-bold text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {config.primary.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                {config.primary.unit}
              </span>
            )}
          </div>
        </div>

        {/* Secondary value (e.g., diastolic) */}
        {config.secondary && (
          <div>
            <label
              htmlFor="secondary-value"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {config.secondary.label}
            </label>
            <div className="relative">
              <input
                id="secondary-value"
                type="number"
                inputMode="decimal"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder={config.secondary.placeholder}
                min={config.secondary.min}
                max={config.secondary.max}
                step={config.secondary.step}
                required
                className="w-full h-14 px-4 text-xl font-bold text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {config.secondary.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  {config.secondary.unit}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Context selector */}
      {config.contexts && config.contexts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contexto
          </label>
          <div className="flex flex-wrap gap-2">
            {config.contexts.map((ctx) => (
              <button
                key={ctx.value}
                type="button"
                onClick={() =>
                  setContext((prev) => (prev === ctx.value ? "" : ctx.value))
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                  context === ctx.value
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ctx.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date/time */}
      <div>
        <label
          htmlFor="measured-at"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fecha y hora de la lectura
        </label>
        <input
          id="measured-at"
          type="datetime-local"
          value={measuredAt}
          onChange={(e) => setMeasuredAt(e.target.value)}
          className="w-full h-12 px-4 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="reading-notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notas <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="reading-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: despues de caminar, sentia mareo..."
          rows={2}
          className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!primaryValue || submitting}
        className={`w-full h-14 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          success
            ? "bg-green-500 text-white"
            : !primaryValue || submitting
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm"
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Guardando...
          </>
        ) : success ? (
          <>
            <Check className="h-5 w-5" />
            Registrado
          </>
        ) : (
          "Registrar lectura"
        )}
      </button>
    </form>
  );
}
