"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { Button } from "@red-salud/ui";
import { Card, CardContent } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { Calendar, Clock, Video, MapPin, Phone, Plus } from "lucide-react";
import Link from "next/link";

interface PatientAppointment {
  id: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  reason?: string;
  doctor?: {
    nombre_completo?: string;
    avatar_url?: string | null;
    specialty?: {
      name?: string;
    };
  };
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    // English keys (legacy API)
    pending: { variant: "secondary", label: "Pendiente" },
    confirmed: { variant: "default", label: "Confirmada" },
    cancelled: { variant: "destructive", label: "Cancelada" },
    completed: { variant: "outline", label: "Completada" },
    no_show: { variant: "destructive", label: "No asistió" },
    // Spanish keys (calendar / realtime)
    pendiente: { variant: "secondary", label: "Pendiente" },
    confirmada: { variant: "default", label: "Confirmada" },
    en_espera: { variant: "default", label: "En Espera" },
    en_consulta: { variant: "default", label: "En Consulta" },
    completada: { variant: "outline", label: "Completada" },
    no_asistio: { variant: "destructive", label: "No asistió" },
    cancelada: { variant: "destructive", label: "Cancelada" },
    rechazada: { variant: "destructive", label: "Rechazada" },
  };
  const config = variants[status];
  return <Badge variant={config?.variant || "secondary"}>{config?.label || status}</Badge>;
};

const getConsultationIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "presencial":
      return <MapPin className="h-4 w-4" />;
    case "telefono":
      return <Phone className="h-4 w-4" />;
    default:
      return <Video className="h-4 w-4" />;
  }
};

const getConsultationLabel = (type: string) => {
  switch (type) {
    case "video":
      return "Videollamada";
    case "presencial":
      return "Presencial";
    case "telefono":
      return "Teléfono";
    default:
      return type;
  }
};

// Helpers to normalize English/Spanish status codes
const isActiveStatus = (s: string) =>
  ["pending", "confirmed", "pendiente", "confirmada", "en_espera"].includes(s);
const isCancelledStatus = (s: string) =>
  ["cancelled", "cancelada", "rechazada"].includes(s);
const isTerminalStatus = (s: string) =>
  ["completed", "completada", "no_show", "no_asistio"].includes(s);

const AppointmentCard = ({ appointment }: { appointment: PatientAppointment }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {appointment.doctor?.avatar_url ? (
              <Image
                src={appointment.doctor.avatar_url}
                alt={appointment.doctor.nombre_completo || "Doctor"}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-primary">
                {appointment.doctor?.nombre_completo?.charAt(0) || "D"}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{appointment.doctor?.nombre_completo || "Doctor"}</h3>
            <p className="text-sm text-muted-foreground">
              {appointment.doctor?.specialty?.name || "Medicina General"}
            </p>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(appointment.appointment_date).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{appointment.appointment_time.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {getConsultationIcon(appointment.consultation_type)}
          <span>{getConsultationLabel(appointment.consultation_type)}</span>
        </div>
      </div>

      {appointment.reason && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Motivo:</span> {appointment.reason}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Ver Detalles
        </Button>
        {isActiveStatus(appointment.status) && (
          <Button variant="destructive" size="sm">
            Cancelar
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function CitasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const { appointments, loading: appointmentsLoading } = usePatientAppointments(userId || undefined);

  // Normalize status to handle both English and Spanish codes

  const upcomingAppointments = useMemo(() => appointments.filter(
    (apt) =>
      isActiveStatus(apt.status) &&
      new Date(`${apt.appointment_date}T${apt.appointment_time}`) > new Date()
  ), [appointments]);

  const pastAppointments = useMemo(() => appointments.filter(
    (apt) =>
      isTerminalStatus(apt.status) ||
      (isActiveStatus(apt.status) &&
        new Date(`${apt.appointment_date}T${apt.appointment_time}`) < new Date())
  ), [appointments]);

  const cancelledAppointments = useMemo(() => appointments.filter((apt) => isCancelledStatus(apt.status)), [appointments]);

  if (loading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando citas...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Citas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus citas médicas</p>
        </div>
        <Link href="/dashboard/paciente/citas/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">Pasadas ({pastAppointments.length})</TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({cancelledAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No tienes citas próximas</h3>
                <p className="text-muted-foreground mb-4">
                  Agenda una cita con uno de nuestros especialistas
                </p>
                <Link href="/dashboard/paciente/citas/nueva">
                  <Button>Agendar Cita</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No tienes citas pasadas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledAppointments.length > 0 ? (
            cancelledAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No tienes citas canceladas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
