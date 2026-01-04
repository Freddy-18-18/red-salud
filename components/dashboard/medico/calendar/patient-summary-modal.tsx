"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  AlertCircle,
  Pill,
  FileText,
  Video,
  MessageSquare,
  Loader2,
  Clock,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import type { CalendarAppointment } from "./types";

interface PatientSummaryModalProps {
  appointment: CalendarAppointment | null;
  open: boolean;
  onClose: () => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
}

interface PatientData {
  // Perfil básico
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  avatar_url?: string;
  
  // Datos médicos
  grupo_sanguineo?: string;
  alergias?: string[];
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
  peso_kg?: number;
  altura_cm?: number;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
}

interface MedicalHistory {
  total_consultas: number;
  ultima_consulta?: string;
  diagnosticos_frecuentes: Array<{ diagnostico: string; count: number }>;
}

export function PatientSummaryModal({
  appointment,
  open,
  onClose,
  onMessage,
  onStartVideo,
}: PatientSummaryModalProps) {
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && appointment) {
      console.log("Modal opened with appointment:", {
        id: appointment.id,
        paciente_id: appointment.paciente_id,
        offline_patient_id: appointment.offline_patient_id,
        paciente_nombre: appointment.paciente_nombre,
      });
      loadPatientData();
    } else if (!open) {
      // Reset state when modal closes
      setPatientData(null);
      setMedicalHistory(null);
      setAppointmentHistory([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.paciente_id, appointment?.offline_patient_id]);

  const loadPatientData = async () => {
    if (!appointment) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar si es un paciente offline
      const isOfflinePatient = !appointment.paciente_id && appointment.offline_patient_id;
      
      console.log("Loading patient data:", {
        paciente_id: appointment.paciente_id,
        offline_patient_id: appointment.offline_patient_id,
        isOfflinePatient
      });

      // Crear perfil básico con los datos que ya tenemos del appointment
      const basicProfile: PatientData = {
        id: appointment.paciente_id || appointment.offline_patient_id || "",
        nombre_completo: appointment.paciente_nombre,
        email: appointment.paciente_email || "",
        telefono: appointment.paciente_telefono || undefined,
        avatar_url: appointment.paciente_avatar || undefined,
      };

      if (isOfflinePatient) {
        // Para pacientes offline, cargar datos de la tabla offline_patients
        const { data: offlinePatient, error: offlineError } = await supabase
          .from("offline_patients")
          .select("*")
          .eq("id", appointment.offline_patient_id)
          .maybeSingle();

        if (offlineError) {
          console.warn("Error loading offline patient:", offlineError);
        }

        // Combinar datos
        setPatientData({
          ...basicProfile,
          ...(offlinePatient || {}),
        });

        // Para pacientes offline, no hay historial en el sistema
        setAppointmentHistory([]);
        setMedicalHistory(null);
      } else if (appointment.paciente_id) {
        // Para pacientes registrados, cargar datos completos
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", appointment.paciente_id)
          .maybeSingle();

        console.log("Profile query result:", { profile, profileError });

        const fullProfile = profile || basicProfile;

        // Cargar detalles médicos (puede no existir)
        const { data: medicalDetails, error: medicalError } = await supabase
          .from("patient_details")
          .select("*")
          .eq("profile_id", appointment.paciente_id)
          .maybeSingle();

        if (medicalError && medicalError.code !== "PGRST116") {
          console.warn("Error loading medical details:", medicalError);
        }

        console.log("Medical details:", medicalDetails);

        // Combinar datos
        setPatientData({
          ...fullProfile,
          ...(medicalDetails || {}),
        });

        // Cargar historial de citas (incluyendo citas completadas)
        const { data: appointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("paciente_id", appointment.paciente_id)
          .in("status", ["completada", "pendiente", "confirmada"])
          .order("fecha_hora", { ascending: false })
          .limit(10);

        if (appointmentsError) {
          console.warn("Error loading appointments:", appointmentsError);
        }

        console.log("Loaded appointment history:", appointments);
        setAppointmentHistory(appointments || []);

        // Cargar resumen de historial médico
        const { data: records, error: recordsError } = await supabase
          .from("medical_records")
          .select("diagnostico, created_at")
          .eq("paciente_id", appointment.paciente_id)
          .order("created_at", { ascending: false });

        if (recordsError) {
          console.warn("Error loading medical records:", recordsError);
        }

        if (records && records.length > 0) {
          const diagnosticosMap = new Map<string, number>();
          records.forEach((record: any) => {
            if (record.diagnostico) {
              diagnosticosMap.set(
                record.diagnostico,
                (diagnosticosMap.get(record.diagnostico) || 0) + 1
              );
            }
          });

          const diagnosticos_frecuentes = Array.from(diagnosticosMap.entries())
            .map(([diagnostico, count]) => ({ diagnostico, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setMedicalHistory({
            total_consultas: records.length,
            ultima_consulta: records[0]?.created_at,
            diagnosticos_frecuentes,
          });
        }
      } else {
        // No hay paciente_id ni offline_patient_id
        throw new Error("Esta cita no tiene un paciente asociado. Por favor, verifica los datos de la cita.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar datos del paciente";
      console.error("Error loading patient data:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "confirmada":
        return "bg-blue-100 text-blue-800";
      case "completada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b bg-gradient-to-r from-blue-50 to-white">
          <DialogTitle className="text-lg font-semibold">Resumen del Paciente</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="ml-3 text-gray-600">Cargando información del paciente...</p>
            </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Error al cargar información</p>
            <p className="text-gray-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={loadPatientData}
            >
              Reintentar
            </Button>
          </div>
        ) : patientData ? (
          <div className="space-y-4 mt-4">
            {/* Header con info básica - Más compacto */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                  <AvatarImage src={patientData.avatar_url} />
                  <AvatarFallback className="text-base bg-blue-100 text-blue-700">
                    {getInitials(patientData.nombre_completo)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {patientData.nombre_completo}
                    </h2>
                    {appointment.offline_patient_id && !appointment.paciente_id && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Paciente sin cuenta
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    {patientData.fecha_nacimiento && (
                      <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {getAge(patientData.fecha_nacimiento)} años ({format(new Date(patientData.fecha_nacimiento), "dd/MM/yyyy")})
                        </span>
                      </div>
                    )}
                    
                    {patientData.telefono && (
                      <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{patientData.telefono}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{patientData.email}</span>
                    </div>
                    
                    {patientData.cedula && (
                      <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">CI: {patientData.cedula}</span>
                      </div>
                    )}
                    
                    {(patientData.ciudad || patientData.estado) && (
                      <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {[patientData.ciudad, patientData.estado].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="flex gap-2 shrink-0">
                  {onMessage && appointment.paciente_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMessage(appointment)}
                      className="h-8"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Mensaje
                    </Button>
                  )}
                  {onStartVideo && appointment.paciente_id && appointment.tipo_cita === "telemedicina" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStartVideo(appointment)}
                      className="h-8"
                    >
                      <Video className="h-3.5 w-3.5 mr-1.5" />
                      Video
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Información de la cita actual - Más compacto */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Cita Actual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Fecha y Hora</p>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {format(new Date(appointment.fecha_hora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(appointment.fecha_hora), "HH:mm", { locale: es })} - {format(new Date(appointment.fecha_hora_fin), "HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="col-span-full min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Motivo</p>
                  <p className="text-sm font-medium text-gray-900 break-words">{appointment.motivo}</p>
                </div>
                {appointment.notas_internas && (
                  <div className="col-span-full min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Notas Internas</p>
                    <p className="text-sm text-gray-700 break-words">{appointment.notas_internas}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs con información detallada - Diseño minimalista */}
            <Tabs defaultValue="medical" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="medical" className="text-xs">Información Médica</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">Historial</TabsTrigger>
                <TabsTrigger value="emergency" className="text-xs">Emergencia</TabsTrigger>
              </TabsList>

              <TabsContent value="medical" className="space-y-3 mt-3">
                {/* Datos Vitales */}
                {(patientData.grupo_sanguineo || patientData.peso_kg || patientData.altura_cm) && (
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" />
                      Datos Vitales
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {patientData.grupo_sanguineo && (
                        <div>
                          <p className="text-xs text-gray-500">Grupo Sanguíneo</p>
                          <p className="text-sm font-medium">{patientData.grupo_sanguineo}</p>
                        </div>
                      )}
                      {patientData.peso_kg && (
                        <div>
                          <p className="text-xs text-gray-500">Peso</p>
                          <p className="text-sm font-medium">{patientData.peso_kg} kg</p>
                        </div>
                      )}
                      {patientData.altura_cm && (
                        <div>
                          <p className="text-xs text-gray-500">Altura</p>
                          <p className="text-sm font-medium">{patientData.altura_cm} cm</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Alergias */}
                {patientData.alergias && patientData.alergias.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Alergias
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {patientData.alergias.map((alergia, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {alergia}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enfermedades Crónicas */}
                {patientData.enfermedades_cronicas && patientData.enfermedades_cronicas.length > 0 && (
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Enfermedades Crónicas
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5">
                      {patientData.enfermedades_cronicas.map((enfermedad, index) => (
                        <li key={index} className="text-xs text-gray-700">{enfermedad}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medicamentos Actuales */}
                {patientData.medicamentos_actuales && (
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5" />
                      Medicamentos Actuales
                    </h4>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{patientData.medicamentos_actuales}</p>
                  </div>
                )}

                {/* Cirugías Previas */}
                {patientData.cirugias_previas && (
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Cirugías Previas</h4>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{patientData.cirugias_previas}</p>
                  </div>
                )}

                {/* Mensaje si no hay datos médicos */}
                {!patientData.grupo_sanguineo && 
                 !patientData.peso_kg && 
                 !patientData.altura_cm && 
                 (!patientData.alergias || patientData.alergias.length === 0) &&
                 (!patientData.enfermedades_cronicas || patientData.enfermedades_cronicas.length === 0) &&
                 !patientData.medicamentos_actuales &&
                 !patientData.cirugias_previas && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No hay información médica registrada</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-3 mt-3">
                {/* Resumen de Historial */}
                <div className="bg-white border rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3">Resumen de Historial</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total de Citas</p>
                      <p className="text-xl font-bold text-blue-600">
                        {appointmentHistory.length}
                      </p>
                    </div>
                    {appointmentHistory.length > 0 && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500">Completadas</p>
                          <p className="text-xl font-bold text-green-600">
                            {appointmentHistory.filter(a => a.status === "completada").length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Última Cita</p>
                          <p className="text-sm font-medium">
                            {format(new Date(appointmentHistory[0].fecha_hora), "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {medicalHistory && medicalHistory.diagnosticos_frecuentes.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2">Diagnósticos Frecuentes</p>
                      <div className="space-y-1.5">
                        {medicalHistory.diagnosticos_frecuentes.map((diag, index) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700">{diag.diagnostico}</span>
                            <Badge variant="secondary" className="text-xs">{diag.count}x</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Historial de Citas */}
                <div className="bg-white border rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Historial de Citas
                  </h4>
                  {appointmentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {appointmentHistory.map((apt) => (
                        <div key={apt.id} className="flex items-start justify-between py-2 border-b last:border-0 last:pb-0">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-xs text-gray-900 truncate">{apt.motivo}</p>
                              <Badge className={`${getStatusColor(apt.status)} text-xs shrink-0`}>
                                {apt.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(apt.fecha_hora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {format(new Date(apt.fecha_hora), "HH:mm", { locale: es })}
                              {apt.duracion_minutos && ` (${apt.duracion_minutos} min)`}
                            </p>
                            {apt.tipo_cita && (
                              <p className="text-xs text-gray-600 mt-1 capitalize flex items-center gap-1">
                                {apt.tipo_cita === "telemedicina" && <Video className="h-3 w-3 text-green-600" />}
                                {apt.tipo_cita === "presencial" && <MapPin className="h-3 w-3 text-blue-600" />}
                                {apt.tipo_cita === "urgencia" && <AlertCircle className="h-3 w-3 text-red-600" />}
                                {apt.tipo_cita.replace("_", " ")}
                              </p>
                            )}
                            {apt.notas_internas && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                "{apt.notas_internas.substring(0, 80)}{apt.notas_internas.length > 80 ? "..." : ""}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No hay citas registradas</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="mt-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-red-900 mb-3 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Contacto de Emergencia
                  </h4>
                  {patientData.contacto_emergencia_nombre ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-red-700">Nombre</p>
                        <p className="text-sm font-medium text-red-900">{patientData.contacto_emergencia_nombre}</p>
                      </div>
                      {patientData.contacto_emergencia_telefono && (
                        <div>
                          <p className="text-xs text-red-700">Teléfono</p>
                          <p className="text-sm font-medium text-red-900">{patientData.contacto_emergencia_telefono}</p>
                        </div>
                      )}
                      {patientData.contacto_emergencia_relacion && (
                        <div>
                          <p className="text-xs text-red-700">Relación</p>
                          <p className="text-sm font-medium text-red-900">{patientData.contacto_emergencia_relacion}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-700 text-center py-4">No hay contacto de emergencia registrado</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-gray-600">No se pudo cargar la información del paciente</p>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
