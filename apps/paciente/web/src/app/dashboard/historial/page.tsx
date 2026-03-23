"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Stethoscope,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";

type FilterType = "all" | "consultas" | "recetas" | "laboratorios";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function HistorialMedicoPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { appointments, loading } = usePatientAppointments(userId);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const completedAppointments = appointments
    .filter((a) => a.status === "completed")
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  const uniqueDoctors = new Set(completedAppointments.map((a) => a.doctor_id)).size;

  const lastConsultDate = completedAppointments.length > 0
    ? formatShortDate(completedAppointments[0].appointment_date)
    : "Sin consultas";

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "all" },
    { label: "Consultas", value: "consultas" },
    { label: "Recetas", value: "recetas" },
    { label: "Laboratorios", value: "laboratorios" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial Medico</h1>
        <p className="text-gray-500 mt-1">Tu registro de consultas y tratamientos</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Stethoscope}
            label="Consultas"
            value={completedAppointments.length}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Calendar}
            label="Doctores"
            value={uniqueDoctors}
            color="bg-emerald-50 text-emerald-600"
          />
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-900 font-semibold">{lastConsultDate}</p>
                <p className="text-xs text-gray-500">Ultima consulta</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeFilter === filter.value
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <SkeletonList count={4} />
      ) : completedAppointments.length > 0 ? (
        <div className="space-y-3">
          {completedAppointments.map((appointment) => {
            const isExpanded = expandedId === appointment.id;
            const initials = (appointment.doctor?.nombre_completo || "D")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={appointment.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : appointment.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Timeline dot */}
                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 ring-4 ring-emerald-50" />

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-emerald-600">{initials}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          Dr. {appointment.doctor?.nombre_completo || "Medico"}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatShortDate(appointment.appointment_date)}
                        </span>
                      </div>
                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{appointment.reason}</p>
                      )}
                    </div>

                    {/* Expand icon */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="ml-7 pl-10 space-y-3 pt-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Fecha</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {formatDate(appointment.appointment_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hora</p>
                          <p className="font-medium text-gray-900">
                            {appointment.appointment_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duracion</p>
                          <p className="font-medium text-gray-900">{appointment.duration} minutos</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Estado</p>
                          <p className="font-medium text-emerald-600">Completada</p>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Motivo</p>
                          <p className="text-sm text-gray-700">{appointment.reason}</p>
                        </div>
                      )}

                      {appointment.notes && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Notas del doctor</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      <a
                        href="/dashboard/buscar-medico"
                        className="inline-block px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                      >
                        Agendar de nuevo
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No tienes consultas en tu historial"
          description="Tus consultas completadas apareceran aqui para que puedas revisarlas cuando quieras."
          action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
        />
      )}
    </div>
  );
}
