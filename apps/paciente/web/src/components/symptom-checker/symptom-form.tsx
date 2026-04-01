"use client";

import {
  Brain,
  Heart,
  Bone,
  Hand,
  Footprints,
  Eye,
  Stethoscope,
  CircleDot,
} from "lucide-react";
import { useState } from "react";

import type { SymptomEntry } from "@/lib/services/symptom-checker-service";

// --- Types ---

interface SymptomFormProps {
  onSubmit: (symptoms: SymptomEntry) => void;
  loading: boolean;
}

interface BodyArea {
  id: string;
  label: string;
  icon: typeof Brain;
  color: string;
}

// --- Constants ---

const BODY_AREAS: BodyArea[] = [
  { id: "cabeza", label: "Cabeza", icon: Brain, color: "text-purple-600 bg-purple-50" },
  { id: "cuello", label: "Cuello", icon: CircleDot, color: "text-pink-600 bg-pink-50" },
  { id: "pecho", label: "Pecho", icon: Heart, color: "text-red-600 bg-red-50" },
  { id: "abdomen", label: "Abdomen", icon: Stethoscope, color: "text-amber-600 bg-amber-50" },
  { id: "espalda", label: "Espalda", icon: Bone, color: "text-blue-600 bg-blue-50" },
  { id: "brazos", label: "Brazos", icon: Hand, color: "text-teal-600 bg-teal-50" },
  { id: "piernas", label: "Piernas", icon: Footprints, color: "text-indigo-600 bg-indigo-50" },
  { id: "piel", label: "Piel", icon: Eye, color: "text-orange-600 bg-orange-50" },
  { id: "general", label: "General", icon: Stethoscope, color: "text-gray-600 bg-gray-50" },
];

const DURATION_UNITS = [
  { value: "hours" as const, label: "Horas" },
  { value: "days" as const, label: "Dias" },
  { value: "weeks" as const, label: "Semanas" },
];

// --- Component ---

export function SymptomForm({ onSubmit, loading }: SymptomFormProps) {
  const [description, setDescription] = useState("");
  const [bodyArea, setBodyArea] = useState<string | null>(null);
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState<"hours" | "days" | "weeks">("hours");
  const [severity, setSeverity] = useState(5);

  const isValid = description.trim().length >= 10 && bodyArea !== null;

  const handleSubmit = () => {
    if (!isValid || !bodyArea) return;
    onSubmit({
      description: description.trim(),
      body_area: bodyArea,
      duration_value: durationValue,
      duration_unit: durationUnit,
      severity,
    });
  };

  // Severity color based on value
  const getSeverityColor = (value: number): string => {
    if (value <= 3) return "text-green-600";
    if (value <= 5) return "text-yellow-600";
    if (value <= 7) return "text-orange-600";
    return "text-red-600";
  };

  const getSeverityBg = (value: number): string => {
    if (value <= 3) return "bg-green-500";
    if (value <= 5) return "bg-yellow-500";
    if (value <= 7) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Describa sus sintomas
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describa lo que siente con el mayor detalle posible. Por ejemplo: dolor agudo en el pecho al respirar profundo..."
          rows={4}
          className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-none placeholder:text-gray-400"
        />
        {description.length > 0 && description.length < 10 && (
          <p className="text-xs text-amber-600 mt-1">
            Describa sus sintomas con al menos 10 caracteres
          </p>
        )}
      </div>

      {/* Body Area Grid */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Area del cuerpo afectada
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BODY_AREAS.map((area) => {
            const isSelected = bodyArea === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setBodyArea(area.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-[0.97] ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-emerald-100 text-emerald-600" : area.color
                  }`}
                >
                  <area.icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isSelected ? "text-emerald-700" : "text-gray-600"
                  }`}
                >
                  {area.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Duracion de los sintomas
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={99}
            value={durationValue}
            onChange={(e) =>
              setDurationValue(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))
            }
            className="w-20 px-3 py-2.5 text-sm text-center bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <div className="flex gap-1.5 flex-1">
            {DURATION_UNITS.map((unit) => (
              <button
                key={unit.value}
                type="button"
                onClick={() => setDurationUnit(unit.value)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  durationUnit === unit.value
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {unit.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Severity Scale */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Nivel de dolor / molestia
          </label>
          <span className={`text-2xl font-bold ${getSeverityColor(severity)}`}>
            {severity}/10
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={severity}
          onChange={(e) => setSeverity(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500"
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #eab308 40%, #f97316 70%, #ef4444 100%)`,
          }}
        />

        {/* Severity bar visual */}
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-400">Leve</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[10px] text-gray-400">Moderado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[10px] text-gray-400">Severo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-400">Extremo</span>
          </div>
        </div>

        {/* Severity progress dots */}
        <div className="flex gap-1 mt-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < severity ? getSeverityBg(severity) : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full py-3.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? "Analizando sintomas..." : "Analizar Sintomas"}
      </button>
    </div>
  );
}
