"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { differenceInYears } from "date-fns";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Separator } from "@red-salud/design-system";
import { usePrescription } from "@/hooks/use-medications";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Pill,
  Download,
  Share2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getDoctorSettings } from "@/lib/supabase/services/settings";
import type { DoctorSettings } from "@/lib/supabase/types/settings";
import { PrescriptionPDF } from "@/components/dashboard/medico/recetas/prescription-pdf";
import { usePdfGeneration } from "@/hooks/use-pdf-generation";

export default function DetalleRecetaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.id as string;

  const { prescription, loading: prescriptionLoading } = usePrescription(prescriptionId);
  const [doctorSettings, setDoctorSettings] = useState<DoctorSettings | null>(null);
  const { generatePdf, isGenerating } = usePdfGeneration();

  useEffect(() => {
    async function loadDoctorSettings() {
      if (prescription?.medico_id) {
        // Since getDoctorSettings requires a user ID, and here we have the doctor's profile ID (medico_id)
        // We are assuming medico_id in prescription IS the auth user id of the doctor.
        // If they are different (profile vs auth), we might need to adjust.
        // Usually in Supabase schema, profiles.id === auth.users.id.
        const result = await getDoctorSettings(prescription.medico_id);
        if (result.success && result.data) {
          setDoctorSettings(result.data);
        } else if (prescription.medico) {
          // Fallback if no specific settings found: use profile data
          setDoctorSettings({
            id: "temp",
            doctor_id: prescription.medico_id,
            nombre_completo: prescription.medico.nombre_completo,
            especialidad: prescription.medico.especialidad || "",
            cedula_profesional: "",
            clinica_nombre: "Consultorio Médico", // Default
            consultorio_direccion: "",
            telefono: "",
            email: "",
            logo_enabled: false,
            firma_digital_enabled: false,
            frame_color: "#0da9f7",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    }
    loadDoctorSettings();
  }, [prescription?.medico_id, prescription?.medico]); // Add prescription.medico to deps

  const handleDownloadPdf = async () => {
    const success = await generatePdf("prescription-pdf-content", {
      fileName: `Receta-${prescription?.folio || "sin-folio"}.pdf`
    });
    if (!success) {
      // toast.error("Error al generar PDF"); // If we had toast here
      console.error("Failed to generate PDF");
    }
  };

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
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generando..." : "Descargar PDF"}
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
      {/* Hidden PDF Container for Capture */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {prescription && doctorSettings && userId && (
          <div id="prescription-pdf-content">
            <PrescriptionPDF
              recipe={{
                created_at: prescription.fecha_prescripcion,
                medicamentos: prescription.medications?.map(m => ({
                  nombre_comercial: m.nombre_medicamento,
                  nombre_generico: m.medication?.nombre_generico,
                  dosis: m.dosis,
                  presentacion: m.medication?.forma_farmaceutica ?? undefined, // Handle null/undefined
                  frecuencia: m.frecuencia,
                  duracion: m.duracion_dias ? `${m.duracion_dias} días` : undefined,
                  indicaciones: m.instrucciones_especiales || undefined
                })) || [],
                folio: "RX-" + (prescription.id.slice(0, 8).toUpperCase()), // Placeholder folio if not present
                diagnostico: prescription.diagnostico
              }}
              settings={doctorSettings}
              patient={{
                nombre_completo: prescription.paciente?.nombre_completo || "Paciente",
                edad: prescription.paciente?.fecha_nacimiento
                  ? differenceInYears(new Date(), new Date(prescription.paciente.fecha_nacimiento)).toString()
                  : "--",
                peso: "--",
                sexo: prescription.paciente?.genero
                  ? (prescription.paciente.genero === 'masculino' ? 'M' : prescription.paciente.genero === 'femenino' ? 'F' : prescription.paciente.genero.charAt(0).toUpperCase())
                  : "--"
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


