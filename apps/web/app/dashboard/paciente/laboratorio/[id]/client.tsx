"use client";

import { use, useState, useEffect } from "react";
import { useLabOrder } from "@/hooks/use-laboratory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FlaskConical,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowLeft,
  User,
  Building2,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { LabResultValue } from "@/lib/supabase/types/laboratory";

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  muestra_tomada: {
    label: "Muestra Tomada",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FlaskConical,
  },
  en_proceso: {
    label: "En Proceso",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Loader2,
  },
  completada: {
    label: "Completada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertCircle,
  },
  rechazada: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
};

const alertLevelConfig = {
  normal: { color: "text-green-600", icon: CheckCircle2, label: "Normal" },
  bajo: { color: "text-blue-600", icon: TrendingUp, label: "Bajo" },
  alto: { color: "text-orange-600", icon: AlertTriangle, label: "Alto" },
  critico: { color: "text-red-600", icon: AlertCircle, label: "Crítico" },
};

export default function LabOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { order, results, statusHistory, loading, error } = useLabOrder(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error || "Orden no encontrada"}</p>
        <Link href="/dashboard/paciente/laboratorio">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Laboratorio
          </Button>
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status].icon;
  const hasResults = results.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/paciente/laboratorio">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Orden de Laboratorio</h1>
            <p className="text-muted-foreground font-mono">{order.numero_orden}</p>
          </div>
        </div>
        <Badge variant="outline" className={statusConfig[order.status].color}>
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusConfig[order.status].label}
        </Badge>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Orden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Orden</p>
              <p className="font-medium">
                {format(new Date(order.fecha_orden), "dd 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </p>
            </div>
            {order.fecha_muestra && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Muestra</p>
                <p className="font-medium">
                  {format(new Date(order.fecha_muestra), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            )}
            {order.fecha_entrega_estimada && (
              <div>
                <p className="text-sm text-muted-foreground">Entrega Estimada</p>
                <p className="font-medium">
                  {format(new Date(order.fecha_entrega_estimada), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Prioridad</p>
              <Badge className="mt-1">
                {order.prioridad === "normal" && "Normal"}
                {order.prioridad === "urgente" && "Urgente"}
                {order.prioridad === "stat" && "STAT (Inmediato)"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Médica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.medico && (
              <div>
                <p className="text-sm text-muted-foreground">Médico Solicitante</p>
                <p className="font-medium">{order.medico.nombre_completo}</p>
                {order.medico.especialidad && (
                  <p className="text-sm text-muted-foreground">
                    {order.medico.especialidad}
                  </p>
                )}
              </div>
            )}
            {order.laboratorio && (
              <div>
                <p className="text-sm text-muted-foreground">Laboratorio</p>
                <p className="font-medium">{order.laboratorio.nombre_completo}</p>
              </div>
            )}
            {order.diagnostico_presuntivo && (
              <div>
                <p className="text-sm text-muted-foreground">Diagnóstico Presuntivo</p>
                <p className="font-medium">{order.diagnostico_presuntivo}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones */}
      {order.instrucciones_paciente && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Info className="h-5 w-5" />
              Instrucciones para el Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-900">{order.instrucciones_paciente}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Exámenes y Resultados */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="examenes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="examenes">
                Exámenes Solicitados
                {order.tests && (
                  <Badge variant="secondary" className="ml-2">
                    {order.tests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resultados">
                Resultados
                {results.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {results.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="examenes" className="mt-6">
              {order.tests && order.tests.length > 0 ? (
                <div className="space-y-3">
                  {order.tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{test.test_type?.nombre}</p>
                        {test.test_type?.categoria && (
                          <p className="text-sm text-muted-foreground">
                            {test.test_type.categoria}
                          </p>
                        )}
                        {test.test_type?.preparacion_requerida && (
                          <p className="text-sm text-blue-600 mt-1">
                            {test.test_type.preparacion_requerida}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={test.resultado_disponible ? "default" : "secondary"}
                      >
                        {test.resultado_disponible ? "Resultado Disponible" : test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay exámenes registrados
                </p>
              )}
            </TabsContent>

            <TabsContent value="resultados" className="mt-6">
              {hasResults ? (
                <div className="space-y-6">
                  {results.map((result) => (
                    <Card key={result.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{result.test_type?.nombre}</CardTitle>
                            <CardDescription>
                              {format(new Date(result.fecha_resultado), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
                                locale: es,
                              })}
                            </CardDescription>
                          </div>
                          {result.resultado_pdf_url && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar PDF
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.values && result.values.length > 0 ? (
                          <div className="space-y-2">
                            {result.values.map((value) => (
                              <ResultValueRow key={value.id} value={value} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No hay valores individuales registrados
                          </p>
                        )}
                        {result.observaciones_generales && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Observaciones:</p>
                            <p className="text-sm">{result.observaciones_generales}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Los resultados aún no están disponibles
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Te notificaremos cuando estén listos
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="historial" className="mt-6">
              {statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((history) => (
                    <div key={history.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{history.status_nuevo}</Badge>
                          {history.status_anterior && (
                            <>
                              <span className="text-muted-foreground">←</span>
                              <Badge variant="secondary">{history.status_anterior}</Badge>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(history.created_at), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
                            locale: es,
                          })}
                        </p>
                        {history.comentario && (
                          <p className="text-sm mt-2">{history.comentario}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay historial de cambios
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultValueRow({ value }: { value: LabResultValue }) {
  const AlertIcon = value.nivel_alerta
    ? alertLevelConfig[value.nivel_alerta].icon
    : null;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${value.es_anormal ? "bg-red-50 border-red-200" : "bg-white"
        }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{value.parametro}</p>
          {value.es_anormal && AlertIcon && (
            <AlertIcon className={`h-4 w-4 ${alertLevelConfig[value.nivel_alerta!].color}`} />
          )}
        </div>
        {value.rango_referencia && (
          <p className="text-sm text-muted-foreground">
            Rango: {value.rango_referencia}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className={`font-bold ${value.es_anormal ? "text-red-600" : ""}`}>
          {value.valor} {value.unidad}
        </p>
        {value.nivel_alerta && value.nivel_alerta !== "normal" && (
          <Badge variant="outline" className="mt-1">
            {alertLevelConfig[value.nivel_alerta].label}
          </Badge>
        )}
      </div>
    </div>
  );
}


