"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Loader2, Play, CalendarClock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActiveConsultation {
  id: string;
  fecha_hora: string;
  paciente?: { id: string; nombre_completo: string; cedula: string } | null;
  offline_patient?: {
    id: string;
    nombre_completo: string;
    cedula: string;
  } | null;
  motivo: string;
}

export function ActiveConsultationsWidget() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<ActiveConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveConsultations = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Buscar citas básicas sin joins para evitar errores de relación
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from("appointments")
          .select(
            `
          id,
          fecha_hora,
          motivo,
          status,
          medical_record_id,
          paciente_id,
          offline_patient_id
        `,
          )
          .eq("medico_id", user.id)
          .not("medical_record_id", "is", null)
          .not("status", "in", '("completada","cancelada","no_asistio")')
          .order("fecha_hora", { ascending: false });

      if (appointmentsError) throw appointmentsError;

      if (!appointmentsData || appointmentsData.length === 0) {
        setConsultations([]);
        return;
      }

      // 2. Obtener IDs únicos
      const patientIds = Array.from(
        new Set(appointmentsData.map((a) => a.paciente_id).filter(Boolean)),
      ) as string[];
      const offlineIds = Array.from(
        new Set(
          appointmentsData.map((a) => a.offline_patient_id).filter(Boolean),
        ),
      ) as string[];

      // 3. Consultar datos de pacientes en paralelo
      const [patientsRes, offlineRes] = await Promise.all([
        patientIds.length > 0
          ? supabase
              .from("profiles")
              .select("id, nombre_completo, cedula")
              .in("id", patientIds)
          : Promise.resolve({ data: [], error: null }),
        offlineIds.length > 0
          ? supabase
              .from("offline_patients")
              .select("id, nombre_completo, cedula")
              .in("id", offlineIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const patientsMap = new Map(patientsRes.data?.map((p) => [p.id, p]));
      const offlineMap = new Map(offlineRes.data?.map((p) => [p.id, p]));

      // 4. Combinar resultados
      const combinedData = appointmentsData.map((apt) => ({
        ...apt,
        paciente: apt.paciente_id ? patientsMap.get(apt.paciente_id) : null,
        offline_patient: apt.offline_patient_id
          ? offlineMap.get(apt.offline_patient_id)
          : null,
      }));

      setConsultations(combinedData as any[]);
    } catch (err) {
      console.error(
        "Error fetching active consultations:",
        JSON.stringify(err, null, 2),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveConsultations();
  }, []);

  if (!loading && consultations.length === 0) return null;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
            Consulta en Progreso
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchActiveConsultations}
          className="h-8 w-8 p-0"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consultations.map((consultation) => {
          const patientName =
            consultation.paciente?.nombre_completo ||
            consultation.offline_patient?.nombre_completo ||
            "Paciente sin nombre";
          const patientCedula =
            consultation.paciente?.cedula ||
            consultation.offline_patient?.cedula;

          return (
            <Card
              key={consultation.id}
              className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10 shadow-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4
                      className="font-bold text-foreground truncate max-w-[200px]"
                      title={patientName}
                    >
                      {patientName}
                    </h4>
                    {patientCedula && (
                      <p className="text-xs text-muted-foreground">
                        V-{patientCedula}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    En curso
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>
                    {format(
                      new Date(consultation.fecha_hora),
                      "d MMM, h:mm a",
                      { locale: es },
                    )}
                  </span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/medico/pacientes/consulta?appointment_id=${consultation.id}&paciente_id=${consultation.paciente ? consultation.paciente.id : consultation.offline_patient?.id}`,
                    )
                  } // Ajustar lógica de ID
                >
                  <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                  Continuar Consulta
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
