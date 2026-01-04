"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Edit,
  Plus,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

interface PatientData {
  id: string;
  nombre_completo: string;
  email: string;
  avatar_url: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  cedula: string | null;
  direccion: string | null;
  tipo_sangre: string | null;
  alergias: string[] | null;
  condiciones_cronicas: string[] | null;
  medicamentos_actuales: string[] | null;
}

interface DoctorPatientRelation {
  first_consultation_date: string | null;
  last_consultation_date: string | null;
  total_consultations: number;
  notes: string | null;
}

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [relation, setRelation] = useState<DoctorPatientRelation | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      // Cargar datos del paciente
      const { data: patientData, error: patientError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Cargar relación médico-paciente
      const { data: relationData } = await supabase
        .from("doctor_patients")
        .select("*")
        .eq("doctor_id", user.id)
        .eq("patient_id", patientId)
        .single();

      setRelation(relationData);

      // Cargar citas
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("*")
        .eq("medico_id", user.id)
        .eq("paciente_id", patientId)
        .order("fecha_hora", { ascending: false });

      setAppointments(appointmentsData || []);

      // Cargar notas médicas
      const { data: notesData } = await supabase
        .from("medical_notes")
        .select("*")
        .eq("doctor_id", user.id)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      setMedicalNotes(notesData || []);

      // Cargar recetas
      const { data: prescriptionsData } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("medico_id", user.id)
        .eq("paciente_id", patientId)
        .order("created_at", { ascending: false });

      setPrescriptions(prescriptionsData || []);

    } catch (error) {
      console.error("Error loading patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Paciente no encontrado
              </h3>
              <Button onClick={() => router.back()}>Volver</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(patient.fecha_nacimiento);

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Patient Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={patient.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(patient.nombre_completo)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {patient.nombre_completo}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                      {age && <span>{age} años</span>}
                      {patient.genero && (
                        <Badge variant="outline">
                          {patient.genero === "M" ? "Masculino" : "Femenino"}
                        </Badge>
                      )}
                      {patient.tipo_sangre && (
                        <Badge variant="outline">Tipo {patient.tipo_sangre}</Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => router.push(`/dashboard/medico/pacientes/${patientId}/editar`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {patient.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{patient.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{patient.email}</span>
                  </div>
                  {patient.direccion && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{patient.direccion}</span>
                    </div>
                  )}
                </div>

                {relation && (
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">Primera consulta:</span>{" "}
                      <span className="font-medium">
                        {relation.first_consultation_date
                          ? format(new Date(relation.first_consultation_date), "dd/MM/yyyy", { locale: es })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Última consulta:</span>{" "}
                      <span className="font-medium">
                        {relation.last_consultation_date
                          ? format(new Date(relation.last_consultation_date), "dd/MM/yyyy", { locale: es })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Total consultas:</span>{" "}
                      <span className="font-medium">{relation.total_consultations}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={() => router.push(`/dashboard/medico/recetas/nueva?paciente=${patientId}`)}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Pill className="h-6 w-6" />
              <span>Nueva Receta</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/medico/notas/nueva?paciente=${patientId}`)}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Nueva Nota</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/medico/citas/nueva?paciente=${patientId}`)}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Agendar Cita</span>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/medico/mensajeria?paciente=${patientId}`)}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Mail className="h-6 w-6" />
              <span>Enviar Mensaje</span>
            </div>
          </Button>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="historial" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="historial">
              <Activity className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="citas">
              <Calendar className="h-4 w-4 mr-2" />
              Citas ({appointments.length})
            </TabsTrigger>
            <TabsTrigger value="recetas">
              <Pill className="h-4 w-4 mr-2" />
              Recetas ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="notas">
              <FileText className="h-4 w-4 mr-2" />
              Notas ({medicalNotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Historial Tab */}
          <TabsContent value="historial">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Médica */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Médica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.alergias && patient.alergias.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Alergias</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.alergias.map((alergia, idx) => (
                          <Badge key={idx} variant="destructive">{alergia}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.condiciones_cronicas && patient.condiciones_cronicas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Condiciones Crónicas</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.condiciones_cronicas.map((condicion, idx) => (
                          <Badge key={idx} variant="secondary">{condicion}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.medicamentos_actuales && patient.medicamentos_actuales.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Medicamentos Actuales</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicamentos_actuales.map((med, idx) => (
                          <Badge key={idx} variant="outline">{med}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!patient.alergias || patient.alergias.length === 0) &&
                   (!patient.condiciones_cronicas || patient.condiciones_cronicas.length === 0) &&
                   (!patient.medicamentos_actuales || patient.medicamentos_actuales.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay información médica registrada
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Notas del Médico */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Médico</CardTitle>
                  <CardDescription>Observaciones sobre el paciente</CardDescription>
                </CardHeader>
                <CardContent>
                  {relation?.notes ? (
                    <p className="text-sm text-gray-700">{relation.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay notas registradas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Citas Tab */}
          <TabsContent value="citas">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {format(new Date(apt.fecha_hora), "dd 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(apt.fecha_hora), "HH:mm")} • {apt.duracion_minutos} min
                            </p>
                            {apt.motivo && (
                              <p className="text-sm text-gray-500 mt-1">{apt.motivo}</p>
                            )}
                          </div>
                        </div>
                        <Badge>
                          {apt.status === "pendiente" && "Pendiente"}
                          {apt.status === "confirmada" && "Confirmada"}
                          {apt.status === "completada" && "Completada"}
                          {apt.status === "cancelada" && "Cancelada"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No hay citas registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recetas Tab */}
          <TabsContent value="recetas">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recetas Médicas</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/dashboard/medico/recetas/nueva?paciente=${patientId}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Receta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/medico/recetas/${rx.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{rx.diagnostico || "Sin diagnóstico"}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {format(new Date(rx.created_at), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                          <Badge>{rx.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No hay recetas registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notas Tab */}
          <TabsContent value="notas">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Notas Médicas</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/dashboard/medico/notas/nueva?paciente=${patientId}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Nota
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {medicalNotes.length > 0 ? (
                  <div className="space-y-4">
                    {medicalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{note.title || "Sin título"}</h4>
                          <Badge variant="outline">{note.note_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(note.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No hay notas registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VerificationGuard>
  );
}
