"use client";

import type { LucideIcon } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import {
  useHealthDashboardSummary,
  usePatientHealthMetrics,
  usePatientHealthGoals,
  useHealthMetricTypes,
} from "@/hooks/use-health-metrics";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Calendar,
  Heart,
  Droplet,
  Weight,
  Thermometer,
} from "lucide-react";
import Link from "next/link";

export default function MetricasSaludPage() {
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

  const { summary, loading: summaryLoading } = useHealthDashboardSummary(userId || undefined);
  const { metrics, loading: metricsLoading } = usePatientHealthMetrics(userId || undefined, { limit: 10 });
  const { goals } = usePatientHealthGoals(userId || undefined, 'activa');
  const { metricTypes } = useHealthMetricTypes();

  if (loading || summaryLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  const getIconForMetric = (nombre: string) => {
    const iconMap: Record<string, LucideIcon> = {
      'Presión Arterial': Activity,
      'Frecuencia Cardíaca': Heart,
      'Temperatura Corporal': Thermometer,
      'Peso': Weight,
      'Glucosa': Droplet,
    };
    return iconMap[nombre] || Activity;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Métricas de Salud</h1>
          <p className="text-muted-foreground mt-1">
            Monitorea tus indicadores vitales y progreso
          </p>
        </div>
        <Link href="/dashboard/paciente/metricas/registrar">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Métrica
          </Button>
        </Link>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Registros</p>
                  <p className="text-2xl font-bold">{summary.total_metricas_registradas}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoy</p>
                  <p className="text-2xl font-bold">{summary.metricas_hoy}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Metas Activas</p>
                  <p className="text-2xl font-bold">{summary.metas_activas}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">{summary.metas_completadas}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="recientes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recientes">Registros Recientes</TabsTrigger>
          <TabsTrigger value="metas">Metas ({goals.length})</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Métricas</TabsTrigger>
        </TabsList>

        {/* Registros Recientes */}
        <TabsContent value="recientes" className="space-y-4">
          {metrics.length > 0 ? (
            metrics.map((metric) => {
              const Icon = getIconForMetric(metric.metric_type?.nombre || '');
              const valorDisplay = metric.metric_type?.requiere_multiple_valores && metric.valor_secundario
                ? `${metric.valor}/${metric.valor_secundario}`
                : metric.valor;

              return (
                <Card key={metric.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{metric.metric_type?.nombre}</h3>
                          <p className="text-2xl font-bold text-primary">
                            {valorDisplay} {metric.metric_type?.unidad_medida}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(metric.fecha_medicion).toLocaleString("es-ES", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {metric.notas && (
                          <p className="text-sm text-muted-foreground mb-2">{metric.notas}</p>
                        )}
                        <Link href={`/dashboard/paciente/metricas/${metric.metric_type_id}`}>
                          <Button variant="outline" size="sm">
                            Ver Historial
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No hay registros aún</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza a registrar tus métricas de salud
                </p>
                <Link href="/dashboard/paciente/metricas/registrar">
                  <Button>Registrar Primera Métrica</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metas */}
        <TabsContent value="metas" className="space-y-4">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{goal.titulo}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {goal.metric_type?.nombre}
                        </p>
                        {goal.descripcion && (
                          <p className="text-sm text-muted-foreground mb-3">{goal.descripcion}</p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progreso</span>
                            <span className="font-medium">{goal.progreso_actual}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${goal.progreso_actual}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Objetivo: {goal.valor_objetivo} {goal.metric_type?.unidad_medida}</span>
                            {goal.fecha_objetivo && (
                              <span>
                                Hasta: {new Date(goal.fecha_objetivo).toLocaleDateString("es-ES")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/paciente/metricas/metas/${goal.id}`}>
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
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No tienes metas activas</h3>
                <p className="text-muted-foreground mb-4">
                  Establece metas para mejorar tu salud
                </p>
                <Link href="/dashboard/paciente/metricas/metas/nueva">
                  <Button>Crear Meta</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tipos de Métricas */}
        <TabsContent value="tipos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricTypes.map((type) => {
              const Icon = getIconForMetric(type.nombre);
              return (
                <Card key={type.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{type.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                          Unidad: {type.unidad_medida}
                        </p>
                      </div>
                    </div>
                    {type.descripcion && (
                      <p className="text-sm text-muted-foreground mb-3">{type.descripcion}</p>
                    )}
                    {type.rango_normal_min && type.rango_normal_max && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Rango Normal:</p>
                        <p className="font-medium">
                          {type.rango_normal_min} - {type.rango_normal_max} {type.unidad_medida}
                        </p>
                      </div>
                    )}
                    <Link href={`/dashboard/paciente/metricas/${type.id}`} className="mt-3 block">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Historial
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
