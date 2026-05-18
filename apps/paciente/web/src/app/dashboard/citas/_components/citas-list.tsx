"use client";

import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  MapPin,
  RefreshCw,
  Stethoscope,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@red-salud/design-system";
import { CancelAppointmentDialog } from "@/components/citas/cancel-appointment-dialog";
import { WaitlistMatchBanner } from "@/components/citas/waitlist-match-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { usePatientAppointments, useCancelAppointment } from "@/hooks/use-appointments";
import type {
  Appointment,
  AppointmentType,
} from "@/lib/services/appointments/appointments.types";

type TabValue = "upcoming" | "past" | "cancelled";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700" },
  confirmed: { label: "Confirmada", bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { label: "Completada", bg: "bg-blue-50", text: "text-blue-700" },
  cancelled: { label: "Cancelada", bg: "bg-red-50", text: "text-red-700" },
};

const APPOINTMENT_TYPE_CONFIG: Record<
  AppointmentType,
  { label: string; icon: LucideIcon; bg: string; text: string }
> = {
  in_person: {
    label: "Presencial",
    icon: MapPin,
    bg: "bg-gray-100",
    text: "text-gray-700",
  },
  telemedicine: {
    label: "Video consulta",
    icon: Video,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  emergency: {
    label: "Emergencia",
    icon: AlertCircle,
    bg: "bg-red-50",
    text: "text-red-700",
  },
  follow_up: {
    label: "Control",
    icon: RefreshCw,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  first_visit: {
    label: "Primera visita",
    icon: Stethoscope,
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
};

const PRESENCE_TYPES: ReadonlySet<AppointmentType> = new Set([
  "in_person",
  "follow_up",
  "first_visit",
  "emergency",
]);

function formatDate(isoTimestamp: string): string {
  try {
    return new Date(isoTimestamp).toLocaleDateString("es-VE", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoTimestamp;
  }
}

function formatTime(isoTimestamp: string): string {
  try {
    return new Date(isoTimestamp).toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

interface CitasListProps {
  userId: string;
}

export function CitasList({ userId }: CitasListProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [retrying, setRetrying] = useState(false);
  const { appointments, loading, error, refreshAppointments } = usePatientAppointments(userId);
  const { cancel, loading: cancelling } = useCancelAppointment();

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refreshAppointments();
    } finally {
      setRetrying(false);
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(a.scheduled_at) >= now
  );
  const pastAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(a.scheduled_at) < now
  );
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled");

  const displayedAppointments =
    activeTab === "upcoming" ? upcomingAppointments :
    activeTab === "past" ? pastAppointments :
    cancelledAppointments;

  const handleConfirmCancel = async (reason: string | undefined) => {
    if (!appointmentToCancel) {
      return { success: false, error: "Sesión inválida" };
    }
    const result = await cancel(appointmentToCancel.id, userId, reason);
    if (result.success) {
      setAppointmentToCancel(null);
      refreshAppointments();
    }
    return result;
  };

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Proximas", value: "upcoming", count: upcomingAppointments.length },
    { label: "Pasadas", value: "past", count: pastAppointments.length },
    { label: "Canceladas", value: "cancelled", count: cancelledAppointments.length },
  ];

  return (
    <div className="space-y-6">
      {/* Banner: waitlist match (only renders if there are unread matches) */}
      <WaitlistMatchBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus consultas medicas</p>
        </div>
        <a
          href="/dashboard/agendar"
          aria-label="Nueva cita"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Cita</span>
        </a>
      </div>

      {/* Tabs — Radix primitive: gives us role="tablist", role="tab", aria-selected,
          arrow-key navigation, and proper focus management out of the box. */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className="w-full"
      >
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* One TabsContent per tab so screen readers correctly announce the tabpanel
            switch; the underlying list is filtered by activeTab and rendered below. */}
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0" />
        ))}
      </Tabs>

      {/* Appointments List */}
      {error && !loading ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50/50 border border-red-100 rounded-2xl">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle aria-hidden="true" className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No pudimos cargar tus citas
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mb-4">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${retrying ? "animate-spin motion-reduce:animate-none" : ""}`} />
            {retrying ? "Reintentando..." : "Reintentar"}
          </button>
        </div>
      ) : loading ? (
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

            const showCancel =
              activeTab === "upcoming" && appointment.status !== "cancelled";
            const showRebook =
              activeTab === "past" && appointment.status === "completed";

            return (
              <div
                key={appointment.id}
                className="bg-white border border-gray-100 rounded-xl hover:shadow-sm hover:border-gray-200 transition overflow-hidden"
              >
                <Link
                  href={`/dashboard/citas/${appointment.id}`}
                  className="block p-4 group"
                  aria-label={`Ver detalle de cita con Dr. ${appointment.doctor?.full_name ?? "Medico"}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      aria-hidden="true"
                      className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0"
                    >
                      {appointment.doctor?.avatar_url ? (
                        <img
                          src={appointment.doctor.avatar_url}
                          alt=""
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-emerald-600">{initials}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition">
                          Dr. {appointment.doctor?.full_name || "Medico"}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                          <ChevronRight aria-hidden="true" className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
                          <span className="capitalize">{formatDate(appointment.scheduled_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                          <span>{formatTime(appointment.scheduled_at)} ({appointment.duration_minutes} min)</span>
                        </div>
                      </div>

                      {/* Type + location */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {(() => {
                          const typeConfig =
                            APPOINTMENT_TYPE_CONFIG[appointment.appointment_type] ??
                            APPOINTMENT_TYPE_CONFIG.in_person;
                          const TypeIcon = typeConfig.icon;
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}
                            >
                              <TypeIcon aria-hidden="true" className="h-3 w-3" />
                              {typeConfig.label}
                            </span>
                          );
                        })()}

                        {PRESENCE_TYPES.has(appointment.appointment_type) &&
                          (appointment.doctor?.city || appointment.doctor?.state) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-600 bg-gray-50 border border-gray-200">
                              <MapPin aria-hidden="true" className="h-3 w-3" />
                              {[appointment.doctor.city, appointment.doctor.state]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                      </div>

                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                          Motivo: {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {(showCancel || showRebook) && (
                  <div className="flex items-center gap-2 px-4 pb-4 pl-20">
                    {showCancel && (
                      <button
                        type="button"
                        onClick={() => setAppointmentToCancel(appointment)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                      >
                        Cancelar
                      </button>
                    )}
                    {showRebook && (
                      <Link
                        href="/dashboard/agendar"
                        className="px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                      >
                        Agendar de nuevo
                      </Link>
                    )}
                  </div>
                )}
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

      {appointmentToCancel && (
        <CancelAppointmentDialog
          appointment={appointmentToCancel}
          onConfirm={handleConfirmCancel}
          onClose={() => setAppointmentToCancel(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
}
