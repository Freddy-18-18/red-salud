"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/design-system";
import {
  usePatientPrescriptions,
  useTodayIntakeLog,
  useAdherenceStats,
  useActiveMedicationsSummary,
  usePatientReminders,
} from "@/hooks/use-medications";
import {
  Pill,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  Plus,
  Bell,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function MedicamentosPage() {
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

  const { prescriptions, loading: prescriptionsLoading } = usePatientPrescriptions(userId || undefined);
  const { intakeLog, recordIntake } = useTodayIntakeLog(userId || undefined);
  const { stats } = useAdherenceStats(userId || undefined, 30);
  const { summary } = useActiveMedicationsSummary(userId || undefined);
  const { reminders } = usePatientReminders(userId || undefined);

  if (loading || prescriptionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  const handleRecordIntake = async (intakeId: string, status: 'tomado' | 'omitido') => {
    await recordIntake(intakeId, status);
  };

  const activePrescriptions = prescriptions.filter(p => p.status === 'activa');
  const pendingIntakes = intakeLog.filter(log => log.status === 'pendiente');
  const completedToday = intakeLog.filter(log => log.status === 'tomado').length;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Medicamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus medicamentos y recordatorios
          </p>
        </div>
        <Link href="/dashboard/paciente/medicamentos/recordatorios/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Recordatorio
          </Button>
        </Link>
      </div>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medicamentos Activos</p>
                <p className="text-2xl font-bold">{summary?.total_medicamentos || 0}</p>
              </div>
              <Pill className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tomados Hoy</p>
                <p className="text-2xl font-bold">{completedToday}/{intakeLog.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adherencia</p>
                <p className="text-2xl font-bold">{stats?.porcentaje_adherencia || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Racha Actual</p>
                <p className="text-2xl font-bold">{stats?.racha_actual || 0} días</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próxima Toma */}
      {summary?.proxima_toma && (
        <Card className="mb-6 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Próxima Toma</h3>
                <p className="text-sm text-muted-foreground">
                  {summary.proxima_toma.medicamento} - {summary.proxima_toma.hora}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">En</p>
                <p className="text-lg font-bold">{summary.proxima_toma.minutos_restantes} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="hoy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hoy">
            Hoy ({pendingIntakes.length} pendientes)
          </TabsTrigger>
          <TabsTrigger value="recordatorios">
            Recordatorios ({reminders.length})
          </TabsTrigger>
          <TabsTrigger value="recipe">
            recipe ({activePrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Tomas de Hoy */}
        <TabsContent value="hoy" className="space-y-4">
          {intakeLog.length > 0 ? (
            intakeLog.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${log.status === 'tomado' ? 'bg-green-100' :
                          log.status === 'omitido' ? 'bg-red-100' :
                            'bg-gray-100'
                        }`}>
                        {log.status === 'tomado' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : log.status === 'omitido' ? (
                          <XCircle className="h-6 w-6 text-red-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{log.reminder?.nombre_medicamento}</h3>
                        <p className="text-sm text-muted-foreground">
                          {log.reminder?.dosis} •{" "}
                          {new Date(log.fecha_programada).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {log.status === 'pendiente' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRecordIntake(log.id, 'tomado')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Tomado
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecordIntake(log.id, 'omitido')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Omitir
                        </Button>
                      </div>
                    )}
                    {log.status === 'tomado' && (
                      <Badge variant="default">
                        Tomado a las{" "}
                        {new Date(log.fecha_tomada!).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    )}
                    {log.status === 'omitido' && (
                      <Badge variant="destructive">Omitido</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No hay tomas programadas para hoy</h3>
                <p className="text-muted-foreground mb-4">
                  Configura recordatorios para tus medicamentos
                </p>
                <Link href="/dashboard/paciente/medicamentos/recordatorios/nuevo">
                  <Button>Crear Recordatorio</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recordatorios */}
        <TabsContent value="recordatorios" className="space-y-4">
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{reminder.nombre_medicamento}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{reminder.dosis}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {reminder.horarios.map((hora, index) => (
                            <Badge key={index} variant="outline">
                              {hora}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(reminder.fecha_inicio).toLocaleDateString("es-ES")}
                          {reminder.fecha_fin && ` hasta ${new Date(reminder.fecha_fin).toLocaleDateString("es-ES")}`}
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/paciente/medicamentos/recordatorios/${reminder.id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No tienes recordatorios activos</h3>
                <p className="text-muted-foreground mb-4">
                  Crea recordatorios para no olvidar tus medicamentos
                </p>
                <Link href="/dashboard/paciente/medicamentos/recordatorios/nuevo">
                  <Button>Crear Recordatorio</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* recipe */}
        <TabsContent value="recipe" className="space-y-4">
          {prescriptions.length > 0 ? (
            prescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            recipe del {new Date(prescription.fecha_prescripcion).toLocaleDateString("es-ES")}
                          </h3>
                          <Badge
                            variant={
                              prescription.status === 'activa' ? 'default' :
                                prescription.status === 'surtida' ? 'outline' :
                                  'destructive'
                            }
                          >
                            {prescription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Dr. {prescription.medico?.nombre_completo}
                        </p>
                        {prescription.diagnostico && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Diagnóstico: {prescription.diagnostico}
                          </p>
                        )}
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Medicamentos:</p>
                          <div className="space-y-1">
                            {prescription.medications?.map((med) => (
                              <p key={med.id} className="text-sm text-muted-foreground">
                                • {med.nombre_medicamento} - {med.dosis} - {med.frecuencia}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/paciente/medicamentos/recipe/${prescription.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No tienes recipe médicas</h3>
                <p className="text-muted-foreground">
                  Tus recipe aparecerán aquí después de tus consultas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="estadisticas" className="space-y-6">
          {stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Adherencia al Tratamiento
                  </CardTitle>
                  <CardDescription>Últimos 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Porcentaje de adherencia</span>
                      <span className="text-2xl font-bold">{stats.porcentaje_adherencia}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary h-4 rounded-full transition-all"
                        style={{ width: `${stats.porcentaje_adherencia}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.tomas_completadas}</p>
                        <p className="text-sm text-muted-foreground">Tomadas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.tomas_omitidas}</p>
                        <p className="text-sm text-muted-foreground">Omitidas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.tomas_retrasadas}</p>
                        <p className="text-sm text-muted-foreground">Retrasadas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rachas
                  </CardTitle>
                  <CardDescription>Días consecutivos tomando medicamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-primary">{stats.racha_actual}</p>
                      <p className="text-sm text-muted-foreground mt-2">Racha Actual</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-orange-500">{stats.mejor_racha}</p>
                      <p className="text-sm text-muted-foreground mt-2">Mejor Racha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
