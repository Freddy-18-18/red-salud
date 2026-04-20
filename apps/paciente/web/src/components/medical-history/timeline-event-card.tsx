"use client";

import {
  Stethoscope,
  TestTube,
  Pill,
  Syringe,
  Ambulance,
  Clipboard,
  Scissors,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { useState } from "react";

import type { TimelineEvent, TimelineEventType } from "@/lib/services/medical-history-service";

interface TimelineEventCardProps {
  event: TimelineEvent;
}

const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: typeof Stethoscope; color: string; bg: string; dot: string; label: string }
> = {
  appointment: {
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500 ring-blue-100",
    label: "Consulta",
  },
  lab_result: {
    icon: TestTube,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500 ring-emerald-100",
    label: "Laboratorio",
  },
  prescription: {
    icon: Pill,
    color: "text-purple-600",
    bg: "bg-purple-50",
    dot: "bg-purple-500 ring-purple-100",
    label: "Receta",
  },
  vaccination: {
    icon: Syringe,
    color: "text-orange-600",
    bg: "bg-orange-50",
    dot: "bg-orange-500 ring-orange-100",
    label: "Vacuna",
  },
  emergency: {
    icon: Ambulance,
    color: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-500 ring-red-100",
    label: "Emergencia",
  },
  diagnosis: {
    icon: Clipboard,
    color: "text-teal-600",
    bg: "bg-teal-50",
    dot: "bg-teal-500 ring-teal-100",
    label: "Diagnostico",
  },
  procedure: {
    icon: Scissors,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    dot: "bg-indigo-500 ring-indigo-100",
    label: "Procedimiento",
  },
};

function formatDateTime(dateStr: string): { date: string; time: string } {
  try {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("es-VE", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("es-VE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: dateStr, time: "" };
  }
}

function formatShortDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;
  const { date: fullDate, time } = formatDateTime(event.date);

  return (
    <div className="relative flex gap-3 sm:gap-4">
      {/* Timeline connector line (shown from parent container) */}
      {/* Dot */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className={`w-3 h-3 rounded-full ring-4 ${config.dot}`} />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full p-3 sm:p-4 text-left hover:bg-gray-50/50 transition"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {/* Type label */}
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide ${config.color} mb-0.5`}>
                      {config.label}
                    </span>
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {event.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${event.status_color}`}>
                      {event.status_label}
                    </span>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.summary}</p>

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-400">{formatShortDate(event.date)}</span>
                  {event.doctor_name && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <User className="h-2.5 w-2.5" />
                      Dr. {event.doctor_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Expanded detail */}
          {expanded && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-50">
              <div className="ml-12 sm:ml-13 space-y-3 pt-3">
                {/* Date and time */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p className="font-medium text-gray-900 capitalize text-xs sm:text-sm">{fullDate}</p>
                  </div>
                  {time && (
                    <div>
                      <p className="text-xs text-gray-500">Hora</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{time}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Doctor */}
                <DoctorName name={event.doctor_name} />

                {/* Summary */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Detalle</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{event.summary}</p>
                </div>

                {/* Type-specific metadata */}
                {event.type === "appointment" && Boolean((event.metadata as Record<string, unknown>)?.duration) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Duracion: {(event.metadata as Record<string, unknown>).duration as number} minutos
                  </div>
                )}

                {event.type === "appointment" && Boolean((event.metadata as Record<string, unknown>)?.notes) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notas del doctor</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {(event.metadata as Record<string, unknown>).notes as string}
                    </p>
                  </div>
                )}

                {event.type === "prescription" && Boolean((event.metadata as Record<string, unknown>)?.medications) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Medicamentos</p>
                    <p className="text-sm text-gray-700">{(event.metadata as Record<string, unknown>).medications as string}</p>
                  </div>
                )}

                {event.type === "prescription" && Boolean((event.metadata as Record<string, unknown>)?.expires_at) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Expira: {formatShortDate((event.metadata as Record<string, unknown>).expires_at as string)}
                  </div>
                )}

                {event.type === "emergency" && Boolean((event.metadata as Record<string, unknown>)?.location_address) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {(event.metadata as Record<string, unknown>).location_address as string}
                  </div>
                )}

                {event.type === "vaccination" && Boolean((event.metadata as Record<string, unknown>)?.dose_number) && (
                  <div className="text-xs text-gray-500">
                    Dosis numero {(event.metadata as Record<string, unknown>).dose_number as number}
                  </div>
                )}

                {event.type === "lab_result" && Boolean((event.metadata as Record<string, unknown>)?.order_number) && (
                  <div className="text-xs text-gray-500">
                    Orden: {(event.metadata as Record<string, unknown>).order_number as string}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorName({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <div>
      <p className="text-xs text-gray-500">Doctor</p>
      <p className="text-sm font-medium text-gray-900">Dr. {name}</p>
    </div>
  );
}
