"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertCircle,
  Pill,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OfflinePatient {
  id: string;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo_sangre: string | null;
  alergias: string[] | null;
  condiciones_cronicas: string[] | null;
  medicamentos_actuales: string[] | null;
  notas_medico: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function OfflinePatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<OfflinePatient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatient();
  }, [params.id]);

  const loadPatient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      const { data, error } = await supabase
        .from("offline_patients")
        .select("*")
        .eq("id", params.id)
        .eq("doctor_id", user.id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (err: any) {
      console.error("Error loading patient:", err);
      setError(err.message);
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

  if (error || !patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "No se pudo cargar la información del paciente"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const age = calculateAge(patient.fecha_nacimiento);

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Paciente sin cuenta:</strong> Este paciente aún no se ha registrado en la plataforma.
            Cuando se registre con la cédula <strong>{patient.cedula}</strong>, su historial se vinculará automáticamente.
          </AlertDescription>
        </Alert>

        {/* Patient Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {getInitials(patient.nombre_completo)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {patient.nombre_completo}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline">
                        Cédula: {patient.cedula}
                      </Badge>
                      {patient.genero && (
                        <Badge variant="outline">
                          {patient.genero === "M" ? "Masculino" : "Femenino"}
                        </Badge>
                      )}
                      {age && (
                        <Badge variant="outline">
                          {age} años
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        Sin cuenta
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.telefono && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium text-gray-900">{patient.telefono}</p>
                  </div>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{patient.email}</p>
                  </div>
                </div>
              )}
              {patient.direccion && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium text-gray-900">{patient.direccion}</p>
                  </div>
                </div>
              )}
              {patient.fecha_nacimiento && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(patient.fecha_nacimiento), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5" />
                Información Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.tipo_sangre && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Sangre</p>
                  <Badge variant="outline" className="text-base">
                    {patient.tipo_sangre}
                  </Badge>
                </div>
              )}
              {patient.alergias && patient.alergias.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Alergias</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.alergias.map((alergia, index) => (
                      <Badge key={index} variant="destructive">
                        {alergia}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.condiciones_cronicas && patient.condiciones_cronicas.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Condiciones Crónicas</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.condiciones_cronicas.map((condicion, index) => (
                      <Badge key={index} variant="secondary">
                        {condicion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.medicamentos_actuales && patient.medicamentos_actuales.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medicamentos Actuales</p>
                  <div className="space-y-2">
                    {patient.medicamentos_actuales.map((medicamento, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-900">{medicamento}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Doctor Notes */}
        {patient.notas_medico && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas del Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{patient.notas_medico}</p>
            </CardContent>
          </Card>
        )}

        {/* Registration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Registrado el:</span>
              <span className="font-medium text-gray-900">
                {format(new Date(patient.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Última actualización:</span>
              <span className="font-medium text-gray-900">
                {format(new Date(patient.updated_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </VerificationGuard>
  );
}
