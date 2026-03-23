"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HistorialMedicoPage() {
  const [userId, setUserId] = useState<string | undefined>();
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historial Médico</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700">Total Consultas</h3>
          <p className="text-2xl font-bold text-blue-900 mt-1">{completedAppointments.length}</p>
        </div>
        <div className="p-4 border rounded-lg bg-green-50">
          <h3 className="text-sm font-medium text-green-700">Doctores Visitados</h3>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {new Set(completedAppointments.map(a => a.doctor_id)).size}
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-purple-50">
          <h3 className="text-sm font-medium text-purple-700">Última Consulta</h3>
          <p className="text-sm font-bold text-purple-900 mt-1">
            {completedAppointments.length > 0
              ? format(new Date(completedAppointments[0].appointment_date + "T00:00:00"), "PPP", { locale: es })
              : "Sin consultas"}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Consultas Completadas</h2>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Cargando historial...</p>
      ) : completedAppointments.length > 0 ? (
        <div className="space-y-3">
          {completedAppointments.map((appointment) => (
            <div key={appointment.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  Dr. {appointment.doctor?.nombre_completo || "Médico"}
                </h3>
                <span className="text-sm text-gray-500">
                  {format(new Date(appointment.appointment_date + "T00:00:00"), "PPP", { locale: es })}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {appointment.reason && <p>Motivo: {appointment.reason}</p>}
                {appointment.notes && <p>Notas: {appointment.notes}</p>}
                <p className="text-xs text-gray-400">Duración: {appointment.duration} min</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No tienes consultas en tu historial aún.</p>
          <p className="text-sm text-gray-400 mt-1">Tus consultas completadas aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
}
