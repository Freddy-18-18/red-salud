"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePrescription } from "@/hooks/use-medications";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Pill,
  Download,
  Share2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function DetalleRecetaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.id as string;

  const { prescription, loading: prescriptionLoading } = usePrescription(prescriptionId);

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

  if (loading || prescriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando receta...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Receta no encontrada</h3>
            <p className="text-muted-foreground mb-4">
              La receta que buscas no existe o no tienes acceso a ella
            </p>
            <Link href="/dashboard/paciente/medicamentos">
              <Button>Volver a Medicamentos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return 'default';
      case 'surtida':
        return 'outline';
      case 'vencida':
        return 'destructive';
      case 'cancelada':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/paciente/medicamentos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Receta Médica</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(prescription.fecha_prescripcion).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Estado */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estado de la Receta</p>
              <Badge variant={getStatusColor(prescription.status)} className="text-base">
                {prescription.status.toUpperCase()}
              </Badge>
            </div>
            {prescription.fecha_vencimiento && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Válida hasta</p>
                <p className="font-medium">
                  {new Date(prescription.fecha_vencimiento).toLocaleDateString("es-ES")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del Médico */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Médico Prescriptor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {prescription.medico?.nombre_completo?.charAt(0) || "D"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {prescription.medico?.nombre_completo || "No especificado"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {prescription.medico?.especialidad || "Medicina General"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      {prescription.diagnostico && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{prescription.diagnostico}</p>
          </CardContent>
        </Card>
      )}

      {/* Medicamentos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicamentos Recetados
          </CardTitle>
          <CardDescription>
            {prescription.medications?.length || 0} medicamento(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescription.medications?.map((med, index) => (
              <div key={med.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{med.nombre_medicamento}</h3>
                      {med.medication && (
                        <p className="text-sm text-muted-foreground">
                          {med.medication.nombre_generico} - {med.medication.concentracion}
                        </p>
                      )}
                    </div>
                    <Link href={`/dashboard/paciente/medicamentos/recordatorios/nuevo?medication=${med.nombre_medicamento}&dosis=${med.dosis}`}>
                      <Button variant="outline" size="sm">
                        Crear Recordatorio
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Dosis</p>
                      <p className="font-medium">{med.dosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frecuencia</p>
                      <p className="font-medium">{med.frecuencia}</p>
                    </div>
                    {med.via_administracion && (
                      <div>
                        <p className="text-sm text-muted-foreground">Vía de Administración</p>
                        <p className="font-medium">{med.via_administracion}</p>
                      </div>
                    )}
                    {med.duracion_dias && (
                      <div>
                        <p className="text-sm text-muted-foreground">Duración</p>
                        <p className="font-medium">{med.duracion_dias} días</p>
                      </div>
                    )}
                    {med.cantidad_total && (
                      <div>
                        <p className="text-sm text-muted-foreground">Cantidad Total</p>
                        <p className="font-medium">{med.cantidad_total}</p>
                      </div>
                    )}
                  </div>

                  {med.instrucciones_especiales && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 mb-1">
                        Instrucciones Especiales:
                      </p>
                      <p className="text-sm text-amber-700">{med.instrucciones_especiales}</p>
                    </div>
                  )}

                  {med.medication?.indicaciones && (
                    <details className="mt-3">
                      <summary className="text-sm font-medium cursor-pointer text-primary">
                        Ver indicaciones y contraindicaciones
                      </summary>
                      <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {med.medication.indicaciones && (
                          <div>
                            <p className="font-medium text-foreground">Indicaciones:</p>
                            <p>{med.medication.indicaciones}</p>
                          </div>
                        )}
                        {med.medication.contraindicaciones && (
                          <div>
                            <p className="font-medium text-foreground">Contraindicaciones:</p>
                            <p>{med.medication.contraindicaciones}</p>
                          </div>
                        )}
                        {med.medication.efectos_secundarios && (
                          <div>
                            <p className="font-medium text-foreground">Efectos Secundarios:</p>
                            <p>{med.medication.efectos_secundarios}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones Generales */}
      {prescription.instrucciones_generales && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Instrucciones Generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{prescription.instrucciones_generales}</p>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información de la Receta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fecha de Prescripción:</span>
              <span className="text-sm font-medium">
                {new Date(prescription.fecha_prescripcion).toLocaleDateString("es-ES")}
              </span>
            </div>
            {prescription.fecha_vencimiento && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fecha de Vencimiento:</span>
                <span className="text-sm font-medium">
                  {new Date(prescription.fecha_vencimiento).toLocaleDateString("es-ES")}
                </span>
              </div>
            )}
            {prescription.fecha_surtida && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fecha Surtida:</span>
                <span className="text-sm font-medium">
                  {new Date(prescription.fecha_surtida).toLocaleDateString("es-ES")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {prescription.notas && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {prescription.notas}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


