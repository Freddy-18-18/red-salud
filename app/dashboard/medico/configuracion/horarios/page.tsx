"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

interface DaySchedule {
  dia_semana: number;
  activo: boolean;
  hora_inicio: string;
  hora_fin: string;
}

const DIAS_SEMANA = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function HorariosConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [horarios, setHorarios] = useState<DaySchedule[]>(
    DIAS_SEMANA.map((dia) => ({
      dia_semana: dia.value,
      activo: false,
      hora_inicio: "08:00",
      hora_fin: "17:00",
    }))
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      setUserId(user.id);
      await loadHorarios(user.id);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  const loadHorarios = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", doctorId);

    if (error) {
      console.error("Error loading schedules:", error);
      return;
    }

    if (data && data.length > 0) {
      // Actualizar horarios con los datos de la BD
      setHorarios((prev) =>
        prev.map((horario) => {
          const dbHorario = data.find((d) => d.dia_semana === horario.dia_semana);
          if (dbHorario) {
            return {
              dia_semana: horario.dia_semana,
              activo: dbHorario.activo,
              hora_inicio: dbHorario.hora_inicio,
              hora_fin: dbHorario.hora_fin,
            };
          }
          return horario;
        })
      );
    }
  };

  const handleToggleDay = (dia: number) => {
    setHorarios((prev) =>
      prev.map((h) =>
        h.dia_semana === dia ? { ...h, activo: !h.activo } : h
      )
    );
  };

  const handleTimeChange = (dia: number, field: "hora_inicio" | "hora_fin", value: string) => {
    setHorarios((prev) =>
      prev.map((h) =>
        h.dia_semana === dia ? { ...h, [field]: value } : h
      )
    );
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Eliminar horarios existentes
      await supabase
        .from("doctor_availability")
        .delete()
        .eq("doctor_id", userId);

      // Insertar solo los días activos
      const horariosActivos = horarios.filter((h) => h.activo);
      
      if (horariosActivos.length > 0) {
        const { error: insertError } = await supabase
          .from("doctor_availability")
          .insert(
            horariosActivos.map((h) => ({
              doctor_id: userId,
              dia_semana: h.dia_semana,
              hora_inicio: h.hora_inicio,
              hora_fin: h.hora_fin,
              activo: true,
            }))
          );

        if (insertError) throw insertError;
      }

      // Log de actividad
      await supabase.from("user_activity_log").insert({
        user_id: userId,
        activity_type: "schedule_updated",
        description: "Horarios de atención actualizados",
        status: "success",
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving schedules:", err);
      setError(err.message || "Error al guardar los horarios");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToAll = (sourceDay: number) => {
    const source = horarios.find((h) => h.dia_semana === sourceDay);
    if (!source) return;

    setHorarios((prev) =>
      prev.map((h) => ({
        ...h,
        hora_inicio: source.hora_inicio,
        hora_fin: source.hora_fin,
      }))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Horarios de Atención</h1>
            <p className="text-gray-600 mt-1">
              Configure los días y horarios en los que atiende pacientes
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Horarios guardados exitosamente
            </AlertDescription>
          </Alert>
        )}

        {/* Info Card */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Nota:</strong> Estos horarios se usarán para mostrar tu disponibilidad en el calendario.
            Los pacientes y tu secretaria podrán ver estos horarios al agendar citas.
          </AlertDescription>
        </Alert>

        {/* Schedule Cards */}
        <div className="space-y-4">
          {DIAS_SEMANA.map((dia) => {
            const horario = horarios.find((h) => h.dia_semana === dia.value);
            if (!horario) return null;

            return (
              <Card key={dia.value} className={horario.activo ? "border-blue-300" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Toggle */}
                    <div className="flex items-center gap-3 w-40">
                      <Switch
                        checked={horario.activo}
                        onCheckedChange={() => handleToggleDay(dia.value)}
                        id={`dia-${dia.value}`}
                      />
                      <Label
                        htmlFor={`dia-${dia.value}`}
                        className={`text-lg font-semibold cursor-pointer ${
                          horario.activo ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {dia.label}
                      </Label>
                    </div>

                    {/* Time Inputs */}
                    {horario.activo && (
                      <>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600">Desde:</Label>
                            <input
                              type="time"
                              value={horario.hora_inicio}
                              onChange={(e) =>
                                handleTimeChange(dia.value, "hora_inicio", e.target.value)
                              }
                              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600">Hasta:</Label>
                            <input
                              type="time"
                              value={horario.hora_fin}
                              onChange={(e) =>
                                handleTimeChange(dia.value, "hora_fin", e.target.value)
                              }
                              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Copy Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyToAll(dia.value)}
                          className="whitespace-nowrap"
                        >
                          Copiar a todos
                        </Button>
                      </>
                    )}

                    {!horario.activo && (
                      <span className="text-gray-400 italic">No laborable</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            <CardDescription>
              Configura rápidamente tus horarios de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setHorarios((prev) =>
                    prev.map((h) => ({
                      ...h,
                      activo: h.dia_semana >= 1 && h.dia_semana <= 5,
                      hora_inicio: "08:00",
                      hora_fin: "17:00",
                    }))
                  );
                }}
              >
                Lunes a Viernes (8:00 - 17:00)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setHorarios((prev) =>
                    prev.map((h) => ({
                      ...h,
                      activo: h.dia_semana >= 1 && h.dia_semana <= 6,
                      hora_inicio: "09:00",
                      hora_fin: "18:00",
                    }))
                  );
                }}
              >
                Lunes a Sábado (9:00 - 18:00)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setHorarios((prev) =>
                    prev.map((h) => ({
                      ...h,
                      activo: false,
                    }))
                  );
                }}
              >
                Limpiar Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Guardar Horarios
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
            size="lg"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </VerificationGuard>
  );
}
