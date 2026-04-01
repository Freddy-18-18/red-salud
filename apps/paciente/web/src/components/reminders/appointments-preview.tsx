"use client";

import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

interface AppointmentRecord {
  id: string;
  fecha_hora: string;
  duracion_minutos?: number;
  motivo?: string;
  notas?: string;
  status: string;
  doctor?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

interface AppointmentsPreviewProps {
  appointments: Array<Record<string, unknown>>;
  loading: boolean;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Manana";
  if (diffDays < 7) return `En ${diffDays} dias`;
  if (diffDays < 14) return `En 1 semana`;
  if (diffDays < 30) return `En ${Math.ceil(diffDays / 7)} semanas`;
  return `En ${Math.ceil(diffDays / 30)} mes${Math.ceil(diffDays / 30) > 1 ? "es" : ""}`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function AppointmentsPreview({
  appointments: rawAppointments,
  loading,
}: AppointmentsPreviewProps) {
  const [expanded, setExpanded] = useState(true);

  const appointments = rawAppointments as unknown as AppointmentRecord[];

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              Citas proximas
            </h3>
            <p className="text-xs text-gray-500">
              {appointments.length} programada{appointments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {appointments.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No tienes citas proximas
              </p>
              <a
                href="/dashboard/buscar-medico"
                className="mt-2 inline-block text-sm text-emerald-600 font-medium hover:text-emerald-700"
              >
                Buscar medico
              </a>
            </div>
          ) : (
            <>
              {appointments.map((apt) => {
                const doctor = apt.doctor;
                const doctorName = doctor?.full_name || "Medico";
                const relativeDate = formatRelativeDate(apt.fecha_hora);
                const time = formatTime(apt.fecha_hora);
                const date = formatDate(apt.fecha_hora);

                return (
                  <a
                    key={apt.id}
                    href="/dashboard/citas"
                    className="block p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-emerald-700">
                          {doctorName.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Dr. {doctorName}
                          </p>
                          <span className="text-xs font-medium text-emerald-600 flex-shrink-0 ml-2">
                            {relativeDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {time}
                          </span>
                        </div>

                        {apt.notas && (
                          <p className="text-xs text-gray-400 mt-1 italic truncate">
                            &quot;{apt.notas}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}

              {/* See all link */}
              <a
                href="/dashboard/citas"
                className="flex items-center justify-center gap-1 py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Ver todas las citas
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
