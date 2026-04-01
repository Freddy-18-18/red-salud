"use client";

import { AlertCircle, AlertTriangle, Activity } from "lucide-react";
import { useState } from "react";

import type { EmergencyPriority } from "@/lib/services/emergency-service";

interface StepPriorityProps {
  onSelect: (priority: EmergencyPriority, symptoms: string) => void;
  onBack: () => void;
}

interface PriorityOption {
  value: EmergencyPriority;
  label: string;
  description: string;
  icon: typeof AlertCircle;
  quickSymptoms: string[];
  colors: {
    border: string;
    bg: string;
    hoverBg: string;
    activeBg: string;
    icon: string;
    text: string;
    tag: string;
    tagText: string;
  };
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: "red",
    label: "Peligro de vida",
    description: "Requiere atención inmediata",
    icon: AlertCircle,
    quickSymptoms: [
      "Dolor en el pecho",
      "Dificultad para respirar",
      "Pérdida de conciencia",
      "Sangrado severo",
      "Convulsiones",
      "Sospecha de ACV",
    ],
    colors: {
      border: "border-red-300",
      bg: "bg-red-50",
      hoverBg: "hover:bg-red-100",
      activeBg: "bg-red-100 border-red-500",
      icon: "text-red-600 bg-red-100",
      text: "text-red-700",
      tag: "bg-red-100",
      tagText: "text-red-700",
    },
  },
  {
    value: "yellow",
    label: "Urgente",
    description: "Necesita atención pronto",
    icon: AlertTriangle,
    quickSymptoms: [
      "Fractura o hueso roto",
      "Fiebre alta (+39°C)",
      "Dolor severo",
      "Reacción alérgica",
      "Quemadura",
      "Herida profunda",
    ],
    colors: {
      border: "border-amber-300",
      bg: "bg-amber-50",
      hoverBg: "hover:bg-amber-100",
      activeBg: "bg-amber-100 border-amber-500",
      icon: "text-amber-600 bg-amber-100",
      text: "text-amber-700",
      tag: "bg-amber-100",
      tagText: "text-amber-700",
    },
  },
  {
    value: "green",
    label: "No urgente",
    description: "Puede esperar pero necesita atención",
    icon: Activity,
    quickSymptoms: [
      "Lesión menor",
      "Síntomas leves",
      "Malestar general",
      "Dolor leve",
      "Mareo",
      "Corte pequeño",
    ],
    colors: {
      border: "border-green-300",
      bg: "bg-green-50",
      hoverBg: "hover:bg-green-100",
      activeBg: "bg-green-100 border-green-500",
      icon: "text-green-600 bg-green-100",
      text: "text-green-700",
      tag: "bg-green-100",
      tagText: "text-green-700",
    },
  },
];

export function StepPriority({ onSelect, onBack }: StepPriorityProps) {
  const [selected, setSelected] = useState<EmergencyPriority | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState("");

  const activeOption = PRIORITY_OPTIONS.find((o) => o.value === selected);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) {
        next.delete(symptom);
      } else {
        next.add(symptom);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (!selected) return;
    const parts = [...selectedSymptoms];
    if (freeText.trim()) parts.push(freeText.trim());
    onSelect(selected, parts.join(". ") || activeOption!.label);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">¿Qué tan urgente es?</h2>
        <p className="text-sm text-gray-500 mt-1">Seleccioná el nivel de urgencia y los síntomas</p>
      </div>

      {/* Priority selection */}
      <div className="space-y-3">
        {PRIORITY_OPTIONS.map((option) => {
          const isActive = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSelected(option.value);
                setSelectedSymptoms(new Set());
                setFreeText("");
              }}
              className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all active:scale-[0.98] ${
                isActive
                  ? option.colors.activeBg
                  : `bg-white ${option.colors.border} ${option.colors.hoverBg}`
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${option.colors.icon}`}>
                <option.icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className={`font-semibold ${isActive ? option.colors.text : "text-gray-900"}`}>
                  {option.label}
                </p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Symptom selection — shows when a priority is chosen */}
      {activeOption && (
        <div className={`rounded-xl p-4 ${activeOption.colors.bg} space-y-4 animate-in`}>
          <p className="text-sm font-semibold text-gray-700">Síntomas (seleccioná los que apliquen)</p>

          <div className="flex flex-wrap gap-2">
            {activeOption.quickSymptoms.map((symptom) => {
              const isSelected = selectedSymptoms.has(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all ${
                    isSelected
                      ? `${activeOption.colors.tag} ${activeOption.colors.tagText} ring-2 ring-offset-1 ring-current`
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>

          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Describí otros síntomas o detalles..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
