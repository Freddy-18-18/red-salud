"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, Phone, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VerificationGuard } from "@/components/dashboard/medico/verification-guard";

interface Appointment {
  id: string;
  fecha_hora: string;
  motivo: string;
  status: string;
  paciente: {
    nombre_completo: string;
    avatar_url: string | null;
  };
}

export default function DoctorCitasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      setUserId(user.id);
      await loadAppointments(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        paciente:profiles!appointments_paciente_id_fkey(
          nombre_completo,
          avatar_url
        )
      `)
      .eq("medico_id", doctorId)
      .order("fecha_hora", { ascending: true });

    if (!error && data) {
      setAppointments(data as any);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      confirmada: { label: "Confirmada", className: "bg-blue-100 text-blue-800" },
      completada: { label: "Completada", className: "bg-green-100 text-green-800" },
      cancelada: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    };
    const variant = variants[status] || variants.pendiente;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Citas</h1>
          <p className="text-gray-600 mt-1">
            {appointments.length} cita{appointments.length !== 1 ? "s" : ""} programada{appointments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/medico/citas/nueva")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((apt) => {
            const fechaHora = new Date(apt.fecha_hora);
            return (
              <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {apt.paciente?.nombre_completo || "Paciente"}
                          </h3>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{apt.motivo}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(fechaHora, "EEEE, d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(fechaHora, "HH:mm")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                      {apt.status === "confirmada" && (
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes citas programadas
              </h3>
              <p className="text-gray-600 mb-4">
                Las citas que agendes o que tus pacientes agenden aparecerán aquí
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </VerificationGuard>
  );
}
