"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { usePatientSessions, useSessionStats } from "@/hooks/use-telemedicine";
import { Button } from "@red-salud/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import {
  Video,
  Calendar,
  Clock,
  User,
  FileText,
  TrendingUp,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { TelemedicineSession } from "@/lib/supabase/types/telemedicine";

export default function TelemedicinePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const { sessions, loading, refreshSessions } = usePatientSessions(userId);
  const { stats } = useSessionStats(userId);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: LucideIcon }> = {
      scheduled: { variant: "outline", icon: Calendar },
      waiting: { variant: "secondary", icon: Clock },
      active: { variant: "default", icon: Play },
      completed: { variant: "secondary", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
      failed: { variant: "destructive", icon: AlertCircle },
    };

    const config = variants[status] || variants.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status === "scheduled" && "Programada"}
        {status === "waiting" && "En espera"}
        {status === "active" && "En curso"}
        {status === "completed" && "Completada"}
        {status === "cancelled" && "Cancelada"}
        {status === "failed" && "Fallida"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" || s.status === "waiting"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled" || s.status === "failed"
  );

  const handleJoinSession = (session: TelemedicineSession) => {
    router.push(`/dashboard/paciente/telemedicina/sesion/${session.id}`);
  };

  const handleNewSession = () => {
    router.push("/dashboard/paciente/citas/nueva?type=video");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Telemedicina</h1>
          <p className="text-gray-600 mt-1">
            Consultas médicas por videollamada
          </p>
        </div>
        <Button onClick={handleNewSession} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Consulta
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed_sessions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Duración Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.average_duration)} min
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tiempo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.total_duration / 60)} hrs
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Historial ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Próximas Sesiones */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes consultas programadas
                </h3>
                <p className="text-gray-600 mb-4 text-center max-w-md">
                  Agenda una nueva consulta por videollamada con uno de nuestros
                  especialistas
                </p>
                <Button onClick={handleNewSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            {session.doctor?.avatar_url ? (
                              <Image
                                src={session.doctor.avatar_url}
                                alt={session.doctor.nombre_completo}
                                className="rounded-full object-cover"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <User className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Dr. {session.doctor?.nombre_completo}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {session.doctor?.specialty || "Medicina General"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.scheduled_start_time)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {formatTime(session.scheduled_start_time)}
                          </div>
                        </div>

                        {session.appointment?.reason && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                            <FileText className="h-4 w-4 mt-0.5" />
                            <span>{session.appointment.reason}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {getStatusBadge(session.status)}
                          {session.recording_enabled && (
                            <Badge variant="outline">
                              <Video className="h-3 w-3 mr-1" />
                              Grabación habilitada
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {session.status === "waiting" || session.status === "active" ? (
                          <Button
                            onClick={() => handleJoinSession(session)}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Video className="h-5 w-5 mr-2" />
                            Unirse
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinSession(session)}
                            variant="outline"
                            size="lg"
                          >
                            Ver Detalles
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Historial */}
        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay consultas anteriores
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Aquí aparecerán tus consultas completadas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            {session.doctor?.avatar_url ? (
                              <Image
                                src={session.doctor.avatar_url}
                                alt={session.doctor.nombre_completo}
                                className="rounded-full object-cover"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <User className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Dr. {session.doctor?.nombre_completo}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {session.doctor?.specialty || "Medicina General"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.scheduled_start_time)}
                          </div>
                          {session.duration_minutes && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {session.duration_minutes} minutos
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(session.status)}
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/dashboard/paciente/telemedicina/sesion/${session.id}`)}
                        variant="outline"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
