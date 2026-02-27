"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import Image from "next/image";
import { useMedicalRecord } from "@/hooks/use-medical-records";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Pill,
  Activity,
  ClipboardList,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function DetalleRegistroMedicoPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const { record, loading: recordLoading } = useMedicalRecord(recordId);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading || recordLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando registro médico...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Registro no encontrado</h3>
            <p className="text-muted-foreground mb-4">
              El registro médico que buscas no existe o no tienes acceso a él
            </p>
            <Link href="/dashboard/paciente/historial">
              <Button>Volver al Historial</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/paciente/historial">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Historial
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Registro Médico</h1>
          <p className="text-muted-foreground">
            {new Date(record.created_at).toLocaleDateString("es-ES", {
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

      {/* Información del Doctor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {record.medico?.avatar_url ? (
                <Image
                  src={record.medico.avatar_url}
                  alt={record.medico.nombre_completo}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-primary">
                  {record.medico?.nombre_completo?.charAt(0) || "D"}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {record.medico?.nombre_completo || "No especificado"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {record.medico?.especialidad || "Medicina General"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico Principal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-lg font-medium">{record.diagnostico}</p>
          </div>
        </CardContent>
      </Card>

      {/* Síntomas */}
      {record.sintomas && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Síntomas Reportados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{record.sintomas}</p>
          </CardContent>
        </Card>
      )}

      {/* Tratamiento */}
      {record.tratamiento && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tratamiento Indicado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{record.tratamiento}</p>
          </CardContent>
        </Card>
      )}

      {/* Medicamentos */}
      {record.medicamentos && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medicamentos Recetados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {record.medicamentos.split(",").map((med, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <span>{med.trim()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exámenes Solicitados */}
      {record.examenes_solicitados && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Exámenes Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {record.examenes_solicitados.split(",").map((exam, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{exam.trim()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observaciones */}
      {record.observaciones && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{record.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Información de la Cita */}
      {record.appointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fecha de Consulta:</span>
                <span className="text-sm font-medium">
                  {new Date(record.appointment.fecha_hora).toLocaleDateString("es-ES")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hora:</span>
                <span className="text-sm font-medium">
                  {new Date(record.appointment.fecha_hora).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {record.appointment.motivo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Motivo:</span>
                  <span className="text-sm font-medium">{record.appointment.motivo}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Registro creado: {new Date(record.created_at).toLocaleString("es-ES")}</span>
          {record.updated_at !== record.created_at && (
            <span>
              Última actualización: {new Date(record.updated_at).toLocaleString("es-ES")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


