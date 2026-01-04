"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, User, Video, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

function NuevaCitaSecretariaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const dateParam = searchParams.get("date");
  const hourParam = searchParams.get("hour");

  const getMinDate = () => format(new Date(), "yyyy-MM-dd");
  
  const [formData, setFormData] = useState({
    paciente_id: "",
    fecha: dateParam ? format(new Date(dateParam), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    hora: hourParam ? `${hourParam.padStart(2, "0")}:00` : "09:00",
    duracion_minutos: "30",
    tipo_cita: "presencial",
    motivo: "",
    notas_internas: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: relation } = await supabase
        .from("doctor_secretaries")
        .select("doctor_id, permissions")
        .eq("secretary_id", user.id)
        .eq("status", "active")
        .single();

      if (!relation || !relation.permissions.can_create_appointments) {
        setError("No tienes permiso para crear citas");
        return;
      }

      setDoctorId(relation.doctor_id);
      await loadPatients(relation.doctor_id);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const loadPatients = async (doctorId: string) => {
    try {
      const { data: registeredPatients } = await supabase
        .from("doctor_patients")
        .select(`
          patient_id,
          patient:profiles!doctor_patients_patient_id_fkey(
            id,
            nombre_completo,
            email
          )
        `)
        .eq("doctor_id", doctorId);

      const { data: offlinePatients } = await supabase
        .from("offline_patients")
        .select("id, nombre_completo, cedula")
        .eq("doctor_id", doctorId)
        .eq("status", "offline");

      const allPatients = [
        ...(registeredPatients?.map((rp: any) => ({
          id: rp.patient.id,
          nombre_completo: rp.patient.nombre_completo,
          email: rp.patient.email,
          type: "registered",
        })) || []),
        ...(offlinePatients?.map((op: any) => ({
          id: op.id,
          nombre_completo: `${op.nombre_completo} (${op.cedula})`,
          email: null,
          type: "offline",
        })) || []),
      ];

      setPatients(allPatients);
    } catch (err) {
      console.error("Error loading patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    
    setLoading(true);
    setError(null);

    try {
      if (!formData.paciente_id) {
        setError("Debes seleccionar un paciente");
        setLoading(false);
        return;
      }

      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`);
      const colors: Record<string, string> = {
        presencial: "#3B82F6",
        telemedicina: "#10B981",
        urgencia: "#EF4444",
        seguimiento: "#8B5CF6",
        primera_vez: "#F59E0B",
      };

      const { error: insertError } = await supabase
        .from("appointments")
        .insert({
          medico_id: doctorId,
          paciente_id: formData.paciente_id,
          fecha_hora: fechaHora.toISOString(),
          duracion_minutos: parseInt(formData.duracion_minutos),
          tipo_cita: formData.tipo_cita,
          motivo: formData.motivo,
          notas_internas: formData.notas_internas || null,
          status: "pendiente",
          color: colors[formData.tipo_cita] || colors.presencial,
        });

      if (insertError) throw insertError;

      router.push("/dashboard/secretaria/agenda");
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  if (error && !doctorId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
            <p className="text-gray-600 mt-1">Agenda una nueva cita</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-7xl mx-auto mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="paciente_id">
                    Seleccionar Paciente <span className="text-red-500">*</span>
                  </Label>
                  {loadingPatients ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando pacientes...
                    </div>
                  ) : (
                    <Select
                      value={formData.paciente_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paciente_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.nombre_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">
                      ¿No encuentras al paciente en la lista?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full text-base font-semibold"
                      onClick={() => router.push("/dashboard/medico/pacientes/nuevo/simple?from=cita")}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Registrar Nuevo Paciente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fecha y Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">
                      Fecha <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fecha"
                      type="date"
                      min={getMinDate()}
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">
                      Hora <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formData.hora}
                      onChange={(e) =>
                        setFormData({ ...formData, hora: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracion">Duración Aproximada</Label>
                    <Select
                      value={formData.duracion_minutos}
                      onValueChange={(value) =>
                        setFormData({ ...formData, duracion_minutos: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Cita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_cita">Tipo de Cita</Label>
                  <Select
                    value={formData.tipo_cita}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo_cita: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="telemedicina">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Telemedicina
                        </div>
                      </SelectItem>
                      <SelectItem value="urgencia">Urgencia</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="primera_vez">Primera Vez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">
                    Motivo de Consulta <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="motivo"
                    placeholder="Ej: Control de rutina, dolor de cabeza, etc."
                    value={formData.motivo}
                    onChange={(e) =>
                      setFormData({ ...formData, motivo: e.target.value })
                    }
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas_internas">Notas Internas (Opcional)</Label>
                  <Textarea
                    id="notas_internas"
                    placeholder="Notas privadas"
                    value={formData.notas_internas}
                    onChange={(e) =>
                      setFormData({ ...formData, notas_internas: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <p className="font-medium">
                    {formData.fecha
                      ? format(new Date(formData.fecha), "EEEE, d 'de' MMMM", {
                          locale: es,
                        })
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Hora:</span>
                  <p className="font-medium">{formData.hora || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-600">Duración:</span>
                  <p className="font-medium">{formData.duracion_minutos} minutos</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Crear Cita
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NuevaCitaSecretariaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <NuevaCitaSecretariaContent />
    </Suspense>
  );
}
