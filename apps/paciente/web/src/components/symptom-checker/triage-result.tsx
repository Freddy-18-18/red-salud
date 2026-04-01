"use client";

import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Info,
} from "lucide-react";

import type {
  TriageLevel,
  TriageResult as TriageResultType,
  SymptomEntry,
} from "@/lib/services/symptom-checker-service";

// --- Types ---

interface TriageResultProps {
  result: TriageResultType;
  symptoms: SymptomEntry;
  onNewCheck: () => void;
  onBookAppointment?: () => void;
}

interface TriageLevelConfig {
  label: string;
  description: string;
  icon: typeof AlertCircle;
  colors: {
    bg: string;
    border: string;
    icon: string;
    iconBg: string;
    text: string;
    badge: string;
    badgeText: string;
  };
}

// --- Constants ---

const TRIAGE_CONFIG: Record<TriageLevel, TriageLevelConfig> = {
  emergency: {
    label: "Emergencia",
    description: "Requiere atencion medica inmediata",
    icon: AlertCircle,
    colors: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      iconBg: "bg-red-100",
      text: "text-red-800",
      badge: "bg-red-600",
      badgeText: "text-white",
    },
  },
  urgent: {
    label: "Urgente",
    description: "Consulte con un medico pronto",
    icon: AlertTriangle,
    colors: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      iconBg: "bg-orange-100",
      text: "text-orange-800",
      badge: "bg-orange-500",
      badgeText: "text-white",
    },
  },
  standard: {
    label: "Consulta Programada",
    description: "Agende una cita con un especialista",
    icon: CalendarClock,
    colors: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      iconBg: "bg-yellow-100",
      text: "text-yellow-800",
      badge: "bg-yellow-500",
      badgeText: "text-white",
    },
  },
  "self-care": {
    label: "Autocuidado",
    description: "Monitoree sus sintomas en casa",
    icon: ShieldCheck,
    colors: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      iconBg: "bg-green-100",
      text: "text-green-800",
      badge: "bg-green-500",
      badgeText: "text-white",
    },
  },
};

const BODY_AREA_LABELS: Record<string, string> = {
  cabeza: "Cabeza",
  cuello: "Cuello",
  pecho: "Pecho",
  abdomen: "Abdomen",
  espalda: "Espalda",
  brazos: "Brazos",
  piernas: "Piernas",
  piel: "Piel",
  general: "General",
};

const DURATION_LABELS: Record<string, string> = {
  hours: "hora(s)",
  days: "dia(s)",
  weeks: "semana(s)",
};

// --- Component ---

export function TriageResult({
  result,
  symptoms,
  onNewCheck,
  onBookAppointment,
}: TriageResultProps) {
  const config = TRIAGE_CONFIG[result.level];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Triage Level Card */}
      <div
        className={`p-5 rounded-2xl border-2 ${config.colors.bg} ${config.colors.border}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${config.colors.iconBg}`}
          >
            <Icon className={`h-7 w-7 ${config.colors.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${config.colors.badge} ${config.colors.badgeText}`}
              >
                {config.label}
              </span>
            </div>
            <p className={`text-sm font-medium ${config.colors.text}`}>
              {config.description}
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="mt-4 p-3 bg-white/60 rounded-xl">
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.recommended_action}
          </p>
        </div>
      </div>

      {/* Symptom Summary */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Resumen de sintomas</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Area</p>
            <p className="text-sm font-medium text-gray-800">
              {BODY_AREA_LABELS[symptoms.body_area] || symptoms.body_area}
            </p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Severidad</p>
            <p className="text-sm font-medium text-gray-800">{symptoms.severity}/10</p>
          </div>
          <div className="col-span-2 p-2.5 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Duracion</p>
            <p className="text-sm font-medium text-gray-800">
              {symptoms.duration_value}{" "}
              {DURATION_LABELS[symptoms.duration_unit] || symptoms.duration_unit}
            </p>
          </div>
        </div>
        <div className="p-2.5 bg-gray-50 rounded-lg">
          <p className="text-[10px] text-gray-400 uppercase font-medium">Descripcion</p>
          <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
            {symptoms.description}
          </p>
        </div>
      </div>

      {/* Related Specialties */}
      {result.related_specialties.length > 0 && (
        <div className="p-4 bg-white border border-gray-100 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-emerald-500" />
            Especialidades recomendadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.related_specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onNewCheck}
          className="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Nuevo chequeo
        </button>
        {(result.level === "urgent" || result.level === "standard") &&
          onBookAppointment && (
            <button
              type="button"
              onClick={onBookAppointment}
              className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
            >
              Agendar cita
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        {result.level === "emergency" && (
          <a
            href="/dashboard/emergencia"
            className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
          >
            Emergencia
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Aviso importante:</span> Esta herramienta es
          solo orientativa y NO reemplaza una consulta medica profesional. Si tiene una
          emergencia, llame al servicio de emergencias o dirijase al hospital mas cercano.
        </p>
      </div>
    </div>
  );
}
