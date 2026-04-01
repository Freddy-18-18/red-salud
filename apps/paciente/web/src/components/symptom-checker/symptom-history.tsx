"use client";

import {
  Clock,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import type {
  SymptomCheckSession,
  TriageLevel,
} from "@/lib/services/symptom-checker-service";

// --- Types ---

interface SymptomHistoryProps {
  sessions: SymptomCheckSession[];
  loading: boolean;
  onSelect?: (session: SymptomCheckSession) => void;
}

interface TriageBadgeConfig {
  label: string;
  icon: typeof AlertCircle;
  bg: string;
  text: string;
  dot: string;
}

// --- Constants ---

const TRIAGE_BADGES: Record<TriageLevel, TriageBadgeConfig> = {
  emergency: {
    label: "Emergencia",
    icon: AlertCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  urgent: {
    label: "Urgente",
    icon: AlertTriangle,
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  standard: {
    label: "Consulta",
    icon: CalendarClock,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  "self-care": {
    label: "Autocuidado",
    icon: ShieldCheck,
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
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

// --- Helpers ---

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Component ---

export function SymptomHistory({ sessions, loading, onSelect }: SymptomHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-gray-100 rounded-xl space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-3 w-24 skeleton rounded" />
              </div>
            </div>
            <div className="h-3 w-full skeleton rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <Clock className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Sin historial de sintomas
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Sus chequeos de sintomas apareceran aqui una vez realice su primera consulta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const symptoms = session.symptoms;
        const triage = session.triage_result;
        const triageConfig = triage ? TRIAGE_BADGES[triage.level] : null;

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelect?.(session)}
            className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all active:scale-[0.99] group"
          >
            <div className="flex items-start gap-3">
              {/* Triage indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {triageConfig ? (
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${triageConfig.bg}`}
                  >
                    <triageConfig.icon
                      className={`h-5 w-5 ${triageConfig.text}`}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {BODY_AREA_LABELS[symptoms.body_area] || symptoms.body_area}
                  </span>
                  {triageConfig && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${triageConfig.bg} ${triageConfig.text}`}
                    >
                      {triageConfig.label}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">
                  {symptoms.description}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span>Severidad: {symptoms.severity}/10</span>
                  <span>|</span>
                  <span>
                    {formatDate(session.created_at)} a las{" "}
                    {formatTime(session.created_at)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
