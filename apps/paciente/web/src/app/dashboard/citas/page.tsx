"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { usePatientAppointments, useCancelAppointment } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type TabValue = "upcoming" | "past" | "cancelled";

export default function MisCitasPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");
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
    const confirmed = window.confirm("¿Estás seguro de que deseas cancelar esta cita?");
    if (!confirmed) return;

    const result = await cancel(appointmentId, userId, "Cancelada por paciente");
    if (result.success) {
      refreshAppointments();
    }
  };

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Próximas", value: "upcoming", count: upcomingAppointments.length },
    { label: "Pasadas", value: "past", count: pastAppointments.length },
    { label: "Canceladas", value: "cancelled", count: cancelledAppointments.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Citas</h1>
        <a
          href="/dashboard/buscar-medico"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Nueva Cita
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <p className="text-gray-500 py-8 text-center">Cargando citas...</p>
      ) : displayedAppointments.length > 0 ? (
        <div className="space-y-4">
          {displayedAppointments.map((appointment) => (
            <div key={appointment.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      Dr. {appointment.doctor?.nombre_completo || "Médico"}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                      appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      appointment.status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {appointment.status === "confirmed" ? "Confirmada" :
                       appointment.status === "pending" ? "Pendiente" :
                       appointment.status === "completed" ? "Completada" :
                       "Cancelada"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {format(new Date(appointment.appointment_date + "T00:00:00"), "PPPP", { locale: es })}
                      {" a las "}
                      {appointment.appointment_time?.slice(0, 5)}
                    </p>
                    <p>Duración: {appointment.duration} minutos</p>
                    {appointment.reason && <p>Motivo: {appointment.reason}</p>}
                  </div>
                </div>

                {activeTab === "upcoming" && appointment.status !== "cancelled" && (
                  <button
                    onClick={() => handleCancel(appointment.id)}
                    disabled={cancelling}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {activeTab === "upcoming" ? "No tienes citas próximas" :
             activeTab === "past" ? "No tienes citas pasadas" :
             "No tienes citas canceladas"}
          </p>
          {activeTab === "upcoming" && (
            <a
              href="/dashboard/buscar-medico"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Buscar Médico
            </a>
          )}
        </div>
      )}
    </div>
  );
}
