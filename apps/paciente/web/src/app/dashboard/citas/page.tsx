"use client";

import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { usePatientAppointments, useCancelAppointment } from "@/hooks/use-appointments";
import { supabase } from "@/lib/supabase/client";

type TabValue = "upcoming" | "past" | "cancelled";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700" },
  confirmed: { label: "Confirmada", bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { label: "Completada", bg: "bg-blue-50", text: "text-blue-700" },
  cancelled: { label: "Cancelada", bg: "bg-red-50", text: "text-red-700" },
};

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

export default function MisCitasPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { appointments, loading, refreshAppointments } = usePatientAppointments(userId);
  const { cancel, loading: cancelling } = useCancelAppointment();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(`${a.appointment_date}T${a.appointment_time}`) >= now
  );
  const pastAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(`${a.appointment_date}T${a.appointment_time}`) < now
  );
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled");

  const displayedAppointments =
    activeTab === "upcoming" ? upcomingAppointments :
    activeTab === "past" ? pastAppointments :
    cancelledAppointments;

  const handleCancel = async (appointmentId: string) => {
    if (!userId) return;
    const confirmed = window.confirm("Estas seguro de que deseas cancelar esta cita?");
    if (!confirmed) return;

    setCancellingId(appointmentId);
    const result = await cancel(appointmentId, userId, "Cancelada por paciente");
    if (result.success) {
      refreshAppointments();
    }
    setCancellingId(null);
  };

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Proximas", value: "upcoming", count: upcomingAppointments.length },
    { label: "Pasadas", value: "past", count: pastAppointments.length },
    { label: "Canceladas", value: "cancelled", count: cancelledAppointments.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus consultas medicas</p>
        </div>
        <a
          href="/dashboard/agendar"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Cita</span>
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-200 text-gray-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <SkeletonList count={3} />
      ) : displayedAppointments.length > 0 ? (
        <div className="space-y-3">
          {displayedAppointments.map((appointment) => {
            const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;
            const initials = (appointment.doctor?.full_name || "D")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={appointment.id}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    {appointment.doctor?.avatar_url ? (
                      <img
                        src={appointment.doctor.avatar_url}
                        alt={appointment.doctor.full_name}
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-emerald-600">{initials}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">
                        Dr. {appointment.doctor?.full_name || "Medico"}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="capitalize">{formatDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{appointment.appointment_time?.slice(0, 5)} ({appointment.duration} min)</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                        Motivo: {appointment.reason}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={cancelling && cancellingId === appointment.id}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {cancelling && cancellingId === appointment.id ? "Cancelando..." : "Cancelar"}
                        </button>
                      )}
                      {activeTab === "past" && appointment.status === "completed" && (
                        <a
                          href={`/dashboard/agendar`}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                        >
                          Agendar de nuevo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={activeTab === "upcoming" ? Calendar : activeTab === "past" ? Clock : AlertCircle}
          title={
            activeTab === "upcoming" ? "No tienes citas proximas" :
            activeTab === "past" ? "No tienes citas pasadas" :
            "No tienes citas canceladas"
          }
          description={
            activeTab === "upcoming"
              ? "Busca un medico y agenda tu primera cita"
              : undefined
          }
          action={
            activeTab === "upcoming"
              ? { label: "Buscar Medico", href: "/dashboard/agendar" }
              : undefined
          }
        />
      )}
    </div>
  );
}
