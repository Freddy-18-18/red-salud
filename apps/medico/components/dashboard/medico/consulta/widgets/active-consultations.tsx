"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Play, CalendarClock, RefreshCw } from "lucide-react";
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
          // Mostrar citas de las últimas 24 horas y del futuro inmediato (próximas 2 horas solamente)
          // O mejor: Solo mostrar las que están "en_consulta" O las de "hoy" que están pendientes
          // Simplificación: Filtramos por rango de fecha: Ayer (-24h) hasta Final del día de hoy
          .gte("fecha_hora", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .lte("fecha_hora", new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
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

      setConsultations(combinedData);
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
    <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-green-50/50 dark:bg-green-900/5 border border-green-100 dark:border-green-900/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-sm uppercase tracking-wide text-green-700 dark:text-green-400">
            Consulta en Progreso
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchActiveConsultations}
          className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
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
              className="border-green-200 dark:border-green-800 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() =>
                router.push(
                  `/consultorio/pacientes/consulta?appointment_id=${consultation.id}&paciente_id=${consultation.paciente ? consultation.paciente.id : consultation.offline_patient?.id}`,
                )
              }
            >
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4
                    className="font-bold text-foreground truncate text-sm"
                    title={patientName}
                  >
                    {patientName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {patientCedula && <span>V-{patientCedula}</span>}
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      <span>
                        {format(
                          new Date(consultation.fecha_hora),
                          "h:mm a",
                          { locale: es },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
